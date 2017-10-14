
export default {
  loading: (state) => {
    return state.loading
  },
  notifications: (state) => {
    return state.notifications
  },
  logs: (state) => {
    return state.logs
  },
  zeroEx: (state) => {
    return state.zeroEx
  },
  tokens: (state) => {
    return state.tokens
  },
  address: (state) => {
    return state.addresses.length && state.addresses[0]
  }
}
