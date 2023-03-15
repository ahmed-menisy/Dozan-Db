import Router from 'express';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as category from './category.js';
import * as Val from './category.validation.js';
import { auth, roles } from '../../middleware/auth.js';
const router = Router();



router.post('/create-category',
    validation(Val.createVal),
    asyncErrorHandler(auth([roles.superAdmin,roles.admin])),
    asyncErrorHandler(category.createCategory)
)

router.patch('/update-category/:categoryId',
    validation(Val.update),
    asyncErrorHandler(auth([roles.admin,roles.superAdmin])),
    asyncErrorHandler(category.update)
)


export default router