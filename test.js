const fs = require('fs')

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

const bytes =
  programRom
    .map(word => [word >> 8, word & 0xFF])
    .reduce((acc, pair) => acc.concat(pair))
const programLength = 64 * 2 * 1024
const dataLength = 32 * 2 * 1024
const programAndDataLength = programLength + dataLength
const buffer = Buffer.alloc(programAndDataLength + 16)
Buffer.from(bytes).copy(buffer)
Buffer.from([0, 27, 0, 73]).copy(buffer, programLength)
const colors = [
  0x0a, // 0 medium cyan
  0x04, // 1 dark green
  0x03, // 2 blue
  0x2b, // 3 light blue
  0x00, // 4
  0x00, // 5
  0x00, // 6
  0x00, // 7
  0x00, // 8
  0x00, // 9
  0x00, // A
  0x00, // B
  0x00, // C
  0x00, // D
  0x00, // E
  0x30 // F light blue
]
Buffer.from(colors).copy(buffer, programAndDataLength)
fs.writeFileSync('test.bin', buffer)
