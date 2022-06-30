#!/usr/bin/env node

import fs from 'fs'
import os from 'os'
import path from 'path'
import meow from 'meow'
import fetch from 'node-fetch'
import padend from 'lodash.padend'
import stringWidth from 'string-width'
import breakString from 'break-string'
import repeatString from 'repeat-string'

const cli = meow(
  `
  Usage
    $ daily-saying [options]

  Options
    --line-length, -l  The max length of line
    --help             Show help info

  Examples
    $ daily-saying --line-length 56
    $ daily-saying --help
    $ daily-saying --version
`,
  {
    flags: {
      lineLength: {
        type: 'number',
        default: 56,
        alias: 'l'
      },
    },
    importMeta: import.meta,
    allowUnknownFlags: true,
    version: true,
  },
)

const lineLength = cli.flags.lineLength

function printLine(content) {
  breakString(content, lineLength).forEach((text) => {
    const len = stringWidth(text)
    if (len === lineLength) {
      console.log('( ' + text + ' )')
    } else {
      console.log('( ' + text + padend('', lineLength - len, ' ') + ' )')
    }
  })
}

function emptyline() {
  console.log('(' + repeatString(' ', lineLength + 2) + ')')
}

function cowsay(data) {
  console.log(' ' + repeatString('_', lineLength + 2) + ' ')
  printLine(data.content)
  emptyline()
  printLine(data.note)
  // emptyline();
  // printLine(data.translation)
  console.log(' ' + repeatString('-', lineLength + 2) + ' ')

  console.log('             o                                       ')
  console.log('              o   ^__^                               ')
  console.log('               o  (oo)\\_______                      ')
  console.log('                  (__)\\       )\\/\\                ')
  console.log('                      ||----w |                      ')
  console.log('                      ||     ||                      ')
  console.log()
}

try {
  const tmpdir = os.tmpdir()
  const cachePath = path.join(tmpdir, 'daily-saying.json')
  if (!fs.existsSync(cachePath)) {
    fs.writeFileSync(cachePath, '{}')
  }
  const cache = JSON.parse(fs.readFileSync(cachePath, { encoding: 'utf8' }))

  const now = new Date()
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

  if (cache[date]) {
    cowsay(cache[date])
  } else {
    fetch('http://open.iciba.com/dsapi/').then(res => res.json()).then(data => {
      cowsay(data)
      cache[date] = data
      fs.writeFile(
        cachePath,
        JSON.stringify(cache, null, 2),
        () => {},
      )
    })
  }
} catch (error) {
}
