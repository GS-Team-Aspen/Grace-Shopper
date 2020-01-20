import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import cart from './cart'
import user from './user'
import orders from './orders'
import singleOrder from './singleOrder'
import {itemsReducer as items} from './item'
import {singleItemReducer as singleItem} from './singleItem'
import {categoriesReducer as categories} from './categories'
import {reviewsReducer as reviews} from './review'

const reducer = combineReducers({
  user,
  items,
  singleItem,
  categories,
  reviews,
  orders,
  singleOrder,
  cart
})

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({collapsed: true}))
)
const store = createStore(reducer, middleware)

export default store
export * from './user'
