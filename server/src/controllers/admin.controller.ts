import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import prisma from '../utils/prisma';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { Role } from '../generated/prisma';

export const signupAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token !== process.env.ADMIN_API_KEY) {
      return next(
        new AppError('You are not authorized to perform this action', 403)
      );
    }

    const { name, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { password: _, ...data } = newAdmin;

    res.status(201).json({
      status: 'success',
      data,
    });
  }
);

export const getAdmins = catchAsync(async (req: Request, res: Response) => {
  /*TODO: Add Pagination */
  const admins = await prisma.admin.findMany({
    where: { role: Role.SUPER_ADMIN },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: admins,
  });
});

export const getOperators = catchAsync(
  /*TODO: Add Pagination */
  async (req: Request, res: Response, next: NextFunction) => {
    const fetchedOperators = await prisma.admin.findMany({
      where: { role: Role.OPERATOR },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: fetchedOperators,
    });
  }
);

export const getAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { adminId } = req.params;

    const admin = await prisma.admin.findFirst({
      where: { id: adminId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin) {
      return next(new AppError('No admin found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: admin,
    });
  }
);

export const updateAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { adminId } = req.params;

    const fetchedAdmin = await prisma.admin.findFirst({
      where: { id: adminId, isActive: true },
    });

    if (!fetchedAdmin) {
      return next(new AppError('No admin found with this ID', 404));
    }

    if (
      fetchedAdmin.role === Role.SUPER_ADMIN &&
      req.body.role &&
      req.body.role !== Role.SUPER_ADMIN
    ) {
      return next(
        new AppError('Cannot change role of SUPER_ADMIN via this route', 403)
      );
    }

    const { name, email, role } = req.body;

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        name,
        email,
        role,
      },
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
      data: updatedAdmin,
    });
  }
);

export const deleteAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { adminId } = req.params;

    const fetchedAdmin = await prisma.admin.findFirst({
      where: { id: adminId, isActive: true },
    });

    if (!fetchedAdmin) {
      return next(new AppError('No admin found with this ID', 404));
    }

    if (fetchedAdmin.role === Role.SUPER_ADMIN) {
      return next(
        new AppError('SUPER_ADMIN cannot be deleted via this route', 403)
      );
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
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
      data: updatedAdmin,
    });
  }
);

export const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    /*TODO: Add Pagination */
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: users,
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        kycId: true,
        isKycComplete: true,
      },
    });

    if (!user) {
      return next(new AppError('No user found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

export const getUserKyc = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        kyc: true,
      },
    });

    if (!user) {
      return next(new AppError('No user found with this ID', 404));
    }

    if (user.kyc === null) {
      return next(new AppError('No KYC found for this user', 404));
    }

    res.status(200).json({
      status: 'success',
      data: user.kyc,
    });
  }
);
