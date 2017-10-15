<template> <v-layout row justify-center>
    <v-dialog v-model="dialog"  max-width="500px">
      <v-card>
        <v-form lazy-validation ref="form">
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap >

                <v-flex xs12  >
                  <v-text-field 
                  textarea
                  :rules="[() => (raw && raw.length > 0) || 'This field is required']"
                  required  label="Raw Signed Transaction" required v-model="raw">
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
      dialog: false,
      raw: ''
    }
  },
  watch: {
    rawOrder () {
      if (this.rawOrder) {
        this.dialog = true
        this.raw = ''
      } else {
        this.dialog = false
      }
    },
    dialog () {
      console.log('dialog changed')
      if (!this.dialog) this.close()
    }
  },
  methods: {
    ...mapActions(['submitOrder']),
    close () {
      this.$emit('close')
    },
    createOrder () {
      if (this.$refs.form.validate()) {
        this.submitOrder(this.raw).then(() => {
          this.close()
        })
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
