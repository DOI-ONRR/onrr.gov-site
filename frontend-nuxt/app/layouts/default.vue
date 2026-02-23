<template>
  <div class="my-app">
    <GovBanner />
    <header class="usa-header usa-header--extended">
      <div class="usa-nav-container">
        <div class="usa-navbar">
          <div class="usa-logo">
            <NuxtLink to="/" class="usa-logo__link">
              <img src="/img/onrr_seal_logo.svg" alt="ONRR seal" class="usa-logo__img" />
              <em class="usa-logo__text">Office of Natural Resources Revenue</em>
            </NuxtLink>
          </div>
          <section class="header-search" aria-label="Search">
            <form class="usa-search usa-search--small" role="search">
              <label class="usa-sr-only" for="header-search-field">Search</label>
              <input class="usa-input" id="header-search-field" type="search" name="search" />
              <button class="usa-button" type="submit">
                <img
                  src="/uswds/img/usa-icons-bg/search--white.svg"
                  class="usa-search__submit-icon"
                  alt="Search"
                />
              </button>
            </form>
          </section>
        </div>
      </div>
      <NavigationMenu />
    </header>

    <main id="main-content">
      <slot />
    </main>

    <SiteFooter />
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

.usa-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-search {
  flex-shrink: 0;
}
</style>
