/* gulpfile.js */

const uswds = require("@uswds/compile");

/**
 * USWDS version
 */

uswds.settings.version = 3;

/**
 * Path settings
 */
uswds.paths.src.projectSass = './src/sass';
uswds.paths.dist.css = "./public/uswds/css";
uswds.paths.dist.theme = "./src/sass";
uswds.paths.dist.img = "./public/uswds/img";
uswds.paths.dist.fonts = "./public/uswds/fonts";
uswds.paths.dist.js = "./public/uswds/js";

/**
 * Exports
 */

exports.compile = uswds.compile;
exports.watch = uswds.watch;
exports.init = uswds.init;
exports.updateUswds = uswds.updateUswds;
exports.default = uswds.watch;