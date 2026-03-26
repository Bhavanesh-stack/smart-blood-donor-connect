const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const { db } = require('../utils/db');
const { haversineDistance } = require('../utils/haversine');

// POST /api/requests — Auth required, role=recipient
router.post('/', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ error: 'Only recipients can create blood requests.' });
    }

    const { bloodGroup, hospital, lat, lng, city, urgency, units } = req.body;

    if (!bloodGroup || !hospital || !lat || !lng) {
      return res.status(400).json({ error: 'bloodGroup, hospital, lat, and lng are required.' });
    }

    const requestLat = parseFloat(lat);
    const requestLng = parseFloat(lng);

    // Auto-find nearby donors (within 10km, matching blood group, available)
    const allDonors = db.get('donors').value();
    const nearbyDonorIds = allDonors
      .filter(d => d.bloodGroup === bloodGroup && d.available === true)
      .filter(d => {
        const dist = haversineDistance(requestLat, requestLng, d.location.lat, d.location.lng);
        return dist <= 10;
      })
      .map(d => d.id);

    // Get the user info
    const user = db.get('users').find({ id: req.user.id }).value();

    const newRequest = {
      id: uuidv4(),
      recipientId: req.user.id,
      recipientName: user ? user.name : 'Unknown',
      bloodGroup,
      hospital,
      location: {
        lat: requestLat,
        lng: requestLng,
        city: city || ''
      },
      urgency: urgency || 'normal',
      units: parseInt(units) || 1,
      status: 'pending',
      matchedDonorId: null,
      notifiedDonors: nearbyDonorIds,
      createdAt: new Date().toISOString()
    };

    db.get('requests').push(newRequest).write();

    res.status(201).json(newRequest);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Server error creating request.' });
  }
});

// GET /api/requests/my — Auth required, role=recipient
router.get('/my', authMiddleware, (req, res) => {
  try {
    const myRequests = db.get('requests')
      .filter({ recipientId: req.user.id })
      .value();

    // Attach matched donor info if accepted
    const enriched = myRequests.map(r => {
      if (r.matchedDonorId) {
        const donor = db.get('donors').find({ id: r.matchedDonorId }).value();
        return { ...r, matchedDonor: donor || null };
      }
      return r;
    });

    res.json(enriched);
  } catch (err) {
    console.error('Get my requests error:', err);
    res.status(500).json({ error: 'Server error fetching requests.' });
  }
});

// GET /api/requests/incoming — Auth required, role=donor
router.get('/incoming', authMiddleware, (req, res) => {
  try {
    const allRequests = db.get('requests').value();
    const donor = db.get('donors').find({ id: req.user.id }).value();

    const incoming = allRequests
      .filter(r =>
        r.status === 'pending' &&
        r.notifiedDonors.includes(req.user.id)
      )
      .map(r => {
        let distance = null;
        if (donor && donor.location) {
          distance = haversineDistance(
            donor.location.lat, donor.location.lng,
            r.location.lat, r.location.lng
          );
          distance = Math.round(distance * 100) / 100;
        }
        return { ...r, distance };
      });

    res.json(incoming);
  } catch (err) {
    console.error('Get incoming requests error:', err);
    res.status(500).json({ error: 'Server error fetching incoming requests.' });
  }
});

// PATCH /api/requests/:id/respond — Auth required, role=donor
router.patch('/:id/respond', authMiddleware, (req, res) => {
  try {
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "accept" or "reject".' });
    }

    const request = db.get('requests').find({ id: req.params.id });

    if (!request.value()) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (action === 'accept') {
      request.assign({
        status: 'accepted',
        matchedDonorId: req.user.id
      }).write();
    } else {
      // On reject, remove this donor from notifiedDonors (they shouldn't see it again)
      const updatedNotified = request.value().notifiedDonors.filter(id => id !== req.user.id);
      request.assign({ notifiedDonors: updatedNotified }).write();
    }

    res.json(request.value());
  } catch (err) {
    console.error('Respond to request error:', err);
    res.status(500).json({ error: 'Server error responding to request.' });
  }
});

// PATCH /api/requests/:id/fulfill — Auth required, role=recipient
router.patch('/:id/fulfill', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ error: 'Only recipients can fulfill requests.' });
    }

    const request = db.get('requests').find({ id: req.params.id });

    if (!request.value()) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.value().recipientId !== req.user.id) {
      return res.status(403).json({ error: 'You can only fulfill your own requests.' });
    }

    // Mark as fulfilled
    request.assign({ status: 'fulfilled' }).write();

    // Increment donor's totalDonations
    if (request.value().matchedDonorId) {
      const donor = db.get('donors').find({ id: request.value().matchedDonorId });
      if (donor.value()) {
        donor.assign({ totalDonations: (donor.value().totalDonations || 0) + 1 }).write();
      }
    }

    res.json(request.value());
  } catch (err) {
    console.error('Fulfill request error:', err);
    res.status(500).json({ error: 'Server error fulfilling request.' });
  }
});

module.exports = router;
