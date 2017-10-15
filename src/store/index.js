import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)
let coinList = require('../assets/coinlist.json')

// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const state = {
  zeroEx: null,
  loading: false,
  notifications: [],
  tokens: [],
  logs: [],
  NULL_ADDRESS: null, // ZeroEx.NULL_ADDRESS;
  WETH_ADDRESS: null, // = await zeroEx.etherToken.getContractAddressAsync();
  ZRX_ADDRESS: null, // = await zeroEx.exchange.getZRXTokenAddressAsync();
  EXCHANGE_ADDRESS: null, // = await zeroEx.exchange.getContractAddressAsync();
  rates: {},
  addresses: [],
  conversion: 'WETH',
  // coinList,
  cryptoList: coinList.Data,
  coinList: [],
  orders: [],
  totalItems: 0
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: false, // debug,
  plugins: debug ? [createLogger()] : []
})
