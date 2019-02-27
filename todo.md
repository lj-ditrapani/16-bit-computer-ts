- Add an 16 byte VideoRom to end of cartridge
    - Contains 16 colors
    - No more color ram
    - No more copying colors to ram
- write test program that uses gamepad input
    - should setup on first frame, then switch FIV to main loop


ljd 16-bit-cpu-ts
ICpu interface:
- ICpu interface should include setProgramCounter
- Cpu must clear gamepad itself (at end of frame, before returning)
- cpu must have makeCpuTypedArray that takes uint16arrays


- readme
- documentation
- usage example

- require ROM length to be exact
