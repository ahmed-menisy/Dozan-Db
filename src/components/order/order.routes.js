import Router from 'express';
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as order from './order.js';
import * as Val from './order.validation.js';
const router = Router();



router.post('/create-order',
    validation(Val.createOrderVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(order.createOrder)
)

router.patch('/update-order/:_id',
    validation(Val.updateOrderVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(order.updateOrder)
)

router.delete('/delete-order/:_id',
    validation(Val.deleteOrderVal),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(order.deleteOrder)
)

router.get('/mark-as-delivered/:_id',
    validation(Val.deleteOrderVal),
    asyncErrorHandler(auth([roles.admin, roles.superAdmin])),
    asyncErrorHandler(order.markAsDelivered)
)

router.get('/get-orders',
    validation(Val.getOrderSchema),
    asyncErrorHandler(auth([roles.admin, roles.superAdmin])),
    asyncErrorHandler(order.getOrders)
)

router.get('/get-user-orders/:userId',
    validation(Val.getUserOrderSchema),
    asyncErrorHandler(auth([roles.admin, roles.superAdmin])),
    asyncErrorHandler(order.getUserOrders)
)

router.get('/get-order-by-id/:_id',
    validation(Val.orderById),
    asyncErrorHandler(auth([roles.admin, roles.superAdmin])),
    asyncErrorHandler(order.orderById)
)


export default router