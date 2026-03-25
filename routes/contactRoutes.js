// routes/contactRoutes.js
const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact — send contact/custom order message
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ message: 'Name, phone and message are required' });
    }

    // Only send email if EMAIL_USER is configured
    if (process.env.EMAIL_USER) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      await transporter.sendMail({
        from:    process.env.EMAIL_USER,
        to:      process.env.EMAIL_USER,
        subject: `New enquiry from ${name} — VJ 3D Works`,
        html:    `<h3>New Enquiry</h3>
                  <p><b>Name:</b> ${name}</p>
                  <p><b>Phone:</b> ${phone}</p>
                  <p><b>Email:</b> ${email || 'Not provided'}</p>
                  <p><b>Message:</b><br>${message}</p>`
      });
    }

    res.json({ message: 'Message sent! We will contact you soon.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message. Please WhatsApp us.' });
  }
});

module.exports = router;
