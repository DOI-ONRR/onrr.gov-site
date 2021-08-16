<template>
  <v-card class="v-card__item">
    <v-card-title class="text-h5" v-if="cardTitle">
      {{ cardTitle }}
    </v-card-title>
    <v-card-subtitle v-if="cardSubtitle" class="v-card__subtitle">
      {{ cardSubtitle }}
    </v-card-subtitle>
    <v-card-text
      class="v-card__content"
      v-html="cardContent[0].item.content"></v-card-text>
    <!-- <v-card-actions>
      Actions here...
    </v-card-actions> -->
  </v-card>
</template>

<script>
export default {
  name: 'CardBlock',
  data () {
    return {
      data: {}
    }
  },
  props: {
    cardTitle: {
      type: String
    },
    cardSubtitle: {
      type: String
    },
    cardContent: {
      type: [String, Array]
    }
  }
}
</script>

<style lang="scss" scoped>
.v-card__item {
  margin-bottom: 24px;
}

.v-card-text {
  margin-top: 50px;
}
</style>