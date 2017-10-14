
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
  },
  rates: (state) => {
    return state.rates
    let tokens = []
    state.tokens.forEach((token) => {
      if (tokens.findIndex((t) => t.address === token.address) < 0) {
        tokens.push(token)
      }
    })
    return tokens.sort((a, b) => {
      return a.name - b.name
    })
  },
  address: (state) => {
    return state.addresses.length && state.addresses[0]
  },
  NULL_ADDRESS: (state) => {
    return state.NULL_ADDRESS
  },
  conversion: (state) => {
    return state.conversion
  }
}
