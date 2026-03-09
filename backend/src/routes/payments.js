const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

// Stripe
router.post('/stripe/create-intent', authenticate, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { courseId } = req.body;
    const { rows } = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(rows[0].price * 100),
      currency: 'kes',
      metadata: { courseId, userId: req.user.id },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  res.json({ received: true });
});

// M-Pesa STK Push
router.post('/mpesa/initiate', authenticate, async (req, res) => {
  const { phoneNumber, courseId } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data: { access_token } } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const phone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');
    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password, Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(rows[0].price),
        PartyA: phone, PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `CC-${courseId.slice(0, 8)}`,
        TransactionDesc: rows[0].title,
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    res.json({ message: 'Check your phone for the M-Pesa prompt', checkoutRequestId: data.CheckoutRequestID });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'M-Pesa initiation failed. Check your credentials.' });
  }
});

router.post('/mpesa/callback', async (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Manual enrollment for testing
router.post('/enroll-free', authenticate, async (req, res) => {
  const { courseId } = req.body;
  try {
    await db.query(
      "INSERT INTO enrollments (user_id, course_id, payment_method, payment_status, amount_paid) VALUES ($1,$2,'free','completed',0) ON CONFLICT DO NOTHING",
      [req.user.id, courseId]
    );
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

router.get('/history', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, c.title as course_title FROM payments p JOIN courses c ON p.course_id = c.id WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json({ payments: rows });
});

module.exports = router;
