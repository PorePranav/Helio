import { Router } from 'express';
import { protectRoute, restrictTo } from '../utils/authUtils';
import { submitKyc, updateKyc } from '../controllers/kyc.controller';
import { validateBody } from '../utils/utilFunctions';
import { createKycSchema, updateKycSchema } from '../validators/kycValidations';
import { Role } from '../generated/prisma';

const router = Router();

router.use(protectRoute);
router.post(
  '/submitKyc',
  restrictTo(Role.VENDOR, Role.INDIVIDUAL),
  validateBody(createKycSchema),
  submitKyc
);

router.patch(
  '/updateKyc',
  restrictTo(Role.SUPER_ADMIN),
  validateBody(updateKycSchema),
  updateKyc
);

export default router;
