import { keyCodes, makeTermGrid } from 'term-grid-ui'
import { makeDebugCpu } from '/home/ljd/fun/16-bit-cpu-ts'

const tg = makeTermGrid(15, 32)

const programRom = [
  0x1f8a, // $F840 -> RA (color ram)
  0x240a, //
  0x1001, // $000A -> R1 (medium cyan)
  0x20a1,
  0x4a10, // STR $000A -> mem[$F840]
  0x241a, // $F841 -> RA
  0x2041, // $0004 -> R1 (dark green)
  0x4a10, // STR $0004 -> mem[$F841]
  0x24fa, // $F84F -> RA (end of color ram)
  0x2301, // $0030 -> R1 (red)
  0x4a10, // STR $0030 -> mem[$F84F]
  0x100a, // HBY 0x00 RA
  0x200a, // LBY 0x00 RA
  0x3a01, // LOD RA R1
  0x201a, // LBY 0x01 RA
  0x3a02, // LOD RA R2
  0x5123, // ADD R1 R2 R3
  0x1013, // set fg & bg color indexes
  0x1faa, // HBY $FA00 -> RA (screen ram)
  0x200a, // LBY
  0x4a30, // STR $0164 -> mem[$FBDF]
  0x1fba, // HBY $FBDF -> RA (screen ram)
  0x2dfa, //
  0x4a30, // STR $0164 -> mem[$FBDF]
  0x2c0a, // LBY $FBC0 -> RA (screen ram)
  0x1f23, // set fg & bg color indexes
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

const getScreenCell = (row: number, column: number): number => {
  // console.log(row * 32 + column)
  return ioRam[512 + row * 32 + column]
}

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
      const fgIndex = word >> 12
      const bgIndex = (word >> 8) & 0xf
      const fgColor = ioRam[0x40 + fgIndex]
      const bgColor = ioRam[0x40 + bgIndex]
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
