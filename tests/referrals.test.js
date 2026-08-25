const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const HealthcareCenter = require('../models/HealthcareCenter');
const Referral = require('../models/Referral');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { REFERRAL_STATUS, REFERRAL_PRIORITY } = require('../constants/referralEnums');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Referral Module API', () => {
  let user, patient, activeCenter, inactiveCenter, consultation;

  beforeEach(async () => {
    user = await User.create({
      name: 'ASHA Worker Sunita',
      role: 'HEALTH_WORKER',
      assignedVillage: 'Kondapur'
    });

    patient = await Patient.create({
      name: 'Laxmi Devi',
      age: 28,
      gender: 'FEMALE',
      village: 'Kondapur',
      district: 'Medak'
    });

    activeCenter = await HealthcareCenter.create({
      name: 'Narsingi CHC',
      type: 'CHC',
      address: 'Narsingi Junction',
      location: { type: 'Point', coordinates: [78.37, 17.38] },
      isActive: true,
      emergencySupport: true
    });

    inactiveCenter = await HealthcareCenter.create({
      name: 'Closed PHC',
      type: 'PHC',
      address: 'Old Road',
      location: { type: 'Point', coordinates: [78.30, 17.30] },
      isActive: false
    });

    consultation = await Consultation.create({
      patientId: patient._id,
      healthWorkerId: user._id,
      symptoms: ['High fever', 'Body ache'],
      observedConditions: ['Suspected Dengue'],
      urgencyPriority: 'HIGH'
    });
  });

  describe('POST /api/referrals', () => {
    it('should create a referral successfully with status CREATED and auto created timestamp', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('x-healthworker-id', user._id.toString())
        .send({
          patientId: patient._id.toString(),
          consultationId: consultation._id.toString(),
          healthcareCenterId: activeCenter._id.toString(),
          priority: REFERRAL_PRIORITY.HIGH,
          reason: 'Suspected severe fever requiring lab tests and emergency observation',
          clinicalSummary: 'Temp 103F, Low platelet count suspected',
          notes: 'Immediate transfer advised'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(REFERRAL_STATUS.CREATED);
      expect(res.body.data.referralId).toBeDefined();

      const savedRef = await Referral.findById(res.body.data.referralId);
      expect(savedRef.priority).toBe(REFERRAL_PRIORITY.HIGH);
      expect(savedRef.timestamps.created).toBeDefined();
    });

    it('should reject referral creation if patient does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/api/referrals')
        .set('x-healthworker-id', user._id.toString())
        .send({
          patientId: nonExistentId,
          healthcareCenterId: activeCenter._id.toString(),
          priority: REFERRAL_PRIORITY.HIGH,
          reason: 'Emergency evaluation'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Patient not found/i);
    });

    it('should reject referral creation if healthcare center is inactive', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('x-healthworker-id', user._id.toString())
        .send({
          patientId: patient._id.toString(),
          healthcareCenterId: inactiveCenter._id.toString(),
          priority: REFERRAL_PRIORITY.HIGH,
          reason: 'Evaluation'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/inactive/i);
    });

    it('should reject referral with invalid priority', async () => {
      const res = await request(app)
        .post('/api/referrals')
        .set('x-healthworker-id', user._id.toString())
        .send({
          patientId: patient._id.toString(),
          healthcareCenterId: activeCenter._id.toString(),
          priority: 'CRITICAL_URGENT', // Invalid
          reason: 'Evaluation'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/referrals/:id/status & State Machine Transitions', () => {
    let referral;

    beforeEach(async () => {
      referral = await Referral.create({
        patientId: patient._id,
        healthcareCenterId: activeCenter._id,
        priority: REFERRAL_PRIORITY.HIGH,
        reason: 'Severe illness',
        status: REFERRAL_STATUS.CREATED,
        timestamps: { created: new Date() }
      });
    });

    it('should transition through valid sequence: CREATED -> SENT -> ACCEPTED -> ARRIVED -> COMPLETED', async () => {
      // 1. CREATED -> SENT
      let res = await request(app)
        .put(`/api/referrals/${referral._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: REFERRAL_STATUS.SENT });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(REFERRAL_STATUS.SENT);
      expect(res.body.data.timestamps.sent).toBeDefined();

      // 2. SENT -> ACCEPTED
      res = await request(app)
        .put(`/api/referrals/${referral._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: REFERRAL_STATUS.ACCEPTED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(REFERRAL_STATUS.ACCEPTED);
      expect(res.body.data.timestamps.accepted).toBeDefined();

      // 3. ACCEPTED -> ARRIVED
      res = await request(app)
        .put(`/api/referrals/${referral._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: REFERRAL_STATUS.ARRIVED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(REFERRAL_STATUS.ARRIVED);
      expect(res.body.data.timestamps.arrived).toBeDefined();

      // 4. ARRIVED -> COMPLETED
      res = await request(app)
        .put(`/api/referrals/${referral._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: REFERRAL_STATUS.COMPLETED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(REFERRAL_STATUS.COMPLETED);
      expect(res.body.data.timestamps.completed).toBeDefined();
    });

    it('should block invalid transition such as COMPLETED -> CREATED or CREATED -> ARRIVED', async () => {
      // Direct jump from CREATED to ARRIVED without SENT/ACCEPTED
      const res = await request(app)
        .put(`/api/referrals/${referral._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: REFERRAL_STATUS.ARRIVED });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid status transition/i);
    });

    it('should allow cancellation from CREATED or SENT status', async () => {
      const res = await request(app)
        .put(`/api/referrals/${referral._id}/status`)
        .set('x-healthworker-id', user._id.toString())
        .send({ status: REFERRAL_STATUS.CANCELLED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(REFERRAL_STATUS.CANCELLED);
    });
  });

  describe('GET /api/referrals & Pagination/Filtering', () => {
    beforeEach(async () => {
      await Referral.create([
        {
          patientId: patient._id,
          healthcareCenterId: activeCenter._id,
          priority: REFERRAL_PRIORITY.HIGH,
          reason: 'Emergency 1',
          status: REFERRAL_STATUS.COMPLETED,
          timestamps: { created: new Date('2026-08-01') }
        },
        {
          patientId: patient._id,
          healthcareCenterId: activeCenter._id,
          priority: REFERRAL_PRIORITY.LOW,
          reason: 'Routine 1',
          status: REFERRAL_STATUS.SENT,
          timestamps: { created: new Date('2026-08-10') }
        }
      ]);
    });

    it('should list referrals with pagination metadata', async () => {
      const res = await request(app).get('/api/referrals?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
      expect(res.body.total).toBe(2);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter referrals by status and priority', async () => {
      const res = await request(app).get('/api/referrals?status=COMPLETED&priority=HIGH');
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].status).toBe(REFERRAL_STATUS.COMPLETED);
      expect(res.body.data[0].priority).toBe(REFERRAL_PRIORITY.HIGH);
    });

    it('should retrieve referrals for a specific patient via /api/patients/:patientId/referrals', async () => {
      const res = await request(app).get(`/api/patients/${patient._id}/referrals`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
    });
  });
});