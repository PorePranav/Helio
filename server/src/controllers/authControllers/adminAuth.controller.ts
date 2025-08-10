import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { sendPasswordResetMail } from '../../utils/sendEmail';
import { createSendToken } from '../../utils/authUtils';

export const loginAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const admin = await prisma.admin.findFirst({
      where: { email, isActive: true },
    });

    const dummyHash =
      '$2a$12$Y2A1NjIxZjRjMzAzYjI4N.eo234bYx38bVT3P2R6Fz4Yq2j2E9i7m';

    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.password)
      : false;

    if (!admin) {
      await bcrypt.compare(password, dummyHash);
    }

    if (!admin || !passwordMatches) {
      return next(new AppError('Invalid credentials', 401));
    }

    createSendToken(admin, 200, res);
  }
);

export const getMeAdmin = catchAsync(async (req: Request, res: Response) => {
  const fetchedAdmin = await prisma.admin.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: fetchedAdmin,
  });
});

export const forgotPasswordAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const fetchedAdmin = await prisma.admin.findFirst({
      where: { email, isActive: true },
    });

    if (fetchedAdmin) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      await prisma.admin.update({
        where: { id: fetchedAdmin.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      sendPasswordResetMail(fetchedAdmin.name, fetchedAdmin.email, resetToken);
    }

    res.status(200).json({
      status: 'success',
      message:
        'If this email exists and is active, you will receive a password reset link',
    });
  }
);

export const resetPasswordAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.token) {
      return next(new AppError('Token is required', 400));
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.query.token as string)
      .digest('hex');

    const fetchedAdmin = await prisma.admin.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiresAt: { gte: new Date() },
      },
    });

    const { password, confirmPassword } = req.body;

    if (!fetchedAdmin) {
      return next(new AppError('Invalid or expired token', 400));
    }

    if (await bcrypt.compare(password, fetchedAdmin.password)) {
      return next(new AppError('New password cannot be same as old', 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    const newHashedPassword = await bcrypt.hash(password, 12);

    const updatedAdmin = await prisma.admin.update({
      where: { id: fetchedAdmin.id },
      data: {
        password: newHashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        passwordChangedAt: new Date(),
      },
    });

    createSendToken(updatedAdmin, 200, res);
  }
);

export const changePasswordAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    const fetchedAdmin = await prisma.admin.findUnique({
      where: { id: req.user!.id },
    });

    if (!fetchedAdmin) {
      return next(new AppError('No admin found with this ID', 404));
    }

    if (await bcrypt.compare(password, fetchedAdmin.password)) {
      return next(new AppError('New password cannot be same as old', 400));
    }

    const newHashedPassword = await bcrypt.hash(password, 12);

    const updatedAdmin = await prisma.admin.update({
      where: { id: req.user!.id },
      data: {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    createSendToken(updatedAdmin, 200, res);
  }
);
