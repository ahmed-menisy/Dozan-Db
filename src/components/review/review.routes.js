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

router.patch('/update-review/:reviewId',
    validation(Val.update),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(review.update)
)

router.delete('/delete-review/:reviewId',
    validation(Val.deleteReview),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(review.deleteReview)
)

router.get('/get-all-reviews',
    validation(Val.NoDataSchema),
    asyncErrorHandler(review.getAllReviews)
)

router.get('/get-user-reviews',
    validation(Val.NoDataSchema),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(review.getUserReviews)
)
export default router