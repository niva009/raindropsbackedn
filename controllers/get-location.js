const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    const response = await axios.get(url);
    console.log("localtion response..:", response);


    const address = response.data.address;

    const postalCode = address.postcode || '';
    const city = address.city || address.town || address.village || '';
    const state = address.state || '';
    const country = address.country || '';

    // Send the response
    return res.status(200).json({
      message: 'Location found successfully',
      data: { postalCode, city, state, country },
    });
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return res.status(500).json({ error: 'Failed to fetch location data.' });
  }
};
