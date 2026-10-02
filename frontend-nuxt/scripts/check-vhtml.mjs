#!/usr/bin/env node
// Fails if any v-html (or innerHTML binding) in app/ isn't passed through
// sanitizeHtml(). CMS content is HTML written by editors; rendering it raw lets
// stored markup run script on the site (CWE-79). See app/utils/sanitizeHtml.js.
//
//   npm run check:vhtml
//
// Only <template> blocks are checked, with HTML comments removed, so code
// comments that mention v-html don't count.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const APP = join(ROOT, 'app')

function vueFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? vueFiles(path) : name.endsWith('.vue') ? [path] : []
  })
}

// Raw-HTML bindings: v-html="…", :innerHTML / :inner-html / v-bind:innerHTML="…".
const BINDING = /(v-html|(?:v-bind)?:inner-?html)\s*=\s*(["'])([\s\S]*?)\2/gi

const problems = []
let checked = 0

for (const file of vueFiles(APP)) {
  const source = readFileSync(file, 'utf8')
  for (const block of source.matchAll(/<template\b[^>]*>([\s\S]*)<\/template>/gi)) {
    const template = block[1].replace(/<!--[\s\S]*?-->/g, comment => comment.replace(/[^\n]/g, ' '))
    const offset = block.index + block[0].indexOf(block[1])
    for (const m of template.matchAll(BINDING)) {
      checked++
      const [, directive, , value] = m
      if (directive.toLowerCase() === 'v-html' && /^\s*sanitizeHtml\(/.test(value)) continue
      const line = source.slice(0, offset + m.index).split('\n').length
      problems.push(`${relative(ROOT, file)}:${line}  ${directive}="${value.trim().slice(0, 80)}"`)
    }
  }
}

if (problems.length > 0) {
  console.error(`Unsanitized HTML bindings (wrap the value in sanitizeHtml(...)):\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log(`check:vhtml: all ${checked} v-html bindings go through sanitizeHtml().`)
