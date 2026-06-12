const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a contact name'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a contact phone number'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    relationship: {
      type: String,
      default: 'Friend/Family',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
