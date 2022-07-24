const fs = require('fs')

/**
 * Init
 * RA: Start of screen RAM
 * RB: Gamepad RAM address
 * RC: FIV main loop
 * RD: FIV IO RAM address
 * RE: target screen RAM cell
 * RF: screen loop start
 * R0: const 0
 * R1: gamepad
 * R2: screen cell value
 * R3: Counter value
 * R4: Screen size
 * R5: Draw counter
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
  // Init
  0x1000, // 00 0x0000 -> R0 Const ZERO
  0x2000, // 01
  0x7003, // 02 $0000 -> R3 (gamepad counter)
  0x1014, // 03 HBY $01E0 -> R4 (screen size = 480)
  0x2e04, // 04
  0x1faa, // 05 HBY $FA00 -> RA (screen ram)
  0x200a, // 06 LBY
  0x1f8b, // 07 HBY $F810 -> RB (gamepad IO RAM)
  0x210b, // 08 LBY
  0x100c, // 09 HBY $0010 -> RC (FIV main loop)
  0x210c, // 0A LBY
  0x1f8d, // 0B HBY $F800 -> RD (FIV IO RAM address)
  0x200d, // 0C
  0x100f, // 0D HBY $0013 -> RF (screen loop)
  0x215f, // 0E
  0x4dc0, // 0F str main loop to FIV; RC -> mem[$F800]
  // Main Loop
  0x7a0e, // 10 ADI start of screen ram -> RE (mutates)
  0x7405, // 11 ADI draw counter = 480
  0x3b01, // 12 LOD gamepad -> R1
  0x1012, // 13 HBY screen ram cell R2
  0x2412, // 14 LBY
  0x4e20, // 15 STR R2 -> screen ram
  0x7e1e, // 16 ADI inc screen ram location
  0x8515, // 17 SBI --R5 (screen loop counter)
  0xe5f5, // 18 BRV Repeat loop if R5 != 0
  0x0000, // 19 END
]

const bytes = programRom
  .map((word) => [word >> 8, word & 0xff])
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
  0x2a, // 2 light grey
  0x01, // 3 dark blue
  0x04, // 4 dark green
  0x2f, // 5 light cyan
  0x30, // 6 red (A)
  0x0c, // 7 green (S)
  0x03, // 8 blue (D)
  0x33, // 9 magenta (F)
  0x00, // A
  0x00, // B
  0x00, // C
  0x00, // D
  0x00, // E
  0x3f, // F white
]
Buffer.from(colors).copy(buffer, programAndDataLength)
fs.writeFileSync('test2.bin', buffer)
