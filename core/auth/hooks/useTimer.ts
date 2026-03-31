import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useTimer Hook
 *
 * A custom React hook to manage a timer with start, pause, and reset functionality.
 *
 * @param {number} initialTime - The initial time in seconds for the timer.
 * @param {function} onTimerEnd - An optional function that executes when the timer reaches zero.
 * @returns {object} An object containing:
 * - timeRemaining: The current time remaining in seconds.
 * - isRunning: A boolean indicating whether the timer is currently running.
 * - startTimer: A function to start the timer.
 * - pauseTimer: A function to pause the timer.
 * - resetTimer: A function to reset the timer to its initial time.
 */
export const useTimer = (
  initialTime: number = 30, // Default initial time is 30 seconds
  onTimerEnd: () => void = () => {},
) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = undefined;
          setIsRunning(false);
          onTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [isRunning, onTimerEnd]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimeRemaining(initialTime);
  }, [initialTime, pauseTimer]);

  return { timeRemaining, isRunning, startTimer, pauseTimer, resetTimer };
};
