<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog"  max-width="500px">
      <v-card>
        <v-form lazy-validation ref="form">
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap >
                <v-flex xs5 v-if="shouldShow"  >
                  <v-text-field
                  :rules="[() => (tmpOrder.makerTokenAddress && tmpOrder.makerTokenAddress.length > 0) || 'This field is required']"
                  required  label="Maker Token Address" required v-model="tmpOrder.makerTokenAddress"></v-text-field>
                </v-flex>
                <v-flex xs5 v-if="shouldShow" offset-xs1>
                  <v-text-field
                  :rules="[() => (tmpOrder.takerTokenAddress && tmpOrder.takerTokenAddress.length > 0) || 'This field is required']"
                   required label="Taker Token Address" required v-model="tmpOrder.takerTokenAddress"></v-text-field>
                </v-flex>



                <v-flex xs5>
                  <v-text-field
                  :rules="[() => (tmpOrder.makerTokenAddress && tmpOrder.makerTokenAmount > 0) || 'Amount can\'t be 0']"
                  :readonly="!newOrder"
                  type="number" label="Make Amount" :suffix="getTokenSymbol(tmpOrder.makerTokenAddress)" required v-model="tmpOrder.makerTokenAmount"></v-text-field>
                </v-flex>

                <v-flex xs5 offset-xs1>
                  <v-text-field
                  :rules="[() => (tmpOrder.makerTokenAddress && tmpOrder.makerTokenAmount > 0) || 'Amount can\'t be 0']"
                  type="number" label="Take Amount" :suffix="getTokenSymbol(tmpOrder.takerTokenAddress)" required v-model="tmpOrder.takerTokenAmount"></v-text-field>
                </v-flex>


                <v-flex xs5>
                  <v-text-field readonly :label="getTokenSymbol(tmpOrder.makerTokenAddress) + ' Market Price (SAI)'" :suffix="getTokenSymbol(tmpOrder.makerTokenAddress)" :value="convert(tmpOrder.makerTokenAddress, tmpOrder.makerTokenAmount)"></v-text-field>
                </v-flex>

                <v-flex xs5 offset-xs1>
                  <v-text-field readonly :label="getTokenSymbol(tmpOrder.makerTokenAddress) + ' Asking Price (SAI)'" :suffix="getTokenSymbol(tmpOrder.makerTokenAddress)" :value="orderPrice(tmpOrder.makerTokenAddress, tmpOrder.makerTokenAmount, tmpOrder.takerTokenAddress, tmpOrder.takerTokenAmount)"></v-text-field>
                </v-flex>



                <v-flex xs6>
                  <v-dialog
                    v-model="dateMenu"
                    lazy
                    full-width
                  >
                    <v-text-field
                      slot="activator"
                      label="Expiration Date"
                      v-model="tmpOrder.date"
                      prepend-icon="event"
                      readonly
                    ></v-text-field>
                    <v-date-picker v-model="tmpOrder.date"  actions >
                      <template scope="{ save, cancel }">
                        <v-card-actions>
                          <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
                          <v-btn flat color="primary" @click="save">Save</v-btn>
                        </v-card-actions>
                      </template>

                    </v-date-picker>
                  </v-dialog>
                </v-flex>




                <v-flex xs6>
                  <v-dialog

                    v-model="timeMenu"
                    lazy
                    full-width
                  >
                    <v-text-field
                      slot="activator"
                      label="Expiration Time"
                      v-model="tmpOrder.time"
                      prepend-icon="access_time"
                      readonly
                    ></v-text-field>
                    <v-time-picker v-model="tmpOrder.time" actions >
                      <template scope="{ save, cancel }">
                        <v-card-actions>
                          <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
                          <v-btn flat color="primary" @click="save">Save</v-btn>
                        </v-card-actions>
                      </template>
                    </v-time-picker>
                  </v-dialog>
                </v-flex>



              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close()">Close</v-btn>
            <v-btn color="blue darken-1" flat @click.native="createOrder()">{{ newOrder ? 'Save' : 'Take'}}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>

import moment from 'moment'
import BN from 'bignumber.js'
import { ZeroEx } from '0x.js'
import {mapGetters, mapActions} from 'vuex'
import _ from 'lodash'

