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
      :items="logsFiltered"
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
        <td class="text-xs-right"><v-btn @click="take(props.item)">Take</v-btn></td>
      </template>
    </v-data-table>
    <order @close="close" v-if="order" :order="order"></order>
  </div>
</template>

<script>
import Order from '@/components/Order'
import axios from 'axios'
// import ProviderEngine from 'web3-provider-engine'
// import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
// import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'
import BN from 'bignumber.js'

import { mapGetters, mapActions } from 'vuex'

export default {
  components: {Order},
  name: 'HelloWorld',
  data () {
    return {
      takerAddress: null,
      makerAddress: null,
      paged: 0,
      limit: 3,
      eth: 0,
      exchangeResults: {},
      order: null,
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
    const blahrates = this.calculateOrderRates({
      makerToken: 'ETH',
      takerToken: 'BTC',
      filledMakerTokenAmount: 100,
      filledTakerTokenAmount: 10
    })
    console.log('pls?', JSON.stringify(blahrates))
  },
  computed: {
    ...mapGetters(['logs', 'tokens', 'rates']),
    logsFiltered () {
      return this.logs.filter((con) => {
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
    ...mapActions(['connect']),
    calculateOrderRates (order) {
      const {takerToken, filledMakerTokenAmount, filledTakerTokenAmount} = order
      const ratio = filledTakerTokenAmount / filledMakerTokenAmount
      const orderRates = this.rates[takerToken]
      Object.keys(orderRates).map((key, index) => {
        orderRates[key] *= ratio
      })
      return orderRates
    },
    close () {
      this.order = null
    },
    take (order) {
      this.order = order
    },
    formatDecimals (tokenAddress, amount) {
      let token = this.tokens.filter((token) => token.address === tokenAddress)
      return token.length && ZeroEx.toBaseUnitAmount(new BN(parseInt(amount)), parseInt(token[0].decimals)).toNumber()
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
      return this.logsFiltered.filter((log) => {
        return (!maker && log.args.makerToken === address) || (maker && log.args.takerToken === address)
      }).length
    },
    shorten (str) {
      return str.slice(0, 8)
    },
    getExchange () {
      axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + this.symbolsString + '&tsyms=USD,CAD').then((results) => {
        this.exchangeResults = results.data
      })
    },
    // withdraw () {
    //   zeroEx.getAvailableAddressesAsync().then((addresses) => {
    //     if (addresses.length) {
    //       console.log(zeroEx)
    //       zeroEx.etherToken.withdrawAsync(new BN(1000000000000000000).mul(this.eth), addresses[0]).then((tx) => {
    //         console.log(tx)
    //       })
    //     }
    //   })
    // },
    // deposit () {
    //   zeroEx.getAvailableAddressesAsync().then((addresses) => {
    //     if (addresses.length) {
    //       console.log(zeroEx)
    //       zeroEx.etherToken.depositAsync(new BN(1000000000000000000).mul(this.eth), addresses[0]).then((tx) => {
    //         console.log(tx)
    //       })
    //     }
    //   })
    // },
    getToken (address) {
      let t = this.tokens.find((token) => {
        return token.address === address
      })
      return t && t.name
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
