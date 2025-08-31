import { Request, Response, NextFunction } from 'express';

import prisma from '../utils/prisma';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { Claim, ClaimStatus, FormStatus } from '../generated/prisma';

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
