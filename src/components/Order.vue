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
              <v-flex xs12 v-for="orderKey in orderKeys">
                <v-text-field :label="orderKey" required v-model="tmpOrder[orderKey]"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="close()">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="close()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import BN from 'bignumber.js'
import { ZeroEx } from '0x.js'
import {mapGetters} from 'vuex'
export default {

  name: 'Order',
  props: ['order'],
  data () {
    return {
      dialog: false,
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
    ...mapGetters(['address']),
    orderKeys () {
      return Object.keys(this.tmpOrder)
    }
  },
  mounted () {
    this.setOrder()
  },
  methods: {
    close () {
      this.$emit('close')
    },
    setOrder () {
      if (!this.order) return
      this.tmpOrder.maker = this.order.args.maker
      this.tmpOrder.taker = this.address
      this.tmpOrder.feeRecipient = this.order.args.feeRecipient
      this.tmpOrder.makerTokenAddress = this.order.args.makerToken
      this.tmpOrder.takerTokenAddress = this.order.args.takerToken
      this.tmpOrder.exchangeContractAddress = this.order.address
      this.tmpOrder.salt = null // ZeroEx.generatePseudoRandomSalt()
      this.tmpOrder.makerFee = new BN(this.order.args.paidMakerFee)
      this.tmpOrder.takerFee = new BN(this.order.args.paidTakerFee)
      this.tmpOrder.makerTokenAmount = new BN(this.order.args.filledMakerTokenAmount)
      this.tmpOrder.takerTokenAmount = new BN(this.order.args.filledTakerTokenAmount)
      this.tmpOrder.expirationUnixTimestampSec = null
    }
  }
}
</script>

<style lang="css" scoped>
</style>
