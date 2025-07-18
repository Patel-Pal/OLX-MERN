const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Optional: Middleware to allow only sellers
exports.verifySeller = (req, res, next) => {
  if (req.user?.role !== 'seller') {
    return res.status(403).json({ message: 'Access denied: Sellers only' });
  }
  next();
};

// Optional: Middleware to allow only admins
exports.verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

