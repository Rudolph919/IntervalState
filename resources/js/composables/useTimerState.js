import { ref, computed } from 'vue';

/** @typedef {'idle' | 'running' | 'paused' | 'completed'} TimerState */

/**
 * Deterministic timer state machine.
 * States: idle → running ⇄ paused → completed
 *
 * @returns {{
 *   state: import('vue').Ref<TimerState>,
 *   isIdle: import('vue').ComputedRef<boolean>,
 *   isRunning: import('vue').ComputedRef<boolean>,
 *   isPaused: import('vue').ComputedRef<boolean>,
 *   isCompleted: import('vue').ComputedRef<boolean>,
 *   canStart: import('vue').ComputedRef<boolean>,
 *   canPause: import('vue').ComputedRef<boolean>,
 *   canResume: import('vue').ComputedRef<boolean>,
 *   canReset: import('vue').ComputedRef<boolean>,
 *   start: () => void,
 *   pause: () => void,
 *   resume: () => void,
 *   complete: () => void,
 *   reset: () => void,
 * }}
 */
export function useTimerState() {
    const state = ref(/** @type {TimerState} */ ('idle'));

    const isIdle = computed(() => state.value === 'idle');
    const isRunning = computed(() => state.value === 'running');
    const isPaused = computed(() => state.value === 'paused');
    const isCompleted = computed(() => state.value === 'completed');

    const canStart = computed(() => state.value === 'idle');
    const canPause = computed(() => state.value === 'running');
    const canResume = computed(() => state.value === 'paused');
    const canReset = computed(() => state.value === 'paused' || state.value === 'completed');

    function start() {
        if (state.value === 'idle') state.value = 'running';
    }

    function pause() {
        if (state.value === 'running') state.value = 'paused';
    }

    function resume() {
        if (state.value === 'paused') state.value = 'running';
    }

    function complete() {
        if (state.value === 'running') state.value = 'completed';
    }

    function reset() {
        if (state.value === 'paused' || state.value === 'completed') {
            state.value = 'idle';
        }
    }

    return {
        state,
        isIdle,
        isRunning,
        isPaused,
        isCompleted,
        canStart,
        canPause,
        canResume,
        canReset,
        start,
        pause,
        resume,
        complete,
        reset,
    };
}
