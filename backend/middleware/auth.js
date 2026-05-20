const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.cookies?.token) token = req.cookies.token;
  else if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) return res.status(401).json({ message: 'User not found or deactivated' });

    req.tenantId = req.user.role === 'ca' ? req.user._id : req.user.tenantId;

    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const authorizeCA = (req, res, next) => {
  if (req.user?.role === 'ca') return next();
  res.status(403).json({ message: 'Access denied: CA role required' });
};

const authorizeClientAccess = (req, res, next) => {
  if (req.user.role === 'ca') return next();
  const clientId = req.params.clientId || req.params.id || req.body.clientId;
  if (!clientId) return res.status(400).json({ message: 'Client ID required' });
  if (req.user.assignedClients.some(c => c.toString() === clientId.toString())) return next();
  res.status(403).json({ message: 'Access denied: not assigned to this client' });
};

module.exports = { protect, authorizeCA, authorizeClientAccess };
