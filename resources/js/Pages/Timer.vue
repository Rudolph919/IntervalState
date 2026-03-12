<script setup>
import { Head } from '@inertiajs/vue3';
import { useTimerState } from '../composables/useTimerState';
import { useTimerEngine } from '../composables/useTimerEngine';

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

const {
    formattedTime,
    mode,
    durationSeconds,
    setMode,
} = useTimerEngine(state, {
    mode: 'up',
    durationSeconds: 60,
    onCountDownComplete: () => complete(),
});
</script>

<template>
    <Head title="Timer" />

    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <h1 class="text-3xl font-bold mb-8">IntervalState</h1>
        <p class="text-slate-400 mb-4">Interval / CrossFit Training Timer</p>

        <!-- Mode selector (idle only) -->
        <div v-if="isIdle" class="flex gap-2 mb-6">
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

        <!-- Duration (count down, idle only) -->
        <div v-if="isIdle && mode === 'down'" class="flex items-center gap-2 mb-4">
            <label for="duration" class="text-slate-400 text-sm">Duration (seconds)</label>
            <input
                id="duration"
                v-model.number="durationSeconds"
                type="number"
                min="1"
                max="3600"
                class="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-slate-100 text-center font-mono"
            />
        </div>

        <div class="text-6xl font-mono tabular-nums tracking-wider mb-2">
            {{ formattedTime }}
        </div>
        <p class="text-slate-500 text-sm mb-8" :class="{ 'text-amber-400': isRunning, 'text-emerald-400': isCompleted }">
            {{ state }}
        </p>

        <div class="flex gap-3 flex-wrap justify-center">
            <button
                v-if="canStart"
                type="button"
                class="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors"
                @click="start"
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
