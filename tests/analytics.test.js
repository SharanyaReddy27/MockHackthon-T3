const request = require('supertest');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const HealthcareCenter = require('../models/HealthcareCenter');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { REFERRAL_STATUS, REFERRAL_PRIORITY } = require('../constants/referralEnums');
const { FOLLOWUP_STATUS, FOLLOWUP_TYPES } = require('../constants/followUpEnums');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Village Health Analytics Module', () => {
  let user, patient1, patient2, center1, center2;

  beforeEach(async () => {
    user = await User.create({
      name: 'ASHA Worker Sunita',
      role: 'HEALTH_WORKER',
      assignedVillage: 'Kondapur'
    });

    patient1 = await Patient.create({
      name: 'Laxmi Devi',
      village: 'Kondapur',
      district: 'Medak',
      registeredBy: user._id
    });

    patient2 = await Patient.create({
      name: 'Venkat Reddy',
      village: 'Shankarpally',
      district: 'Rangareddy',
      registeredBy: user._id
    });

    center1 = await HealthcareCenter.create({
      name: 'Kondapur PHC',
      type: 'PHC',
      address: 'Main Road',
      location: { type: 'Point', coordinates: [78.36, 17.46] },
      emergencySupport: false
    });

    center2 = await HealthcareCenter.create({
      name: 'Narsingi CHC',
      type: 'CHC',
      address: 'Junction',
      location: { type: 'Point', coordinates: [78.37, 17.38] },
      emergencySupport: true
    });

    // Create referrals
    const createdTime = new Date('2026-08-01T10:00:00Z');
    const completedTime = new Date('2026-08-01T14:00:00Z'); // 4 hours later

    await Referral.create([
      {
        patientId: patient1._id,
        healthcareCenterId: center1._id,
        priority: REFERRAL_PRIORITY.HIGH,
        reason: 'Severe fever',
        status: REFERRAL_STATUS.COMPLETED,
        timestamps: {
          created: createdTime,
          completed: completedTime
        }
      },
      {
        patientId: patient1._id,
        healthcareCenterId: center2._id,
        priority: REFERRAL_PRIORITY.MODERATE,
        reason: 'Cough check',
        status: REFERRAL_STATUS.SENT,
        timestamps: { created: new Date('2026-08-05T10:00:00Z') }
      },
      {
        patientId: patient2._id,
        healthcareCenterId: center2._id,
        priority: REFERRAL_PRIORITY.LOW,
        reason: 'Joint pain',
        status: REFERRAL_STATUS.CREATED,
        timestamps: { created: new Date('2026-08-10T10:00:00Z') }
      }
    ]);

    // Create follow-ups
    const now = new Date();
    const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const futureDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    await FollowUp.create([
      {
        patientId: patient1._id,
        type: FOLLOWUP_TYPES.REFERRAL,
        scheduledDate: pastDate, // Overdue
        status: FOLLOWUP_STATUS.PENDING
      },
      {
        patientId: patient2._id,
        type: FOLLOWUP_TYPES.MEDICATION_REVIEW,
        scheduledDate: futureDate,
        status: FOLLOWUP_STATUS.PENDING
      },
      {
        patientId: patient1._id,
        type: FOLLOWUP_TYPES.GENERAL,
        scheduledDate: pastDate,
        status: FOLLOWUP_STATUS.COMPLETED,
        completedAt: now
      }
    ]);

    // Create consultations for symptom trends
    await Consultation.create([
      {
        patientId: patient1._id,
        symptoms: ['Fever', 'Headache'],
        observedConditions: ['Suspected Dengue'],
        urgencyPriority: 'HIGH'
      },
      {
        patientId: patient2._id,
        symptoms: ['Fever', 'Cough'],
        observedConditions: ['Upper Respiratory Tract Infection'],
        urgencyPriority: 'LOW'
      }
    ]);
  });

  describe('GET /api/analytics/overview', () => {
    it('should aggregate overall metrics accurately', async () => {
      const res = await request(app).get('/api/analytics/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPatients).toBe(2);
      expect(res.body.data.totalReferrals).toBe(3);
      expect(res.body.data.completedReferrals).toBe(1);
      expect(res.body.data.pendingReferrals).toBe(2);
      expect(res.body.data.highPriorityReferrals).toBe(1);
      expect(res.body.data.pendingFollowups).toBe(2);
      expect(res.body.data.overdueFollowups).toBe(1);
    });

    it('should support village-level filtering', async () => {
      const res = await request(app).get('/api/analytics/overview?village=Kondapur');
      expect(res.status).toBe(200);
      expect(res.body.data.totalPatients).toBe(1);
      expect(res.body.data.totalReferrals).toBe(2); // Only patient1's referrals
    });
  });

  describe('GET /api/analytics/referrals', () => {
    it('should return detailed referral metrics including priority breakdown, completion rate and avg time', async () => {
      const res = await request(app).get('/api/analytics/referrals');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.byPriority.HIGH).toBe(1);
      expect(res.body.data.byPriority.MODERATE).toBe(1);
      expect(res.body.data.byPriority.LOW).toBe(1);
      expect(res.body.data.byStatus.COMPLETED).toBe(1);
      expect(res.body.data.averageCompletionTimeHours).toBe(4); // 4 hours from test seed
    });
  });

  describe('GET /api/analytics/followups', () => {
    it('should return follow-up status statistics and overdue counts', async () => {
      const res = await request(app).get('/api/analytics/followups');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.pending).toBe(2);
      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.overdue).toBe(1);
    });
  });

  describe('GET /api/analytics/healthcare-centers', () => {
    it('should return referral counts grouped per healthcare center', async () => {
      const res = await request(app).get('/api/analytics/healthcare-centers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);

      const narsingi = res.body.data.find((c) => c.name === 'Narsingi CHC');
      expect(narsingi).toBeDefined();
      expect(narsingi.totalReferrals).toBe(2);
    });
  });

  describe('GET /api/analytics/health-trends', () => {
    it('should aggregate recorded consultation observations and symptoms', async () => {
      const res = await request(app).get('/api/analytics/health-trends');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.disclaimer).toBeDefined();

      const feverSymptom = res.body.data.symptoms.find((s) => s.symptom === 'Fever');
      expect(feverSymptom).toBeDefined();
      expect(feverSymptom.count).toBe(2); // 2 consultations had Fever
    });
  });
});