import { Router } from 'express';

import { createCrudFactory } from '../utils/crudFactory';
import { protectRoute, restrictTo } from '../utils/authUtils';
import { Role } from '../generated/prisma';
import {
  createEventSchema,
  updateEventSchema,
} from '../validators/eventValidations';
import { validateBody } from '../utils/utilFunctions';

const router = Router();

const eventCrud = createCrudFactory({
  modelName: 'event',
  selectFields: {
    id: true,
    name: true,
    location: true,
    date: true,
    description: true,
  },
  transformInput: (input) => ({
    ...input,
    name: input.name?.trim(),
    location: input.location?.trim(),
  }),
});

router.use(protectRoute());
router.get('/', eventCrud.getAll);
router.get('/:eventId', eventCrud.getOne);

router.use(restrictTo(Role.SUPER_ADMIN));
router.post('/', validateBody(createEventSchema), eventCrud.create);
router.patch('/:eventId', validateBody(updateEventSchema), eventCrud.update);
router.delete('/:eventId', eventCrud.delete);

export default router;
