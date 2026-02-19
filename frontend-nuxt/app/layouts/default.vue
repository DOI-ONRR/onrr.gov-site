<template>
  <div class="my-app">
    <header class="usa-header usa-header--basic">
      <div class="usa-nav-container">
        <div class="usa-navbar">
          <div class="usa-logo">
            <NuxtLink to="/" class="usa-logo__link">
              <img src="/img/onrr_seal_logo.svg" alt="ONRR seal" class="usa-logo__img" />
              <em class="usa-logo__text">Office of Natural Resources Revenue</em>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>
    
    <NavigationMenu />

    <main id="main-content">
      <slot />
    </main>

  </div>
</template>

<style lang="scss" scoped>
.usa-logo__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.usa-logo__img {
  height: 8rem;
  width: auto;
}
</style>
