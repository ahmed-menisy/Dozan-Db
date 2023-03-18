import Router from 'express';
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as cart from './cart.js';
import * as Val from './cart.validation.js';
const router = Router();

router.post('/add-to-cart',
    validation(Val.addToCart),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.addToCart)
)

router.patch('/update-cart/:_id',
    validation(Val.updateCartVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.updateCart)
)

router.delete('/delete-product/:productId',
    validation(Val.deleteCartVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.deleteProduct)
)

router.get('/get-user-cart',
    validation(Val.noDateSchema),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.getUserCart)
)

export default router