const fs = require('fs')

/**
 * Init
 * RA: Start of screen RAM
 * RB: Gamepad RAM address
 * RC: FIV main loop
 * RD: FIV IO RAM address
 * RE: target screen RAM cell
 * R0: const 0
 * R1: gamepad
 * R2: screen cell value
 * R3: Counter value
 * Set counter = 0
 * Set FIV
 *
 * Main loop
 * Check gamepad
 * if button pressed
 *    - light up button that was pressed on screen
 *    - increment counter
 * Jump to Draw screen RAM
 *    - Draw counter
 *    - Draw buttons; if one was pressed, it is brighter
 *    - END
 */
const programRom = [
  0x1000, // 00 0x0000 -> R0 Const ZERO
  0x2000, // 01
  0x7003, // 02 $0000 -> R3 (gamepad counter)
  0x1faa, // 03 HBY $FA00 -> RA (screen ram)
  0x200a, // 04 LBY
  0x1f8b, // 05 HBY $F810 -> RB (gamepad IO RAM)
  0x210b, // 06 LBY
  0x100c, // 07 HBY $000C -> RC (FIV main loop)
  0x20cc, // 08 LBY
  0x1F8d, // 09 HBY $F800 -> RD (FIV IO RAM address)
  0x200d, // 0A
  0x4dc0, // 0B str main loop to FIV; RC -> mem[$F800]
  0x7a0e, // 0C start of screen ram -> RE (mutates)
  0x3b01, // 0D gamepad -> R1
  0x1012, // 0E screen ram cell R2
  0x2412, //
  0x4e20, //
  0x0000 // END
]

const bytes =
  programRom
    .map(word => [word >> 8, word & 0xFF])
    .reduce((acc, pair) => acc.concat(pair))
const programLength = 64 * 2 * 1024
const dataLength = 32 * 2 * 1024
const programAndDataLength = programLength + dataLength
const buffer = Buffer.alloc(programAndDataLength + 16)
Buffer.from(bytes).copy(buffer)
const dataBytes = []
Buffer.from(dataBytes).copy(buffer, programLength)
const colors = [
  0x00, // 0 black
  0x0a, // 1 medium cyan
  0x2A, // 2 light grey
  0x01, // 3 dark blue
  0x04, // 4 dark green
  0x2F, // 5 light cyan
  0x30, // 6 red (A)
  0x0C, // 7 green (S)
  0x03, // 8 blue (D)
  0x33, // 9 magenta (F)
  0x00, // A
  0x00, // B
  0x00, // C
  0x00, // D
  0x00, // E
  0x3F // F white
]
Buffer.from(colors).copy(buffer, programAndDataLength)
fs.writeFileSync('test2.bin', buffer)
