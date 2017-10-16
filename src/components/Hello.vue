<template>
  <div class="hello">
<!--     <v-btn @click="withdraw(eth)">withdraw</v-btn>
    <v-btn @click="deposit(eth)">deposit</v-btn>
    <input placeholder="Gwei" v-model="eth"> -->
    <v-layout row wrap>
      <v-flex xs12 sm4>
        <v-select
        clearable
        :editable="false"
        @click="isEmpty()"
        autocomplete
        label="Make Order"
        v-model="makerAddress"
        :search-input.sync="searchMakerAddress"
        v-bind:items="selectTokens(false)">
          <!-- <template slot="no-data">
            <v-layout>
              <v-flex>
                <v-btn
                 block
                 flat
                 color="success"
                 @click="checkBeforeAdding(searchMakerAddress)">
                  Add Token Address {{ searchMakerAddress }}
                </v-btn>
              </v-flex>
            </v-layout>
          </template> -->
        </v-select>
      </v-flex>
      <v-flex xs12 sm4  offset-sm4>
        <v-select
        clearable
        :editable="false"
        @click="isEmpty()"
        autocomplete
        label="Take Order"
        v-model="takerAddress"
        v-bind:items="selectTokens(true)">
        </v-select>
      </v-flex>
    </v-layout>


    <v-layout row wrap>
      <v-flex xs12 sm4 offset-sm1>
        <token :token="makerAddress"></token>
      </v-flex>


      <v-flex xs12 sm2 class='text-xs-center mt-5'>
        <v-btn @click="makeOrder()">Make Order</v-btn>
        <v-btn @click="makeToken()">Add New Token</v-btn>
      </v-flex>


      <v-flex xs12  sm4 >
        <token :token="takerAddress"></token>
      </v-flex>
    </v-layout>


    <v-layout row wrap class="xs-align-center">
    </v-layout>

    <v-data-table
      v-bind:headers="headers"
      :items="orders"
      class="elevation-1"
    >
      <template slot="items" scope="props">
      <!-- :class="goodPrice(props.item.args)" -->
        <td class="text-xs-right">{{ getMarketRate(props.item.makerTokenAddress) || 'N/A' }}</td>
        <td :class="goodPrice(getMarketRate(props.item.makerTokenAddress), calculateOrderRates(props.item))" class="flare text-xs-right">{{ calculateOrderRates(props.item) || 'N/A' }}</td>
        <td class="text-xs-right">{{ getTokenSymbol(props.item.makerTokenAddress) }}</td>
        <td class="text-xs-right">{{ shorten(props.item.makerFee) || 0 }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.makerTokenAddress, props.item.makerTokenAmount) }}</td>


        <td class="text-xs-right">{{ getTokenSymbol(props.item.takerTokenAddress) }}</td>
        <td class="text-xs-right">{{ shorten(props.item.takerFee) || 0 }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.takerTokenAddress, props.item.takerTokenAmount) }}</td>
        <td class="text-xs-right"><v-btn @click.native.stop="take(props.item)">Take</v-btn></td>
      </template>
    </v-data-table>
    <order v-on:close="close()" :new-order="newOrder" :order="order"></order>
    <raw-order v-on:close="close()" :raw-order="rawOrder"></raw-order>
  </div>
</template>

<script>
import Token from '@/components/Token'
import RawOrder from '@/components/RawOrder'
import Order from '@/components/Order'
import _ from 'lodash'
// import axios from 'axios'

// import { ZeroEx } from '0x.js'
// import BN from 'bignumber.js'

import { mapGetters, mapActions } from 'vuex'

