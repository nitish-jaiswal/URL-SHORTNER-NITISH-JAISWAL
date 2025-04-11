const cron = require('node-cron');
const db = require('../config/db');

cron.schedule('* * * * *', async () => {
  try {
    const [result] = await db.query(
      "DELETE FROM urls WHERE expires_at IS NOT NULL AND expires_at < NOW()"
    );
    if(result.affectedRows > 0) {
      console.log(`Cron Job: Deleted ${result.affectedRows} expired URL(s)`);
    }
  } catch (error) {
    console.error('Cron Job Error:', error);
  }
});
