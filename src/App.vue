<template>
  <v-app light>
    <v-navigation-drawer
      persistent
      :disable-route-watcher="true"
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-tile-action>
            <v-icon light v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app >
      <v-toolbar-side-icon @click.stop="drawer = !drawer" light></v-toolbar-side-icon>
      
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid>
          <v-slide-y-transition mode="out-in">
            <v-layout column align-center>
              <v-flex xs12>
                <router-view ></router-view>
              </v-flex>
            </v-layout>
          </v-slide-y-transition>
        </v-container>
      </v-content>
      <v-progress-circular 
      style="position:fixed; top:10px; bottom:10px;" 
      indeterminate color="primary" v-if="loading"></v-progress-circular>
    </main>
   
      <notifications></notifications>


    <v-footer app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Notifications from '@/components/Notifications'
  export default {
    components: {Notifications},
    data () {
      return {
        drawer: false,
        items: [{
          icon: 'bubble_chart',
          title: 'Home',
          href: '/'
        }],
        title: '0xchange'
      }
    },
    computed: {
      ...mapGetters(['loading'])
    }
  }

</script>

<style lang="stylus">
  @import './stylus/main'
</style>
