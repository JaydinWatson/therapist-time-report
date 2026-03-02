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
  const apiKey = req.headers['x-cliniko-key'];
  const region = req.headers['x-cliniko-region'] || 'au1';

  if (!apiKey) return res.status(400).json({ error: 'Missing x-cliniko-key header' });

  const clinikoPath = req.path.replace(/^\/cliniko/, '');
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url = `https://api.${region}.cliniko.com/v1${clinikoPath}${query}`;

  // Cliniko requires base64(apiKey + ':') with NO password
  const credentials = Buffer.from(apiKey + ':').toString('base64');

  console.log(`-> Proxying: GET ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'TherapistTimeReport/1.0'
      }
    });

    const text = await response.text();
    console.log(`<- Cliniko responded: ${response.status}`);

    if (!response.ok) {
      console.log('Error detail:', text.slice(0, 300));
      return res.status(response.status).json({
        error: `Cliniko error ${response.status}`,
        detail: text.slice(0, 300)
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from Cliniko', detail: text.slice(0, 200) });
    }

    res.json(data);
  } catch (err) {
    console.log('Fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
