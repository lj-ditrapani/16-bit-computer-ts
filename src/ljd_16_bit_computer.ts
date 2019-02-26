import * as fs from 'fs'
import { keyCodes, makeTermGrid } from 'term-grid-ui'
import { Cpu } from '/home/ljd/fun/16-bit-cpu-ts'

const file = fs.readFileSync('test.bin')

const programRom = new Uint16Array(64 * 1024)
const dataRom = new Uint16Array(32 * 1024)

let fileIndex = 0
for (let programIndex = 0; programIndex < 64 * 1024; programIndex++) {
  programRom[programIndex] = (file[fileIndex++] << 8) | file[fileIndex++]
}

for (let dataIndex = 0; dataIndex < 32 * 1024; dataIndex++) {
  dataRom[dataIndex] = (file[fileIndex++] << 8) | file[fileIndex++]
}

const tg = makeTermGrid(15, 32)

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

const getColor = (nibble: number): number => {
  const index = nibble >> 1
  const offset = nibble & 0x1
  const colorPair = ioRam[0x40 + index]
  return [colorPair >> 8, colorPair & 0xff][offset]
}

const draw = () => {
  for (const row of range(15)) {
    for (const column of range(32)) {
      const word = getScreenCell(row, column)
      const lowByte = word & 0xff
      const c = String.fromCharCode(getChar(lowByte))
      const byte = word >> 8
      const fgColor = getColor(byte >> 4)
      const bgColor = getColor(byte & 0xf)
      // console.log(`${row} ${column} ${word} ${c} ${fgIndex} ${bgIndex} ${fgColor} ${bgColor}`)
      tg.set(row, column, c, fgColor, bgColor)
    }
  }
  // process.exit(1)
  tg.draw()
}

const runFrame = () => {
  ioRam = cpu.run(1000)
  ioRam[0x0010] = 0 // clear gamepad input register
  draw()
  setTimeout(runFrame, 100)
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
tg.onInput(data => {
  // set gamepad input register
  ioRam[0x0010] = getButtonBits(data)
})
