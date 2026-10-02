// Browser-build stand-in for postcss. sanitize-html imports postcss only to
// parse style attributes, which sanitizePolicy.js turns off
// (parseStyleAttributes: false), so the real package (~16 KB gzipped) never
// runs in the browser. If that option is ever changed, this throws instead of
// silently skipping style filtering.
function parse() {
  throw new Error('postcss is not bundled for the browser; keep parseStyleAttributes: false in sanitizePolicy.js')
}

export { parse }
export default { parse }
