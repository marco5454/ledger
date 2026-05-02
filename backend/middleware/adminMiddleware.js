// ============================================================
// FILE: middleware/adminMiddleware.js
// PURPOSE: Restricts route access to admin users only
// PHASE: 2 (new)
// DEPENDENCIES: Must run AFTER authMiddleware (req.user must exist)
// ============================================================

// FUNCTION: adminMiddleware
// PURPOSE: Checks if the authenticated user has admin role
// PARAMS: req (Express request), res (Express response), next (next middleware)
// RETURNS: 403 error if not admin, calls next() if admin
// ERRORS: Returns 403 if role is missing or not 'admin'
const adminMiddleware = (req, res, next) => {

  // req.user is set by authMiddleware — if it's missing, auth failed upstream
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admins only.'
    });
  }

  // User is confirmed admin — proceed to the route handler
  next();
};

module.exports = adminMiddleware;