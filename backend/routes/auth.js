const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../utils/db');
require('dotenv').config();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, city, lat, lng } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    if (!['donor', 'recipient'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "donor" or "recipient".' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Check if email already exists
    const existingUser = db.get('users').find({ email }).value();
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Create user object
    const user = {
      id,
      name,
      email,
      passwordHash,
      role,
      createdAt
    };

    db.get('users').push(user).write();

    // If donor, create donor profile
    if (role === 'donor') {
      if (!bloodGroup) {
        return res.status(400).json({ error: 'Blood group is required for donors.' });
      }

      const donor = {
        id,
        name,
        email,
        phone: '',
        bloodGroup,
        location: {
          lat: parseFloat(lat) || 0,
          lng: parseFloat(lng) || 0,
          city: city || ''
        },
        available: true,
        lastDonated: null,
        totalDonations: 0,
        createdAt
      };

      db.get('donors').push(donor).write();
    }

    // Generate JWT
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id, name, email, role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = db.get('users').find({ email }).value();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
