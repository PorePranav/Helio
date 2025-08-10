import { Router } from 'express';
import { protectRoute, restrictTo } from '../utils/authUtils';
import { Role } from '../generated/prisma';
import {
  deleteAdmin,
  getAdmin,
  getAdmins,
  getOperators,
  getUser,
  getUserKyc,
  getUsers,
  signupAdmin,
  updateAdmin,
} from '../controllers/admin.controller';
import { validateBody } from '../utils/utilFunctions';
import { signupAdminSchema } from '../validators/authValidations';

const router = Router();

router.use(protectRoute);
router.get('/user/list', restrictTo(Role.SUPER_ADMIN), getUsers);

router.use(restrictTo(Role.SUPER_ADMIN, Role.OPERATOR));
router.get('/user/kyc/:userId', getUserKyc);
router.get('/user/:userId', getUser);

router.use(restrictTo(Role.SUPER_ADMIN));

router.post('/signup', validateBody(signupAdminSchema), signupAdmin);

router.get('/superadmins/list', getAdmins);
router.get('/operators/list', getOperators);
router.get('/admin/:adminId', getAdmin);
router.patch('/admin/:adminId', updateAdmin);
router.delete('/admin/:adminId', deleteAdmin);

export default router;
