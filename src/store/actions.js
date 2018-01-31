import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import axios from 'axios'
// import jsonpAdapter from 'axios-jsonp'
import BN from 'bignumber.js'
import _ from 'lodash'
import { ZeroEx } from '0x.js'

let zeroEx = null

// option for prices
// const priceSymbols = ['USD', 'CAD', 'BTC']
// let abi = require('../assets/contracts/Exchange.json')
// const abiDecoder = require('abi-decoder')
// var Web3EthAbi = require('web3-eth-abi')

let hostname = window.location.hostname
let suffix = hostname === 'kovan.0xchange.me' ? '/kovan' : ''
console.log(suffix)
axios.defaults.baseURL = '//api.0xchange.me' + suffix

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
  getRates ({commit, dispatch, getters}) {
    for (let i = 0; i < 500; i += 100) {
      const query = 'https://api.coinmarketcap.com/v1/ticker/?convert=CAD&start=' + i
      // console.log(testString)
      axios.get(query).then((results) => {
        console.log(results)
        const mappedResults = _.map(results.data, (result) => {
          return {
            from: result.symbol,
            to: 'USD',
            price: parseFloat(result.price_usd)
          }
        })
        // console.log('THE RATES HAVE BEEN UPDATED', mappedResults)
        commit('UPDATE_RATES', mappedResults)
      })
    }
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
    zeroEx._web3Wrapper.web3.version.getNetwork((error, response) => {
      if (error) console.error(error)
      if (parseInt(response) === 42 && window.location.hostname !== 'kovan.0xchange.me') {
        window.location.href = 'https://kovan.0xchange.me'
      } else if (parseInt(response) === 1 && window.location.hostname === 'kovan.0xchange.me') {
        window.location.href = 'https://0xchange.me'
      }
    })
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
      const mappedData = results.data.map((coin) => {
        const newCoin = coin
        newCoin.address = newCoin.address.toLowerCase()
        return newCoin
      })
      commit('ADD_COINLIST', mappedData)
      dispatch('getRates')
      setInterval(() => {
        dispatch('getRates')
      }, 300000)
    })
  }
}
