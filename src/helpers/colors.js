/**
 * AuthConfirm - Colour Helpers
 *
 * Provides utilities for validating and detecting colours.
 */


/**
 * Check whether a value is a valid CSS colour.
 *
 * @param {string} color
 * @returns {boolean}
 */
export function validColor(color) {

    if (typeof color !== "string" || !color.trim()) {
        return false;
    }

    return CSS.supports("color", color);
}


/**
 * Detect the primary colour from a CSS variable.
 *
 * @param {string} variable
 * @returns {string|null}
 */
export function detectColor(variable = "--primary-color") {

    const color = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();

    return validColor(color) ? color : null;
}


/**
 * Resolve the primary colour.
 *
 * Priority:
 * 1. Explicitly provided colour.
 * 2. CSS variable.
 * 3. Fallback colour.
 *
 * @param {string|null} customColor
 * @param {string} fallback
 * @returns {string}
 */
export function getPrimaryColor(
    customColor = null,
    fallback = "#168653"
) {

    if (validColor(customColor)) {
        return customColor;
    }

    const detected = detectColor("--primary-color");

    return detected || fallback;
}