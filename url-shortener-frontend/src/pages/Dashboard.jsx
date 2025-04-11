import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [longUrl, setLongUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsUrl, setAnalyticsUrl] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchUrls = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/url/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrls(response.data);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch URLs');
    }
  };

  useEffect(() => {
    fetchUrls();
    const interval = setInterval(fetchUrls, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleShorten = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/url/shorten',
        { longUrl, expiresAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Short URL created: ${response.data.shortUrl}`);
      setLongUrl('');
      setExpiresAt('');
      fetchUrls();
    } catch (err) {
      setError(err.response?.data.message || 'Failed to shorten URL');
    }
  };

  const handleAnalytics = async (shortCode, shortUrl) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/url/${shortCode}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data);
      setAnalyticsUrl(shortUrl);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch analytics');
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleShorten} className="shorten-form">
        <div className="form-group">
          <label>Enter Long URL:</label>
          <input 
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com"
            required
            style={{ width: '300px' }}
          />
        </div>
        <div className="form-group">
          <label>Expiration Date (optional):</label>
          <input 
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
        <button type="submit" className="btn">Shorten URL</button>
      </form>

      <h3>Your URLs</h3>
      {urls.length === 0 ? (
        <p>No URLs found.</p>
      ) : (
        <div className="table-responsive">
          <table className="url-table">
            <thead>
              <tr>
                <th>Long URL</th>
                <th>Short URL</th>
                <th>Created At</th>
                <th>Expires At</th>
                <th>Analytics</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.id}>
                  <td>{url.long_url}</td>
                  <td>
                    <a href={`http://localhost:5000/api/url/${url.short_code}`} target="_blank" rel="noopener noreferrer">
                      {url.short_code}
                    </a>
                  </td>
                  <td>{new Date(url.created_at).toLocaleString()}</td>
                  <td>{url.expires_at ? new Date(url.expires_at).toLocaleString() : 'Never'}</td>
                  <td>
                    <button 
                      onClick={() => handleAnalytics(url.short_code, `http://localhost:5000/api/url/${url.short_code}`)}
                      className="btn small-btn"
                    >
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {analytics && (
        <div className="analytics">
          <h3>Analytics for {analyticsUrl.split('/').pop()}</h3>
          <p>Total Clicks: {analytics.clicks}</p>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Clicked At</th>
                </tr>
              </thead>
              <tbody>
                {analytics.records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.ip_address}</td>
                    <td>{new Date(record.clicked_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setAnalytics(null)} className="btn">Close Analytics</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
