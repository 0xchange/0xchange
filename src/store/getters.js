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
    let tokens = []
    state.coinList.forEach((token) => {
      if (tokens.findIndex((t) => t.address === token.address) < 0) {
        tokens.push(token)
      }
    })
    return tokens.sort((a, b) => {
      return a.name - b.name
    })
  },
  tokenSymbols: (state) => {
    return state.tokens.map((token) => token.symbol)
  },
  rates: (state) => {
    return state.rates
  },
  address: (state) => {
    return state.addresses.length && state.addresses[0]
  },
  NULL_ADDRESS: (state) => {
    return state.NULL_ADDRESS
  },
  conversion: (state) => {
    return state.conversion
  },
  cryptoList (state) {
    return state.cryptoList
  },
  coinList (state) {
    return state.coinList
  },
  addressList (state) {
    let addresses = {}
    state.coinList.forEach((coin) => {
      addresses[coin.address] = coin
    })
    // console.log('addresses', addresses)
    return addresses
  },
  totalItems (state) {
    return state.totalItems
  },
  orders (state) {
    return state.orders
  }
}
