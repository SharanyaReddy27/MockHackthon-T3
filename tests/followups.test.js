const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const User = require('../models/User');
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

describe('Follow-up Module API', () => {
  let user, patient;

  beforeEach(async () => {
    user = await User.create({
      name: 'ASHA Worker Ramesh',
      role: 'HEALTH_WORKER',
      assignedVillage: 'Shankarpally'
    });

    patient = await Patient.create({
      name: 'Venkat Reddy',
      age: 54,
      gender: 'MALE',
      village: 'Shankarpally',
      district: 'Rangareddy'
    });
  });

  describe('POST /api/followups', () => {
    it('should create a follow-up with PENDING status', async () => {
      const scheduledDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/followups')
        .set('x-healthworker-id', user._id.toString())
        .send({
          patientId: patient._id.toString(),
          type: FOLLOWUP_TYPES.MEDICATION_REVIEW,
          scheduledDate,
          notes: 'Review blood pressure medications'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(FOLLOWUP_STATUS.PENDING);
      expect(res.body.data.type).toBe(FOLLOWUP_TYPES.MEDICATION_REVIEW);
    });

    it('should reject follow-up creation without required scheduledDate', async () => {
      const res = await request(app)
        .post('/api/followups')
        .set('x-healthworker-id', user._id.toString())
        .send({
          patientId: patient._id.toString(),
          type: FOLLOWUP_TYPES.MEDICATION_REVIEW
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/followups/upcoming & Dynamic Overdue calculation', () => {
    beforeEach(async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

      await FollowUp.create([
        {
          patientId: patient._id,
          type: FOLLOWUP_TYPES.CONSULTATION,
          scheduledDate: inThreeDays,
          status: FOLLOWUP_STATUS.PENDING
        },
        {
          patientId: patient._id,
          type: FOLLOWUP_TYPES.MEDICATION_REVIEW,
          scheduledDate: inTenDays,
          status: FOLLOWUP_STATUS.PENDING
        },
        {
          patientId: patient._id,
          type: FOLLOWUP_TYPES.VACCINATION,
          scheduledDate: pastDate,
          status: FOLLOWUP_STATUS.PENDING
        }
      ]);
    });

    it('should retrieve follow-ups due within specified days window (default 7 days)', async () => {
      const res = await request(app).get('/api/followups/upcoming?days=7');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1); // Only the inThreeDays follow-up
      expect(res.body.data[0].type).toBe(FOLLOWUP_TYPES.CONSULTATION);
    });

    it('should dynamically calculate and flag OVERDUE status for pending past follow-ups', async () => {
      const res = await request(app).get('/api/followups?status=OVERDUE');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].status).toBe(FOLLOWUP_STATUS.OVERDUE);
      expect(res.body.data[0].isOverdue).toBe(true);
    });
  });

  describe('PUT /api/followups/:id/status', () => {
    let followUp;

    beforeEach(async () => {
      followUp = await FollowUp.create({
        patientId: patient._id,
        type: FOLLOWUP_TYPES.REFERRAL,
        scheduledDate: new Date(),
        status: FOLLOWUP_STATUS.PENDING
      });
    });

    it('should update status to COMPLETED and set completedAt server timestamp', async () => {
      const res = await request(app)
        .put(`/api/followups/${followUp._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: FOLLOWUP_STATUS.COMPLETED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(FOLLOWUP_STATUS.COMPLETED);
      expect(res.body.data.completedAt).toBeDefined();
    });
  });
});