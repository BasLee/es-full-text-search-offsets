/**
 * 'Private Use Area' characters:
 */
export const START_MARKER = '\ue000';
export const END_MARKER = '\ue001';
export const MARKERS = new RegExp(`[${START_MARKER}${END_MARKER}]`, 'g');