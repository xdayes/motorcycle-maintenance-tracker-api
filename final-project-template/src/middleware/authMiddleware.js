import jwt from 'jsonwebtoken';
import { unauthorized } from '../utils/response.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return unauthorized(res, 'Missing or invalid Authorization header');
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
}

export function isAdmin(user) {
  return user?.role === 'ADMIN';
}
