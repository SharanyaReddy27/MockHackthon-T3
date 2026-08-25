const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HealthcareCenter = require('../models/HealthcareCenter');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const { sampleHealthcareCenters } = require('./seedHealthcareCenters');
const { REFERRAL_STATUS, REFERRAL_PRIORITY } = require('../constants/referralEnums');
const { FOLLOWUP_STATUS, FOLLOWUP_TYPES } = require('../constants/followUpEnums');

dotenv.config();

const seedFullData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/village_health_db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for Complete System Seeding...');

    // Clear collections
    await Promise.all([
      HealthcareCenter.deleteMany({}),
      Referral.deleteMany({}),
      FollowUp.deleteMany({}),
      User.deleteMany({}),
      Patient.deleteMany({}),
      Consultation.deleteMany({})
    ]);

    // Create 2dsphere index
    await HealthcareCenter.collection.createIndex({ location: '2dsphere' });

    // 1. Seed Health Workers (Users)
    const users = await User.insertMany([
      {
        name: 'Sunita Rao (ASHA Worker)',
        email: 'sunita.asha@villagehealth.org',
        phone: '+91-9988776601',
        role: 'HEALTH_WORKER',
        assignedVillage: 'Kondapur',
        assignedDistrict: 'Medak'
      },
      {
        name: 'Ramesh Patel (ANM)',
        email: 'ramesh.anm@villagehealth.org',
        phone: '+91-9988776602',
        role: 'HEALTH_WORKER',
        assignedVillage: 'Shankarpally',
        assignedDistrict: 'Rangareddy'
      }
    ]);
    console.log(`Seeded ${users.length} health workers`);

    // 2. Seed Patients
    const patients = await Patient.insertMany([
      {
        name: 'Laxmi Devi',
        age: 28,
        gender: 'FEMALE',
        village: 'Kondapur',
        district: 'Medak',
        phone: '+91-9123456701',
        registeredBy: users[0]._id
      },
      {
        name: 'Venkat Reddy',
        age: 54,
        gender: 'MALE',
        village: 'Shankarpally',
        district: 'Rangareddy',
        phone: '+91-9123456702',
        registeredBy: users[1]._id
      },
      {
        name: 'Ananya Sharma',
        age: 4,
        gender: 'FEMALE',
        village: 'Kondapur',
        district: 'Medak',
        phone: '+91-9123456703',
        registeredBy: users[0]._id
      },
      {
        name: 'Babu Rao',
        age: 62,
        gender: 'MALE',
        village: 'Chevella',
        district: 'Rangareddy',
        phone: '+91-9123456704',
        registeredBy: users[1]._id
      },
      {
        name: 'Kavitha M.',
        age: 31,
        gender: 'FEMALE',
        village: 'Shankarpally',
        district: 'Rangareddy',
        phone: '+91-9123456705',
        registeredBy: users[1]._id
      }
    ]);
    console.log(`Seeded ${patients.length} patients`);

    // 3. Seed Healthcare Centers
    const centers = await HealthcareCenter.insertMany(sampleHealthcareCenters);
    console.log(`Seeded ${centers.length} healthcare centers`);

    // 4. Seed Consultations
    const consultations = await Consultation.insertMany([
      {
        patientId: patients[0]._id,
        healthWorkerId: users[0]._id,
        symptoms: ['High fever', 'Severe headache', 'Joint pain'],
        observedConditions: ['Suspected Dengue', 'Mild Dehydration'],
        urgencyPriority: 'HIGH',
        notes: 'Platelet count needs urgent verification at secondary facility.'
      },
      {
        patientId: patients[1]._id,
        healthWorkerId: users[1]._id,
        symptoms: ['Chest tightness', 'Shortness of breath on exertion'],
        observedConditions: ['Hypertensive Urgency', 'Suspected Angina'],
        urgencyPriority: 'HIGH',
        notes: 'Needs immediate ECG and cardiology review.'
      },
      {
        patientId: patients[2]._id,
        healthWorkerId: users[0]._id,
        symptoms: ['Persistent dry cough for 3 weeks', 'Low grade evening fever'],
        observedConditions: ['Suspected Pulmonary Infection', 'Underweight'],
        urgencyPriority: 'MODERATE',
        notes: 'Requires chest X-ray and sputum examination at CHC.'
      },
      {
        patientId: patients[3]._id,
        healthWorkerId: users[1]._id,
        symptoms: ['Joint stiffness', 'Bilateral knee pain'],
        observedConditions: ['Osteoarthritis flare-up'],
        urgencyPriority: 'LOW',
        notes: 'Pain management and physiotherapy consultation.'
      }
    ]);
    console.log(`Seeded ${consultations.length} consultations`);

    // 5. Seed Referrals
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    const referrals = await Referral.insertMany([
      {
        patientId: patients[0]._id,
        consultationId: consultations[0]._id,
        healthcareCenterId: centers[1]._id, // Narsingi CHC
        priority: REFERRAL_PRIORITY.HIGH,
        reason: 'Severe fever with suspected low platelets requiring pediatric/emergency admission',
        clinicalSummary: 'Temp: 103F, BP 90/60. Suspected Dengue.',
        status: REFERRAL_STATUS.ARRIVED,
        referredBy: users[0]._id,
        timestamps: {
          created: threeDaysAgo,
          sent: twoDaysAgo,
          accepted: oneDayAgo,
          arrived: now
        }
      },
      {
        patientId: patients[1]._id,
        consultationId: consultations[1]._id,
        healthcareCenterId: centers[2]._id, // Sangareddy District Hospital
        priority: REFERRAL_PRIORITY.HIGH,
        reason: 'Emergency cardiology review and ICU monitoring for suspected unstable angina',
        clinicalSummary: 'BP 180/110 mmHg, pulse 105 bpm, chest discomfort.',
        status: REFERRAL_STATUS.COMPLETED,
        referredBy: users[1]._id,
        timestamps: {
          created: threeDaysAgo,
          sent: threeDaysAgo,
          accepted: twoDaysAgo,
          arrived: twoDaysAgo,
          completed: oneDayAgo
        }
      },
      {
        patientId: patients[2]._id,
        consultationId: consultations[2]._id,
        healthcareCenterId: centers[0]._id, // Kondapur PHC
        priority: REFERRAL_PRIORITY.MODERATE,
        reason: 'Pediatric cough evaluation and chest radiograph',
        clinicalSummary: 'Cough > 20 days. Normal oxygen saturation.',
        status: REFERRAL_STATUS.SENT,
        referredBy: users[0]._id,
        timestamps: {
          created: oneDayAgo,
          sent: now
        }
      },
      {
        patientId: patients[3]._id,
        consultationId: consultations[3]._id,
        healthcareCenterId: centers[4]._id, // Shankarpally Clinic
        priority: REFERRAL_PRIORITY.LOW,
        reason: 'Knee joint pain management and prescription review',
        clinicalSummary: 'Chronic degenerative knee pain.',
        status: REFERRAL_STATUS.CREATED,
        referredBy: users[1]._id,
        timestamps: {
          created: now
        }
      }
    ]);
    console.log(`Seeded ${referrals.length} referrals`);

    // 6. Seed Follow-ups
    const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const followUps = await FollowUp.insertMany([
      {
        patientId: patients[0]._id,
        referralId: referrals[0]._id,
        consultationId: consultations[0]._id,
        type: FOLLOWUP_TYPES.REFERRAL,
        scheduledDate: inTwoDays,
        notes: 'Check if platelet count stabilized after hospital discharge',
        status: FOLLOWUP_STATUS.PENDING,
        createdBy: users[0]._id
      },
      {
        patientId: patients[1]._id,
        referralId: referrals[1]._id,
        consultationId: consultations[1]._id,
        type: FOLLOWUP_TYPES.MEDICATION_REVIEW,
        scheduledDate: inFiveDays,
        notes: 'Review hypertensive medications prescribed by District Hospital cardiologist',
        status: FOLLOWUP_STATUS.PENDING,
        createdBy: users[1]._id
      },
      {
        patientId: patients[2]._id,
        referralId: referrals[2]._id,
        type: FOLLOWUP_TYPES.CONSULTATION,
        scheduledDate: pastDate, // Intentionally in the past to test dynamic OVERDUE computation
        notes: 'Verify if sputum test results were received from CHC',
        status: FOLLOWUP_STATUS.PENDING,
        createdBy: users[0]._id
      },
      {
        patientId: patients[3]._id,
        referralId: referrals[3]._id,
        type: FOLLOWUP_TYPES.GENERAL,
        scheduledDate: pastDate,
        notes: 'Check pain tolerance with new analgesics',
        status: FOLLOWUP_STATUS.COMPLETED,
        completedAt: oneDayAgo,
        createdBy: users[1]._id
      }
    ]);
    console.log(`Seeded ${followUps.length} follow-ups`);

    await mongoose.connection.close();
    console.log('\n--- Complete Seeding Finished Successfully! ---');
  } catch (error) {
    console.error('Error seeding full dataset:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedFullData();
}

module.exports = {
  seedFullData
};