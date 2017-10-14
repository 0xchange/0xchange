import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import axios from 'axios'
import { ZeroEx } from '0x.js'
import io from 'socket.io-client'
import CCC from '../socket/ccc.js'

let zeroEx = null

export default {
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
  setAddresses () {

  },
  getRates ({commit}) {
    axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + this.symbolsString + '&tsyms=USD,CAD').then((results) => {
      commit('UPDATE_RATES', results.data)
    })
  },
  openRateSocket ({commit}, symbols) {
    const subscription = []
    const priceSymbols = ['USD', 'CAD', 'BTC']
    symbols.forEach((symbol) => {
      priceSymbols.forEach((pSymbol) => {
        const str = '5~CCCAGG~' + symbol + '~' + pSymbol
        subscription.push(str)
      })
    })
    console.log(JSON.stringify(subscription))
    // var quote = {}
    /* var updateQuote = function (result) {
      var keys = Object.keys(result)
      var pair = result.FROMSYMBOL + result.TOSYMBOL
      if (!quote.hasOwnProperty(pair)) {
        quote[pair] = {}
      }
      for (var i = 0; i < keys.length; ++i) {
        quote[pair][keys[i]] = result[keys[i]]
      }
      quote[pair]['CHANGE24H'] = quote[pair]['PRICE'] - quote[pair]['OPEN24HOUR']
      quote[pair]['CHANGEPCT24H'] = quote[pair]['CHANGE24H'] / quote[pair]['OPEN24HOUR'] * 100
      // displayQuote(quote[pair])
      console.log(quote[pair])
    } */

    var socket = io.connect('https://streamer.cryptocompare.com/')

    // Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
    // Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
    // For aggregate quote updates use CCCAGG as market

    socket.emit('SubAdd', {subs: subscription})

    socket.on('m', function (message) {
      var messageType = message.substring(0, message.indexOf('~'))
      var res = {}
      console.log('msgtype,', messageType)
      if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
        res = CCC.CURRENT.unpack(message)
        if (res.PRICE) {
          console.log(JSON.stringify(res))
          commit('UPDATE_RATES', res)
        }
        // updateQuote(res)
      }
    })
  },
  connect ({dispatch, commit}) {
    // dispatch('getRates')
    // get tokens here
    dispatch('openRateSocket', ['ETH', 'BTC', 'OMG'])
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
    // Maker Token, Taker Token, Amount of maker token, amount of Taker token
    // Amount of Taker token that have been filled...
  // vTak

    zeroEx = new ZeroEx(providerEngine)
    // commit('SET_ZERO_EX', zeroEx)
    // 3117574 kovan
    // 4145578 mainnet
    zeroEx.exchange.getLogsAsync('LogFill', {fromBlock: 4219261, toBlock: 'latest'}, {}).then((logs) => {
      console.log(logs)
      commit('ADD_LOGS', logs)
    })
    zeroEx.tokenRegistry.getTokensAsync().then((tokens) => {
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
  }
}
