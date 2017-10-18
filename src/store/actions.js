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
// let abi = require('../assets/contracts/Exchange.json')
// const abiDecoder = require('abi-decoder')
// var Web3EthAbi = require('web3-eth-abi')

let hostname = window.location.hostname
let prefix = hostname === 'kovan.0xchange.me' ? 'kovan.api.' : 'api.'
axios.defaults.baseURL = '//' + prefix + '0xchange.me'

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
  getRates ({commit, dispatch, getters}, symbols) {
    const symbolsString = symbols.join()
    const priceSymbolsString = priceSymbols.join()
    const testString = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + symbolsString + '&tsyms=' + priceSymbolsString
    // console.log(testString)
    axios.get(testString).then((results) => {
      // console.log('THE RATES HAVE BEEN UPDATED', results.data)
      commit('UPDATE_RATES', results.data)
      // const socketSymbols = getters.coinList.map((coin) => {
      //   return coin.symbol
      // })
      // dispatch('openRateSocket', socketSymbols)
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
    // console.log(JSON.stringify(subscription))

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
      const ROPSTEN_ENDPOINT = 'https://infura.io'

      providerEngine = new ProviderEngine()
      providerEngine.addProvider(new FilterSubprovider())
      providerEngine.addProvider(new RpcSubprovider({rpcUrl: ROPSTEN_ENDPOINT}))
      providerEngine.start()
    }

    zeroEx = new ZeroEx(providerEngine)
    // commit('SET_ZERO_EX', zeroEx)
    // 3117574 kovan
    // 4145578 mainnet
    // zeroEx.exchange.getLogsAsync('LogFill', {fromBlock: 4219261, toBlock: 'latest'}, {}).then((logs) => {
    //   console.log(logs)
    //   commit('ADD_LOGS', logs)
    //   console.log(logs[0])
    //   let data = logs[0].data
    //   // console.log(data)
    //   console.log(abi.abi)
    //   abi = abi.abi.map((a) => {
    //     console.log(a)
    //   })

    //   Web3EthAbi.decodeParameters(abi, data).then((results) => {
    //     console.log(results)
    //   })

    //   // abiDecoder.addABI(abi.abi)
    //   // const testData = "0x53d9d9100000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114de5000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114daa";
    //   // let decodedData = abiDecoder.decodeMethod(data)
    //   // console.log(decodedData)
    //   // zeroEx._web3Wrapper.web3.eth.getTransaction(tx, (result) => {
    //   //   console.log(result)
    //   // })
    // })

    // zeroEx.tokenRegistry.getTokensAsync().then((tokens) => {
    //   console.log('tokens returned')
    //   commit('ADD_TOKENS', tokens)
    //   console.log('tokens:', tokens)
    //   const symbols = getters.tokenSymbols
    //   var index = symbols.indexOf('WETH')
    //   if (index !== -1) {
    //     symbols[index] = 'ETH'
    //   }
    //
    // })
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
  fillOrder ({commit, getters, dispatch}, {order, amount}) {
    console.log(zeroEx)
    console.log(getters.address)
    // let copyOrder = JSON.parse(JSON.stringify(order))
    let sig = order.ecSignature
    delete order.ecSignature
    console.log(order)
    let orderHash = ZeroEx.getOrderHashHex(order)
    console.log('HASH', orderHash)
    order.ecSignature = sig
    // zeroEx.exchange.validateFillOrderThrowIfInvalidAsync(order, amount, getters.address, (result) => {
    //   console.log(result)
    // })
    zeroEx.exchange.fillOrderAsync(order, order.takerTokenAmount, false, getters.address).then((result) => {
      console.log(result)
      dispatch('addNotification', {type: 'success', 'text': 'Order filled, database will update shortly'})
      dispatch('pageServer')
    }).catch((error) => {
      console.error(error)
      dispatch('addNotification', {type: 'error', 'text': 'Order failed, check log for details'})
    })
  },
  submitOrder ({commit, state, dispatch}, order) {
    // console.log('hier?')
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
    try {
      var orderHash = ZeroEx.getOrderHashHex(order)
      console.log('HASH', orderHash)
      return zeroEx.signOrderHashAsync(orderHash, state.addresses[0]).then((ecSignature) => {
        const signedOrder = {
          ...order,
          ecSignature
        }
        // console.log(signedOrder)
        // commit('ADD_ORDER', signedOrder)
        return axios.post('/order/new', signedOrder).then((results) => {
          // console.log(results)
          dispatch('pageServer')
          dispatch('addNotification', {type: 'success', 'text': 'Order Added'})
        }).catch((error) => {
          dispatch('addNotification', {type: 'error', 'text': 'Order failed, check log for details'})
          console.error(error)
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
    } catch (error) {
      dispatch('addNotification', {type: 'error', 'text': 'Order failed, check log for details'})
      console.error(error)
    }
  },
  submitToken ({commit, dispatch}, token) {
    axios.post('/token/new', token).then((results) => {
      console.log(results)
      dispatch('addNotification', {type: 'success', 'text': 'Token Submitted!'})
      dispatch('getTokens')
    }).catch((error) => {
      console.error(error)
      dispatch('addNotification', {type: 'error', 'text': 'error adding token, check log for details'})
    })
  },
  pageServer ({commit, state, dispatch, getters}) {
    console.log('page server')
    axios.get('/order').then((results) => {
      // console.log(results)
      commit('ADD_ORDERS', results.data)
    }).catch((error) => {
      console.error(error)
    })

    // getters.coinList.forEach((coin) => {
    //   const newCoin = {
    //     address: coin.address,
    //     symbol: coin.symbol,
    //     name: coin.name,
    //     decimals: parseInt(coin.decimals)
    //   }
    //   axios.post('http://api.0xchange.me/token/new', newCoin).then((results) => {
    //     console.log(results)
    //     commit('ADD_ORDERS', results.data)
    //   }).catch((error) => {
    //     console.error(error)
    //   })
    // })
    dispatch('getTokens')
  },
  getTokens ({commit, getters, dispatch}) {
    axios.get('/token')
    .then((results) => {
      // console.log(results.data)
      // const filteredData = results.data.filter((coin) => {
      //   const s = coin.symbol
      //   if (/[^a-zA-Z0-9]/.test(s)) {
      //     return false
      //   } else {
      //     return ((s.toUpperCase() === s) && s.length < 5)
      //   }
      // })
      const mappedData = results.data.map((coin) => {
        const newCoin = coin
        newCoin.address = newCoin.address.toLowerCase()
        return newCoin
      })
      commit('ADD_COINLIST', mappedData)
      // console.log('orders---', getters.orders)
      const symbols = []
      getters.orders.forEach((order) => {
        // console.log('makerAddress', order.makerTokenAddress)
        // console.log('AddressList', getters.addressList)
        let makerSymbol = getters.addressList[order.makerTokenAddress].symbol
        let takerSymbol = getters.addressList[order.takerTokenAddress].symbol
        makerSymbol = (makerSymbol === 'WETH') ? 'ETH' : makerSymbol
        takerSymbol = (takerSymbol === 'WETH') ? 'ETH' : takerSymbol
        symbols.push(makerSymbol)
        symbols.push(takerSymbol)
      })
      // const symbols = filteredData.map((coin) => { return coin.symbol })
      dispatch('getRates', symbols)
      setInterval(() => {
        dispatch('getRates', symbols)
      }, 50000)
    })
  }
}
