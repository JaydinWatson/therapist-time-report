const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — fetches any Cliniko API path
app.get('/cliniko/*', async (req, res) => {
  const apiKey  = req.headers['x-cliniko-key'];
  const region  = req.headers['x-cliniko-region'] || 'au1';

  if (!apiKey) return res.status(400).json({ error: 'Missing x-cliniko-key header' });

  const clinikoPath = req.path.replace(/^\/cliniko/, '');
  const query       = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url         = `https://api.${region}.cliniko.com/v1${clinikoPath}${query}`;

  const credentials = Buffer.from(apiKey + ':').toString('base64');

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept':        'application/json',
        'User-Agent':    'TherapistTimeReport/1.0'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
