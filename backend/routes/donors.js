const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { db } = require('../utils/db');
const { haversineDistance } = require('../utils/haversine');

// GET /api/donors/search — Public (no auth required)
router.get('/search', (req, res) => {
  try {
    const { bloodGroup, lat, lng, radius } = req.query;

    if (!bloodGroup || !lat || !lng) {
      return res.status(400).json({ error: 'bloodGroup, lat, and lng are required query parameters.' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius) || 10; // default 10km

    // Filter donors by blood group and availability
    const allDonors = db.get('donors').value();
    const matchingDonors = allDonors
      .filter(d => d.bloodGroup === bloodGroup && d.available === true)
      .map(d => {
        const distance = haversineDistance(userLat, userLng, d.location.lat, d.location.lng);
        return { ...d, distance: Math.round(distance * 100) / 100 };
      })
      .filter(d => d.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json(matchingDonors);
  } catch (err) {
    console.error('Donor search error:', err);
    res.status(500).json({ error: 'Server error during donor search.' });
  }
});

// GET /api/donors/profile — Auth required
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const donor = db.get('donors').find({ id: req.user.id }).value();
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found.' });
    }
    res.json(donor);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// PATCH /api/donors/availability — Auth required
router.patch('/availability', authMiddleware, (req, res) => {
  try {
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'available must be a boolean.' });
    }

    const donor = db.get('donors').find({ id: req.user.id });
    if (!donor.value()) {
      return res.status(404).json({ error: 'Donor profile not found.' });
    }

    donor.assign({ available }).write();
    res.json(donor.value());
  } catch (err) {
    console.error('Toggle availability error:', err);
    res.status(500).json({ error: 'Server error updating availability.' });
  }
});

// PATCH /api/donors/profile — Auth required
router.patch('/profile', authMiddleware, (req, res) => {
  try {
    const { phone, city, lat, lng, lastDonated } = req.body;
    const donor = db.get('donors').find({ id: req.user.id });

    if (!donor.value()) {
      return res.status(404).json({ error: 'Donor profile not found.' });
    }

    const updates = {};
    if (phone !== undefined) updates.phone = phone;
    if (lastDonated !== undefined) updates.lastDonated = lastDonated;

    if (city !== undefined || lat !== undefined || lng !== undefined) {
      const currentLocation = donor.value().location || {};
      updates.location = {
        lat: lat !== undefined ? parseFloat(lat) : currentLocation.lat,
        lng: lng !== undefined ? parseFloat(lng) : currentLocation.lng,
        city: city !== undefined ? city : currentLocation.city
      };
    }

    donor.assign(updates).write();
    res.json(donor.value());
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

module.exports = router;
