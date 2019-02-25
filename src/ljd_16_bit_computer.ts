import { keyCodes, makeTermGrid } from 'term-grid-ui'
import { makeDebugCpu } from '/home/ljd/fun/16-bit-cpu-ts'

const tg = makeTermGrid(15, 32)

const programRom = [
  0x100a, // HBY 0x00 RA
  0x200a, // LBY 0x00 RA
  0x3a01, // LOD RA R1
  0x201a, // LBY 0x01 RA
  0x3a02, // LOD RA R2
  0x5123, // ADD R1 R2 R3
  0x1faa, // HBY 0xFA RA
  0x200a, // LBY 0x00 RA
  0x4a30, // STR RA R3
  0x0000 // END
]

let ioRamPtr: Uint16Array
const dataRom = [27, 73, 0]
const { cpu, ioRam } = makeDebugCpu(programRom, dataRom)
ioRamPtr = ioRam

function* range(end: number) {
  for (let i = 0; i < end; i += 1) {
    yield i
  }
}

const draw = () => {
  tg.draw()
}

const step = () => {
  ioRamPtr = cpu.run(1000)
  draw()
  setTimeout(step, 100)
}

setTimeout(step, 100)

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
  ioRamPtr[0x0010] = getButtonBits(data)
})
