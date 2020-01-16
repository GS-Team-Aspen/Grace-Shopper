import axios from 'axios'
import history from '../history'

export const GET_SINGLE_ITEM = 'GET_SINGLE_ITEM'

export const getSingleItem = item => ({type: GET_SINGLE_ITEM, item})

const initialState = {}

export const fetchSingleItem = id => {
  return async dispatch => {
    try {
      const response = await axios.get(`/api/items/${id}`)
      const item = response.data
      const action = getSingleItem(item)
      dispatch(action)
    } catch (err) {
      console.log(err)
    }
  }
}

export const singleItemReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SINGLE_ITEM:
      return action.item
    default:
      return state
  }
}