import { describe, it, expect } from 'vitest'
import { sanitize, SANITIZE_OPTIONS } from '../policy.js'
import { SANITIZE_OPTIONS as NUXT_OPTIONS } from '../../../../../../../frontend-nuxt/app/utils/sanitizePolicy.js'

describe('sanitize: removes script execution vectors', () => {
  const cases = {
    'img onerror': ['<img src="x" onerror="alert(1)">', '<img src="x" />'],
    'svg onload': ['<p>a</p><svg onload="alert(1)"><circle r="1"/></svg>', '<p>a</p>'],
    'script tag': ['<p>hi</p><script>alert(1)</script>', '<p>hi</p>'],
    'iframe': ['<iframe src="https://evil.example"></iframe><p>x</p>', '<p>x</p>'],
    'javascript: href': ['<a href="javascript:alert(1)">x</a>', '<a>x</a>'],
    'mixed-case javascript: href': ['<a href="JaVaScRiPt:alert(1)">x</a>', '<a>x</a>'],
    'entity-encoded javascript: href': ['<a href="&#106;avascript:alert(1)">x</a>', '<a>x</a>'],
    'data: href': ['<a href="data:text/html,<script>alert(1)</script>">x</a>', '<a>x</a>'],
    'onclick on allowed tag': ['<p onclick="alert(1)" class="c">x</p>', '<p class="c">x</p>'],
    'onmouseover on link': ['<a href="/x" onmouseover="alert(1)">x</a>', '<a href="/x">x</a>'],
    'form + input': ['<form action="https://evil.example"><input name="p"></form>', ''],
    'style element': ['<style>body{display:none}</style><p>x</p>', '<p>x</p>'],
    'object/embed': ['<object data="x.swf"></object><embed src="x.swf">', ''],
    'video javascript: src': ['<video src="javascript:alert(1)"></video>', '<video></video>'],
  }
  for (const [name, [input, expected]] of Object.entries(cases)) {
    it(name, () => expect(sanitize(input)).toBe(expected))
  }
})

describe('sanitize: keeps legitimate CMS markup', () => {
  const keep = [
    '<p style="text-align:center"><span style="color:#1a1a1a">Text</span></p>',
    '<a href="https://www.onrr.gov/x" target="_blank" class="usa-link usa-link--external" aria-label="Opens in new window" rel="noopener">link</a>',
    '<a href="/assets/abc" data-name="file.pdf" data-path="/x">file</a>',
    '<a href="mailto:someone@onrr.gov">mail</a>',
    '<a href="tel:+13035550100">call</a>',
    '<img src="/assets/abc" alt="Chart of revenue" width="150" height="150" data-id="abc" data-filename-disk="abc.png" />',
    '<figure class="image"><img src="/assets/abc" alt="a" /><figcaption>Caption</figcaption></figure>',
    '<table class="usa-table"><thead><tr><th scope="col">A</th></tr></thead><tbody><tr><td colspan="2">1</td></tr></tbody></table>',
    '<video controls width="640" height="360"><source src="/assets/v.mp4" type="video/mp4" /></video>',
    '<font color="#000" face="Arial">old markup</font>',
    '<h2 id="section-1">Heading</h2><ul><li>one</li></ul><ol start="3"><li>three</li></ol>',
    '<div class="grid-row"><div class="grid-col">x</div></div>',
    '<address class="phone">1-800</address><section id="s"><p>x</p></section>',
  ]
  for (const html of keep) {
    it(html.slice(0, 60), () => expect(sanitize(html)).toBe(html))
  }

  it('keeps text of unknown tags (pasted sitemap XML)', () => {
    expect(sanitize('<urlset><url><loc>https://www.onrr.gov/</loc></url></urlset>')).toBe('https://www.onrr.gov/')
  })

  it('leaves non-strings and empty strings alone', () => {
    expect(sanitize(null)).toBe(null)
    expect(sanitize(undefined)).toBe(undefined)
    expect(sanitize('')).toBe('')
  })

  it('is idempotent', () => {
    const html = '<p style="x">a &amp; b &lt;c&gt; “quotes”</p><img src="/a" alt="b" /><br />'
    expect(sanitize(sanitize(html))).toBe(sanitize(html))
  })
})

describe('allow-list stays in sync with the Nuxt frontend', () => {
  it('frontend-nuxt/app/utils/sanitizePolicy.js matches', () => {
    expect(NUXT_OPTIONS).toEqual(SANITIZE_OPTIONS)
  })
})
