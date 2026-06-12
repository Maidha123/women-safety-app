const Incident = require('../models/Incident');
const Contact = require('../models/Contact');
const { sendSOSTriggerAlerts } = require('../utils/notifier');

// @desc    Trigger a new SOS Emergency Alert
// @route   POST /api/incidents/sos
// @access  Private
const triggerSOS = async (req, res, next) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      res.status(400);
      throw new Error('Latitude and longitude are required to trigger SOS');
    }

    // Create the incident log with starting location as first element in history
    const incident = await Incident.create({
      user: req.user.id,
      location: {
        latitude,
        longitude,
        address: address || 'Location details pending geocoding',
      },
      locationHistory: [
        {
          latitude,
          longitude,
        },
      ],
      status: 'active',
    });

    // Fetch user's emergency contacts
    const contacts = await Contact.find({ user: req.user.id });

    // Send emergency alert notifications (SMS/Email stubs)
    await sendSOSTriggerAlerts(req.user, incident.location, contacts);

    res.status(201).json({
      success: true,
      message: 'SOS Alert triggered successfully. Contacts notified.',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live location checkpoints during an active SOS
// @route   PUT /api/incidents/:id/location
// @access  Private
const updateLiveLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res.status(400);
      throw new Error('Latitude and longitude are required');
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      res.status(404);
      throw new Error('Incident not found');
    }

    // Check ownership
    if (incident.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to access this incident log');
    }

    if (incident.status !== 'active') {
      res.status(400);
      throw new Error('Cannot update location for a resolved incident');
    }

    // Push new coordinate checkpoint
    incident.locationHistory.push({
      latitude,
      longitude,
    });

    // Update current location coordinates
    incident.location.latitude = latitude;
    incident.location.longitude = longitude;

    await incident.save();

    res.json({
      success: true,
      message: 'Live location updated successfully',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate distance using Haversine formula (returns distance in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Determine safety threat rating based on proximity to previous incidents
// @route   POST /api/incidents/check-safety
// @access  Private
const checkSafetyProximity = async (req, res, next) => {
  try {
    const { latitude, longitude, radiusKm = 1.0 } = req.body;

    if (!latitude || !longitude) {
      res.status(400);
      throw new Error('Latitude and longitude coordinates are required for safety check');
    }

    // Fetch all historical incidents
    const incidents = await Incident.find({}, 'location createdAt status');

    const nearbyIncidents = [];

    incidents.forEach((inc) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        inc.location.latitude,
        inc.location.longitude
      );

      if (distance <= radiusKm) {
        nearbyIncidents.push({
          id: inc._id,
          location: inc.location,
          createdAt: inc.createdAt,
          status: inc.status,
          distanceKm: parseFloat(distance.toFixed(3)),
        });
      }
    });

    // Predict risk status level
    let riskLevel = 'Safe';
    let riskScore = 0; // 0-100 scale

    if (nearbyIncidents.length > 0) {
      if (nearbyIncidents.length <= 2) {
        riskLevel = 'Moderate Risk';
        riskScore = 40;
      } else {
        riskLevel = 'High Risk';
        riskScore = 80;
      }
    }

    res.json({
      success: true,
      data: {
        riskLevel,
        riskScore,
        nearbyIncidentsCount: nearbyIncidents.length,
        radiusCheckedKm: radiusKm,
        incidents: nearbyIncidents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload media evidence (Audio/Video) for an active SOS
// @route   POST /api/incidents/:id/evidence
// @access  Private
const uploadEvidence = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      res.status(404);
      throw new Error('Incident report not found');
    }

    // Verify ownership
    if (incident.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to access this incident report');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an audio or video file');
    }

    // Generate local path or URL for saved media evidence file
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'audio';

    incident.evidence.push({
      fileUrl,
      fileType,
    });

    await incident.save();

    res.json({
      success: true,
      message: 'Evidence file uploaded successfully',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's incident history logs
// @route   GET /api/incidents/history
// @access  Private
const getIncidentHistory = async (req, res, next) => {
  try {
    const history = await Incident.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active or reported coordinates for Danger Zones prediction
// @route   GET /api/incidents/danger-zones
// @access  Public (or Private)
const getDangerZones = async (req, res, next) => {
  try {
    // Return locations of all incidents to visualize as high-risk or danger zones
    const incidents = await Incident.find({}, 'location createdAt status');

    res.json({
      success: true,
      count: incidents.length,
      data: incidents.map(inc => ({
        id: inc._id,
        latitude: inc.location.latitude,
        longitude: inc.location.longitude,
        address: inc.location.address,
        createdAt: inc.createdAt,
        status: inc.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve an active SOS incident
// @route   PUT /api/incidents/:id/resolve
// @access  Private
const resolveIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      res.status(404);
      throw new Error('Incident report not found');
    }

    if (incident.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to modify this incident');
    }

    incident.status = 'resolved';
    incident.resolvedAt = Date.now();
    await incident.save();

    res.json({
      success: true,
      message: 'Incident marked as resolved',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerSOS,
  updateLiveLocation,
  checkSafetyProximity,
  uploadEvidence,
  getIncidentHistory,
  getDangerZones,
  resolveIncident,
};
