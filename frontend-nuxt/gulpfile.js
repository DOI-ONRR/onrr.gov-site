/* gulpfile.js */

const uswds = require("@uswds/compile");

/**
 * USWDS version
 */

uswds.settings.version = 3;

/**
 * Path settings
 */
uswds.paths.src.projectSass = './app/assets/scss';
uswds.paths.dist.css = "./public/uswds/css";
uswds.paths.dist.theme = "./app/assets/scss";
uswds.paths.dist.img = "./public/uswds/img";
uswds.paths.dist.fonts = "./public/uswds/fonts";
uswds.paths.dist.js = "./public/uswds/js";

/**
 * Exports
 */

// Only use @uswds/compile to copy static assets.
// Sass compilation is handled by Vite/Nuxt.
exports.updateUswds = uswds.copyAssets;