export default {
  components: {RawOrder, Order, Token},
  name: 'HelloWorld',
  data () {
    return {
      desiredCurrency: 'USD',
      pagination: { sortBy: 'makerFee', page: 1, rowsPerPage: 5, descending: false, totalItems: 0 },
      takerAddress: null,
      makerAddress: null,
      searchTakerAddress: null,
      searchMakerAddress: null,
      eth: 0,
      exchangeResults: {},
      newOrder: false,
      rawOrder: null,
      order: null,
      headers: [
        {
          text: 'Market Price (SAI)',
          value: 'marketPrice'
        },
        {
          text: 'Asking Price (SAI)',
          value: 'askingPrice'
        },
        {
          text: 'Maker Token',
          value: 'makerTokenAddress'
        },
        {
          text: 'Maker Fee',
          value: 'makerFee'
        },
        {
          text: 'Maker Amount',
          value: 'makerTokenAmount'
        },
        {
          text: 'Taker Token',
          value: 'takerTokenAddress'
        },
        {
          text: 'Taker Fee',
          value: 'takerFee'
        },
        {
          text: 'Taker Amount',
          value: 'takerTokenAmount'
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
    ...mapGetters(['tokens', 'totalItems', 'orders', 'rates', 'addressList', 'coinList'])
    // logsFiltered () {
    //   return this.logs.filter((con) => {
    //     return (this.takerAddress && !this.makerAddress && con.takerTokenAddress === this.takerAddress) ||
    //     (this.makerAddress && !this.takerAddress && con.makerTokenAddress === this.makerAddress) ||
    //     (!this.takerAddress && !this.makerAddress) ||
    //     (this.takerAddress && con.takerTokenAddress === this.takerAddress && this.makerAddress && con.makerTokenAddress === this.makerAddress)
    //   })
    // },
  },
  methods: {
    flare (order) {
      return {
        'background-color': '#' + (Math.random() * 0xFFFFFF << 0).toString(16)
      }
    },
    goodPrice (one, two) {
      return {
        goodPrice: parseFloat(one) > parseFloat(two),
        badPrice: !(parseFloat(one) > parseFloat(two)) && parseFloat(two)
      }
    },
    ...mapActions(['connect', 'withdraw', 'deposit', 'pageServer', 'setPagination', 'addTokenAddress']),
    checkBeforeAdding (address) {
      this.addTokenAddress(address)
      // alert(address)
      // Perform your AJAX call to backend here :D
    },
    calculateOrderRates (order) {
      const {takerTokenAddress, makerTokenAmount, takerTokenAmount} = order
      // const makerTokenSymbol = this.getTokenSymbol(makerTokenAddress)
      const takerTokenSymbol = this.getTokenSymbol(takerTokenAddress)
      const ratio = takerTokenAmount / makerTokenAmount

      // console.log(this.rates)
      const takerOrderRates = this.rates[takerTokenSymbol]
      if (!takerOrderRates) return ''
      const makerOrderRates = _.mapValues(takerOrderRates, (rate) => { return rate * ratio })
      return (makerOrderRates && makerOrderRates[this.desiredCurrency].toFixed(3)) || ''
    },
    getMarketRate (address) {
      const symbol = this.getTokenSymbol(address)
      const marketRates = this.rates[symbol]
      return (marketRates && marketRates[this.desiredCurrency].toFixed(3)) || ''
    },
    close () {
      this.order = null
      this.rawOrder = false
    },
    makeOrder () {
      this.newOrder = true
      this.order = {
        makerTokenAddress: this.makerAddress,
        takerTokenAddress: this.takerAddress
      }
    },
    makeToken () {
      this.rawOrder = true
    },
    take (order, e) {
      this.newOrder = false
      this.order = order
    },
    formatDecimals (tokenAddress, amount) {
      // let token = this.tokens.filter((token) => token.address === tokenAddress)
      return amount
      // return token.length && ZeroEx.toBaseUnitAmount(new BN(parseInt(amount)), parseInt(token[0].decimals)).toNumber()
    },
    selectTokens (maker = true) {
      let foo = this.tokens.map((token) => {
        return {
          text: token.name + ' - ' + token.symbol,
          value: token.address
          // disabled: this.tokenQuant(token.address, maker) === 0
        }
      })
      foo = foo.sort((a, b) => {
        // return b.quant === a.quant ? b.toUpperCase().name - a.toUpperCase().name : b.quant - a.quant
        // console.log(b.name > a.name)
        return a.text && a.text.localeCompare(b.text)
      })
      // foo.unshift({
      //   'text': 'Select Token',
      //   'value': null
      // })
      return foo
    },
    shorten (str) {
      return str.length > 8 && str.slice(0, 8)
    },
    getToken (address) {
      let t = this.tokens.find((token) => {
        return token.address === address
      })
      return t && t.name
    },
    getTokenSymbol (address) {
      let t = this.coinList.find((token) => {
        // console.log(address, token.address)
        return token.address.toLowerCase() === address.toLowerCase()
      })
      if (!t) return ''
      const symbol = (t.symbol === 'WETH') ? 'ETH' : t.symbol
      return symbol || ''
      // console.log('addresslistpls', this.addressList)
      // if (!this.addressList[address]) {
      //   console.log('why did this not work?', address)
      //   return ''
      // }
      // const tempSymbol = this.addressList[address].symbol
      // return (tempSymbol === 'WETH') ? 'ETH' : tempSymbol
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
.goodPrice {
  color: green;
}
.badPrice {
  color: red;
}
</style>
