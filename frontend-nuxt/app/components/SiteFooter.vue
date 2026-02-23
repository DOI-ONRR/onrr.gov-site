<template>
  <footer class="usa-footer usa-footer--slim">
    <div class="grid-container usa-footer__return-to-top">
      <a href="#">Return to top</a>
    </div>
    <div class="usa-footer__primary-section">
      <div class="usa-footer__primary-container grid-row">
        <div class="mobile-lg:grid-col-8">
          <nav class="usa-footer__nav" aria-label="Footer navigation">
            <ul class="grid-row grid-gap">
              <li class="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                <a class="usa-footer__primary-link" href="https://doi.gov">Department of the Interior</a>
              </li>
              <li class="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                <a class="usa-footer__primary-link" href="https://doi.gov/privacy">Privacy Policy</a>
              </li>
              <li class="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                <a class="usa-footer__primary-link" href="https://doi.gov/accessibility">Accessibility</a>
              </li>
              <li class="mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content">
                <a class="usa-footer__primary-link" href="https://doi.gov/foia">FOIA</a>
              </li>
            </ul>
          </nav>
        </div>
        <div class="mobile-lg:grid-col-4">
          <address class="usa-footer__address">
            <div class="grid-row grid-gap">
              <div class="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                <div class="usa-footer__contact-info">
                  <a href="tel:1-303-231-3162">(303) 231-3162</a>
                </div>
              </div>
              <div class="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                <div class="usa-footer__contact-info">
                  <a href="mailto:onrrcomm@onrr.gov">onrrcomm@onrr.gov</a>
                </div>
              </div>
            </div>
          </address>
        </div>
      </div>
    </div>
    <div class="usa-footer__secondary-section">
      <div class="grid-container">
        <div class="usa-footer__logo grid-row grid-gap-2">
          <div class="grid-col-auto">
            <img
              class="usa-footer__logo-img"
              src="/img/onrr_seal_logo.svg"
              alt="ONRR seal"
            />
          </div>
          <div class="grid-col-auto">
            <p class="usa-footer__logo-heading">
              Office of Natural Resources Revenue
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "uswds-theme" as *; 

.usa-footer__primary-section {
  background-color: $color-teal-cyan;
}

.usa-footer__secondary-section {
  background-color: $color-medium-blue;
  color: #ffffff;
}

</style>