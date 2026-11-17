/**
 * AuthConfirm - SVG Icons
 *
 * Returns SVG icons for supported actions.
 *
 * Usage:
 * getActionIcon("login");
 */

const ICONS = {

    login: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17l5-5-5-5"></path>
            <path d="M15 12H3"></path>
            <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"></path>
        </svg>
    `,

    logout: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 17l5-5-5-5"></path>
            <path d="M19 12H9"></path>
            <path d="M12 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6"></path>
        </svg>
    `,

    otp: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="2" width="14" height="20" rx="2"></rect>
            <path d="M9 6h6"></path>
            <path d="M9 17h6"></path>
            <path d="M12 11v2"></path>
        </svg>
    `,

    success: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6L9 17l-5-5"></path>
        </svg>
    `
};


/**
 * Get an SVG icon for an action.
 *
 * @param {string} action
 * @returns {string} SVG markup or empty string.
 */
export function getActionIcon(action) {

    return ICONS[ action ] || "";
}