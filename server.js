const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/cliniko/*', async (req, res) => {
  const apiKey = req.headers['x-cliniko-key'];
  if (!apiKey) return res.status(400).json({ error: 'Missing x-cliniko-key header' });

  // Auto-detect region from key suffix (e.g. "xxxxx-au1" → "au1")
  const parts = apiKey.split('-');
  const region = (parts.length > 1 && /^[a-z]{2}\d{1,2}$/.test(parts[parts.length - 1]))
    ? parts[parts.length - 1]
    : (req.headers['x-cliniko-region'] || 'au1');

  const clinikoPath = req.path.replace(/^\/cliniko/, '');
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url = `https://api.${region}.cliniko.com/v1${clinikoPath}${query}`;

  const credentials = Buffer.from(apiKey + ':').toString('base64');

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'User-Agent': 'TherapistTimeReport (admin@example.com)'
      }
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
