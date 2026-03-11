<script setup>
import { Head } from '@inertiajs/vue3';
import { useTimerState } from '../composables/useTimerState';

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
    reset,
} = useTimerState();
</script>

<template>
    <Head title="Timer" />

    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <h1 class="text-3xl font-bold mb-8">IntervalState</h1>
        <p class="text-slate-400 mb-4">Interval / CrossFit Training Timer</p>

        <div class="text-6xl font-mono tabular-nums tracking-wider mb-2">
            00:00
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
