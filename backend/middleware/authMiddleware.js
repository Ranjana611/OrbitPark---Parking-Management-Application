const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('Auth header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  console.log('Token extracted:', token ? 'exists' : 'missing');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    console.log('User ID:', req.userId);
    console.log('User Role:', req.userRole);
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check user role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log('Checking role. User role:', req.userRole);
    console.log('Allowed roles:', allowedRoles);
    console.log('Role match:', allowedRoles.includes(req.userRole));
    
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Insufficient permissions. Required: ${allowedRoles.join(' or ')}, but user is: ${req.userRole}` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };