const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile, updateBuyerProfile, sendOtp, resetPassword } = require('../controllers/authController');
const { authenticate, verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', authenticate, upload.single('profileImage'), updateProfile);
router.get('/profile', authenticate, getProfile);
// Update buyer profile at billing 
router.put('/profile', verifyToken,updateBuyerProfile);
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);


module.exports = router;
