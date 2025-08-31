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
import { createCrudFactory } from '../utils/crudFactory';
import {
  createAccountHeadSchema,
  createCostCenterSchema,
  createGstStateSchema,
} from '../validators/adminOperationsValidations';

const costCenterCrud = createCrudFactory({
  modelName: 'costCenter',
  fieldName: 'costCenter',
  transformInput: (input: string) => input.toLowerCase(),
});

const accountHeadCrud = createCrudFactory({
  modelName: 'accountHead',
  fieldName: 'accountHead',
  transformInput: (input: string) => input.toLowerCase(),
});

const gstStateCrud = createCrudFactory({
  modelName: 'gstState',
  fieldName: 'gstState',
  transformInput: (input: string) => input.toLowerCase(),
});

const router = Router();

router.post('/signup', validateBody(signupAdminSchema), signupAdmin);

router.use(protectRoute(false));
router.get('/user/list', restrictTo(Role.SUPER_ADMIN), getUsers);

router.use(restrictTo(Role.SUPER_ADMIN, Role.OPERATOR));
router.get('/user/kyc/:userId', getUserKyc);
router.get('/user/:userId', getUser);
router.get('/costCenter/:costCenterId', costCenterCrud.getOne);
router.get('/costCenter', costCenterCrud.getAll);
router.get('/accountHead/:accountHeadId', accountHeadCrud.getOne);
router.get('/accountHead', accountHeadCrud.getAll);
router.get('/gstState/:gstStateId', gstStateCrud.getOne);
router.get('/gstState', gstStateCrud.getAll);

router.use(restrictTo(Role.SUPER_ADMIN));

router.get('/superadmins/list', getAdmins);
router.get('/operators/list', getOperators);
router.get('/admin/:adminId', getAdmin);
router.patch('/admin/:adminId', updateAdmin);
router.delete('/admin/:adminId', deleteAdmin);

/**
 * Cost Center Routes
 */
router.post(
  '/costCenter',
  validateBody(createCostCenterSchema),
  costCenterCrud.create
);
router.patch(
  '/costCenter/:costCenterId',
  validateBody(createCostCenterSchema),
  costCenterCrud.update
);
router.delete('/costCenter/:costCenterId', costCenterCrud.delete);

/*
 * Account Head Routes
 */
router.post(
  '/accountHead',
  validateBody(createAccountHeadSchema),
  accountHeadCrud.create
);
router.patch(
  '/accountHead/:accountHeadId',
  validateBody(createAccountHeadSchema),
  accountHeadCrud.update
);
router.delete('/accountHead/:accountHeadId', accountHeadCrud.delete);

/**
 * GST State Routes
 */
router.post(
  '/gstState',
  validateBody(createGstStateSchema),
  gstStateCrud.create
);
router.patch(
  '/gstState/:gstStateId',
  validateBody(createGstStateSchema),
  gstStateCrud.update
);
router.delete('/gstState/:gstStateId', gstStateCrud.delete);

export default router;
