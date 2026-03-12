/**
 * Config-driven interval presets.
 * Each preset defines work/rest durations and number of rounds.
 */

/** @typedef {{ id: string, name: string, workSeconds: number, restSeconds: number, rounds: number }} IntervalPreset */

/** @type {IntervalPreset[]} */
export const INTERVAL_PRESETS = [
    {
        id: 'tabata',
        name: 'Tabata',
        workSeconds: 20,
        restSeconds: 10,
        rounds: 8,
    },
    {
        id: 'tabata-short',
        name: 'Tabata Short',
        workSeconds: 15,
        restSeconds: 10,
        rounds: 6,
    },
    {
        id: 'hiit',
        name: 'HIIT',
        workSeconds: 45,
        restSeconds: 15,
        rounds: 8,
    },
];

/**
 * @param {string} id
 * @returns {IntervalPreset | undefined}
 */
export function getPresetById(id) {
    return INTERVAL_PRESETS.find((p) => p.id === id);
}

/**
 * @param {IntervalPreset} preset
 * @returns {IntervalPreset}
 */
export function clonePreset(preset) {
    return {
        id: preset.id,
        name: preset.name,
        workSeconds: preset.workSeconds,
        restSeconds: preset.restSeconds,
        rounds: preset.rounds,
    };
}
