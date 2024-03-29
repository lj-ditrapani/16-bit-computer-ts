import * as fs from 'fs'
import { keyCodes, makeTermGrid } from 'term-grid-ui'
import { Cpu } from 'ljd-16-bit-cpu'
import { strict as assert } from 'assert'

if (process.argv.length !== 3) {
  console.error('You must provide the path of the ROM file as a command line argument')
  process.exit(1)
}

const file = fs.readFileSync(process.argv[2])

const fileLength = (64 + 32) * 2 * 1024 + 16
assert.equal(file.length, fileLength, `ROM file must be exactly ${fileLength} bytes.`)

const programRom = new Uint16Array(64 * 1024)
const dataRom = new Uint16Array(32 * 1024)
const colors = new Uint8Array(16)

let fileIndex = 0
for (let programIndex = 0; programIndex < 64 * 1024; programIndex++) {
  programRom[programIndex] = (file[fileIndex++] << 8) | file[fileIndex++]
}

for (let dataIndex = 0; dataIndex < 32 * 1024; dataIndex++) {
  dataRom[dataIndex] = (file[fileIndex++] << 8) | file[fileIndex++]
}
for (let colorIndex = 0; colorIndex < 16; colorIndex++) {
  colors[colorIndex] = file[fileIndex + colorIndex]
}

const tg = makeTermGrid(17, 32)

const ioRam1: Uint16Array = new Uint16Array(1 * 1024)
const ioRam2: Uint16Array = new Uint16Array(1 * 1024)
const cpu = new Cpu(programRom, dataRom, ioRam1, ioRam2)
let ioRam = ioRam2

function* range(end: number) {
  for (let i = 0; i < end; i += 1) {
    yield i
  }
}

const getScreenCell = (row: number, column: number): number =>
  ioRam[512 + row * 32 + column]

const getChar = (code: number): number => {
  if (code < 0x20) {
    return 0x2580 + code
  } else if (code < 127) {
    return code
  } else {
    return 0x2500 + code
  }
}

const draw = () => {
  for (const row of range(15)) {
    for (const column of range(32)) {
      const word = getScreenCell(row, column)
      const lowByte = word & 0xff
      const c = String.fromCharCode(getChar(lowByte))
      const byte = word >> 8
      const fgColor = colors[byte >> 4]
      const bgColor = colors[byte & 0xf]
      // console.log(`${row} ${column} ${word} ${c} ${fgIndex} ${bgIndex} ${fgColor} ${bgColor}`)
      tg.set(row, column, c, fgColor, bgColor)
    }
  }
  // process.exit(1)
}

const runFrame = () => {
  const start = process.hrtime()
  ioRam = cpu.run(400000)
  ioRam[0x0010] = 0 // clear gamepad input register
  draw()
  const end = process.hrtime(start)
  const elapsed = end[0] * 1000 + end[1] / 1e6
  tg.text(15, 0, ''.padEnd(32, ' '), 0, 0)
  tg.text(16, 0, elapsed.toString().padEnd(32, ' '), 0x2f, 0)
  tg.draw()
  const end2 = process.hrtime(start)
  const elapsed2 = end2[0] * 1000 + end2[1] / 1e6
  const remaining = 100 - elapsed2
  setTimeout(runFrame, remaining > 0 ? remaining : 1)
}

setTimeout(runFrame, 100)

const getButtonBits = (data: string): number => {
  switch (data) {
    case keyCodes.arrowUp:
      return 0x80
    case keyCodes.arrowDown:
      return 0x40
    case keyCodes.arrowLeft:
      return 0x20
    case keyCodes.arrowRight:
      return 0x10
    case 'a':
      return 0x08
    case 's':
    case 'o':
      return 0x04
    case 'd':
    case 'e':
      return 0x02
    case 'u':
    case 'f':
      return 0x01
    case 'q':
      tg.reset()
      console.log('exiting')
      process.exit()
    default:
      return 0
  }
}

tg.clear()
tg.draw()
tg.onInput((data) => {
  // set gamepad input register
  ioRam[0x0010] = getButtonBits(data)
})
