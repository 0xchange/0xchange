import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import axios from 'axios'
// import jsonpAdapter from 'axios-jsonp'
import BN from 'bignumber.js'
import { ZeroEx } from '0x.js'

let zeroEx = null

let abi = require('../assets/contracts/Exchange.json')
const abiDecoder = require('abi-decoder')

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
  connect ({dispatch, commit}) {
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
      console.log(logs[0])
      let data = logs[0].data
      abiDecoder.addABI(abi.abi)
      // const testData = "0x53d9d9100000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114de5000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114daa";
      const decodedData = abiDecoder.decodeMethod(data)
      console.log(decodedData)
      // zeroEx._web3Wrapper.web3.eth.getTransaction(tx, (result) => {
      //   console.log(result)
      // })
    })
    zeroEx.tokenRegistry.getTokensAsync().then((tokens) => {
      console.log('tokens returned')
      commit('ADD_TOKENS', tokens)
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
    axios.get('http://138.197.172.238/get').then((results) => {
      console.log(results)
      commit('ADD_ORDERS', results.data)
    }).catch((error) => {
      console.error(error)
    })
  }
}
