import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import prisma from '../../utils/prisma';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/AppError';
import {
  sendPasswordResetMail,
  sendVerificationEmail,
} from '../../utils/sendEmail';
import { createSendToken } from '../../utils/authUtils';

export const signupUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword)
      return next(new AppError('Passwords do not match', 400));

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        verificationToken: verificationTokenHash,
        verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    sendVerificationEmail(newUser.name, newUser.email, verificationToken);
    const { password: newUserPassword, ...data } = newUser;

    res.status(201).json({
      status: 'success',
      data,
    });
  }
);

export const resendVerificationEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const fetchedUser = await prisma.user.findFirst({
      where: { email, isVerified: false },
    });

    if (fetchedUser) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      await prisma.user.update({
        where: { id: fetchedUser.id },
        data: {
          verificationToken: verificationTokenHash,
          verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      sendVerificationEmail(
        fetchedUser.name,
        fetchedUser.email,
        verificationToken
      );
    }

    res.status(200).json({
      status: 'success',
      message:
        'If this email exists and is unverified, you will receive a verification email',
    });
  }
);

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    const dummyHash =
      '$2a$12$Y2A1NjIxZjRjMzAzYjI4N.eo234bYx38bVT3P2R6Fz4Yq2j2E9i7m';

    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user) await bcrypt.compare(password, dummyHash);

    if (!user || !passwordMatches)
      return next(new AppError('Invalid credentials', 401));

    if (!user.isVerified)
      return next(new AppError('Email is not verified', 401));

    createSendToken(user, 200, res);
  }
);

export const getMeUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('In get me user');
    const fetchedUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: fetchedUser,
    });
  }
);

export const forgotUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const fetchedUser = await prisma.user.findFirst({
      where: { email },
    });

    if (fetchedUser) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const updatedUser = await prisma.user.update({
        where: { id: fetchedUser.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      sendPasswordResetMail(updatedUser.name, updatedUser.email, resetToken);
    }

    res.status(200).json({
      status: 'success',
      message:
        'If this email exists in our system, you will receive a password reset link',
    });
  }
);

export const resetUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.token) return next(new AppError('Token is required', 400));

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.query.token as string)
      .digest('hex');

    const fetchedUser = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiresAt: { gte: new Date() },
      },
    });

    const { password, confirmPassword } = req.body;

    if (!fetchedUser)
      return next(new AppError('Invalid or expired token', 400));

    if (await bcrypt.compare(password, fetchedUser.password))
      return next(new AppError('New password cannot be same as old', 400));

    if (password !== confirmPassword)
      return next(new AppError('Passwords do not match', 400));

    const newHashedPassword = await bcrypt.hash(req.body.password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: fetchedUser.id },
      data: {
        password: newHashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        passwordChangedAt: new Date(),
      },
    });

    createSendToken(updatedUser, 200, res);
  }
);

export const updateUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword)
      return next(new AppError('Passwords do not match', 400));

    const fetchedUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!fetchedUser)
      return next(new AppError('No user found with this ID', 404));

    if (await bcrypt.compare(password, fetchedUser.password))
      return next(new AppError('New password cannot be same as old', 400));

    const newHashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    createSendToken(updatedUser, 200, res);
  }
);

export const verifyUserEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string')
      return next(new AppError('Token is required', 400));

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationTokenExpiresAt: { gte: new Date() },
      },
    });

    if (!user)
      return next(new AppError('Token is invalid or has expired', 400));

    interface UserUpdateData {
      verificationToken: null;
      verificationTokenExpiresAt: null;
      isVerified?: boolean;
      email?: string;
      pendingEmail?: null;
    }

    const updateData: UserUpdateData = {
      verificationToken: null,
      verificationTokenExpiresAt: null,
    };

    if (user.pendingEmail) {
      updateData.email = user.pendingEmail;
      updateData.pendingEmail = null;
      updateData.isVerified = true;
    }

    if (!user.isVerified) {
      updateData.isVerified = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    createSendToken(updatedUser, 200, res);
  }
);

export const updateUserEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newEmail, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser)
      return next(new AppError('This email is already in use', 400));

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    const passwordMatches = currentUser
      ? await bcrypt.compare(password, currentUser.password)
      : false;

    if (!currentUser || !passwordMatches)
      return next(new AppError('Invalid credentials', 401));

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        pendingEmail: newEmail,
        verificationToken: verificationTokenHash,
        verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    sendVerificationEmail(currentUser.name, newEmail, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent to new email address',
    });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('jwt').status(204).json({
      status: 'success',
      data: null,
    });
  }
);
