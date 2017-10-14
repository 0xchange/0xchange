
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
  tokenSymbols: () => {
    return this.tokens.map((token) => token.symbol)
  }
}
