<template>
  <v-card
      elevation="1"
      class="text-wrap contact-card"
      v-if="contact">
        <v-card-title
          :class="[formatToSlug(role).toLowerCase(), 'contact-title']">{{ role }}</v-card-title>
        <v-card-text
          class="pa-4">
          <div class="contact contact-row" v-if="contact">{{ contact }}</div>
          <div class="contact-row" v-if="email">
            <v-icon color="secondary" class="mr-1">mdi-email</v-icon>
            <a :href="`mailto:${ email }`">{{ email }}</a>
          </div>
          <div class="contact-row" v-if="phone">
            <v-icon color="secondary" class="mr-1">mdi-phone</v-icon>
            <a :href="`tel:${ phone }`">{{ phone }}</a>
          </div>
          <div class="contact-row" v-if="fax">
            <v-icon color="secondary" class="mr-1">mdi-fax</v-icon>
            <a :href="`tel:${ fax }`">{{ fax }}</a>
          </div>
        </v-card-text>
    </v-card>
</template>

<script>
import { formatToSlug } from '@/js/utils'

export default {
  name: 'ContactCard',
  props: {
    contact: String,
    role: String,
    email: String,
    phone: String,
    fax: String
  },
  methods: {
    formatToSlug: formatToSlug
  }
}
</script>

<style lang="scss" scoped>
.contact-card {
  min-height: 165px;
}

.contact-title {
  padding: 0px 8px;
  min-height: 36px;
  color: white !important;
  font-size: 1rem !important;
}

.contact-row {
  margin-bottom: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.primary-contact {
  background-color: var(--v-primary-base);
}

.back-up-contact {
  background-color: var(--v-purple-lighten1);
}

.supervisor,
.manager {
  background-color: var(--v-yellow-lighten1);
  color: var(--v-black) !important;
}

.contact {
  background-color: var(--v-neutrals-lighten2);
  padding: 2px 4px;
}
</style>
