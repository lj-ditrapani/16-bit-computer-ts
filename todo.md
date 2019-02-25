- color palette (16 colors)
    - color palette in ioRam (should be 2 per word)
        - right now is 1 color per word.  Takes up 16 words.  Sould be 8 words.
    - ioRam screen cells fg & bg index into color palette
- Read ROM (program/data) from file
- loop timing
    - setTimout delay the diff of 100 ms - elapsed time
- write test program that uses gamepad input
    - should setup on first frame, then switch FIV to main loop


ljd 16-bit-cpu-ts
ICpu interface:
- ICpu interface should include setProgramCounter
- Cpu could clear gamepad itself (at end of frame, before returning)
- cpu could have makeCpuTypedArray that takes uint16arrays
