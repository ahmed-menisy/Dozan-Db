import Router from 'express';
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as favourite from './favourite.js';
import * as Val from './favourite.validation.js';
const router = Router();

router.post('/add-to-wishlist',
    validation(Val.addToFavourite),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(favourite.addToFavourite)
)

router.get('/get-user-wishlist',
    validation(Val.noDateSchema),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(favourite.getUserWishList)
)

export default router