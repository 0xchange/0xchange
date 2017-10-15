<template> <v-layout row justify-center>
    <v-dialog v-model="dialog"  max-width="500px">
      <v-card>
        <v-form lazy-validation ref="form">
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap >

                <v-flex xs12  >
                  <v-text-field 
                  :rules="[() => (name && name.length > 0) || 'This field is required']"
                  required  label="Name" required v-model="name">
                  </v-text-field>
                </v-flex>                
                <v-flex xs12  >
                  <v-text-field 
                  :rules="[() => (symbol && symbol.length > 0) || 'This field is required']"
                  required  label="Symbol" required v-model="symbol">
                  </v-text-field>
                </v-flex>                
                <v-flex xs12  >
                  <v-text-field 
                  :rules="[() => (address && address.length > 0) || 'This field is required']"
                  required  label="Address" required v-model="address">
                  </v-text-field>
                </v-flex>                
                <v-flex xs12  >
                  <v-text-field 
                  :rules="[() => (decimals && decimals.length > 0) || 'This field is required']"
                  required 
                  default="0"
                  type="number"
                   label="Decimals" required v-model="decimals">
                  </v-text-field>
                </v-flex>

              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close()">Close</v-btn>
            <v-btn color="blue darken-1" flat @click.native="createOrder()">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
export default {

  name: 'RawOrder',
  props: ['rawOrder'],
  data () {
    return {
      raw: null,
      dialog: false,
      address: null,
      name: null,
      symbol: null,
      decimals: null
    }
  },
  watch: {
    rawOrder () {
      if (this.rawOrder) {
        this.dialog = true
        this.raw = ''
        this.$refs.form.reset()
      } else {
        this.dialog = false
      }
    },
    dialog () {
      if (!this.dialog) this.close()
    }
  },
  methods: {
    ...mapActions(['submitToken']),
    close () {
      this.$emit('close')
    },
    createOrder () {
      if (this.$refs.form.validate()) {
        this.submitToken({
          decimals: this.decimals,
          address: this.address,
          name: this.name,
          symbol: this.symbol
        }).then(() => {
          this.close()
        })
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
