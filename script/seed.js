'use strict'

const faker = require('faker')

const db = require('../server/db')
const {
  User,
  Review,
  Order,
  Item,
  OrderItem,
  Category,
  Address
} = require('../server/db/models')

const orderStatuses = ['shipped', 'delivered', 'cancelled']

const rng = num => Math.floor(Math.random() * num)

const userFramework = []
const addressFramework = []
const categoriesFramework = []
const reviewsFramework = []
const itemsFramework = []
const orderItemsFramework = []
const ordersFramework = []
const cartsFramework = []
const cartItemsFramework = []

for (let i = 0; i < 10; i++) {
  userFramework.push({
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: faker.internet.password(),
    userType: 'user'
  })
  addressFramework.push({
    street: `${faker.address.streetAddress()} ${faker.address.streetName()}`,
    city: faker.address.city(),
    state: faker.address.state(),
    zipCode: faker.address.zipCode('#####')
  })
  categoriesFramework.push({
    name: faker.commerce.productMaterial() + i
  })

  cartsFramework.push({
    status: 'carted'
  })

  for (let j = 0; j < 10; j++) {
    itemsFramework.push({
      name: faker.commerce.product(),
      imageUrl: faker.image.fashion(),
      description: faker.lorem.sentence(),
      price: faker.commerce.price(),
      stock: faker.random.number({min: 1, max: 2000})
    })
    reviewsFramework.push({
      rating: faker.random.number({min: 1, max: 5}),
      description: faker.lorem.paragraph()
    })
    ordersFramework.push({
      status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    })
    orderItemsFramework.push({
      quantity: faker.random.number({min: 1, max: 2000}),
      salePrice: faker.commerce.price(),
      orderId: i + 1,
      itemId: j + 1
    })
  }
}

async function seed() {
  await db.sync({force: true})
  console.log('db synced!')

  const users = await Promise.all([
    User.create({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@email.com',
      password: 'admin',
      userType: 'admin'
    }),
    ...userFramework.map(user => User.create(user))
  ])

  console.log(`seeded ${users.length} users`)

  const addresses = await Promise.all(
    addressFramework.map(address => Address.create(address))
  )

  console.log(`seeded ${addresses.length} addresses`)

  const categories = await Promise.all(
    categoriesFramework.map(category => Category.create(category))
  )

  console.log(`seeded ${categories.length} categories`)

  const items = await Promise.all(itemsFramework.map(item => Item.create(item)))

  console.log(`seeded ${items.length} items`)

  const reviews = await Promise.all(
    reviewsFramework.map(review => Review.create(review))
  )

  console.log(`seeded ${reviews.length} reviews`)

  const orders = await Promise.all(
    ordersFramework.map(order => Order.create(order))
  )

  console.log(`seeded ${orders.length} orders`)

  const orderItems = await Promise.all(
    orderItemsFramework.map(orderItem => OrderItem.create(orderItem))
  )

  console.log(`seeded ${orderItems.length} orderItems`)

  const carts = await Promise.all(
    cartsFramework.map(cart => Order.create(cart))
  )

  carts.forEach(cart => {
    for (let i = 0; i < 10; i++) {
      cartItemsFramework.push(
        OrderItem.create({
          quantity: faker.random.number({min: 1, max: 2000}),
          salePrice: null,
          orderId: cart.id,
          itemId: i + 1
        })
      )
    }
  })
  await Promise.all(cartItemsFramework)

  console.log(`seeded ${carts.length} carts`)

  await Promise.all(carts.map((cart, i) => cart.setUser(i + 1)))

  await Promise.all(addresses.map((address, i) => address.setUser(users[i])))

  await Promise.all(
    reviews.map(review => review.setUser(users[rng(users.length)]))
  )
  await Promise.all(
    reviews.map(review => review.setItem(items[rng(items.length)]))
  )
  await Promise.all(
    orders.map(order => order.setUser(users[rng(users.length)]))
  )
  await Promise.all(
    items.map(item => item.addCategory(categories[rng(categories.length)]))
  )
  console.log(`seeded successfully`)
}

// We've separated the `seed` function from the `runSeed` function.
// This way we can isolate the error handling and exit trapping.
// The `seed` function is concerned only with modifying the database.
async function runSeed() {
  console.log('seeding...')
  try {
    await seed()
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    console.log('closing db connection')
    await db.close()
    console.log('db connection closed')
  }
}

// Execute the `seed` function, IF we ran this module directly (`node seed`).
// `Async` functions always return a promise, so we can use `catch` to handle
// any errors that might occur inside of `seed`.
if (module === require.main) {
  runSeed()
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed
