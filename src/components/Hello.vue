<template>
  <div class="hello">
<!--     <v-btn @click="withdraw(eth)">withdraw</v-btn>
    <v-btn @click="deposit(eth)">deposit</v-btn>
    <input placeholder="Gwei" v-model="eth"> -->
    <v-layout row wrap>
      <v-flex xs12 md4>
        <v-select
        clearable
        :editable="false"
        @click="isEmpty()"
        autocomplete
        label="Make Order"
        v-model="makerAddress"
        :search-input.sync="searchMakerAddress"
        v-bind:items="selectTokens(false)">
          <template slot="no-data">
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
          </template>
        </v-select>
      </v-flex>
      <v-flex xs12 md4  offset-md4>
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
      <v-flex xs12 md4 offset-md1>
       <token :token="getTokenSymbol(makerAddress)"></token>
      </v-flex>


      <v-flex xs12 md2 class='text-xs-center mt-5'>
        <v-btn @click="makeOrder()">Make Order</v-btn>
        <v-btn @click="makeRawOrder()">Add Raw Order</v-btn>
      </v-flex>


      <v-flex xs12  md4 >
        <token :token="getTokenSymbol(takerAddress)"></token>
      </v-flex>
    </v-layout>


    <v-layout row wrap class="xs-align-center">
    </v-layout>

    <v-data-table
      :total-items="totalItems"
      :pagination.sync="pagination"
      v-bind:headers="headers"
      :items="orders"
      class="elevation-1"
    >
      <template slot="items" scope="props">
      <!-- :class="goodPrice(props.item.args)" -->
        <td class="text-xs-right">{{ calculateOrderRates(props.item) }}</td>
        <td class="text-xs-right">{{ getTokenSymbol(props.item.makertokenaddress) }}</td>
        <td class="text-xs-right">{{ shorten(props.item.makerfee) }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.makertokenaddress, props.item.makertokenamount) }}</td>
        <td class="text-xs-right">{{ getTokenSymbol(props.item.takertokenaddress) }}</td>
        <td class="text-xs-right">{{ shorten(props.item.takerfee) }}</td>
        <td class="text-xs-right">{{ formatDecimals(props.item.takertokenaddress, props.item.takertokenamount) }}</td>
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
      pagination: { sortBy: 'makerfee', page: 1, rowsPerPage: 10, descending: false, totalItems: 0 },
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
          text: 'price ($SAI)',
          value: 'args.price'
        },
        {
          text: 'makertokenaddress',
          value: 'makertokenaddress'
        },
        {
          text: 'makerfee',
          value: 'makerfee'
        },
        {
          text: 'makertokenamount',
          value: 'makertokenamount'
        },
        {
          text: 'takertokenaddress',
          value: 'takertokenaddress'
        },
        {
          text: 'takerfee',
          value: 'takerfee'
        },
        {
          text: 'takertokenamount',
          value: 'takertokenamount'
        }
      ]
    }
  },
  watch: {
    symbolsString () {
      this.getExchange()
    },
    pagination: {
      handler () {
        this.setPagination(this.pagination)
        this.pageServer(this.pagination)
      },
      deep: true
    }
  },
  mounted () {
    this.connect()
  },
  computed: {
    ...mapGetters(['logs', 'tokens', 'totalItems', 'orders', 'rates', 'addressList']),
    logsFiltered () {
      return this.logs.filter((con) => {
        return (this.takerAddress && !this.makerAddress && con.takertokenaddress === this.takerAddress) ||
        (this.makerAddress && !this.takerAddress && con.makertokenaddress === this.makerAddress) ||
        (!this.takerAddress && !this.makerAddress) ||
        (this.takerAddress && con.takertokenaddress === this.takerAddress && this.makerAddress && con.makertokenaddress === this.makerAddress)
      })
    }
  },
  methods: {
    goodPrice (order) {
      let ourPrice = this.calculateOrderRates(order)
      let theirPrice = this.rates[this.getTokenSymbol(order.takerToken)]
      return {
        goodPrice: ourPrice < theirPrice,
        badPrice: ourPrice > theirPrice
      }
    },
    ...mapActions(['connect', 'withdraw', 'deposit', 'pageServer', 'setPagination', 'addTokenAddress']),
    checkBeforeAdding (address) {
      this.addTokenAddress(address)
      // alert(address)
      // Perform your AJAX call to backend here :D
    },
    isEmpty () {
      console.log('isEmpty')
    },
    calculateOrderRates (order) {
      console.log('order!', order)
      const {makerTokenAddress, takerTokenAddress, makerTokenAmount, takerTokenAmount} = order
      const makerTokenSymbol = this.getTokenSymbol(makerTokenAddress)
      const takerTokenSymbol = this.getTokenSymbol(takerTokenAddress)
      const ratio = takerTokenAmount.toNumber() / makerTokenAmount.toNumber()
      console.log('ratio: ' + ratio)
      console.log('takerToken', takerTokenSymbol)
      console.log('toksymbol', makerTokenSymbol)
      // console.log(this.rates)
      const takerOrderRates = this.rates[takerTokenSymbol]
      if (!takerOrderRates) return ''
      const makerOrderRates = _.mapValues(takerOrderRates, (rate) => { return rate * ratio })
      return makerOrderRates[this.desiredCurrency]
    },
    ...mapActions(['connect', 'withdraw', 'deposit']),
    close () {
      console.log('close')
      this.order = null
      this.rawOrder = null
    },
    makeOrder () {
      this.newOrder = true
      this.order = {
        args: {
          makerToken: this.makerAddress,
          takerToken: this.takerAddress
        }
      }
    },
    makeRawOrder () {
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
        let quant = this.tokenQuant(token.address, maker)
        return {
          text: token.name + ' - ' + token.symbol + ' (' + quant + ')',
          quant,
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
    tokenQuant (address, maker) {
      return this.logsFiltered.filter((log) => {
        return (!maker && log.makertokenaddress === address) || (maker && log.takertokenaddress === address)
      }).length
    },
    shorten (str) {
      return str.slice(0, 8)
    },
    getToken (address) {
      let t = this.tokens.find((token) => {
        return token.address === address
      })
      return t && t.name
    },
    getTokenSymbol (address) {
      // let t = this.tokens.find((token) => {
      //   return token.address === address
      // })
      // if (!t) return ''
      // const symbol = (t.symbol === 'WETH') ? 'ETH' : t.symbol
      // return t && symbol
      console.log('addresslistpls', this.addressList)
      if (!this.addressList[address]) {
        console.log('why did this not work?', address)
        return ''
      }
      const tempSymbol = this.addressList[address].symbol
      return (tempSymbol === 'WETH') ? 'ETH' : tempSymbol
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
