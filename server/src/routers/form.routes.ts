import { Router } from 'express';

import { protectRoute, restrictTo } from '../utils/authUtils';
import { Role } from '../generated/prisma';
import { createForm, getFormById } from '../controllers/form.controller';
import { validateBody } from '../utils/utilFunctions';
import { createFormSchema } from '../validators/formValidations';

const router = Router();

router.use(protectRoute());
router.get('/:formId', getFormById);
router.post(
  '/',
  restrictTo(Role.INDIVIDUAL, Role.VENDOR),
  validateBody(createFormSchema),
  createForm
);

export default router;
