import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  navigation: [],
  permission: [],
  aedExchangeRate: 0,
  usdExchangeRate: 0,
  cadExchangeRate: 0,
}

export const navigationDataSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    addNavigation: (state, action) => {
      state.navigation = action.payload;
    },
    clearNavigation: (state, action) => {
      state.navigation = []
    },
    setPermission: (state, action) => {
      state.permission = action.payload
    },
    addPermission: (state, action) => {
      const index = state?.permission.indexOf(action.payload)
      if (index === -1) {
        console.log(action.payload, 'action');
        
        state.permission.push(action.payload)
      }
    },
    setAedExchangeRate: (state, action) => {
      state.aedExchangeRate = action.payload
    },
    setUsdExchangeRate: (state, action) => {
      state.usdExchangeRate = action.payload
    },
    setCadExchangeRate: (state, action) => {
      state.cadExchangeRate = action.payload
    },
  },
})


// Action creators are generated for each case reducer function
export const { addNavigation, clearNavigation, setPermission, addPermission, setAedExchangeRate, setUsdExchangeRate, setCadExchangeRate } = navigationDataSlice.actions

export default navigationDataSlice.reducer

