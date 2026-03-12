<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useTimerState } from '../composables/useTimerState';
import { useTimerEngine } from '../composables/useTimerEngine';
import { useIntervalEngine } from '../composables/useIntervalEngine';
import { useLeadUpEngine } from '../composables/useLeadUpEngine';
import { INTERVAL_PRESETS, getPresetById } from '../config/intervalPresets';
import { unlockAudio, playStartCue, playCompleteCue, playPhaseCue } from '../composables/useAudioCues';

const {
    state,
    isIdle,
    isLeadup,
    isRunning,
    isPaused,
    isCompleted,
    canStart,
    canPause,
    canResume,
    canReset,
    start,
    transitionToRunning,
    pause,
    resume,
    complete,
    reset,
} = useTimerState();

const timerMode = ref('simple');
const leadUpSeconds = ref(10);
const intervalPresetId = ref('tabata');
const customWork = ref(30);
const customRest = ref(15);
const customRounds = ref(5);

const isSimpleMode = computed(() => timerMode.value === 'simple');
const isIntervalMode = computed(() => timerMode.value === 'interval');
const isCustomMode = computed(() => timerMode.value === 'custom');
const isIntervalOrCustomMode = computed(() => isIntervalMode.value || isCustomMode.value);

const intervalConfig = computed(() => {
    if (isCustomMode.value) {
        return {
            workSeconds: customWork.value,
            restSeconds: customRest.value,
            rounds: customRounds.value,
        };
    }
    const preset = getPresetById(intervalPresetId.value);
    return preset
        ? { workSeconds: preset.workSeconds, restSeconds: preset.restSeconds, rounds: preset.rounds }
        : INTERVAL_PRESETS[0];
});

function handleComplete() {
    playCompleteCue();
    announcement.value = 'Workout complete';
    complete();
}

const timerEngine = useTimerEngine(state, {
    mode: 'up',
    durationSeconds: 60,
    onCountDownComplete: handleComplete,
    isActiveRef: isSimpleMode,
});

const intervalEngine = useIntervalEngine(
    state,
    intervalConfig.value,
    handleComplete,
    isIntervalOrCustomMode,
    playPhaseCue
);

const announcement = ref('');

function onLeadUpComplete() {
    playStartCue();
    announcement.value = 'Workout started';
    transitionToRunning();
}

const leadUpEngine = useLeadUpEngine(state, leadUpSeconds, onLeadUpComplete);

const formattedTime = computed(() => {
    if (isLeadup.value) return leadUpEngine.formattedTime.value;
    return isSimpleMode.value ? timerEngine.formattedTime.value : intervalEngine.formattedTime.value;
});

const mode = computed(() => timerEngine.mode);
const setMode = (m) => timerEngine.setMode(m);

const phaseLabel = computed(() => intervalEngine.phaseLabel.value);
const roundProgress = computed(() => intervalEngine.roundProgress.value);

function applyIntervalConfig() {
    intervalEngine.setConfig(intervalConfig.value);
}

function handleStart() {
    unlockAudio();
    if (isIntervalOrCustomMode.value) applyIntervalConfig();
    start(leadUpSeconds.value);
}

function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') {
        e.preventDefault();
        if (canStart.value) handleStart();
        else if (canPause.value) pause();
        else if (canResume.value) resume();
    }
    if (e.code === 'KeyR' && e.ctrlKey) {
        e.preventDefault();
        if (canReset.value) reset();
    }
}

watch(state, (newState) => {
    if (newState === 'idle') announcement.value = '';
});

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

const stateIndicatorClass = computed(() => {
    if (isIdle.value) return 'bg-slate-800/50';
    if (isLeadup.value) return 'bg-cyan-900/40';
    if (isRunning.value) return 'bg-amber-900/40';
    if (isPaused.value) return 'bg-slate-700/50';
    if (isCompleted.value) return 'bg-emerald-900/40';
    return 'bg-slate-800/50';
});
</script>

