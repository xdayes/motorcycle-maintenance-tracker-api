import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { badRequest, conflict, unauthorized, serverError } from '../utils/response.js';

function publicUser(user) {
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
}

export async function signup(req, res) {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) return badRequest(res, 'fullName, email, and password are required');
    if (!email.includes('@')) return badRequest(res, 'A valid email is required');
    if (password.length < 8) return badRequest(res, 'Password must be at least 8 characters');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return conflict(res, 'Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: role === 'ADMIN' ? 'ADMIN' : 'USER' }
    });
    return res.status(201).json(publicUser(user));
  } catch (error) {
    return serverError(res, error.message);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res, 'email and password are required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return unauthorized(res, 'Invalid email or password');

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) return unauthorized(res, 'Invalid email or password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    return serverError(res, error.message);
  }
}
