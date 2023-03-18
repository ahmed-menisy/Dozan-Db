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

// router.patch('/update-favourite/:_id',
//     validation(Val.updateOrderVal),
//     asyncErrorHandler(auth([roles.user])),
//     asyncErrorHandler(order.updateProduct)
// )

router.delete('/delete-product/:productId',
    // validation(Val.deletefavouriteVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(favourite.deleteProduct)
)


router.get('/get-user-wishlist',
    validation(Val.noDateSchema),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(favourite.getUserWishList)
)
router.get('/get-user-favourite',
    validation(Val.noDateSchema),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(favourite.getUserfavourite)
)

export default router