<template>
    <Head title="Timer" />

    <div
        role="application"
        aria-label="Interval training timer"
        class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6"
    >
        <div aria-live="polite" aria-atomic="true" class="sr-only">{{ announcement }}</div>
        <h1 class="text-3xl font-bold mb-8">IntervalState</h1>
        <p class="text-slate-400 mb-4">Interval / CrossFit Training Timer</p>

        <!-- Mode selector (idle only) -->
        <div v-if="isIdle" class="flex flex-col gap-4 mb-6 items-center">
            <div class="flex gap-2 justify-center">
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900',
                        isSimpleMode
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    :aria-pressed="isSimpleMode"
                    @click="timerMode = 'simple'"
                >
                    Simple
                </button>
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900',
                        isIntervalMode
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    :aria-pressed="isIntervalMode"
                    @click="timerMode = 'interval'"
                >
                    Interval
                </button>
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900',
                        isCustomMode
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    :aria-pressed="isCustomMode"
                    @click="timerMode = 'custom'"
                >
                    Custom
                </button>
            </div>

            <!-- Simple: count up/down -->
            <div v-if="isIdle && isSimpleMode" class="flex gap-2 justify-center">
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900',
                        mode === 'up'
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    :aria-pressed="mode === 'up'"
                    @click="setMode('up')"
                >
                    Count up
                </button>
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900',
                        mode === 'down'
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    :aria-pressed="mode === 'down'"
                    @click="setMode('down')"
                >
                    Count down
                </button>
            </div>

            <!-- Simple: duration (count down only) -->
            <div v-if="isIdle && isSimpleMode && mode === 'down'" class="flex items-center gap-2 justify-center">
                <label for="duration" class="text-slate-400 text-sm">Duration (seconds)</label>
                <input
                    id="duration"
                    :value="timerEngine.durationSeconds"
                    type="number"
                    min="1"
                    max="3600"
                    class="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-slate-100 text-center font-mono"
                    @input="(e) => timerEngine.setDuration(parseInt(e.target.value) || 60)"
                />
            </div>

            <!-- Interval: preset list -->
            <div v-if="isIdle && isIntervalMode" class="flex flex-col gap-2 items-center">
                <label for="preset" class="text-slate-400 text-sm">Preset</label>
                <select
                    id="preset"
                    v-model="intervalPresetId"
                    class="px-3 py-2 rounded bg-slate-900 border border-slate-600 text-slate-100"
                    @change="applyIntervalConfig"
                >
                    <option
                        v-for="preset in INTERVAL_PRESETS"
                        :key="preset.id"
                        :value="preset.id"
                    >
                        {{ preset.name }} ({{ preset.workSeconds }}s / {{ preset.restSeconds }}s × {{ preset.rounds }})
                    </option>
                </select>
            </div>

            <!-- Lead-up (all modes) -->
            <div v-if="isIdle" class="flex items-center gap-2 justify-center">
                <label for="leadup" class="text-slate-400 text-sm">Lead-up (s)</label>
                <input
                    id="leadup"
                    v-model.number="leadUpSeconds"
                    type="number"
                    min="0"
                    max="60"
                    class="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-slate-100 text-center font-mono"
                />
                <span class="text-slate-500 text-sm">0 = start immediately</span>
            </div>

            <!-- Custom: work/rest/rounds -->
            <div v-if="isIdle && isCustomMode" class="flex items-center gap-3 flex-wrap justify-center">
                <div class="flex items-center gap-2">
                    <label for="work" class="text-slate-400 text-sm">Work (s)</label>
                    <input
                        id="work"
                        v-model.number="customWork"
                        type="number"
                        min="1"
                        max="300"
                        class="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-slate-100 text-center font-mono"
                        @change="applyIntervalConfig"
                    />
                </div>
                <div class="flex items-center gap-2">
                    <label for="rest" class="text-slate-400 text-sm">Rest (s)</label>
                    <input
                        id="rest"
                        v-model.number="customRest"
                        type="number"
                        min="1"
                        max="300"
                        class="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-slate-100 text-center font-mono"
                        @change="applyIntervalConfig"
                    />
                </div>
                <div class="flex items-center gap-2">
                    <label for="rounds" class="text-slate-400 text-sm">Rounds</label>
                    <input
                        id="rounds"
                        v-model.number="customRounds"
                        type="number"
                        min="1"
                        max="50"
                        class="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-slate-100 text-center font-mono"
                        @change="applyIntervalConfig"
                    />
                </div>
            </div>
        </div>

        <!-- Timer display with state-indicating background -->
        <div
            :class="[
                'rounded-2xl px-12 py-10 transition-colors duration-300 transition-transform duration-300',
                stateIndicatorClass,
                isCompleted ? 'timer-complete' : '',
            ]"
            role="timer"
            :aria-label="`${formattedTime}${isIntervalOrCustomMode && isRunning ? `, ${phaseLabel}, round ${roundProgress}` : ''}`"
        >
            <div class="text-[12rem] font-mono tabular-nums tracking-wider mb-2 leading-none">
                {{ formattedTime }}
            </div>
            <div class="flex flex-col items-center gap-2">
                <template v-if="isIntervalOrCustomMode && isRunning">
                    <Transition name="phase" mode="out-in">
                        <p
                            :key="phaseLabel"
                            :class="[
                                'text-4xl font-medium',
                                intervalEngine.currentPhase.value === 'work'
                                    ? 'text-amber-300'
                                    : 'text-cyan-300',
                            ]"
                        >
                            {{ phaseLabel }}
                        </p>
                    </Transition>
                    <p class="text-slate-400 text-3xl">
                        Round {{ roundProgress }}
                    </p>
                </template>
            </div>
        </div>

        <div class="flex gap-3 flex-wrap justify-center mt-8">
            <button
                v-if="canStart"
                type="button"
                class="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Start timer"
                @click="handleStart"
            >
                Start
            </button>
            <button
                v-if="canPause"
                type="button"
                class="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Pause timer"
                @click="pause"
            >
                Pause
            </button>
            <button
                v-if="canResume"
                type="button"
                class="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Resume timer"
                @click="resume"
            >
                Resume
            </button>
            <button
                v-if="canReset"
                type="button"
                class="px-6 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Reset timer"
                @click="reset"
            >
                Reset
            </button>
        </div>
    </div>
</template>

<style scoped>
.phase-enter-active,
.phase-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.phase-enter-from,
.phase-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.timer-complete {
    animation: complete-pulse 0.6s ease-out;
}

@keyframes complete-pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
    50% {
        transform: scale(1.02);
        box-shadow: 0 0 24px 4px rgba(16, 185, 129, 0.3);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}
</style>
