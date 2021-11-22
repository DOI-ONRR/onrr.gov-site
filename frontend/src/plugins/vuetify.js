import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

// https://vuetifyjs.com/en/features/theme
export default new Vuetify({
  theme:  {
    themes: {
      dark: {
        primary: '#121212',
        secondary: '#19642a9',
        anchor: '#0076a3',
      },
      light: {
        primary: {
          base: '#1a227e',
          lighten9: '#e8eaf5',
          lighten8: '#c5c9e8',
          lighten7: '#9ea7d8',
          lighten6: '#7885c8',
          lighten5: '#5b6abc',
          lighten4: '#3f50b1',
          lighten3: '#3948a7',
          lighten2: '#303e9b',
          lighten1: '#28348f',
          darken1: '#000051',
        },
        secondary: {
          base: '#0076a3',
          lighten8: '#e1f4f9',
          lighten7: '#b3e4f0',
          lighten6: '#83d2e7',
          lighten5: '#57c0de',
          lighten4: '#38b3da',
          lighten3: '#19a6d6',
          lighten2: '#0f98c9',
          lighten1: '#0086b6',
          darken1: '#005682',
        },
        anchor: '#0076a3',
        accent: '#534aae',
        green: {
          base: '#097d4d',
          lighten1: '#4aad79',
          darken1: '#005024',
        },
        purple: {
          base: '#650d79',
          lighten1: '#960d79',
          darken1: '#36004c',
        },
        yellow: {
          base: '#b6890f',
          lighten1: '#ecb947',
          darken1: '#825c100',
        },
        neutrals: {
          base: '#262431',
          lighten1: '#484554',
          lighten2: '#ebebed',
        }
      }
    },
    options: {
      customProperties: true
    }
  }
});
