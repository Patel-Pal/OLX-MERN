const express = require('express');
const router = express.Router();
const { addProduct } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifySeller } = require('../middleware/authMiddleware');


router.post('/add', verifyToken, verifySeller, upload.single('image'), addProduct);

module.exports = router;
