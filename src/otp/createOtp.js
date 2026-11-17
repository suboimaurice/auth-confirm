import { createOtpInputs } from "./otpInputs.js";
import { createOtpTimer } from "./otpTimer.js";
import { createOtpVerifier } from "./verifyOtp.js";

import { COPY } from "../config/messages.js";
import { getActionIcon } from "../helpers/icons.js";
import { createModalState } from "../confirmation/modalState.js";

/**

* Creates the OTP modal controller.

* 

* Responsibilities:

* - Opening and closing the OTP modal.

* - Creating and removing OTP inputs.

* - Managing the resend countdown.

* - Verifying OTP codes.

* - Resending OTP codes.

* - Handling loading and error states.

* 

* Modal lifecycle state is managed by modalState.js.

* 

* @param {Object} elements - Modal DOM elements.

* @param {Object} config - AuthConfirm configuration.

* @param {Object} focus - Modal focus manager.

* 

* @returns {Object} OTP controller.
  */
export function createOtp(elements, config, focus) {

    const state = createModalState();

    let inputManager = null;
    let timer = null;

    let otpContainer = null;
    let resendButton = null;

    /* ----------------------------------
    CALLBACK HELPER
    ---------------------------------- */

    /**
    
    * Executes callbacks safely.
    
    * 
    
    * Prevents callback errors from
    
    * interrupting the OTP lifecycle.
    
    * 
    
    * @param {Function} callback
    
    * @param {...any} args
      */
    function callSafely(callback, ...args) {

        if (typeof callback !== "function") return;

        try {
            callback(...args);
        } catch (error) {
            console.error("AuthConfirm OTP callback error:", error);
        }
    }

    /* ----------------------------------
    ACTIVE SETTINGS
    ---------------------------------- */

    /**
    
    * Returns the active OTP settings.
      */
    function getSettings() {
        return state.settings || config.otp;
    }

    /**
    
    * Returns the configured OTP length.
      */
    function getLength() {
        return getSettings().length || 6;
    }

    /* ----------------------------------
    ERROR HANDLING
    ---------------------------------- */

    function showError(message) {

        elements.error.textContent = message || "";

        elements.error.hidden = !message;

    }

    function clearError() {
        showError("");
    }

    /* ----------------------------------
    LOADING STATE
    ---------------------------------- */

    /**
    
    * Updates the processing interface.
    
    * 
    
    * @param {boolean} value
      */
    function setProcessing(value) {

        inputManager?.setDisabled(value);

        elements.confirmButton.disabled = value;

        if (resendButton) {

            resendButton.disabled =
                value || !timer?.isReady;

        }

        elements.confirmButton.textContent = value
            ? getSettings().loadingText || "Please wait..."
            : getSettings().confirmText || "Verify";
    }

    /* ----------------------------------
    OTP INTERFACE
    ---------------------------------- */

    /**
    
    * Creates the OTP interface.
      */
    function createInterface() {

        const settings = getSettings();

        otpContainer = document.createElement("div");

        otpContainer.className = "ac-otp-container";

        elements.message.insertAdjacentElement(
            "afterend",
            otpContainer
        );

        // Input container
        const inputContainer = document.createElement("div");

        inputContainer.className = "ac-otp-inputs";

        otpContainer.appendChild(inputContainer);

        // Resend area
        const resendArea = document.createElement("div");

        resendArea.className = "ac-otp-resend-area";

        resendButton = document.createElement("button");

        resendButton.type = "button";

        resendButton.className = "ac-otp-resend";

        resendButton.textContent =
            settings.resendText || "Resend code";

        resendArea.appendChild(resendButton);

        otpContainer.appendChild(resendArea);

        // Resend event
        resendButton.addEventListener(
            "click",
            handleResend
        );

        // OTP inputs
        inputManager = createOtpInputs(
            inputContainer,
            getLength(),
            code => {

                // Automatically verify when all digits are entered.
                if (code.length === getLength()) {
                    verify(code);
                }

            }

        );

        // Resend timer
        timer = createOtpTimer(
            resendButton,
            settings.resendDelay ?? config.otp.resendDelay
        );
    }

    /**
    
    * Removes the OTP interface and its resources.
      */
    function removeInterface() {

        if (resendButton) {

            resendButton.removeEventListener(
                "click",
                handleResend
            );

        }

        inputManager?.destroy();

        timer?.destroy();

        inputManager = null;

        timer = null;

        otpContainer?.remove();

        otpContainer = null;

        resendButton = null;
    }

    /* ----------------------------------
    OPEN OTP MODAL
    ---------------------------------- */

    /**
    
    * Opens the OTP modal.
    
    * 
    
    * @param {Object} overrides
    
    * @returns {Promise<boolean>}
      */
    function open(overrides = {}) {

        if (state.isDestroyed) {
            return Promise.resolve(false);
        }

        if (state.isOpen) {

            return Promise.reject(
                new Error("A modal is already open.")
            );

        }

        const settings = {
            ...config.otp,
            ...overrides
        };

        const promise = state.open("otp", settings);

        // Configure modal appearance.
        elements.modal.classList.remove("ac-is-success");
        elements.modal.classList.add("ac-is-otp");
        elements.iconSymbol.innerHTML =
            getActionIcon("otp");

        elements.title.textContent =
            settings.title || COPY.otp.title;

        elements.message.textContent =
            settings.message || COPY.otp.message;

        elements.confirmButton.textContent =
            settings.confirmText || "Verify";

        elements.confirmButton.disabled = false;

        elements.cancelButton.disabled = false;

        elements.cancelButton.hidden =
            settings.showCancel === false ||
            config.showCancel === false;

        elements.cancelButton.textContent =
            settings.cancelText ||
            config.cancelText ||
            "Cancel";

        clearError();

        createInterface();

        elements.overlay.hidden = false;

        focus?.activate?.();

        // Focus the first OTP field when autoFocus is enabled.
        if (settings.autoFocus !== false) {
            inputManager?.focus?.();
        }

        timer?.start();

        callSafely(config.onOpen, "otp");

        return promise;
    }

    /* ----------------------------------
    CREATE VERIFIER
    ---------------------------------- */

    /**
    
    * Creates the OTP verification service.
    
    * 
    
    * Uses active settings while preserving
    
    * root-level callback compatibility.
      */
    function createVerifier() {

        const settings = getSettings();

        return createOtpVerifier({

            onVerify:
                settings.onVerify || config.onVerify,

            onResend:
                settings.onResend || config.onResend,

            verifyTimeout:
                settings.verifyTimeout ??
                config.otp.verifyTimeout,

            resendTimeout:
                settings.resendTimeout ??
                config.otp.resendTimeout

        });
    }

    /* ----------------------------------
    VERIFY OTP
    ---------------------------------- */

    /**
    
    * Verifies the supplied OTP.
    
    * 
    
    * @param {string|null} suppliedCode
      */
    async function verify(suppliedCode = null) {

        if (!state.isOpen || !state.startProcessing()) {
            return;
        }

        const code =
            suppliedCode ||
            inputManager?.getCode() ||
            "";

        if (code.length !== getLength()) {

            state.stopProcessing();

            showError("Enter the complete verification code.");

            return;

        }

        clearError();

        setProcessing(true);

        const controller = new AbortController();

        state.setController(controller);

        const verifier = createVerifier();

        try {

            const result = await verifier.verify(
                code,
                controller.signal
            );


            // Ignore responses from cancelled or destroyed modals.
            if (
                !state.isOpen ||
                state.isDestroyed ||
                controller.signal.aborted
            ) {
                return;
            }


            // Handle unsuccessful verification.
            if (
                result === false ||
                result?.success === false
            ) {

                throw new Error(
                    result?.message ||
                    getSettings().errorMessage ||
                    "Invalid verification code."
                );

            }


            callSafely(config.onOtpSuccess, result);

            finish(true, "verified");

        } catch (error) {

            if (
                !state.isOpen ||
                state.isDestroyed ||
                controller.signal.aborted
            ) {
                return;
            }

            if (error?.name === "AbortError") {
                return;
            }


            showError(

                error?.name === "TimeoutError"
                    ? getSettings().timeoutMessage ||
                    "Verification timed out. Please try again."

                    : error?.message ||
                    getSettings().errorMessage ||
                    "Unable to verify the code."

            );

        } finally {

            if (state.isOpen && !state.isDestroyed) {

                state.stopProcessing();

                state.setController(null);

                setProcessing(false);

            }

        }
    }

    /* ----------------------------------
    RESEND OTP
    ---------------------------------- */

    /**
    
    * Resends the OTP.
      */
    async function resend() {

        if (
            !state.isOpen ||
            state.isProcessing ||
            state.isDestroyed ||
            !timer?.isReady
        ) {
            return;
        }

        const verifier = createVerifier();

        const settings = getSettings();

        const resendCallback =
            settings.onResend || config.onResend;

        if (typeof resendCallback !== "function") {

            showError("Resending OTP is not configured.");

            return;

        }

        if (!state.startProcessing()) return;

        clearError();

        setProcessing(true);

        const controller = new AbortController();

        state.setController(controller);

        try {

            const result = await verifier.resend(
                controller.signal
            );


            if (
                !state.isOpen ||
                state.isDestroyed ||
                controller.signal.aborted
            ) {
                return;
            }


            if (
                result === false ||
                result?.success === false
            ) {

                throw new Error(
                    result?.message ||
                    "Unable to resend the code."
                );

            }


            // Reset inputs and restart countdown.
            inputManager?.reset();

            timer?.reset();

            timer?.start();


            callSafely(config.onResendSuccess, result);

        } catch (error) {

            if (
                !state.isOpen ||
                state.isDestroyed ||
                controller.signal.aborted
            ) {
                return;
            }

            if (error?.name === "AbortError") {
                return;
            }


            showError(

                error?.name === "TimeoutError"
                    ? settings.resendTimeoutMessage ||
                    "Resending timed out. Please try again."

                    : error?.message ||
                    "Unable to resend the code."

            );

        } finally {

            if (state.isOpen && !state.isDestroyed) {

                state.stopProcessing();

                state.setController(null);

                setProcessing(false);

            }

        }
    }

    /* ----------------------------------
    FINISH OTP FLOW
    ---------------------------------- */

    /**
    
    * Closes the OTP modal.
    
    * 
    
    * @param {boolean} result
    
    * @param {string|null} reason
      */
    function finish(result = false, reason = null) {

        if (!state.isOpen) return;

        // Abort pending requests.
        state.abort();

        // Close modal state and resolve its promise.
        state.close(result, reason);

        // Clean up interface.
        removeInterface();

        clearError();

        // Restore modal elements.
        elements.overlay.hidden = true;

        elements.confirmButton.disabled = false;

        elements.cancelButton.disabled = false;

        elements.confirmButton.textContent =
            config.confirmText || "Continue";

        // Remove OTP styling after the OTP modal closes.
        elements.modal.classList.remove("ac-is-otp", "ac-is-success");

        focus?.restore?.();

        callSafely(
            config.onClose,
            "otp",
            reason
        );
    }

    /* ----------------------------------
    CANCEL
    ---------------------------------- */

    /**
    
    * Cancels the OTP flow.
    
    * 
    
    * @param {string} reason
      */
    function handleCancel(reason = "cancel") {

        if (!state.isOpen) return;

        callSafely(
            config.onCancel,
            "otp",
            reason
        );

        finish(false, reason);
    }

    /* ----------------------------------
    BUTTON HANDLERS
    ---------------------------------- */

    /**
    
    * Verify button handler.
      */
    function handleConfirm() {
        verify();
    }

    /**
    
    * Resend button handler.
      */
    function handleResend() {
        resend();
    }

    /* ----------------------------------
    DESTROY
    ---------------------------------- */

    /**
    
    * Destroys the OTP controller.
      */
    function destroy() {

        if (state.isDestroyed) return;

        if (state.isOpen) {

            finish(false, "destroy");

        } else {

            removeInterface();

        }

        state.destroy();
    }

    /* ----------------------------------
    PUBLIC API
    ---------------------------------- */

    return {

        open,

        verify,

        resend,

        handleConfirm,

        handleCancel,

        handleResend,

        destroy,

        get isOpen() {
            return state.isOpen;
        },

        get isProcessing() {
            return state.isProcessing;
        }

    };

}