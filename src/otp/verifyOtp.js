import { withTimeout } from "../helpers/withTimeout.js";


/**
 * Creates an OTP verification controller.
 *
 * @param {Object} options
 *
 * @returns {Object}
 */
export function createOtpVerifier({

    onVerify,
    onResend,

    verifyTimeout = 15000,
    resendTimeout = 15000

}) {

    /**
     * Verify an OTP code.
     *
     * @param {string} code
     * @param {AbortSignal|null} externalSignal
     *
     * @returns {Promise<*>}
     */
    async function verify(code, externalSignal = null) {

        if (typeof onVerify !== "function") {
            throw new Error(
                "An onVerify callback is required."
            );
        }

        return withTimeout(

            signal => onVerify(code, { signal }),

            verifyTimeout,

            externalSignal

        );
    }

    /**
     * Request a new OTP.
     *
     * @param {AbortSignal|null} externalSignal
     *
     * @returns {Promise<*>}
     */
    async function resend(externalSignal = null) {

        if (typeof onResend !== "function") {
            throw new Error(
                "An onResend callback is required."
            );
        }

        return withTimeout(

            signal => onResend({ signal }),

            resendTimeout,

            externalSignal

        );
    }

    return {
        verify,
        resend
    };
}