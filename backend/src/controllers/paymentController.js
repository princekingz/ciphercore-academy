const axios = require('axios');
const db = require('../utils/db');

const getMpesaToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` },
  });
  return data.access_token;
};

exports.initiateMpesa = async (req, res) => {
  const { phoneNumber, courseId } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const phone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');
    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(rows[0].price),
        PartyA: phone, PartyB: process.env.MPESA_SHORTCODE, PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `CipherCore-${courseId}`,
        TransactionDesc: `Payment for ${rows[0].title}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ message: 'Check your phone for M-Pesa prompt', checkoutRequestId: data.CheckoutRequestID });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'M-Pesa initiation failed' });
  }
};

exports.mpesaCallback = async (req, res) => {
  try {
    const cb = req.body?.Body?.stkCallback;
    if (cb?.ResultCode === 0) {
      const [userId, courseId] = (cb.CallbackMetadata?.Item?.find((i) => i.Name === 'AccountReference')?.Value || '').split('-').slice(1);
      if (userId && courseId) {
        const amount = cb.CallbackMetadata?.Item?.find((i) => i.Name === 'Amount')?.Value;
        await db.query(
          "INSERT INTO enrollments (user_id, course_id, payment_method, payment_status, amount_paid) VALUES ($1,$2,'mpesa','completed',$3) ON CONFLICT DO NOTHING",
          [userId, courseId, amount]
        );
      }
    }
  } catch (err) {
    console.error('Callback error:', err.message);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
};

exports.getHistory = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.*, c.title as course_title FROM payments p JOIN courses c ON p.course_id = c.id WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ payments: rows });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
};
