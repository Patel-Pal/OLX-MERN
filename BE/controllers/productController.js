// const Product = require('../models/productModel');
// const cloudinary = require('../config/cloudinary');

// exports.addProduct = async (req, res) => {
//   try {
//     const { title, description, price, category } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: 'Image is required' });
//     }

//     const imageURL = `/uploads/${req.file.filename}`;
//     const sellerId = req.user.id; // From decoded token

//     const newProduct = new Product({
//       title,
//       description,
//       price,
//       category,
//       imageURL,
//       sellerId,
//     });

//     const saved = await newProduct.save();

//     res.status(201).json({
//       success: true,
//       message: 'Product added successfully',
//       product: saved,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');

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
