/**
 * AuthConfirm - OTP Timer
 *
 * Creates and manages an OTP resend countdown.
 *
 * Responsibilities:
 * - Start and stop countdowns.
 * - Update resend button text.
 * - Control resend button availability.
 * - Reset countdown duration.
 * - Clean up timer resources.
 */


/**
 * Creates an OTP resend countdown.
 *
 * @param {HTMLButtonElement} button
 * @param {number} seconds
 *
 * @returns {Object}
 */
export function createOtpTimer(button, seconds = 30) {

    const defaultSeconds = normalizeTime(seconds);

    let remaining = defaultSeconds;

    let interval = null;

    let destroyed = false;


    /* ----------------------------------
       NORMALIZE TIME
    ---------------------------------- */

    /**
     * Convert a duration into a valid integer.
     *
     * @param {number} value
     * @returns {number}
     */
    function normalizeTime(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 30;
        }

        return Math.max(0, Math.floor(number));
    }


    /* ----------------------------------
       UPDATE BUTTON
    ---------------------------------- */

    /**
     * Update button text and availability.
     */
    function update() {

        if (destroyed) return;

        const ready = remaining <= 0;

        button.disabled = !ready;

        button.textContent = ready
            ? "Resend code"
            : `Resend code in ${remaining}s`;
    }


    /* ----------------------------------
       STOP TIMER
    ---------------------------------- */

    /**
     * Stop the countdown interval.
     */
    function stop() {

        if (interval !== null) {

            clearInterval(interval);

            interval = null;
        }
    }


    /* ----------------------------------
       START TIMER
    ---------------------------------- */

    /**
     * Start the countdown.
     */
    function start() {

        if (destroyed) return;

        // Prevent multiple intervals.
        stop();

        update();

        if (remaining <= 0) return;

        interval = setInterval(() => {

            remaining--;

            update();

            if (remaining <= 0) {
                stop();
            }

        }, 1000);
    }


    /* ----------------------------------
       RESET TIMER
    ---------------------------------- */

    /**
     * Reset the countdown.
     *
     * This does not automatically start it.
     *
     * @param {number} value
     */
    function reset(value = defaultSeconds) {

        if (destroyed) return;

        stop();

        remaining = normalizeTime(value);

        update();
    }


    /* ----------------------------------
       DESTROY TIMER
    ---------------------------------- */

    /**
     * Destroy the timer and release resources.
     */
    function destroy() {

        if (destroyed) return;

        stop();

        destroyed = true;
    }


    /* ----------------------------------
       PUBLIC API
    ---------------------------------- */

    return {

        start,

        stop,

        reset,

        destroy,

        get isReady() {
            return !destroyed && remaining <= 0;
        },

        get remaining() {
            return remaining;
        },

        get isRunning() {
            return interval !== null;
        }

    };

}