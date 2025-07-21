const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

//addProduct 
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Upload the image buffer to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'OLX_MERN_PRODUCTS' },
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

    const imageURL = result.secure_url;
    const sellerId = req.user.id; // Extracted from token by authMiddleware

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      imageURL,
      sellerId,
    });

    const saved = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name email');
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//get single product by id
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    // const product = await Product.findById(id);
    const product = await Product.findById(id).populate('sellerId', 'name email');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const productId = req.params.id;

    let updateFields = { title, description, price, category };

    if (req.file) {
      // Upload new image to Cloudinary
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'OLX_MERN_PRODUCTS' },
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
      updateFields.imageURL = result.secure_url;
    }

    const updated = await Product.findByIdAndUpdate(productId, updateFields, { new: true });

    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ success: true, message: 'Product updated', product: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by seller
exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id; // Decoded from token via middleware
    const products = await Product.find({ sellerId });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};







