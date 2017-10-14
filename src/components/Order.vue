<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog"  max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">User Profile</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>

              <v-flex xs5>
                <v-text-field type="number" label="Make Amount" :suffix="getTokenSymbol(tmpOrder.makerTokenAddress)" required v-model="tmpOrder.makerTokenAmount"></v-text-field>
              </v-flex>

              <v-flex xs5 offset-xs1>
                <v-text-field  type="number" label="Take Amount" :suffix="getTokenSymbol(tmpOrder.takerTokenAddress)" required v-model="tmpOrder.takerTokenAmount"></v-text-field>
              </v-flex>

              <v-flex xs5>
                <v-text-field readonly :label="'Make Amount in ' + getTokenSymbol(conversion)" :suffix="getTokenSymbol(conversion)" required :value="convert(tmpOrder.makerTokenAddress, tmpOrder.makerTokenAmount)"></v-text-field>
              </v-flex>

              <v-flex xs5 offset-xs1>
                <v-text-field readonly :label="'Make Amount in ' + getTokenSymbol(conversion)" :suffix="getTokenSymbol(conversion)" required :value="convert(tmpOrder.takerTokenAddress, tmpOrder.takerTokenAmount)"></v-text-field>
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
          <v-btn color="blue darken-1" flat @click.native="createOrder()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>

import moment from 'moment'
import BN from 'bignumber.js'
import { ZeroEx } from '0x.js'
import {mapGetters, mapActions} from 'vuex'
export default {

  name: 'Order',
  props: ['order'],
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
      console.log('dialog changed')
      if (!this.dialog) this.close()
    }
  },
  computed: {
    ...mapGetters(['address', 'tokens', 'conversion']),
    orderKeys () {
      return Object.keys(this.tmpOrder)
    }
  },
  mounted () {
    this.setOrder()
  },
  methods: {
    ...mapActions(['submitOrder']),
    convert (address, amount) {
      return amount / 2
    },
    getTokenSymbol (tokenAddress) {
      let t = this.tokens.find((token) => token.address === tokenAddress)
      return (t && t.symbol) || ''
    },
    createOrder () {
      this.tmpOrder.expirationUnixTimestampSec = new BN(moment(this.tmpOrder.date + ' ' + this.tmpOrder.time, 'YYYY-MM-DD HH:mz').format('X'))
      this.tmpOrder.makerFee = new BN(this.tmpOrder.makerFee)
      this.tmpOrder.takerFee = new BN(this.tmpOrder.takerFee)
      this.tmpOrder.makerTokenAmount = new BN(this.tmpOrder.makerTokenAmount)
      this.tmpOrder.takerTokenAmount = new BN(this.tmpOrder.takerTokenAmount)
      this.submitOrder(this.tmpOrder)
    },
    close () {
      this.$emit('close')
    },
    setOrder () {
      if (!this.order) return
      this.tmpOrder.maker = this.address
      this.tmpOrder.taker = this.$store.state.NULL_ADDRESS
      this.tmpOrder.feeRecipient = this.$store.state.NULL_ADDRESS
      this.tmpOrder.makerTokenAddress = this.order.args.makerToken
      this.tmpOrder.takerTokenAddress = this.order.args.takerToken
      this.tmpOrder.exchangeContractAddress = this.$store.state.EXCHANGE_ADDRESS
      this.tmpOrder.salt = ZeroEx.generatePseudoRandomSalt()
      this.tmpOrder.makerFee = 0
      this.tmpOrder.takerFee = 0
      this.tmpOrder.makerTokenAmount = 0
      this.tmpOrder.takerTokenAmount = 0
      // moment(this.tmpOrder.date + ' ' + this.tmpOrder.time, 'YYYY-MM-DD HH:mz')
      this.tmpOrder.time = moment().add(1, 'hours').format('HH:mz')
      this.tmpOrder.date = moment().add(1, 'days').format('YYYY-MM-DD')
      // ##/##/#### ##:##
    }
  }
}
</script>

<style lang="css" scoped>
</style>
