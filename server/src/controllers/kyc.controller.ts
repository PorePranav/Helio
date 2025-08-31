import { Request, Response, NextFunction } from 'express';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import prisma from '../utils/prisma';
import { createSendToken } from '../utils/authUtils';

export const submitKyc = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycId: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.kycId) {
      return next(new AppError('KYC already submitted', 400));
    }

    const [newKyc] = await prisma.$transaction([
      prisma.kYC.create({
        data: {
          ...req.body,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          kycId: undefined,
          isKycComplete: true,
        },
      }),
    ]);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { kycId: newKyc.id },
    });

    createSendToken(updatedUser, 201, res);
  }
);

export const updateKyc = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { kycId } = req.params;

    const existingKyc = await prisma.kYC.findUnique({
      where: { id: kycId },
    });

    if (!existingKyc) {
      return next(new AppError('KYC not found', 404));
    }

    const {
      bankAccountName,
      bankName,
      accountType,
      accountNumber,
      ifscCode,
      panNumber,
      gstNumber,
      gstRegistered,
      bankDetailsUrl,
      panCardUrl,
      gstCertificateUrl,
    } = req.body;

    const updatedKyc = await prisma.kYC.update({
      where: { id: kycId },
      data: {
        bankAccountName,
        bankName,
        accountType,
        accountNumber,
        ifscCode,
        panNumber,
        gstNumber,
        gstRegistered,
        bankDetailsUrl,
        panCardUrl,
        gstCertificateUrl,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { kyc: updatedKyc },
    });
  }
);
