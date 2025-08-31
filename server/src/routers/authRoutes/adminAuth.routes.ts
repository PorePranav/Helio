import { Router } from 'express';

const router = Router();

import { validateBody } from '../../utils/utilFunctions';
import {
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from '../../validators/authValidations';
import {
  loginAdmin,
  forgotPasswordAdmin,
  resetPasswordAdmin,
  changePasswordAdmin,
  getMeAdmin,
} from '../../controllers/authControllers/adminAuth.controller';
import { normalizeEmail, protectRoute } from '../../utils/authUtils';

router.post('/login', normalizeEmail, validateBody(loginSchema), loginAdmin);
router.post(
  '/forgotPassword',
  validateBody(forgotPasswordSchema),
  forgotPasswordAdmin
);
router.patch(
  '/resetPassword',
  validateBody(changePasswordSchema),
  resetPasswordAdmin
);

router.use(protectRoute(false));

router.patch(
  '/changePassword',
  validateBody(changePasswordSchema),
  changePasswordAdmin
);

router.get('/me', getMeAdmin);

export default router;
