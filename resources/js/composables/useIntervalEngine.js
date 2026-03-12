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

/** @typedef {'work' | 'rest'} IntervalPhase */

/**
 * Interval engine for Tabata and custom work/rest intervals.
 * Deterministic: ticks every second. Tracks current round and phase.
 *
 * @param {import('vue').Ref<'idle'|'running'|'paused'|'completed'>} stateRef
 * @param {Object} config
 * @param {number} config.workSeconds
 * @param {number} config.restSeconds
 * @param {number} config.rounds
 * @param {() => void} [onComplete]
 * @param {import('vue').Ref<boolean>} [isActiveRef] - When false, engine does not tick (for mode switching)
 * @param {() => void} [onPhaseChange] - Called when work↔rest phase changes
 */
export function useIntervalEngine(stateRef, config, onComplete, isActiveRef, onPhaseChange) {
    const workSeconds = ref(config.workSeconds);
    const restSeconds = ref(config.restSeconds);
    const totalRounds = ref(config.rounds);

    const currentRound = ref(1);
    const currentPhase = ref(/** @type {IntervalPhase} */ ('work'));
    const phaseRemaining = ref(config.workSeconds);

    let intervalId = null;

    const formattedTime = computed(() => formatTime(phaseRemaining.value));

    const phaseLabel = computed(() =>
        currentPhase.value === 'work' ? 'Work' : 'Rest'
    );

    const roundProgress = computed(
        () => `${currentRound.value} / ${totalRounds.value}`
    );

    function advancePhase() {
        if (currentPhase.value === 'work') {
            if (currentRound.value >= totalRounds.value) {
                stopInterval();
                onComplete?.();
                return;
            }
            currentPhase.value = 'rest';
            phaseRemaining.value = restSeconds.value;
            onPhaseChange?.();
        } else {
            currentRound.value += 1;
            currentPhase.value = 'work';
            phaseRemaining.value = workSeconds.value;
            onPhaseChange?.();
        }
    }

    function tick() {
        phaseRemaining.value -= 1;
        if (phaseRemaining.value <= 0) {
            advancePhase();
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
        currentRound.value = 1;
        currentPhase.value = 'work';
        phaseRemaining.value = workSeconds.value;
    }

    function setConfig(newConfig) {
        workSeconds.value = newConfig.workSeconds;
        restSeconds.value = newConfig.restSeconds;
        totalRounds.value = newConfig.rounds;
        phaseRemaining.value = workSeconds.value;
    }

    watch(
        () => stateRef.value,
        (newState) => {
            const active = isActiveRef ? isActiveRef.value : true;
            if (newState === 'running' && active) {
                startInterval();
            } else {
                stopInterval();
            }
            if (newState === 'idle') {
                currentRound.value = 1;
                currentPhase.value = 'work';
                phaseRemaining.value = workSeconds.value;
            }
        },
        { immediate: true }
    );

    if (isActiveRef) {
        watch(isActiveRef, (active) => {
            if (!active) stopInterval();
            else if (stateRef.value === 'running') startInterval();
        });
    }

    onUnmounted(stopInterval);

    return {
        formattedTime,
        currentPhase,
        currentRound,
        totalRounds,
        phaseLabel,
        roundProgress,
        phaseRemaining,
        workSeconds,
        restSeconds,
        setConfig,
        reset,
    };
}
