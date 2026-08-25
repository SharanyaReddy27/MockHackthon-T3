const mongoose = require('mongoose');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const HealthcareCenter = require('../models/HealthcareCenter');
const { REFERRAL_STATUS, REFERRAL_PRIORITY } = require('../constants/referralEnums');
const { FOLLOWUP_STATUS } = require('../constants/followUpEnums');

class AnalyticsService {
  /**
   * Helper: resolves patient IDs matching village and/or district filter
   */
  async getMatchingPatientIds({ village, district }) {
    if (!village && !district) return null;

    const patientQuery = {};
    if (village) patientQuery.village = new RegExp(village, 'i');
    if (district) patientQuery.district = new RegExp(district, 'i');

    const patientIds = await Patient.find(patientQuery).distinct('_id');
    return patientIds;
  }

  /**
   * Helper: Builds date range match object
   */
  buildDateRange(from, to, dateField = 'createdAt') {
    if (!from && !to) return null;

    const range = {};
    if (from) range.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      if (to.length === 10) toDate.setUTCHours(23, 59, 59, 999);
      range.$lte = toDate;
    }
    return { [dateField]: range };
  }

  /**
   * GET /api/analytics/overview
   */
  async getOverviewAnalytics(filters = {}) {
    const { village, district, from, to } = filters;
    const patientIds = await this.getMatchingPatientIds({ village, district });

    // 1. Patient count
    const patientFilter = {};
    if (village) patientFilter.village = new RegExp(village, 'i');
    if (district) patientFilter.district = new RegExp(district, 'i');
    if (from || to) {
      const pDate = this.buildDateRange(from, to, 'createdAt');
      if (pDate) Object.assign(patientFilter, pDate);
    }
    const totalPatients = await Patient.countDocuments(patientFilter);

    // 2. Referral Aggregations
    const referralMatch = {};
    if (patientIds !== null) {
      referralMatch.patientId = { $in: patientIds };
    }
    if (from || to) {
      const rDate = this.buildDateRange(from, to, 'timestamps.created');
      if (rDate) Object.assign(referralMatch, rDate);
    }

    const referralAgg = await Referral.aggregate([
      { $match: referralMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', REFERRAL_STATUS.COMPLETED] }, 1, 0] }
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [
                      REFERRAL_STATUS.CREATED,
                      REFERRAL_STATUS.SENT,
                      REFERRAL_STATUS.ACCEPTED,
                      REFERRAL_STATUS.ARRIVED
                    ]
                  ]
                },
                1,
                0
              ]
            }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', REFERRAL_STATUS.CANCELLED] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', REFERRAL_PRIORITY.HIGH] }, 1, 0] }
          },
          moderatePriority: {
            $sum: { $cond: [{ $eq: ['$priority', REFERRAL_PRIORITY.MODERATE] }, 1, 0] }
          },
          lowPriority: {
            $sum: { $cond: [{ $eq: ['$priority', REFERRAL_PRIORITY.LOW] }, 1, 0] }
          }
        }
      }
    ]);

    const refStats = referralAgg[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      highPriority: 0,
      moderatePriority: 0,
      lowPriority: 0
    };

    // 3. Follow-up Aggregations
    const followUpMatch = {};
    if (patientIds !== null) {
      followUpMatch.patientId = { $in: patientIds };
    }
    if (from || to) {
      const fDate = this.buildDateRange(from, to, 'scheduledDate');
      if (fDate) Object.assign(followUpMatch, fDate);
    }

    const now = new Date();
    const followUpAgg = await FollowUp.aggregate([
      { $match: followUpMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', FOLLOWUP_STATUS.PENDING] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', FOLLOWUP_STATUS.COMPLETED] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', FOLLOWUP_STATUS.PENDING] },
                    { $lt: ['$scheduledDate', now] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const followStats = followUpAgg[0] || {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0
    };

    return {
      totalPatients,
      totalReferrals: refStats.total,
      pendingReferrals: refStats.pending,
      completedReferrals: refStats.completed,
      highPriorityReferrals: refStats.highPriority,
      moderatePriorityReferrals: refStats.moderatePriority,
      lowPriorityReferrals: refStats.lowPriority,
      pendingFollowups: followStats.pending,
      overdueFollowups: followStats.overdue
    };
  }

  /**
   * GET /api/analytics/referrals
   */
  async getReferralAnalytics(filters = {}) {
    const { village, district, from, to } = filters;
    const patientIds = await this.getMatchingPatientIds({ village, district });

    const matchStage = {};
    if (patientIds !== null) {
      matchStage.patientId = { $in: patientIds };
    }
    if (from || to) {
      const rDate = this.buildDateRange(from, to, 'timestamps.created');
      if (rDate) Object.assign(matchStage, rDate);
    }

    const [priorityAgg, statusAgg, centerAgg, completionTimeAgg] = await Promise.all([
      // Aggregation by priority
      Referral.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),

      // Aggregation by status
      Referral.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Aggregation by healthcare center
      Referral.aggregate([
        { $match: matchStage },
        { $group: { _id: '$healthcareCenterId', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'healthcarecenters',
            localField: '_id',
            foreignField: '_id',
            as: 'center'
          }
        },
        { $unwind: { path: '$center', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            healthcareCenterId: '$_id',
            name: { $ifNull: ['$center.name', 'Unknown Facility'] },
            type: { $ifNull: ['$center.type', 'UNKNOWN'] },
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Average completion time (hours)
      Referral.aggregate([
        {
          $match: {
            ...matchStage,
            status: REFERRAL_STATUS.COMPLETED,
            'timestamps.completed': { $exists: true },
            'timestamps.created': { $exists: true }
          }
        },
        {
          $project: {
            durationHours: {
              $divide: [
                { $subtract: ['$timestamps.completed', '$timestamps.created'] },
                1000 * 60 * 60
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgCompletionTimeHours: { $avg: '$durationHours' },
            completedCount: { $sum: 1 }
          }
        }
      ])
    ]);

    // Build byPriority map
    const byPriority = {
      [REFERRAL_PRIORITY.LOW]: 0,
      [REFERRAL_PRIORITY.MODERATE]: 0,
      [REFERRAL_PRIORITY.HIGH]: 0
    };
    let total = 0;
    priorityAgg.forEach((item) => {
      if (item._id && byPriority[item._id] !== undefined) {
        byPriority[item._id] = item.count;
      }
      total += item.count;
    });

    // Build byStatus map
    const byStatus = {
      [REFERRAL_STATUS.CREATED]: 0,
      [REFERRAL_STATUS.SENT]: 0,
      [REFERRAL_STATUS.ACCEPTED]: 0,
      [REFERRAL_STATUS.ARRIVED]: 0,
      [REFERRAL_STATUS.COMPLETED]: 0,
      [REFERRAL_STATUS.CANCELLED]: 0
    };
    statusAgg.forEach((item) => {
      if (item._id && byStatus[item._id] !== undefined) {
        byStatus[item._id] = item.count;
      }
    });

    const completed = byStatus[REFERRAL_STATUS.COMPLETED] || 0;
    const cancelled = byStatus[REFERRAL_STATUS.CANCELLED] || 0;
    const nonCancelledTotal = total - cancelled;
    const completionRate = nonCancelledTotal > 0 ? Math.round((completed / nonCancelledTotal) * 1000) / 10 : 0;

    const pending =
      (byStatus[REFERRAL_STATUS.CREATED] || 0) +
      (byStatus[REFERRAL_STATUS.SENT] || 0) +
      (byStatus[REFERRAL_STATUS.ACCEPTED] || 0) +
      (byStatus[REFERRAL_STATUS.ARRIVED] || 0);

    const avgTime =
      completionTimeAgg[0] && completionTimeAgg[0].avgCompletionTimeHours !== null
        ? Math.round(completionTimeAgg[0].avgCompletionTimeHours * 10) / 10
        : 0;

    return {
      total,
      byPriority,
      byStatus,
      byHealthcareCenter: centerAgg,
      completionRate: `${completionRate}%`,
      pending,
      averageCompletionTimeHours: avgTime
    };
  }

  /**
   * GET /api/analytics/followups
   */
  async getFollowUpAnalytics(filters = {}) {
    const { village, district, from, to } = filters;
    const patientIds = await this.getMatchingPatientIds({ village, district });

    const matchStage = {};
    if (patientIds !== null) {
      matchStage.patientId = { $in: patientIds };
    }
    if (from || to) {
      const fDate = this.buildDateRange(from, to, 'scheduledDate');
      if (fDate) Object.assign(matchStage, fDate);
    }

    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + (7 - startOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const agg = await FollowUp.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', FOLLOWUP_STATUS.PENDING] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', FOLLOWUP_STATUS.COMPLETED] }, 1, 0] }
          },
          missed: {
            $sum: { $cond: [{ $eq: ['$status', FOLLOWUP_STATUS.MISSED] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', FOLLOWUP_STATUS.CANCELLED] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', FOLLOWUP_STATUS.PENDING] },
                    { $lt: ['$scheduledDate', now] }
                  ]
                },
                1,
                0
              ]
            }
          },
          dueThisWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', FOLLOWUP_STATUS.PENDING] },
                    { $gte: ['$scheduledDate', startOfWeek] },
                    { $lte: ['$scheduledDate', endOfWeek] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = agg[0] || {
      total: 0,
      pending: 0,
      completed: 0,
      missed: 0,
      cancelled: 0,
      overdue: 0,
      dueThisWeek: 0
    };

    return {
      total: stats.total,
      pending: stats.pending,
      completed: stats.completed,
      missed: stats.missed,
      overdue: stats.overdue,
      dueThisWeek: stats.dueThisWeek
    };
  }

  /**
   * GET /api/analytics/healthcare-centers
   */
  async getHealthcareCenterAnalytics(filters = {}) {
    const { village, district, from, to } = filters;
    const patientIds = await this.getMatchingPatientIds({ village, district });

    const matchStage = {};
    if (patientIds !== null) {
      matchStage.patientId = { $in: patientIds };
    }
    if (from || to) {
      const rDate = this.buildDateRange(from, to, 'timestamps.created');
      if (rDate) Object.assign(matchStage, rDate);
    }

    const results = await Referral.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$healthcareCenterId',
          totalReferrals: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', REFERRAL_STATUS.COMPLETED] }, 1, 0] }
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [
                      REFERRAL_STATUS.CREATED,
                      REFERRAL_STATUS.SENT,
                      REFERRAL_STATUS.ACCEPTED,
                      REFERRAL_STATUS.ARRIVED
                    ]
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'healthcarecenters',
          localField: '_id',
          foreignField: '_id',
          as: 'center'
        }
      },
      { $unwind: { path: '$center', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          healthcareCenterId: '$_id',
          name: { $ifNull: ['$center.name', 'Unknown Center'] },
          type: { $ifNull: ['$center.type', 'UNKNOWN'] },
          village: '$center.village',
          district: '$center.district',
          totalReferrals: 1,
          completed: 1,
          pending: 1
        }
      },
      { $sort: { totalReferrals: -1 } }
    ]);

    return { data: results };
  }

  /**
   * GET /api/analytics/health-trends
   * Aggregates recorded consultation observations/symptoms (clinical decision support only)
   */
  async getHealthTrendsAnalytics(filters = {}) {
    const { village, district, from, to } = filters;
    const patientIds = await this.getMatchingPatientIds({ village, district });

    const matchStage = {};
    if (patientIds !== null) {
      matchStage.patientId = { $in: patientIds };
    }
    if (from || to) {
      const cDate = this.buildDateRange(from, to, 'createdAt');
      if (cDate) Object.assign(matchStage, cDate);
    }

    const [symptomAgg, conditionAgg] = await Promise.all([
      Consultation.aggregate([
        { $match: matchStage },
        { $unwind: '$symptoms' },
        { $group: { _id: '$symptoms', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, symptom: '$_id', count: 1 } }
      ]),
      Consultation.aggregate([
        { $match: matchStage },
        { $unwind: '$observedConditions' },
        { $group: { _id: '$observedConditions', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, condition: '$_id', count: 1 } }
      ])
    ]);

    return {
      disclaimer: 'These metrics represent aggregated recorded observations from frontline consultations and do not constitute epidemiological diagnoses.',
      symptoms: symptomAgg,
      observedConditions: conditionAgg
    };
  }
}

module.exports = new AnalyticsService();
