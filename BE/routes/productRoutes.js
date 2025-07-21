const express = require('express');
const router = express.Router();
const { addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getMyProducts } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifySeller } = require('../middleware/authMiddleware');
const { authenticate } = require('../middleware/authMiddleware');


//add product route
router.post('/add', verifyToken, verifySeller, upload.single('image'), addProduct);

// Get all
router.get('/', getAllProducts);

// Get by ID
router.get('/product_desc/:id', getProductById);


// Update (image optional)
router.put('/:id', verifyToken, verifySeller, upload.single('image'), updateProduct);

// Delete
router.delete('/:id', verifyToken, verifySeller, deleteProduct);

// Get products by seller
router.get('/mine', authenticate, getMyProducts);



module.exports = router;
