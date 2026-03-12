/**
 * Audio cues for timer events.
 * Uses Web Audio API for beeps (no external files).
 * Must be unlocked by user gesture before playing.
 */

let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Play a short beep.
 * @param {number} [frequency=800] - Hz
 * @param {number} [duration=0.1] - seconds
 * @param {number} [volume=0.3] - 0-1
 * @param {OscillatorType} [type='sine'] - Waveform type
 */
export function playBeep(frequency = 800, duration = 0.1, volume = 0.3, type = 'sine') {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch {
        // Audio not supported or blocked
    }
}

/**
 * Play a double beep (e.g. for workout start).
 */
export function playStartCue() {
    playBeep(600, 0.15, 0.6);
    setTimeout(() => playBeep(800, 0.2, 0.7), 150);
}

/**
 * Play completion cue (e.g. workout done).
 */
export function playCompleteCue() {
    playBeep(400, 0.2, 0.6);
    setTimeout(() => playBeep(600, 0.2, 0.65), 200);
    setTimeout(() => playBeep(800, 0.3, 0.75), 400);
}

/**
 * Play phase change cue (e.g. work → rest, rest → work).
 * Triple square-wave beep: sharp, loud, cuts through workout noise.
 */
export function playPhaseCue() {
    playBeep(880, 0.15, 0.7, 'square');
    setTimeout(() => playBeep(880, 0.15, 0.7, 'square'), 100);
    setTimeout(() => playBeep(880, 0.2, 0.75, 'square'), 220);
}

/**
 * Unlock audio on first user interaction (required by browsers).
 */
export function unlockAudio() {
    if (typeof window === 'undefined') return;
    getAudioContext().resume();
}
