const shortid = require('shortid');
const { body } = require('express-validator');
const { 
  createShortURL, 
  findUrlByShortCode, 
  incrementClick, 
  getUserUrls,
  getAnalyticsByShortCode 
} = require('../models/urlModel');

exports.validateShorten = [
  body('longUrl').isURL().withMessage('Valid URL is required'),
  body('expiresAt').optional().isISO8601().toDate(),
];

exports.shorten = async (req, res) => {
  const { longUrl, expiresAt } = req.body;
  const shortCode = shortid.generate();

  try {
    const id = await createShortURL({
      userId: req.user.id,
      longUrl,
      shortCode,
      expiresAt,
    });

    res.status(201).json({ shortUrl: `http://localhost:5000/api/url/${shortCode}` });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.redirect = async (req, res) => {
    const { shortCode } = req.params;
    try {
      const url = await findUrlByShortCode(shortCode);
      if (!url || (url.expires_at && new Date(url.expires_at) < new Date())) {
        return res.status(404).json({ message: 'URL not found or expired' });
      }
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      await incrementClick(shortCode, ipAddress);
      res.redirect(url.long_url);
    } catch (err) {
      console.error('Error during redirection:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
exports.getUserUrls = async (req, res) => {
  try {
    const urls = await getUserUrls(req.user.id);
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAnalytics = async (req, res) => {
  const { shortCode } = req.params;
  try {
    const url = await findUrlByShortCode(shortCode);
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }
    if (url.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view analytics for this URL' });
    }
    
    const analyticsRecords = await getAnalyticsByShortCode(shortCode);

    res.json({
      clicks: analyticsRecords.length,
      records: analyticsRecords,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
