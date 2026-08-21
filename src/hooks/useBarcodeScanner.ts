import { useEffect, useRef } from 'react';
import { sounds } from '../utils/soundEffects';

interface UseBarcodeScannerOptions {
  onScan?: (barcode: string) => void;
  enabled?: boolean;
  minBarcodeLength?: number;
  maxKeyInterval?: number; // ms between consecutive keystrokes from laser gun
  enableSound?: boolean;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minBarcodeLength = 3,
  maxKeyInterval = 65, // Laser scanner emits characters rapidly (<50ms)
  enableSound = true,
}: UseBarcodeScannerOptions = {}) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // If key is Enter, evaluate buffer
      if (e.key === 'Enter') {
        const rawBarcode = bufferRef.current.trim();
        bufferRef.current = '';

        if (rawBarcode.length >= minBarcodeLength) {
          // If the event target is a search input, let it also handle or prevent default
          if (enableSound) {
            sounds.playBarcodeBeep();
          }

          // Trigger custom window event for system-wide awareness
          window.dispatchEvent(
            new CustomEvent('barcode-scanned', {
              detail: { barcode: rawBarcode, timestamp: Date.now() },
            })
          );

          if (onScan) {
            onScan(rawBarcode);
          }
        }
        return;
      }

      // If single printable character
      if (e.key.length === 1) {
        // If elapsed time between keystrokes is too long and not empty, reset buffer
        if (timeDiff > maxKeyInterval && bufferRef.current.length > 0) {
          bufferRef.current = '';
        }
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onScan, minBarcodeLength, maxKeyInterval, enableSound]);
}
