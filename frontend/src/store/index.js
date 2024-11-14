import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    pageLoaded: false, // Initial state for pageLoaded
  },
  mutations: {
    setPageLoaded(state, value) {
      state.pageLoaded = value;
    }
  },
  actions: {
    updatePageLoaded({ commit }, value) {
      commit('setPageLoaded', value);
    }
  },
  getters: {
    isPageLoaded: (state) => state.pageLoaded
  },
});

export default store;