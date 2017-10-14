<template>
  <div class="relative ">
    <div class="fixed px-1">
      <v-alert 
      :key="not.id"
      @click="removeNotification(not.id)"
      transition="slide-y-transition"
      v-for="not in notifications" :color="not.type" :icon="getIcon(not.type)" value="true" v-text="not.text"></v-alert>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {

  name: 'Notifications',

  data () {
    return {

    }
  },
  computed: {
    ...mapGetters(['notifications'])
  },
  methods: {
    getIcon (type) {
      switch (type) {
        case 'success':
          return 'check_circle'
      }
    },
    ...mapActions([
      'removeNotification'
    ])
  }
}
</script>

<style lang="css" scoped>
.fixed {
  position:absolute;
  width:100%;
  z-index:2;
}
.relative {
  width:100%;
  position:relative;
}
</style>
