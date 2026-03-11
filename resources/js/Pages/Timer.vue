<script setup>
import { Head } from '@inertiajs/vue3';
</script>

<template>
    <Head title="Timer" />

    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <h1 class="text-3xl font-bold mb-8">IntervalState</h1>
        <p class="text-slate-400 mb-4">Interval / CrossFit Training Timer</p>
        <div class="text-6xl font-mono tabular-nums tracking-wider">
            00:00
        </div>
        <p class="text-slate-500 text-sm mt-8">Timer interface/p>
    </div>
</template>
