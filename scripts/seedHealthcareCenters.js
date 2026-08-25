const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HealthcareCenter = require('../models/HealthcareCenter');
const { HEALTHCARE_TYPES } = require('../constants/healthcareTypes');

dotenv.config();

const sampleHealthcareCenters = [
  {
    name: 'Kondapur Primary Health Centre',
    type: HEALTHCARE_TYPES.PHC,
    address: 'Near Gram Panchayat Office, Main Road',
    village: 'Kondapur',
    district: 'Medak',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [78.3612, 17.4689] // [lng, lat]
    },
    phone: '+91-9876500001',
    services: ['General Outpatient', 'Maternal Care', 'Child Immunization', 'Basic Diagnostics'],
    emergencySupport: false,
    operatingHours: {
      monday: '09:00 - 16:00',
      tuesday: '09:00 - 16:00',
      wednesday: '09:00 - 16:00',
      thursday: '09:00 - 16:00',
      friday: '09:00 - 16:00',
      saturday: '09:00 - 13:00',
      sunday: 'Closed'
    },
    isActive: true
  },
  {
    name: 'Narsingi Community Health Centre',
    type: HEALTHCARE_TYPES.CHC,
    address: 'Survey No. 45, Narsingi Junction',
    village: 'Narsingi',
    district: 'Rangareddy',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [78.3705, 17.3821]
    },
    phone: '+91-9876500002',
    services: ['General Care', 'Pediatrics', 'Obstetrics & Gynecology', 'Minor Surgery', 'Laboratory'],
    emergencySupport: true,
    operatingHours: {
      monday: '24 Hours',
      tuesday: '24 Hours',
      wednesday: '24 Hours',
      thursday: '24 Hours',
      friday: '24 Hours',
      saturday: '24 Hours',
      sunday: '24 Hours'
    },
    isActive: true
  },
  {
    name: 'Sangareddy District Hospital',
    type: HEALTHCARE_TYPES.HOSPITAL,
    address: 'Hospital Road, Beside Collectorate',
    village: 'Sangareddy',
    district: 'Sangareddy',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [78.0825, 17.6189]
    },
    phone: '+91-9876500003',
    services: ['Emergency Care', 'ICU', 'General Surgery', 'Cardiology', 'Trauma', 'Maternal & Neonatal ICU', 'Blood Bank'],
    emergencySupport: true,
    operatingHours: {
      monday: '24 Hours',
      tuesday: '24 Hours',
      wednesday: '24 Hours',
      thursday: '24 Hours',
      friday: '24 Hours',
      saturday: '24 Hours',
      sunday: '24 Hours'
    },
    isActive: true
  },
  {
    name: 'Chevella Emergency Care Centre',
    type: HEALTHCARE_TYPES.EMERGENCY_CENTER,
    address: 'NH 163 Bypass, Chevella Crossroads',
    village: 'Chevella',
    district: 'Rangareddy',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [78.1345, 17.3112]
    },
    phone: '+91-9876500004',
    services: ['24/7 Trauma Unit', 'Cardiac Emergency', 'Resuscitation', 'Ambulance Dispatch', 'Oxygen Support'],
    emergencySupport: true,
    operatingHours: {
      monday: '24 Hours',
      tuesday: '24 Hours',
      wednesday: '24 Hours',
      thursday: '24 Hours',
      friday: '24 Hours',
      saturday: '24 Hours',
      sunday: '24 Hours'
    },
    isActive: true
  },
  {
    name: 'Shankarpally Rural Clinic',
    type: HEALTHCARE_TYPES.CLINIC,
    address: 'Railway Station Road',
    village: 'Shankarpally',
    district: 'Rangareddy',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [78.1812, 17.4523]
    },
    phone: '+91-9876500005',
    services: ['General Consultation', 'Blood Glucose Testing', 'Fever Clinic', 'First Aid'],
    emergencySupport: false,
    operatingHours: {
      monday: '08:30 - 17:30',
      tuesday: '08:30 - 17:30',
      wednesday: '08:30 - 17:30',
      thursday: '08:30 - 17:30',
      friday: '08:30 - 17:30',
      saturday: '08:30 - 14:00',
      sunday: 'Closed'
    },
    isActive: true
  },
  {
    name: 'Vikarabad Area Hospital',
    type: HEALTHCARE_TYPES.HOSPITAL,
    address: 'Station Road, Vikarabad Town',
    village: 'Vikarabad',
    district: 'Vikarabad',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [77.9048, 17.3364]
    },
    phone: '+91-9876500006',
    services: ['Orthopedics', 'General Medicine', 'Dialysis Unit', 'Pediatrics', 'Obstetrics'],
    emergencySupport: true,
    operatingHours: {
      monday: '24 Hours',
      tuesday: '24 Hours',
      wednesday: '24 Hours',
      thursday: '24 Hours',
      friday: '24 Hours',
      saturday: '24 Hours',
      sunday: '24 Hours'
    },
    isActive: true
  },
  {
    name: 'Moinabad Primary Health Centre',
    type: HEALTHCARE_TYPES.PHC,
    address: 'Near Bus Stand, Moinabad',
    village: 'Moinabad',
    district: 'Rangareddy',
    state: 'Telangana',
    location: {
      type: 'Point',
      coordinates: [78.2789, 17.3245]
    },
    phone: '+91-9876500007',
    services: ['Antenatal Care', 'Child Health', 'Malaria & Dengue Testing', 'General Outpatient'],
    emergencySupport: false,
    operatingHours: {
      monday: '09:00 - 17:00',
      tuesday: '09:00 - 17:00',
      wednesday: '09:00 - 17:00',
      thursday: '09:00 - 17:00',
      friday: '09:00 - 17:00',
      saturday: '09:00 - 13:00',
      sunday: 'Closed'
    },
    isActive: true
  }
];

const seedHealthcareCenters = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/village_health_db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for Healthcare Center Seeding...');

    await HealthcareCenter.deleteMany({});
    console.log('Cleared existing healthcare centers');

    // Ensure 2dsphere index is created
    await HealthcareCenter.collection.createIndex({ location: '2dsphere' });

    const inserted = await HealthcareCenter.insertMany(sampleHealthcareCenters);
    console.log(`Successfully seeded ${inserted.length} healthcare centers:`);
    inserted.forEach((hc) => {
      console.log(` - [${hc.type}] ${hc.name} (${hc.village}, ${hc.district}) - Emergency: ${hc.emergencySupport}`);
    });

    await mongoose.connection.close();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding healthcare centers:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedHealthcareCenters();
}

module.exports = {
  sampleHealthcareCenters,
  seedHealthcareCenters
};