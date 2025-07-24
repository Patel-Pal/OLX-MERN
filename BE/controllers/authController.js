const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, address } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      address
    });

    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isActive) return res.status(403).json({ message: 'User is deactivated' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name, phoneNumber: user.phoneNumber, address: user.address },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !phoneNumber || !address) {
      return res.status(400).json({ message: 'Name, phone number, and address are required' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phoneNumber, address },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile updated',
      name: user.name,
      phoneNumber: user.phoneNumber,
      address: user.address,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email phoneNumber address role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};