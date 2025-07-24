const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile, updateBuyerProfile } = require('../controllers/authController');
const { authenticate, verifyToken } = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', authenticate, updateProfile);
router.get('/profile', authenticate, getProfile);


// Update buyer profile
router.put('/profile', verifyToken,updateBuyerProfile);
// router.put('/profile', verifyToken, async (req, res) => {
//   try {
//     const { phoneNumber, address } = req.body;
//     const userId = req.user.id;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.phoneNumber = phoneNumber || user.phoneNumber;
//     user.address = address || user.address;
//     await user.save();

//     res.status(200).json({ success: true, message: 'Profile updated', user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
