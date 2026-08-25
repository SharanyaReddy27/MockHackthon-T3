const HealthcareCenter = require('../models/HealthcareCenter');

/**
 * Healthcare Center Service
 * Handles geospatial discovery, filtering, and facility management
 */
class HealthcareCenterService {
  /**
   * Create a new healthcare center
   */
  async createHealthcareCenter(data) {
    const {
      name,
      type,
      address,
      village,
      district,
      state,
      latitude,
      longitude,
      phone,
      services,
      emergencySupport,
      operatingHours,
      isActive
    } = data;

    const center = new HealthcareCenter({
      name,
      type,
      address,
      village,
      district,
      state,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      phone,
      services: services || [],
      emergencySupport: emergencySupport === true || emergencySupport === 'true',
      operatingHours,
      isActive: isActive !== undefined ? isActive : true
    });

    return await center.save();
  }

  /**
   * Update existing healthcare center
   */
  async updateHealthcareCenter(id, data) {
    const updatePayload = { ...data };

    if (data.latitude !== undefined && data.longitude !== undefined) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)]
      };
      delete updatePayload.latitude;
      delete updatePayload.longitude;
    }

    const updated = await HealthcareCenter.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true
    });

    return updated;
  }

  /**
   * Get single healthcare center by ID
   */
  async getHealthcareCenterById(id) {
    return await HealthcareCenter.findById(id);
  }

  /**
   * List all healthcare centers with optional filters
   */
  async listHealthcareCenters(filters = {}) {
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.village) query.village = new RegExp(filters.village, 'i');
    if (filters.district) query.district = new RegExp(filters.district, 'i');
    if (filters.emergencySupport !== undefined) {
      query.emergencySupport = filters.emergencySupport === 'true' || filters.emergencySupport === true;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters.service) {
      query.services = { $in: [new RegExp(filters.service, 'i')] };
    }

    const centers = await HealthcareCenter.find(query).sort({ name: 1 });
    return centers;
  }

  /**
   * Find nearby healthcare centers using MongoDB $geoNear aggregation
   * @param {Object} params { latitude, longitude, radius, emergencySupport, type, service, limit }
   */
  async findNearbyCenters({
    latitude,
    longitude,
    radius = 20,
    emergencySupport,
    type,
    service,
    limit = 20
  }) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radKm = parseFloat(radius) || 20;
    const maxDistanceMeters = radKm * 1000;

    const matchStage = { isActive: true };

    if (emergencySupport !== undefined && emergencySupport !== '') {
      matchStage.emergencySupport = emergencySupport === 'true' || emergencySupport === true;
    }

    if (type) {
      matchStage.type = type;
    }

    if (service) {
      matchStage.services = { $regex: new RegExp(service, 'i') };
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchStage
        }
      },
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ['$distanceMeters', 1000] }, 1]
          },
          id: '$_id'
        }
      },
      {
        $project: {
          _id: 1,
          id: 1,
          name: 1,
          type: 1,
          address: 1,
          village: 1,
          district: 1,
          state: 1,
          location: 1,
          phone: 1,
          services: 1,
          emergencySupport: 1,
          operatingHours: 1,
          distanceKm: 1,
          isActive: 1
        }
      },
      {
        $limit: parseInt(limit) || 20
      }
    ];

    const results = await HealthcareCenter.aggregate(pipeline);
    return results;
  }
}

module.exports = new HealthcareCenterService();
