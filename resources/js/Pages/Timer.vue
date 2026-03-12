<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { useTimerState } from '../composables/useTimerState';
import { useTimerEngine } from '../composables/useTimerEngine';
import { useIntervalEngine } from '../composables/useIntervalEngine';
import { INTERVAL_PRESETS, getPresetById } from '../config/intervalPresets';

const {
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
} = useTimerState();

const timerMode = ref('simple');
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

const timerEngine = useTimerEngine(state, {
    mode: 'up',
    durationSeconds: 60,
    onCountDownComplete: () => complete(),
    isActiveRef: isSimpleMode,
});

const intervalEngine = useIntervalEngine(
    state,
    intervalConfig.value,
    () => complete(),
    isIntervalOrCustomMode
);

const formattedTime = computed(() =>
    isSimpleMode.value ? timerEngine.formattedTime.value : intervalEngine.formattedTime.value
);

const mode = computed(() => timerEngine.mode);
const setMode = (m) => timerEngine.setMode(m);

const phaseLabel = computed(() => intervalEngine.phaseLabel.value);
const roundProgress = computed(() => intervalEngine.roundProgress.value);

function applyIntervalConfig() {
    intervalEngine.setConfig(intervalConfig.value);
}
</script>

<template>
    <Head title="Timer" />

    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <h1 class="text-3xl font-bold mb-8">IntervalState</h1>
        <p class="text-slate-400 mb-4">Interval / CrossFit Training Timer</p>

        <!-- Mode selector (idle only) -->
        <div v-if="isIdle" class="flex flex-col gap-4 mb-6 items-center">
            <div class="flex gap-2 justify-center">
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        isSimpleMode
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    @click="timerMode = 'simple'"
                >
                    Simple
                </button>
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        isIntervalMode
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    @click="timerMode = 'interval'"
                >
                    Interval
                </button>
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        isCustomMode
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
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
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        mode === 'up'
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
                    @click="setMode('up')"
                >
                    Count up
                </button>
                <button
                    type="button"
                    :class="[
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        mode === 'down'
                            ? 'bg-slate-600 text-slate-100'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700',
                    ]"
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

        <div class="text-6xl font-mono tabular-nums tracking-wider mb-2">
            {{ formattedTime }}
        </div>
        <div class="flex flex-col items-center gap-1 mb-8">
            <p class="text-slate-500 text-sm" :class="{ 'text-amber-400': isRunning, 'text-emerald-400': isCompleted }">
                {{ state }}
            </p>
            <p v-if="isIntervalOrCustomMode && !isIdle" class="text-slate-400 text-sm">
                {{ phaseLabel }} · Round {{ roundProgress }}
            </p>
        </div>

        <div class="flex gap-3 flex-wrap justify-center">
            <button
                v-if="canStart"
                type="button"
                class="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors"
                @click="() => { if (isIntervalOrCustomMode) applyIntervalConfig(); start(); }"
            >
                Start
            </button>
            <button
                v-if="canPause"
                type="button"
                class="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium transition-colors"
                @click="pause"
            >
                Pause
            </button>
            <button
                v-if="canResume"
                type="button"
                class="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors"
                @click="resume"
            >
                Resume
            </button>
            <button
                v-if="canReset"
                type="button"
                class="px-6 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 font-medium transition-colors"
                @click="reset"
            >
                Reset
            </button>
        </div>
    </div>
</template>
