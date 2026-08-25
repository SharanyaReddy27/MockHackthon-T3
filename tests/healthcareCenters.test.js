const request = require('supertest');
const app = require('../server');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const HealthcareCenter = require('../models/HealthcareCenter');
const { HEALTHCARE_TYPES } = require('../constants/healthcareTypes');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Healthcare Center API Module', () => {
  const sampleCenterData = {
    name: 'Kondapur Primary Health Centre',
    type: HEALTHCARE_TYPES.PHC,
    address: 'Near Gram Panchayat Office',
    village: 'Kondapur',
    district: 'Medak',
    state: 'Telangana',
    latitude: 17.4689,
    longitude: 78.3612,
    phone: '+91-9876500001',
    services: ['General Outpatient', 'Maternal Care', 'Child Immunization'],
    emergencySupport: false,
    operatingHours: {
      monday: '09:00 - 16:00'
    },
    isActive: true
  };

  describe('POST /api/healthcare-centers', () => {
    it('should successfully create a new healthcare center with valid GeoJSON point', async () => {
      const res = await request(app)
        .post('/api/healthcare-centers')
        .send(sampleCenterData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Kondapur Primary Health Centre');
      expect(res.body.data.location.type).toBe('Point');
      expect(res.body.data.location.coordinates).toEqual([78.3612, 17.4689]); // [lng, lat]
    });

    it('should reject center creation with invalid coordinates', async () => {
      const res = await request(app)
        .post('/api/healthcare-centers')
        .send({
          ...sampleCenterData,
          latitude: 150 // Invalid latitude > 90
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject center creation with unsupported facility type', async () => {
      const res = await request(app)
        .post('/api/healthcare-centers')
        .send({
          ...sampleCenterData,
          type: 'SUPER_SPECIALTY_HOSPITAL' // not in enum
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/healthcare-centers', () => {
    beforeEach(async () => {
      await HealthcareCenter.create([
        {
          name: 'Center 1',
          type: HEALTHCARE_TYPES.PHC,
          address: 'Village A',
          village: 'Village A',
          district: 'District 1',
          location: { type: 'Point', coordinates: [78.36, 17.46] },
          emergencySupport: false,
          services: ['General Care'],
          isActive: true
        },
        {
          name: 'Center 2',
          type: HEALTHCARE_TYPES.EMERGENCY_CENTER,
          address: 'Village B',
          village: 'Village B',
          district: 'District 1',
          location: { type: 'Point', coordinates: [78.13, 17.31] },
          emergencySupport: true,
          services: ['Trauma Care', 'Cardiology'],
          isActive: true
        }
      ]);
    });

    it('should list all healthcare centers', async () => {
      const res = await request(app).get('/api/healthcare-centers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('should filter centers by emergencySupport', async () => {
      const res = await request(app).get('/api/healthcare-centers?emergencySupport=true');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].emergencySupport).toBe(true);
    });

    it('should filter centers by type', async () => {
      const res = await request(app).get('/api/healthcare-centers?type=PHC');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].type).toBe('PHC');
    });
  });

  describe('GET /api/healthcare-centers/nearby', () => {
    beforeEach(async () => {
      // Ensure 2dsphere index
      await HealthcareCenter.collection.createIndex({ location: '2dsphere' });

      await HealthcareCenter.create([
        {
          name: 'Nearby PHC',
          type: HEALTHCARE_TYPES.PHC,
          address: 'Nearby Locality',
          location: { type: 'Point', coordinates: [78.486, 17.385] }, // 0 km away
          emergencySupport: false,
          services: ['General Outpatient', 'Maternal Care'],
          isActive: true
        },
        {
          name: 'Nearby Emergency Hospital',
          type: HEALTHCARE_TYPES.HOSPITAL,
          address: '5 km away',
          location: { type: 'Point', coordinates: [78.44, 17.385] }, // ~4.9 km away
          emergencySupport: true,
          services: ['Emergency Care', 'ICU', 'Surgery'],
          isActive: true
        },
        {
          name: 'Far Away Center',
          type: HEALTHCARE_TYPES.CHC,
          address: '100 km away',
          location: { type: 'Point', coordinates: [79.486, 18.385] }, // ~150 km away
          emergencySupport: true,
          services: ['General'],
          isActive: true
        }
      ]);
    });

    it('should find centers within specified radius sorted by distance', async () => {
      const res = await request(app)
        .get('/api/healthcare-centers/nearby')
        .query({
          latitude: 17.385,
          longitude: 78.486,
          radius: 20
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2); // Nearby PHC and Nearby Emergency Hospital
      expect(res.body.data[0].name).toBe('Nearby PHC');
      expect(res.body.data[0].distanceKm).toBeDefined();
      expect(res.body.data[0].distanceKm).toBeLessThanOrEqual(res.body.data[1].distanceKm);
    });

    it('should filter nearby discovery by emergency capability', async () => {
      const res = await request(app)
        .get('/api/healthcare-centers/nearby')
        .query({
          latitude: 17.385,
          longitude: 78.486,
          radius: 20,
          emergencySupport: 'true'
        });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe('Nearby Emergency Hospital');
      expect(res.body.data[0].emergencySupport).toBe(true);
    });

    it('should reject nearby search with missing coordinates', async () => {
      const res = await request(app)
        .get('/api/healthcare-centers/nearby')
        .query({
          radius: 20
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});