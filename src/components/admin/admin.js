import bcryptjs from 'bcryptjs';
import adminModel from '../../../DB/models/admin.js';
import orderModel from '../../../DB/models/orderModel.js';
import moment from "moment";
import {
  StatusCodes
} from 'http-status-codes';
import ErrorClass from '../../utils/ErrorClass.js';
import jwt from 'jsonwebtoken';
import { roles } from '../../middleware/auth.js';
import { createHtml, sendEmail } from '../../utils/sendEmail.js';


export const addAdmin = async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, +process.env.salt)
  const AdminAdded = await adminModel.insertMany({ name, email, password: hashedPassword })
  const payload = {
    id: AdminAdded[0]._id,
    email: email,
    role: AdminAdded[0].role
  }
  const token = jwt.sign(payload, process.env.TokenStart)

  const link = `${req.protocol}://${req.headers.host}/api/v1/admin/confirm/${token}`
  let html = createHtml(link)
  await sendEmail(email, "Dozan email confirmation", html)
  return res.status(StatusCodes.CREATED).json({ message: "Done", result: AdminAdded });
}

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const isExist = await adminModel.findOne({ email });
  if (!isExist) {
    return next(new ErrorClass('invalid login information', StatusCodes.BAD_REQUEST));
  }
  const pass = bcryptjs.compareSync(password, isExist.password)
  if (!pass) {
    return next(new ErrorClass('invalid login information', StatusCodes.BAD_REQUEST));
  }
  // token 
  const payload = {
    id: isExist._id,
    email: isExist.email,
    role: isExist.role
  }
  const token = jwt.sign(payload, process.env.TokenStart)
  res.status(StatusCodes.ACCEPTED).json({ message: "Done", token })
}


export const confirmEmail = async (req, res) => {
  const token = req.params.token;
  const tokenDetails = jwt.verify(token, process.env.TokenStart)
  const user = await adminModel.findByIdAndUpdate(tokenDetails._id, { confirm: true }, { new: true })
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  res.redirect('https://google.com');
}

export const changePassword = async (req, res, next) => {
  const { oldPass, newPass } = req.body;
  const id = req.user.id
  const user = await adminModel.findById(id);
  const correctPass = bcryptjs.compareSync(oldPass, user.password)
  if (!correctPass) {
    return next(new ErrorClass('invalid password', StatusCodes.BAD_REQUEST))
  }
  const newpassHashed = bcryptjs.hashSync(newPass, +process.env.salt)
  const upatedUser = await adminModel.findByIdAndUpdate(id, { password: newpassHashed }, { new: true })
  res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: upatedUser })
}


export const update = async (req, res, next) => {
  const { name } = req.body;
  const _id = req.user.id;
  const user = await adminModel.findByIdAndUpdate(_id, { name }, { new: true });
  res.status(StatusCodes.ACCEPTED).json({ message: "Done", result: user })
}


export const deleteAdmin = async (req, res, next) => {
  const { id } = req.params
  const user = await adminModel.findById(id);
  if (!user) {
    return next(new ErrorClass("invalid user Id", StatusCodes.NOT_FOUND))
  }
  // super admin email can't be deleted 
  if (user.role == roles.superAdmin) {
    return next(new ErrorClass("Super admin can't be deleted... if you want to delete it contact the administrator", StatusCodes.FORBIDDEN))
  }
  await adminModel.deleteOne({ _id: id })
  res.status(StatusCodes.ACCEPTED).json({ message: "Deleted" })
}

export const charts = async (req, res, next) => {


  const year = {
    Jan: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Feb: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Mar: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Apr: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    May: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Jun: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Jul: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Aug: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Sep: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Oct: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Nov: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Dec: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
  };
  const month = {
    week1: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    week2: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    week3: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    week4: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
  }
  const week = {
    Sat: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Sun: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Mon: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Tue: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Wed: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Thu: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    },
    Fri: {
      Perfumes: 0,
      Incense: 0,
      Rings: 0,
      Rosary: 0
    }
  };

  let YearDate = moment().subtract(1, 'year')
  let monthDate = moment().subtract(1, 'month')
  let dataMonth = []
  let dataWeek = []
  const ordersYear = await orderModel.find({ createdAt: { $gt: YearDate } }).populate([{
    path: 'products.product',
    select: '-_id category price'

  }])
  for (const order of ordersYear) {
    let item = year[order.createdAt.toString().split(' ')[1]];
    for (const product of order.products) {
      item[product.product.category] += (product.product.price * product.quantity)
    }
    if (order.createdAt > monthDate) {
      dataMonth.push(order)
    }
  }
  for (const order of dataMonth) {
    if (order.createdAt > moment().subtract(1, 'week')) {
      let item = month.week1
      for (const product of order.products) {
        item[product.product.category] += (product.product.price * product.quantity)
      }
      dataWeek.push(order)
    }
    else if (order.createdAt > moment().subtract(2, 'week') && order.createdAt < moment().subtract(1, 'week')) {
      let item = month.week2
      for (const product of order.products) {
        item[product.product.category] += (product.product.price * product.quantity)
      }
    }
    else if (order.createdAt > moment().subtract(3, 'week') && order.createdAt < moment().subtract(2, 'week')) {
      let item = month.week3
      for (const product of order.products) {
        item[product.product.category] += (product.product.price * product.quantity)
      }
    }
    else if (order.createdAt > moment().subtract(4, 'week') && order.createdAt < moment().subtract(3, 'week')) {
      let item = month.week4
      for (const product of order.products) {
        item[product.product.category] += (product.product.price * product.quantity)
      }
    }
  }
  for (const order of dataWeek) {
    let item = week[order.createdAt.toString().split(' ')[0]];
    for (const product of order.products) {
      item[product.product.category] += (product.product.price * product.quantity)
    }
  }

  res.json({ year, month, week })
}