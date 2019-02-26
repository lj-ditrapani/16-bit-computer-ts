- Read binary ROM file from command line arg
    - currently hard coded to test.bin
- loop timing
    - setTimout delay the diff of 100 ms - elapsed time
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
