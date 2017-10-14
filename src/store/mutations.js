export default {
  LOADING (state, val) {
    state.loading = val
  },
  ADD_LOGS (state, logs) {
    state.logs.push(...logs)
  },
  ADD_MSG (state, msg) {
    state.notifications.push(msg)
  },
  REMOVE_MSG (state, id) {
    let key = state.notifications.findIndex((msg) => msg.id === id)
    if (key > -1) {
      state.notifications.splice(key, 1)
    }
  },
  ADD_TOKENS (state, tokens) {
    state.tokens.push(...tokens)
  },
  SET_NULL_ADDRESS (state, address) {
    state.NULL_ADDRESS = address
  },
  SET_WETH_ADDRESS (state, address) {
    state.WETH_ADDRESS = address
  },
  SET_ZRX_ADDRESS (state, address) {
    state.ZRX_ADDRESS = address
  },
  SET_EXCHANGE_ADDRESS (state, address) {
    state.EXCHANGE_ADDRESS = address
  },
  SET_ZERO_EX (state, zeroEx) {
    state.zeroEx = zeroEx
  },
  UPDATE_RATES (state, rates) {
    state.rates = rates
  },
  UPDATE_RATE (state, rate) {
    state.rates[rate.from][rate.to] = rate.price
  },
  SET_ADDRESSES (state, addresses) {
    state.addresses = addresses
  }
}
