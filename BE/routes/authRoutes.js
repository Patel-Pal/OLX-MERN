const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', authenticate, updateProfile);
 router.get('/profile', authenticate, getProfile);

module.exports = router;
