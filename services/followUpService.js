const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const Referral = require('../models/Referral');
const { FOLLOWUP_STATUS, ALLOWED_PERSISTED_FOLLOWUP_STATUSES } = require('../constants/followUpEnums');

class FollowUpService {
  /**
   * Create a new follow-up
   */
  async createFollowUp(data, createdById) {
    const { patientId, referralId, consultationId, type, scheduledDate, notes } = data;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      const err = new Error(`Patient not found with ID: ${patientId}`);
      err.statusCode = 404;
      throw err;
    }

    // Verify referral if provided
    if (referralId) {
      const referral = await Referral.findById(referralId);
      if (!referral) {
        const err = new Error(`Referral not found with ID: ${referralId}`);
        err.statusCode = 404;
        throw err;
      }
    }

    const followUp = new FollowUp({
      patientId,
      referralId: referralId || null,
      consultationId: consultationId || null,
      type,
      scheduledDate: new Date(scheduledDate),
      notes: notes || '',
      status: FOLLOWUP_STATUS.PENDING,
      createdBy: createdById || null
    });

    return await followUp.save();
  }

  /**
   * Get single follow-up by ID
   */
  async getFollowUpById(id) {
    const followUp = await FollowUp.findById(id)
      .populate('patientId', 'id name age gender village district phone')
      .populate('referralId', 'id priority status healthcareCenterId')
      .populate('createdBy', 'id name role');

    if (!followUp) {
      const err = new Error(`Follow-up not found with ID: ${id}`);
      err.statusCode = 404;
      throw err;
    }

    return followUp;
  }

  /**
   * Get upcoming follow-ups
   * @param {Object} params { days, village }
   */
  async getUpcomingFollowUps({ days = 7, village }) {
    const daysCount = parseInt(days, 10) || 7;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysCount);
    futureDate.setHours(23, 59, 59, 999);

    const query = {
      status: FOLLOWUP_STATUS.PENDING,
      scheduledDate: { $gte: now, $lte: futureDate }
    };

    if (village) {
      const patientIds = await Patient.find({
        village: new RegExp(village, 'i')
      }).distinct('_id');
      query.patientId = { $in: patientIds };
    }

    const upcoming = await FollowUp.find(query)
      .sort({ scheduledDate: 1 })
      .populate('patientId', 'id name village phone')
      .populate('referralId', 'id priority status');

    return upcoming;
  }

  /**
   * Update follow-up status
   */
  async updateFollowUpStatus(id, newStatus, userId) {
    if (!ALLOWED_PERSISTED_FOLLOWUP_STATUSES.includes(newStatus)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_PERSISTED_FOLLOWUP_STATUSES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      const err = new Error(`Follow-up not found with ID: ${id}`);
      err.statusCode = 404;
      throw err;
    }

    followUp.status = newStatus;
    if (newStatus === FOLLOWUP_STATUS.COMPLETED) {
      followUp.completedAt = new Date();
    } else {
      followUp.completedAt = undefined;
    }

    return await followUp.save();
  }

  /**
   * List follow-ups with filtering and pagination
   */
  async listFollowUps(filters = {}) {
    const {
      page = 1,
      limit = 20,
      patientId,
      status,
      type,
      from,
      to,
      village
    } = filters;

    const query = {};

    if (patientId) query.patientId = patientId;
    if (type) query.type = type;

    // Handle status filtering including dynamic OVERDUE filter
    if (status) {
      if (status.toUpperCase() === FOLLOWUP_STATUS.OVERDUE) {
        query.status = FOLLOWUP_STATUS.PENDING;
        query.scheduledDate = { $lt: new Date() };
      } else {
        query.status = status.toUpperCase();
      }
    }

    if (from || to) {
      query.scheduledDate = query.scheduledDate || {};
      if (from) query.scheduledDate.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        if (to.length === 10) toDate.setUTCHours(23, 59, 59, 999);
        query.scheduledDate.$lte = toDate;
      }
    }

    if (village) {
      const patientIds = await Patient.find({
        village: new RegExp(village, 'i')
      }).distinct('_id');
      query.patientId = { $in: patientIds };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, followUps] = await Promise.all([
      FollowUp.countDocuments(query),
      FollowUp.find(query)
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('patientId', 'id name village phone')
        .populate('referralId', 'id priority status')
    ]);

    return {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: followUps
    };
  }
}

module.exports = new FollowUpService();
