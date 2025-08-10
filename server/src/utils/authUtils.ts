import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, CookieOptions } from 'express';

import { Admin, User, Role } from '../generated/prisma';
import { CustomJwtPayload } from '../types/customTypes';
import catchAsync from './catchAsync';
import AppError from './AppError';

const signToken = (user: Admin | User) => {
  const { id, role } = user;

  const payload: CustomJwtPayload =
    user.role === Role.INDIVIDUAL || user.role === Role.VENDOR
      ? { id, role, isKycComplete: (user as User).isKycComplete }
      : { id, role };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (Number(process.env.JWT_EXPIRES_IN) || 90) * 24 * 60 * 60,
  });
};

export const createSendToken = (
  user: Admin | User,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user);
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    domain: isProduction ? process.env.FRONTEND_URL : undefined,
  };

  const { password, ...userData } = user;

  res.cookie('jwt', token, cookieOptions).status(statusCode).json({
    status: 'success',
    data: userData,
  });
};

export const protectRoute = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.jwt;

    if (!token || token === null)
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );

    const decodedUser = (await jwt.verify(
      token,
      process.env.JWT_SECRET as string
    )) as CustomJwtPayload;

    if (decodedUser.isKycCompleted === false)
      return next(new AppError('KYC is not completed', 403));

    req.user = decodedUser as CustomJwtPayload;

    next();
  }
);

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const normalizeEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body?.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase();
  }

  if (req.body?.newEmail && typeof req.body.newEmail === 'string') {
    req.body.newEmail = req.body.newEmail.trim().toLowerCase();
  }
  next();
};
