const nodemailer = require('nodemailer');

/**
 * Dispatches emergency alert messages to all registered contacts of a user.
 * 
 * @param {Object} user - The user object triggering the alert.
 * @param {Object} location - Latitude and longitude of the current alert.
 * @param {Array} contacts - List of emergency contacts.
 */
const sendSOSTriggerAlerts = async (user, location, contacts) => {
  const mapLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const alertText = `🚨 EMERGENCY HELP REQUEST 🚨\n\nYour contact, ${user.name}, has triggered an emergency SOS alert. They might be in danger.\n\nLive Location Link: ${mapLink}\nGeocoded Address: ${location.address || 'GPS coordinates'}\nPhone Number: ${user.phone}`;

  console.log(`\n========================================`);
  console.log(`🚨 Aegis Notifier: Dispatching alerts for ${user.name} 🚨`);
  console.log(`========================================`);

  for (const contact of contacts) {
    // 1. Dispatch SMS Notification
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        await client.messages.create({
          body: alertText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact.phone,
        });
        console.log(`[Twilio SMS] Alerts successfully sent to ${contact.name} (${contact.phone})`);
      } else {
        console.log(`[MOCK SMS] To: ${contact.name} (${contact.phone})\nBody: ${alertText}\n`);
      }
    } catch (smsErr) {
      console.error(`[Twilio SMS Error] Failed to send to ${contact.name}:`, smsErr.message);
    }

    // 2. Dispatch Email Notification
    if (contact.email) {
      try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          await transporter.sendMail({
            from: `"Aegis Emergency Network" <${process.env.SMTP_USER}>`,
            to: contact.email,
            subject: `🚨 URGENT: Emergency SOS Alert for ${user.name}`,
            text: alertText,
          });
          console.log(`[SMTP Mail] Alerts successfully sent to ${contact.name} (${contact.email})`);
        } else {
          console.log(`[MOCK EMAIL] To: ${contact.name} (${contact.email})\nSubject: 🚨 URGENT: SOS Alert for ${user.name}\nBody: ${alertText}\n`);
        }
      } catch (emailErr) {
        console.error(`[SMTP Mail Error] Failed to send to ${contact.name}:`, emailErr.message);
      }
    }
  }
  console.log(`========================================\n`);
};

module.exports = {
  sendSOSTriggerAlerts,
};
