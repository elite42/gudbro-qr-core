export const authenticate = (req, res, next) => {
  req.user = { id: '11111111-1111-1111-1111-111111111111' };
  next();
};

export const authenticateUser = (req, res, next) => {
  req.user = { id: '11111111-1111-1111-1111-111111111111' };
  next();
};
