const db = require('../config/db');

const createShortURL = async ({ userId, longUrl, shortCode, expiresAt }) => {
  const [result] = await db.query(
    'INSERT INTO urls (user_id, long_url, short_code, expires_at) VALUES (?, ?, ?, ?)',
    [userId, longUrl, shortCode, expiresAt]
  );
  return result.insertId;
};

const findUrlByShortCode = async (shortCode) => {
  const [rows] = await db.query('SELECT * FROM urls WHERE short_code = ?', [shortCode]);
  return rows[0];
};

const incrementClick = async (shortCode, ipAddress) => {
  await db.query('INSERT INTO analytics (short_code, ip_address) VALUES (?, ?)', [shortCode, ipAddress]);
};

const getUserUrls = async (userId) => {
  const [rows] = await db.query('SELECT * FROM urls WHERE user_id = ?', [userId]);
  return rows;
};

const getAnalyticsByShortCode = async (shortCode) => {
  const [rows] = await db.query(
    'SELECT ip_address, clicked_at FROM analytics WHERE short_code = ? ORDER BY clicked_at DESC',
    [shortCode]
  );
  return rows;
};

module.exports = {
  createShortURL,
  findUrlByShortCode,
  incrementClick,
  getUserUrls,
  getAnalyticsByShortCode,
};
