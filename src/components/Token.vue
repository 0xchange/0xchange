<template>
  <div class="token my-2 mx-auto" :style="bgImage">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {

  name: 'Token',
  props: ['token'],
  data () {
    return {

    }
  },
  methods: {
    random () {
      return Math.floor(Math.random() * 7) + 1
    },
    getSymbol (tokenAddress) {
      let token = this.tokens.find((token) => {
        return token.address === tokenAddress
      })
      return token && token.symbol
    }
  },
  computed: {
    ...mapGetters(['tokens', 'addressList', 'cryptoList']),
    bgImage () {
      let symbol = this.getSymbol(this.token)
      let url = !this.token || !symbol || !this.cryptoList[symbol] ? '/static/emoji_' + this.random() + '.png' : '//cryptocompare.com/' + this.cryptoList[symbol].ImageUrl
      return 'background-image: url("' + url + '")'
    }
  }
}
</script>

<style lang="css" scoped>
.token {
  width:200px;
  height:200px;
  border:1px solid black;
  border-radius: 100%;
  margin-left: auto;
  margin-right: auto;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
