const router = require('express').Router()
//const Op = require('Sequelize').Op
const {Order, OrderItem, User, Item} = require('../db/models')
module.exports = router

//GET all orders--see if additional models should be included
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [User, Item]
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

//GET specific order; accessible to admin or user that created order
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [User, Item]
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
})

//GET all orders associated to a specific user
router.get('/orderHistory/:userId', async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.params.userId
      }
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

//GET or CREATE a new cart for a user; runs at first login ideally
router.get('/cart/:userId', async (req, res, next) => {
  try {
    const cart = await Order.findOrCreate({
      where: {
        userId: req.params.userId,
        status: 'carted'
      },
      include: [Item]
    })
    res.json(cart)
  } catch (error) {
    next(error)
  }
})

//update quantity of an item in a cart
router.put('/cart/changeQuantity', async (req, res, next) => {
  try {
    console.log(req.body)
    const orderItem = await OrderItem.findOne({
      where: {
        orderId: req.body.orderId,
        itemId: req.body.itemId
      }
    })
    const newOrderItem = await orderItem.update({
      quantity: req.body.newValue
    })
    res.json(await Order.findByPk(newOrderItem.orderId, {include: [Item]}))
  } catch (error) {
    next(error)
  }
})

//update the carts status to shipped and set a new cart up for a user
router.put('/cart/purchase', async (req, res, next) => {
  try {
    const cart = await Order.findByPk(req.body.orderId)
    await cart.update({status: 'shipped'})
    const newCart = await Order.findOrCreate({
      where: {
        userId: req.body.userId,
        status: 'carted'
      },
      include: [Item]
    })
    res.json(newCart)
  } catch (error) {
    next(error)
  }
})

//**needs to capture userId; get info to OrderItems
router.post('/', async (req, res, next) => {
  try {
    const order = await Order.create(req.body)
    // const orderitem = await OrderItem.create(req.body)
    res.status(201)
    res.json(order)
  } catch (error) {
    next(error)
  }
})

router.post('/cart/add', async (req, res, next) => {
  try {
    await OrderItem.findOrCreate({where: {...req.body}})
    const cart = await Order.findByPk(req.body.orderId)
    res.status(201)
    res.json(cart)
  } catch (error) {
    next(error)
  }
})

//delete an item from a cart
router.delete('/cart/delete', async (req, res, next) => {
  try {
    const orderItem = await OrderItem.findOne({
      where: {
        orderId: req.body.orderId,
        itemId: req.body.itemId
      }
    })
    await orderItem.destroy()
    res.json(await Order.findByPk(req.body.orderId, {include: [Item]}))
  } catch (error) {
    next(error)
  }
})
