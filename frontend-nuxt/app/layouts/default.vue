<template>
  <div class="usa-layout-docs">
    <header class="usa-header usa-header--basic">
      <div class="usa-nav-container">
        <div class="usa-navbar">
          <div class="usa-logo">
            <em class="usa-logo__text">
              <NuxtLink to="/">ONRR</NuxtLink>
            </em>
          </div>
        </div>
      </div>
    </header>

    <main id="main-content">
      <slot />
    </main>

    <footer class="usa-footer usa-footer--slim">
      <div class="grid-container usa-footer__return-to-top">
        <a href="#">Return to top</a>
      </div>
      <div class="usa-footer__primary-section">
        <div class="grid-container">
          <div class="usa-footer__primary-container grid-row">
            <div class="grid-col-12">
              <span class="usa-footer__logo-heading">
                Office of Natural Resources Revenue
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
