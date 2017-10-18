<template>
  <v-app light>
    <v-navigation-drawer
      :absolute="true"
      persistent
      :clipped="true"
      :disable-route-watcher="true"
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
          :href="item.href"
          :target="item.target"
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
<!--       <v-icon large >record_voice_over</v-icon> -->
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-content>
        <notifications></notifications>
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


  </v-app>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import Notifications from '@/components/Notifications'
  export default {
    components: {Notifications},
    data () {
      return {
        drawer: false,
        title: '0xchange.me — A Free and Open 0x Relayer'
      }
    },
    mounted () {
      this.pageServer()
    },
    computed: {
      ...mapGetters(['loading']),
      network () {
        return window.location.hostname === 'kovan.0xchange.me' ? 'Kovan' : 'Mainnet'
      },
      notNetwork () {
        return this.network === 'Kovan' ? 'Mainnet' : 'Kovan'
      },
      items () {
        return [{
          icon: 'developer_board',
          title: 'About',
          href: 'https://devpost.com/software/0xchange-me',
          target: '_blank'
        }, {
          icon: 'code',
          title: 'Github Frontend',
          href: 'https://github.com/okwme/0xchange',
          target: '_blank'
        }, {
          icon: 'code',
          title: 'Github Backend',
          href: 'https://github.com/okwme/0xchange',
          target: '_blank'
        }, {
          icon: 'language',
          title: 'Switch to ' + this.notNetwork + ' Network',
          href: 'https://' + (this.network === 'Kovan' ? '' : 'kovan.') + '0xchange.me',
          target: '_self'
        }]
      }
    },
    methods: {
      ...mapActions(['pageServer'])
    }
  }

</script>

<style lang="stylus">
  @import './stylus/main'
</style>
