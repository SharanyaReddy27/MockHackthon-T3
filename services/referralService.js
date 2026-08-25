const Referral = require('../models/Referral');
const HealthcareCenter = require('../models/HealthcareCenter');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const {
  REFERRAL_STATUS,
  ALLOWED_PRIORITIES,
  isValidTransition
} = require('../constants/referralEnums');

class ReferralService {
  /**
   * Create a new referral
   */
  async createReferral(data, referredById) {
    const {
      patientId,
      consultationId,
      healthcareCenterId,
      priority,
      reason,
      clinicalSummary,
      notes
    } = data;

    // 1. Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const err = new Error(`Patient not found with ID: ${patientId}`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify healthcare center exists and is active
    const healthcareCenter = await HealthcareCenter.findById(healthcareCenterId);
    if (!healthcareCenter) {
      const err = new Error(`Healthcare center not found with ID: ${healthcareCenterId}`);
      err.statusCode = 404;
      throw err;
    }

    if (!healthcareCenter.isActive) {
      const err = new Error(`Healthcare center '${healthcareCenter.name}' is currently inactive and cannot accept referrals`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Verify consultation if provided
    if (consultationId) {
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        const err = new Error(`Consultation not found with ID: ${consultationId}`);
        err.statusCode = 404;
        throw err;
      }
    }

    // 4. Priority check
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      const err = new Error(`Invalid priority. Must be one of: ${ALLOWED_PRIORITIES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    // 5. Create referral
    const referral = new Referral({
      patientId,
      consultationId: consultationId || null,
      healthcareCenterId,
      priority,
      reason,
      clinicalSummary: clinicalSummary || '',
      notes: notes || '',
      status: REFERRAL_STATUS.CREATED,
      referredBy: referredById || null,
      timestamps: {
        created: new Date()
      }
    });

    const saved = await referral.save();
    return saved;
  }

  /**
   * Get referral by ID with populated healthcare center and safe patient details
   */
  async getReferralById(id) {
    const referral = await Referral.findById(id)
      .populate('healthcareCenterId', 'id name type phone address emergencySupport services')
      .populate('patientId', 'id name age gender village district phone')
      .populate('referredBy', 'id name role');

    if (!referral) {
      const err = new Error(`Referral not found with ID: ${id}`);
      err.statusCode = 404;
      throw err;
    }

    return referral;
  }

  /**
   * Update referral status with transition validation and automatic server-side timestamping
   */
  async updateReferralStatus(id, newStatus, userId) {
    const referral = await Referral.findById(id);
    if (!referral) {
      const err = new Error(`Referral not found with ID: ${id}`);
      err.statusCode = 404;
      throw err;
    }

    // Validate state transition
    if (!isValidTransition(referral.status, newStatus)) {
      const err = new Error(
        `Invalid status transition from '${referral.status}' to '${newStatus}'. Allowed next status: ${
          require('../constants/referralEnums').VALID_STATUS_TRANSITIONS[referral.status]?.join(', ') || 'none'
        }`
      );
      err.statusCode = 400;
      throw err;
    }

    // Server-side timestamp update according to transition
    const now = new Date();
    referral.status = newStatus;

    if (!referral.timestamps) {
      referral.timestamps = { created: referral.createdAt || now };
    }

    switch (newStatus) {
      case REFERRAL_STATUS.SENT:
        referral.timestamps.sent = now;
        break;
      case REFERRAL_STATUS.ACCEPTED:
        referral.timestamps.accepted = now;
        break;
      case REFERRAL_STATUS.ARRIVED:
        referral.timestamps.arrived = now;
        break;
      case REFERRAL_STATUS.COMPLETED:
        referral.timestamps.completed = now;
        break;
      case REFERRAL_STATUS.CANCELLED:
        // Record cancellation
        break;
    }

    const updated = await referral.save();
    return updated;
  }

  /**
   * List referrals with filtering and pagination
   */
  async listReferrals(filters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      healthcareCenterId,
      patientId,
      from,
      to,
      village
    } = filters;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (healthcareCenterId) query.healthcareCenterId = healthcareCenterId;
    if (patientId) query.patientId = patientId;

    if (from || to) {
      query['timestamps.created'] = {};
      if (from) query['timestamps.created'].$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        // Include full day if date string like YYYY-MM-DD
        if (to.length === 10) toDate.setUTCHours(23, 59, 59, 999);
        query['timestamps.created'].$lte = toDate;
      }
    }

    // If filtering by patient village, find matching patient IDs
    if (village) {
      const patientIds = await Patient.find({
        village: new RegExp(village, 'i')
      }).distinct('_id');
      query.patientId = { $in: patientIds };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, referrals] = await Promise.all([
      Referral.countDocuments(query),
      Referral.find(query)
        .sort({ 'timestamps.created': -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('healthcareCenterId', 'id name type phone address emergencySupport')
        .populate('patientId', 'id name village district')
    ]);

    return {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: referrals
    };
  }

  /**
   * Get all referrals for a specific patient
   */
  async getPatientReferrals(patientId, queryParams = {}) {
    return await this.listReferrals({
      ...queryParams,
      patientId
    });
  }
}

module.exports = new ReferralService();
