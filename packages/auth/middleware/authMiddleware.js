const { verifyAccessToken, extractToken } = require('../utils/jwt');

/**
 * Middleware to authenticate requests using JWT
 * Verifies the access token and adds user info to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractToken(authHeader);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Autenticazione richiesta',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      plan: decoded.plan
    };

    next();
  } catch (error) {
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token scaduto',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Token non valido',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Middleware to require admin role
 * Must be used after authenticateToken
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticazione richiesta',
      code: 'NO_AUTH'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accesso negato: permessi di amministratore richiesti',
      code: 'FORBIDDEN'
    });
  }

  next();
}

/**
 * Middleware to require specific plan level
 * Must be used after authenticateToken
 * @param {String} requiredPlan - Minimum plan required ('free', 'basic', 'pro', 'enterprise')
 */
function requirePlan(requiredPlan) {
  const planHierarchy = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'enterprise': 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticazione richiesta',
        code: 'NO_AUTH'
      });
    }

    const userPlanLevel = planHierarchy[req.user.plan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({
        success: false,
        error: `Piano ${requiredPlan} o superiore richiesto`,
        code: 'INSUFFICIENT_PLAN',
        userPlan: req.user.plan,
        requiredPlan
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Adds user info if token is valid, but doesn't fail if missing
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = extractToken(authHeader);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      plan: decoded.plan
    };
  } catch (error) {
    req.user = null;
  }

  next();
}

/**
 * Middleware to check if user owns the resource
 * Compares req.user.id with req.params.userId
 * Admins bypass this check
 */
function requireOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticazione richiesta',
      code: 'NO_AUTH'
    });
  }

  // Admins can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;

  if (!resourceUserId) {
    return res.status(400).json({
      success: false,
      error: 'ID utente mancante',
      code: 'MISSING_USER_ID'
    });
  }

  if (req.user.id !== resourceUserId) {
    return res.status(403).json({
      success: false,
      error: 'Accesso negato: puoi accedere solo alle tue risorse',
      code: 'FORBIDDEN'
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePlan,
  optionalAuth,
  requireOwnership
};
