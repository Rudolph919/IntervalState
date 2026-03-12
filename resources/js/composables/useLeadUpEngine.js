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
 * Lead-up countdown before workout starts.
 * Counts down from leadUpSeconds; on 0, calls onComplete to transition to running.
 *
 * @param {import('vue').Ref<'idle'|'leadup'|'running'|'paused'|'completed'>} stateRef
 * @param {import('vue').Ref<number>} leadUpSecondsRef
 * @param {() => void} onComplete - Called when countdown reaches 0 (transition to running)
 */
export function useLeadUpEngine(stateRef, leadUpSecondsRef, onComplete) {
    const remainingSeconds = ref(0);

    let intervalId = null;

    const formattedTime = computed(() => formatTime(remainingSeconds.value));

    function tick() {
        remainingSeconds.value -= 1;
        if (remainingSeconds.value <= 0) {
            stopInterval();
            onComplete();
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

    watch(
        () => stateRef.value,
        (newState) => {
            if (newState === 'leadup') {
                remainingSeconds.value = leadUpSecondsRef.value;
                startInterval();
            } else {
                stopInterval();
            }
            if (newState === 'idle') {
                remainingSeconds.value = 0;
            }
        },
        { immediate: true }
    );

    onUnmounted(stopInterval);

    return {
        formattedTime,
        remainingSeconds,
    };
}
