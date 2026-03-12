import { ref, computed, watch, onUnmounted } from 'vue';

const TICK_MS = 1000;

/**
 * Format seconds as MM:SS
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatTime(totalSeconds) {
    const mins = Math.floor(Math.abs(totalSeconds) / 60);
    const secs = Math.floor(Math.abs(totalSeconds) % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Single interval engine for count up and count down.
 * Deterministic: ticks every second, no drift.
 * Reacts to state changes from useTimerState.
 *
 * @param {import('vue').Ref<'idle'|'running'|'paused'|'completed'>} stateRef
 * @param {Object} options
 * @param {'up'|'down'} [options.mode='up']
 * @param {number} [options.durationSeconds=60] - Target duration for count down
 * @param {(elapsed: number) => void} [options.onCountDownComplete] - Called when count down reaches 0
 * @returns {{
 *   elapsedSeconds: import('vue').Ref<number>,
 *   formattedTime: import('vue').ComputedRef<string>,
 *   remainingSeconds: import('vue').ComputedRef<number>,
 *   isComplete: import('vue').ComputedRef<boolean>,
 *   mode: import('vue').Ref<'up'|'down'>,
 *   durationSeconds: import('vue').Ref<number>,
 *   setMode: (m: 'up'|'down') => void,
 *   setDuration: (s: number) => void,
 *   reset: () => void,
 * }}
 */
export function useTimerEngine(stateRef, options = {}) {
    const { mode: initialMode = 'up', durationSeconds: initialDuration = 60, onCountDownComplete } = options;

    const elapsedSeconds = ref(0);
    const mode = ref(/** @type {'up'|'down'} */ (initialMode));
    const durationSeconds = ref(initialDuration);

    let intervalId = null;

    const remainingSeconds = computed(() => Math.max(0, durationSeconds.value - elapsedSeconds.value));
    const isComplete = computed(() => mode.value === 'down' && elapsedSeconds.value >= durationSeconds.value);

    const formattedTime = computed(() => {
        if (mode.value === 'up') {
            return formatTime(elapsedSeconds.value);
        }
        return formatTime(remainingSeconds.value);
    });

    function tick() {
        elapsedSeconds.value += 1;
        if (mode.value === 'down' && elapsedSeconds.value >= durationSeconds.value) {
            stopInterval();
            onCountDownComplete?.(elapsedSeconds.value);
        }
    }

    function startInterval() {
        if (intervalId) return;
        intervalId = setInterval(tick, TICK_MS);
    }

    function stopInterval() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function reset() {
        stopInterval();
        elapsedSeconds.value = 0;
    }

    watch(
        () => stateRef.value,
        (newState) => {
            if (newState === 'running') {
                startInterval();
            } else {
                stopInterval();
            }
            if (newState === 'idle') {
                elapsedSeconds.value = 0;
            }
        },
        { immediate: true }
    );

    onUnmounted(stopInterval);

    return {
        elapsedSeconds,
        formattedTime,
        remainingSeconds,
        isComplete,
        mode,
        durationSeconds,
        setMode: (m) => { mode.value = m; },
        setDuration: (s) => { durationSeconds.value = s; },
        reset,
    };
}
