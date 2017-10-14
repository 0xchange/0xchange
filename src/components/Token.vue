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
  computed: {
    ...mapGetters(['tokens', 'coinList']),
    bgImage () {
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
}
</style>
