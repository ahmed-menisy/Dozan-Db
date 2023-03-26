import express from 'express';
const app = express();
app.use(express.json());
import { config } from 'dotenv';
import connection from './DB/connection.js';
import { errorHandel } from './src/utils/errorHandeling.js';
import userRouter from './src/components/user/user.routes.js';
import adminRouter from './src/components/admin/admin.routes.js';
import productRouter from './src/components/product/product.routes.js';
import orderRouter from './src/components/order/order.routes.js';
import reviewRouter from './src/components/review/review.routes.js';
import categoryRouter from "./src/components/category/category.routes.js";
import cartRouter from "./src/components/cart/cart.routes.js";
import favouriteRouter from "./src/components/favourite/favourite.routes.js";
import cors from "cors"
config()
connection()
app.use(cors())





app.use('/api/v1/users', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/review', reviewRouter)
app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/favourite', favouriteRouter)





app.use(errorHandel)
app.all('*', (req, res) => {
    res.json({ message: 'in-valid URL' })
});
app.listen(process.env.port, () => {
    console.log(`running.......`);
});