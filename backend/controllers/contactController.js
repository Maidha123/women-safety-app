const Contact = require('../models/Contact');

// @desc    Get all user's emergency contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ user: req.user.id });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new emergency contact
// @route   POST /api/contacts
// @access  Private
const addContact = async (req, res, next) => {
  try {
    const { name, phone, email, relationship } = req.body;

    if (!name || !phone) {
      res.status(400);
      throw new Error('Please add a name and phone number');
    }

    const contact = await Contact.create({
      user: req.user.id,
      name,
      phone,
      email,
      relationship,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update emergency contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res, next) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }

    // Make sure contact belongs to user
    if (contact.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to update this contact');
    }

    contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }

    // Make sure contact belongs to user
    if (contact.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to delete this contact');
    }

    await contact.deleteOne();

    res.json({
      success: true,
      message: 'Contact removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
};
