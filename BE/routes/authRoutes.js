const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile, updateBuyerProfile } = require('../controllers/authController');
const { authenticate, verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
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


module.exports = router;
