const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const cloudinary = require('cloudinary').v2;
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;
const OTP = require('../models/otpModel');
const sendEmail = require('../utils/mailer');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


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
    let profileImage = '';

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

    // Preserve existing profile image if no new file is uploaded
    const existingUser = await User.findById(userId).select('profileImage');
    if (existingUser && existingUser.profileImage) {
      profileImage = existingUser.profileImage;
    }

    // Handle image upload
    if (req.file) {
      try {
        const streamUpload = (buffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'profile_images',
                transformation: [{ width: 200, height: 200, crop: 'fill' }],
              },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            stream.end(buffer);
          });
        };

        const result = await streamUpload(req.file.buffer);
        profileImage = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', {
          message: error.message,
          name: error.name,
          http_code: error.http_code,
          stack: error.stack,
        });
        return res.status(500).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
      }
    }

    const updateData = { name, phoneNumber, address, profileImage };
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      console.error('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated',
      name: user.name,
      phoneNumber: user.phoneNumber,
      address: user.address,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error('Update profile error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.error('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update buyer profile for billing
exports.updateBuyerProfile = async (req, res) => {
  try {
    const { phoneNumber, address } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.create({ email, otp });
  await sendEmail(email, 'Password Reset OTP', `Your OTP is: ${otp}`);

  res.status(200).json({ message: 'OTP sent to your email' });
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const validOtp = await OTP.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  await OTP.deleteMany({ email }); // Cleanup
  res.status(200).json({ message: 'Password reset successful' });
};