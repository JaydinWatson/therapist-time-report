const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — fetches any Cliniko API path
app.get('/cliniko*', async (req, res) => {
  const apiKey = req.headers['x-cliniko-key'];
  const region = req.headers['x-cliniko-region'] || 'au1';

  if (!apiKey) return res.status(400).json({ error: 'Missing x-cliniko-key header' });

  // Strip /cliniko prefix, keep the rest including query string
  const clinikoPath = req.url.replace(/^\/cliniko/, '');
  const url = `https://api.${region}.cliniko.com/v1${clinikoPath}`;

  // Cliniko expects: Basic base64(apikey + ":")
  const credentials = Buffer.from(apiKey.trim() + ':').toString('base64');

  console.log(`Proxying: GET ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept':        'application/json',
        'User-Agent':    'TherapistTimeReport/1.0 (render.com)'
      }
    });

    const text = await response.text();
    console.log(`Cliniko response ${response.status}: ${text.slice(0, 200)}`);

    let data;
    try { data = JSON.parse(text); }
    catch { data = { raw: text }; }

    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
