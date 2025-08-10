import { Router } from 'express';

import { validateBody } from '../../utils/utilFunctions';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  signupUserSchema,
  updateUserEmailSchema,
} from '../../validators/authValidations';
import {
  signupUser,
  loginUser,
  forgotUserPassword,
  resetUserPassword,
  updateUserPassword,
  verifyUserEmail,
  getMeUser,
  logout,
  resendVerificationEmail,
  updateUserEmail,
} from '../../controllers/authControllers/userAuth.controller';
import { protectRoute, normalizeEmail } from '../../utils/authUtils';

const router = Router();

router.post(
  '/signup',
  normalizeEmail,
  validateBody(signupUserSchema),
  signupUser
);
router.post('/login', normalizeEmail, validateBody(loginSchema), loginUser);
router.post(
  '/forgotPassword',
  normalizeEmail,
  validateBody(forgotPasswordSchema),
  forgotUserPassword
);
router.patch(
  '/resetPassword',
  validateBody(changePasswordSchema),
  resetUserPassword
);
router.patch('/verifyUser', verifyUserEmail);
router.post('/resendVerification', normalizeEmail, resendVerificationEmail);

router.use(protectRoute);
router.patch(
  '/changePassword',
  validateBody(changePasswordSchema),
  updateUserPassword
);
router.patch(
  '/updateEmail',
  normalizeEmail,
  validateBody(updateUserEmailSchema),
  updateUserEmail
);
router.get('/logout', logout);
router.get('/me', getMeUser);

export default router;
