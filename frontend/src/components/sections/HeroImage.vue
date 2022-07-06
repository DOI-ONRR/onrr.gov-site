<template>
  <div :class="[isHome ? 'hero-container home' : 'hero-container']">
    <img 
    :src="image"
    :alt="alt" />

    <h1 :class="[isHome ? 'hero__home-text' : 'hero__text']" v-if="title">
      {{ title }}
    </h1>
  </div>
</template>

<script>
export default {
  name: 'HeroImage',
  data () {
    return {}
  },
  props: {
    title: {
      type: String
    },
    image: {
      type: String
    },
    isHome: {
      type: Boolean
    }
  }
}
</script>

<style lang="scss" scoped>
.hero-container {
  position: relative;
  top: 0;
  height: 300px;

  img {
    height: 100%;
    width: 100%;
    background-size: cover;
    background-position: 50% 50%;
    object-fit: cover;
    object-position: left 15%;
  }
}

.hero-container.home {
  @extend .hero-container;
  height: 450px;
}

.hero__text {
  position: absolute;
  height: 100px;
  line-height: 100px;
  font-weight: 400;
  width: 80%;
  bottom: 0;
  right: 0;
  background: rgba(150, 66,169, 0.65);
  color: white;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  padding-left: 50px;
}

.hero__home-text {
  position: absolute;
  font-weight: 400;
  top: 25px;
  left: 15px;
  background: rgba(255,255,255, 0.65);
  color: black;
  font-size: 24px;
  line-height: inherit;
  width: 65%;
  height: auto;
  text-align: left;
  padding: 16px;
  border-radius: 4px;
}
</style>