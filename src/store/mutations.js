export default {
  LOADING (state, val) {
    state.loading = val
  },
  ADD_MSG (state, msg) {
    state.notifications.push(msg)
  },
  REMOVE_MSG (state, id) {
    let key = state.notifications.findIndex((msg) => msg.id === id)
    if (key > -1) {
      state.notifications.splice(key, 1)
    }
  }
}