export default {

  name: 'Order',
  props: ['order', 'rawOrder', 'newOrder'],
  data () {
    return {
      dialog: false,
      timeMenu: false,
      dateMenu: false,
      tmpOrder: {
        maker: null,
        taker: null,
        feeRecipient: null,
        makerTokenAddress: null,
        takerTokenAddress: null,
        exchangeContractAddress: null,
        salt: ZeroEx.generatePseudoRandomSalt(),
        makerFee: null,
        takerFee: null,
        makerTokenAmount: null,
        takerTokenAmount: null,
        time: null,
        date: null,
        expirationUnixTimestampSec: null
      }
    }
  },
  watch: {
    order () {
      if (this.order) {
        this.dialog = true
        this.setOrder()
      } else {
        this.dialog = false
      }
    },
    dialog () {
      if (!this.dialog) this.close()
    }
  },
  computed: {
    ...mapGetters(['address', 'tokens', 'conversion', 'rates']),
    shouldShow () {
      return this.order && (!this.order.makerTokenAddress || !this.order.takerTokenAddress)
    },
    orderKeys () {
      return Object.keys(this.tmpOrder)
    }
  },
  mounted () {
    this.setOrder()
  },
  methods: {
    ...mapActions(['submitOrder', 'fillOrder']),
    convert (address, amount) {
      const allRates = this.rates[this.getTokenSymbol(address)]
      if (!allRates || !allRates['USD']) return 0
      else return allRates['USD'].toFixed(3)
    },
    orderPrice (makerTokenAddress, makerTokenAmount, takerTokenAddress, takerTokenAmount) {
      const takerTokenSymbol = this.getTokenSymbol(takerTokenAddress)
      const ratio = takerTokenAmount / makerTokenAmount

      // console.log(this.rates)
      const takerOrderRates = this.rates[takerTokenSymbol]
      if (!takerOrderRates) return 0
      const makerOrderRates = _.mapValues(takerOrderRates, (rate) => { return rate * ratio })
      if (!makerOrderRates || !makerOrderRates['USD']) return 0
      return (makerOrderRates && makerOrderRates['USD'].toFixed(3)) || 0
    },
    getTokenSymbol (tokenAddress) {
      let t = this.tokens.find((token) => token.address === tokenAddress)
      return (t && t.symbol) || ''
    },
    createOrder () {
      if (this.$refs.form.validate()) {
        let raw = JSON.parse(JSON.stringify(this.tmpOrder))
        console.log(raw.date)
        console.log(raw.time)
        console.log(moment(raw.date + ' ' + raw.time, 'YYYY-MM-DD HH:mz').format('X'))
        raw.expirationUnixTimestampSec = new BN(moment(raw.date + ' ' + raw.time, 'YYYY-MM-DD HH:mz').format('X'))
        console.log(raw.expirationUnixTimestampSec)
        raw.makerTokenAddress = raw.makerTokenAddress
        raw.takerTokenAddress = raw.takerTokenAddress
        raw.makerFee = new BN(raw.makerFee)
        raw.takerFee = new BN(raw.takerFee)
        raw.makerTokenAmount = new BN(raw.makerTokenAmount)
        raw.takerTokenAmount = new BN(raw.takerTokenAmount)
        if (!this.newOrder) {
          raw.expirationUnixTimestampSec = new BN(this.order.expirationUnixTimestampSec)
          raw.salt = new BN(this.order.salt)
          raw.ecSignature = this.order.ecSignature
          raw.makerFee = new BN(this.order.makerFee)
          raw.takerFee = new BN(this.order.takerFee)
          raw.makerTokenAmount = new BN(this.order.makerTokenAmount)
          raw.takerTokenAmount = new BN(this.order.takerTokenAmount)

          raw.takerAddress = this.address

          console.log(raw)
          console.log(this.order)
          console.log(this.tmpOrder)
          this.fillOrder({order: raw, amount: raw.takerTokenAmount}).then(() => {
            this.close()
          })
        } else {
          this.submitOrder(raw).then(() => {
            this.close()
          })
        }
      }
    },
    close () {
      this.$emit('close')
    },
    setOrder () {
      if (!this.order) return
      this.tmpOrder.makerTokenAddress = this.order.makerTokenAddress
      this.tmpOrder.makerTokenAmount = this.order.makerTokenAmount
      this.tmpOrder.takerTokenAmount = this.order.takerTokenAmount
      this.tmpOrder.exchangeContractAddress = this.$store.state.EXCHANGE_ADDRESS

      if (this.newOrder) {
        this.$refs.form.reset()
        this.tmpOrder.maker = this.address
        this.tmpOrder.taker = this.$store.state.NULL_ADDRESS
        this.tmpOrder.feeRecipient = this.$store.state.NULL_ADDRESS

        this.tmpOrder.takerTokenAddress = this.order.takerTokenAddress
        this.tmpOrder.salt = ZeroEx.generatePseudoRandomSalt()
        this.tmpOrder.makerFee = 0
        this.tmpOrder.takerFee = 0
        // moment(this.tmpOrder.date + ' ' + this.tmpOrder.time, 'YYYY-MM-DD HH:mz')
        this.tmpOrder.time = moment().add(1, 'hours').format('HH:mz')
        this.tmpOrder.date = moment().add(1, 'days').format('YYYY-MM-DD')
      } else {
        this.tmpOrder.maker = this.order.maker
        this.tmpOrder.taker = this.order.taker
        this.tmpOrder.feeRecipient = this.order.feeRecipient
        this.tmpOrder.takerTokenAddress = this.address
        this.tmpOrder.salt = this.order.salt
        this.tmpOrder.makerFee = this.order.makerFee
        this.tmpOrder.takerFee = this.order.takerFee

        this.tmpOrder.time = moment(this.order.expirationUnixTimestampSec, 'X').format('HH:mz')
        this.tmpOrder.date = moment(this.order.expirationUnixTimestampSec, 'X').format('YYYY-MM-DD')
      }

      // ##/##/#### ##:##
    }
  }
}
</script>

<style lang="css" scoped>
</style>
