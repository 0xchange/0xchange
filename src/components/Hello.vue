<template>
  <div class="hello">
   <!--  <v-btn @click="withdraw()">withdraw</v-btn>
    <v-btn @click="deposit()">deposit</v-btn>
    <input placeholder="Gwei" v-model="eth"> -->
    <v-layout row wrap>
      <v-flex xs12 md4>
        <v-select 
        label="Take Order"
        v-model="takerAddress"
        v-bind:items="selectTokens(true)">
        </v-select>
      </v-flex> 
      <v-flex xs12  md4 offset-md2>
        <v-select 
        label="Make Order"
        v-model="makerAddress"
        v-bind:items="selectTokens(false)">
        </v-select>
      </v-flex>
    </v-layout>


    <v-data-table
      v-bind:headers="headers"
      :items="ordersFiltered"
      class="elevation-1"
    >
      <template slot="items" scope="props">
        <td class="text-xs-right">{{ getToken(props.item.args.takerToken) }}</td>
        <td class="text-xs-right">{{ getToken(props.item.args.makerToken) }}</td>
<!--         <td class="text-xs-right">{{ shorten(props.item.args.maker) }}</td>
        <td class="text-xs-right">{{ shorten(props.item.args.taker) }}</td> -->
        <td class="text-xs-right">{{ shorten(props.item.args.feeRecipient) }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.args.makerToken, props.item.args.filledMakerTokenAmount) }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.args.makerToken, props.item.args.paidMakerFee) }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.args.takerToken, props.item.args.paidTakerFee) }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.args.takerToken, props.item.args.filledTakerTokenAmount) }}</td>
       
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from 'axios'
import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'
import BN from 'bignumber.js'
let zeroEx = null
export default {
  name: 'HelloWorld',
  data () {
    return {
      takerAddress: null,
      makerAddress: null,
      tokens: [],
      orders: [],
      paged: 0,
      limit: 3,
      eth: 0,
      exchangeResults: {},
      headers: [
        {
          text: 'takerToken',
          value: 'args.takerToken'
        },
        {
          text: 'makerToken',
          value: 'args.makerToken'
        },
        // {
        //   text: 'maker',
        //   value: 'args.maker'
        // },
        // {
        //   text: 'taker',
        //   value: 'args.taker'
        // },
        {
          text: 'feeRecipient',
          value: 'args.feeRecipient'
        },
        {
          text: 'filledMakerTokenAmount',
          value: 'args.filledMakerTokenAmount'
        },
        {
          text: 'paidMakerFee',
          value: 'args.paidMakerFee'
        },
        {
          text: 'paidTakerFee',
          value: 'args.paidTakerFee'
        },
        {
          text: 'filledTakerTokenAmount',
          value: 'args.filledTakerTokenAmount'
        }
      ]
    }
  },
  watch: {
    symbolsString () {
      this.getExchange()
    }
  },
  mounted () {
    this.connect()
  },
  computed: {
    totalPages () {
      return Math.ceil(this.ordersFiltered.length / this.limit)
    },
    ordersFiltered () {
      return this.orders.filter((con) => {
        return (this.takerAddress && !this.makerAddress && con.args.takerToken === this.takerAddress) ||
        (this.makerAddress && !this.takerAddress && con.args.makerToken === this.makerAddress) ||
        (!this.takerAddress && !this.makerAddress) ||
        (this.takerAddress && con.args.takerToken === this.takerAddress && this.makerAddress && con.args.makerToken === this.makerAddress)
      })
    },
    symbolsString () {
      return this.tokens.map((token) => token.symbol).join()
    }
  },
  methods: {
    formatDecimals (tokenAddress, amount) {
      let token = this.tokens.filter((token) => token.address === tokenAddress)
      console.log(token && parseInt(token[0].decimals))
      let foo = token.length && ZeroEx.toBaseUnitAmount(new BN(parseInt(amount)), parseInt(token[0].decimals))
      console.log(foo)
      return foo.toNumber()
    },
    selectTokens (maker = true) {
      let foo = this.tokens.map((token) => {
        return {
          text: token.name + ' (' + this.tokenQuant(token.address, maker) + ')',
          value: token.address,
          disabled: this.tokenQuant(token.address, maker) === 0
        }
      })
      foo.unshift({
        'text': 'Select Token',
        'value': null
      })
      return foo
    },
    tokenQuant (address, maker) {
      return this.ordersFiltered.filter((order) => {
        return (!maker && order.args.makerToken === address) || (maker && order.args.takerToken === address)
      }).length
    },
    shorten (str) {
      return str.slice(0, 8)
    },
    prev () {
      this.paged = this.paged === 0 ? this.paged : this.paged - 1
    },
    next () {
      this.paged += 1
    },
    getExchange () {
      axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + this.symbolsString + '&tsyms=USD,CAD').then((results) => {
        this.exchangeResults = results.data
      })
    },
    withdraw () {
      zeroEx.getAvailableAddressesAsync().then((addresses) => {
        if (addresses.length) {
          console.log(zeroEx)
          zeroEx.etherToken.withdrawAsync(new BN(1000000000000000000).mul(this.eth), addresses[0]).then((tx) => {
            console.log(tx)
          })
        }
      })
    },
    deposit () {
      zeroEx.getAvailableAddressesAsync().then((addresses) => {
        if (addresses.length) {
          console.log(zeroEx)
          zeroEx.etherToken.depositAsync(new BN(1000000000000000000).mul(this.eth), addresses[0]).then((tx) => {
            console.log(tx)
          })
        }
      })
    },
    getToken (address) {
      let t = this.tokens.find((token) => {
        return token.address === address
      })
      return t && t.name
    },
    connect () {
      console.log('con?')
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
      // 3117574 kovan
      // 4145578 mainnet
      zeroEx.exchange.getLogsAsync('LogFill', {fromBlock: 4219261, toBlock: 'latest'}, {}).then((logs) => {
        this.orders = logs
        console.log(logs)
      })
      zeroEx.tokenRegistry.getTokensAsync().then((tokens) => {
        this.tokens = tokens
      })
      console.log('weth?')
      zeroEx.exchange.getContractAddressAsync().then((address) => {
        console.log('weth:', address)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
