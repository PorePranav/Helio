import { Request, Response, NextFunction } from 'express';

import prisma from '../utils/prisma';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { Claim, ClaimStatus, FormStatus, Role } from '../generated/prisma';

export const getFormById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const form = await prisma.form.findUnique({
      where: { id: req.params.formId },
      select: {
        id: true,
        userId: true,
        formStatus: true,
        totalClaimAmount: true,
        claims: {select: {id: true, amount: true, claimStatus: true}},
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!form) {
      return next(new AppError('Form not found', 404));
    }

    if (req.user!.role === Role.VENDOR && form.userId !== req.user!.id) {
      return next(
        new AppError('You are not authorized to access this form', 403)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        form,
      },
    });
  }
);

// export const getAllForms = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const forms = await prisma.form.findMany({
//       where: { userId: req.user!.id },
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         forms,
//       },
//     });
//   }
// );

export const createForm = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { claims } = req.body;

    const totalClaimAmount = claims.reduce(
      (acc: number, claim: Claim) => Number(acc) + claim.amount,
      0
    );

    const { newForm, newClaims } = await prisma.$transaction(async (prisma) => {
      const newForm = await prisma.form.create({
        data: {
          userId: req.user!.id,
          formStatus: FormStatus.INREVIEW,
          totalClaimAmount,
        },
      });

      const newClaims = await prisma.claim.createMany({
        data: claims.map((claim: Claim) => ({
          ...claim,
          userId: req.user!.id,
          formId: newForm.id,
          claimStatus: ClaimStatus.INREVIEW,
        })),
      });

      return { newForm, newClaims };
    });

    res.status(201).json({
      status: 'success',
      data: {
        form: newForm,
        claims: newClaims,
      },
    });
  }
);
