const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
  triggerSOS,
  updateLiveLocation,
  checkSafetyProximity,
  uploadEvidence,
  getIncidentHistory,
  getDangerZones,
  resolveIncident,
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter (accept only audio/video/image)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio, video, and image files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // Max size 20MB
  },
});

// Public endpoints
router.get('/danger-zones', getDangerZones);

// Protected endpoints
router.post('/sos', protect, triggerSOS);
router.post('/check-safety', protect, checkSafetyProximity);
router.put('/:id/location', protect, updateLiveLocation);
router.get('/history', protect, getIncidentHistory);
router.put('/:id/resolve', protect, resolveIncident);
router.post('/:id/evidence', protect, upload.single('evidence'), uploadEvidence);

module.exports = router;
