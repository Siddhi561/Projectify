import { User } from './auth.model.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt.js';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
} from '../../shared/utils/cookie.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../core/errors/errorTypes.js';
import { logger } from '../../core/logger/logger.js';

function issueTokens(res, userId) {
  const payload = { userId: userId.toString() };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
}

export async function signup({ name, email, password }, res) {
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError('Email already registered');

  const user = await User.create({ name, email, password });

  logger.info('New user registered', { userId: user._id });

  issueTokens(res, user._id);

  return user.toSafeObject();
}

// ── Login ─────────────────────────────────────────────────────────
export async function login({ email, password }, res) {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info('User logged in', { userId: user._id });

  issueTokens(res, user._id);

  return user.toSafeObject();
}

// ── Get current user ──────────────────────────────────────────────
// req.user is attached by authenticate middleware before this runs
export async function getMe(user) {
  return user.toSafeObject();
}

// ── Logout ────────────────────────────────────────────────────────
export async function logout(res) {
  clearAuthCookies(res);
}

// ── Refresh token ─────────────────────────────────────────────────
export async function refresh(refreshToken, res) {
  if (!refreshToken) {
    throw new UnauthorizedError('No refresh token provided');
  }

 
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId);
  if (!user) throw new UnauthorizedError('User not found');


  const accessToken = signAccessToken({ userId: user._id.toString() });
  setAccessTokenCookie(res, accessToken);

  return user.toSafeObject();
}


export async function handleGoogleCallback(user, res) {
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  issueTokens(res, user._id);

  logger.info('Google OAuth login', { userId: user._id });
}