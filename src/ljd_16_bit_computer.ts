import { keyCodes, makeTermGrid } from 'term-grid-ui'
import { makeDebugCpu } from '/home/ljd/fun/16-bit-cpu-ts'

const tg = makeTermGrid(15, 32)

const programRom = [
  0x1f8a, // $F840 -> RA (color ram)
  0x240a, //
  0x10a1, // $0a04 -> R1 (medium cyan / dark green)
  0x2041,
  0x4a10, // STR $0A04 -> mem[$F840]
  0x241a, // $F841 -> RA
  0x1031, // $032B -> R1 (blue / light blue)
  0x22b1, //
  0x4a10, // STR $032B -> mem[$F841]
  0x247a, // $F847 -> RA (end of color ram)
  0x1001, // $0030 -> R1 (black / red)
  0x2301, //
  0x4a10, // STR $0030 -> mem[$F847]
  0x100a, // HBY 0x00 RA
  0x200a, // LBY 0x00 RA
  0x3a01, // LOD RA R1
  0x201a, // LBY 0x01 RA
  0x3a02, // LOD RA R2
  0x5123, // ADD R1 R2 R3
  0x1013, // set fg & bg color indexes (medium cyan / dark green)
  0x1faa, // HBY $FA00 -> RA (screen ram)
  0x200a, // LBY
  0x4a30, // STR $0164 -> mem[$FA00]
  0x1211, // HBY $2300 -> R1 (blue / dark green)
  0x2001,
  0x202a, // LBY
  0x4a10, // STR $2100 -> mem[$FA02]
  0x1fba, // HBY $FBDF -> RA (screen ram)
  0x2dfa, //
  0x4a30, // STR $0164 -> mem[$FBDF]
  0x2c0a, // LBY $FBC0 -> RA (screen ram)
  0x1fe3, // set fg & bg color indexes
  0x4a30, // STR $0164 -> mem[$FBDF]
  0x0000 // END
]

const dataRom = [27, 73, 0]
const cpuAndIoRam = makeDebugCpu(programRom, dataRom)
const cpu = cpuAndIoRam.cpu
let ioRam = cpuAndIoRam.ioRam

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
