import { writable } from 'svelte/store';

export const view = writable<[number, number]>([0, 5]);
