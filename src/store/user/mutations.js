
export function selectUser (state, name) {
  state.username = name
}

export function selectId (state, id) {
  state.userid = id
}

export function logout (state) {
  state.username = ''
  state.userid = ''
}
