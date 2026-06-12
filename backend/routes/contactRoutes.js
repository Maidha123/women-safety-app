const express = require('express');
const router = express.Router();
const {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protect);

router.route('/')
  .get(getContacts)
  .post(addContact);

router.route('/:id')
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
