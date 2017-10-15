import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import axios from 'axios'
// import jsonpAdapter from 'axios-jsonp'
import BN from 'bignumber.js'
import { ZeroEx } from '0x.js'
import io from 'socket.io-client'
import CCC from '../socket/ccc.js'

let zeroEx = null

// option for prices
const priceSymbols = ['USD', 'CAD', 'BTC']

export default {
  withdraw ({commit, state}, eth) {
    zeroEx.etherToken.withdrawAsync(new BN(1000000000000000000).mul(eth), state.addresses[0]).then((tx) => {
      console.log(tx)
    })
  },
  deposit ({commit, state}, eth) {
    zeroEx.etherToken.depositAsync(new BN(1000000000000000000).mul(eth), state.addresses[0]).then((tx) => {
      console.log(tx)
    })
  },
  addNotification ({commit}, msg) {
    let id = new Date().getTime()
    msg.id = id
    commit('ADD_MSG', msg)
    if (!msg.noKill) {
      setTimeout(() => {
        commit('REMOVE_MSG', id)
      }, msg.timeout || 2000)
    }
    return id
  },
  removeNotification ({commit}, id) {
    commit('REMOVE_MSG', id)
  },
  getRates ({commit, dispatch}, symbols) {
    const symbolsString = symbols.join()
    const priceSymbolsString = priceSymbols.join()
    const testString = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + symbolsString + '&tsyms=' + priceSymbolsString
    console.log(testString)
    axios.get(testString).then((results) => {
      console.log('THE RATES HAVE BEEN UPDATED', results.data)
      commit('UPDATE_RATES', results.data)
      dispatch('openRateSocket', symbols)
    })
  },
  openRateSocket ({commit}, symbols) {
    const subscription = []

    // Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
    // Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
    // For aggregate quote updates use CCCAGG as market

    symbols.forEach((symbol) => {
      priceSymbols.forEach((pSymbol) => {
        const str = '5~CCCAGG~' + symbol + '~' + pSymbol
        subscription.push(str)
      })
    })
    console.log(JSON.stringify(subscription))

    var socket = io.connect('https://streamer.cryptocompare.com/')

    socket.emit('SubAdd', {subs: subscription})

    socket.on('m', function (message) {
      var messageType = message.substring(0, message.indexOf('~'))
      var res = {}
      if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
        res = CCC.CURRENT.unpack(message)
        if (res.PRICE) {
          // const rate = {to: res.TOSYMBOL, from: res.FROMSYMBOL, price: res.PRICE}
          // console.log(JSON.stringify(rate))
          // commit('UPDATE_RATE', rate)
        }
      }
    })
  },
  connect ({dispatch, commit, getters, state}) {
    let providerEngine = null
    if (window.web3) {
      providerEngine = window.web3.currentProvider
    } else {
      const ROPSTEN_ENDPOINT = 'https://ropsten.infura.io'

      providerEngine = new ProviderEngine()
      providerEngine.addProvider(new FilterSubprovider())
      providerEngine.addProvider(new RpcSubprovider({rpcUrl: ROPSTEN_ENDPOINT}))
      providerEngine.start()
    }

    zeroEx = new ZeroEx(providerEngine)
    // commit('SET_ZERO_EX', zeroEx)
    // 3117574 kovan
    // 4145578 mainnet
    zeroEx.exchange.getLogsAsync('LogFill', {fromBlock: 4219261, toBlock: 'latest'}, {}).then((logs) => {
      // console.log(logs)
      commit('ADD_LOGS', logs)
    })
    zeroEx.tokenRegistry.getTokensAsync().then((tokens) => {
      console.log('tokens returned')
      commit('ADD_TOKENS', tokens)
      console.log('tokens:', tokens)
      const symbols = getters.tokenSymbols
      var index = symbols.indexOf('WETH')
      if (index !== -1) {
        symbols[index] = 'ETH'
      }
      dispatch('getRates', symbols)
    })
    commit('SET_NULL_ADDRESS', ZeroEx.NULL_ADDRESS)
    zeroEx.etherToken.getContractAddressAsync().then((address) => {
      commit('SET_WETH_ADDRESS', address)
    })
    zeroEx.exchange.getZRXTokenAddressAsync().then((address) => {
      commit('SET_ZRX_ADDRESS', address)
    })
    zeroEx.exchange.getContractAddressAsync().then((address) => {
      commit('SET_EXCHANGE_ADDRESS', address)
    })
    zeroEx.getAvailableAddressesAsync().then((addresses) => {
      commit('SET_ADDRESSES', addresses)
    })
  },
  addTokenAddress ({commit}, address) {
    commit('ADD_TOKENS', [{address, name: null, symbol: null}])
  },
  setPagination ({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  submitOrder ({commit, state, dispatch}, order) {
    console.log('hier?')
    console.log(order)

    if (typeof order === 'string') order = JSON.parse(order)
    // {
    //   try {
    //     ZeroEx.isValidSignature(order)
    //   } catch (error) {
    //     console.error(error)
    //     dispatch('addNotification', {type: 'error', 'text': 'Order failed, check log for details'})
    //   }
    // }

    let orderHash = ZeroEx.getOrderHashHex(order)
    return zeroEx.signOrderHashAsync(orderHash, state.addresses[0]).then((ecSignature) => {
      const signedOrder = {
        ...order,
        ecSignature
      }
      console.log(signedOrder)
      // commit('ADD_ORDER', signedOrder)
      return axios.post('http://138.197.172.238/post/order', signedOrder).then((results) => {
        console.log(results)
        dispatch('pageServer')
        dispatch('addNotification', {type: 'success', 'text': 'Order Added'})
      })
      // return signedOrder
      // return zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder).then((idk) => {
      //   console.log('idk', idk)

      //   return idk
      // })
    }).catch((error) => {
      dispatch('addNotification', {type: 'error', 'text': 'Order failed, check log for details'})
      console.error(error)
    })
  },
  pageServer ({commit, state, dispatch}) {
    axios.get('http://138.197.172.238/get', {
      sortBy: state.pagination.sortBy,
      asc: state.pagination.descending,
      limit: state.pagination.rowsPerPage,
      page: state.pagination.page
    }).then((results) => {
      console.log(results)
      commit('ADD_ORDERS', results.data)
    })
  }
}
