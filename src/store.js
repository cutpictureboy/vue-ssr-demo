import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export function createStore () {
  return new Vuex.Store({
    state: {
      items: {}
    },
    mutations: {
      setItem (state, { id }) {
        Vue.set(state.items, 'id', id)
      }
    },
    actions: {
      fetchItem ({ commit }, id) {
        return Promise.resolve().then(() => {
          commit('setItem', { id: 'huangcheng' })
        })
      }
    }
  })
}
