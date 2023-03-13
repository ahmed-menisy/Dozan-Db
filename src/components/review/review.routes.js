import Router from 'express';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as review from './review.js';
import * as Val from './review.validation.js';
import { auth, roles } from '../../middleware/auth.js';
const router = Router();



router.post('/create-review',
    validation(Val.createVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(review.createReview)
)
export default router