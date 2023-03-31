import Router from 'express';
import express from "express";
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as order from './order.js';
import * as Val from './order.validation.js';
const router = Router();



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

router.post('/checkout',
    validation(Val.checkOut),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(order.checkout)
)

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    order.webhookCheckout
)


router.post('/paypal-checkout',
    validation(Val.checkOut),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(order.paypalCheckOut)
)


router.get("/success/:payId",
    asyncErrorHandler(order.success)
)
router.get("/cancel/:payId",
    asyncErrorHandler(order.cancel)
)
export default router