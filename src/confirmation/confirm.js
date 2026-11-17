import { COPY } from "../config/messages.js";
import { getActionIcon } from "../helpers/icons.js";
import { withTimeout } from "../helpers/withTimeout.js";
import { createModalState } from "./modalState.js";

/**
 * Creates the confirmation engine.
 *
 * Handles:
 * - Opening and closing confirmation modals.
 * - Confirm and cancel actions.
 * - Backend callback execution.
 * - Request timeouts.
 * - Loading and error states.
 * - Request cancellation.
 *
 * Modal lifecycle state is managed by modalState.js.
 *
 * @param {Object} elements - Modal DOM elements.
 * @param {Object} config - AuthConfirm configuration.
 * @param {Object} focus - Modal focus manager.
 * @returns {Object} Confirmation controller.
 */
export function createConfirmation(elements, config, focus) {

    const state = createModalState();

    const originalConfirmText = elements.confirmButton.textContent;


    /* ----------------------------------
       CALLBACK HELPER
    ---------------------------------- */

    /**
     * Executes an optional callback safely.
     *
     * Callback errors should not interrupt
     * the modal's lifecycle.
     */
    function callSafely(callback, ...args) {
        if (typeof callback !== "function") return;

        try {
            callback(...args);
        } catch (error) {
            console.error("AuthConfirm callback error:", error);
        }
    }


    /* ----------------------------------
       VISIBILITY
    ---------------------------------- */

    function setVisible(visible) {
        elements.overlay.hidden = !visible;

        if (visible) {
            focus?.activate?.();
        } else {
            focus?.restore?.();
        }
    }


    /* ----------------------------------
       LOADING STATE
    ---------------------------------- */

    function resetLoading(settings = state.settings) {
        elements.confirmButton.disabled = false;

        elements.confirmButton.textContent =
            settings?.confirmText || originalConfirmText;

        elements.confirmButton.classList.remove("ac-loading");

        elements.cancelButton.disabled = false;
    }


    function showLoading() {
        elements.confirmButton.disabled = true;

        elements.confirmButton.textContent =
            state.settings?.confirmation?.loadingText ||
            "Please wait...";

        elements.confirmButton.classList.add("ac-loading");

        elements.cancelButton.disabled = false;
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
       CONFIGURATION
    ---------------------------------- */

    function configure(action, settings) {
        const copy = COPY[ action ] || {};

        elements.iconSymbol.innerHTML = getActionIcon(action);

        elements.title.textContent =
            settings.title || copy.title || "";

        elements.message.textContent =
            settings.message || copy.message || "";

        elements.confirmButton.textContent =
            settings.confirmText ||
            copy.confirmText ||
            "Continue";

        elements.cancelButton.textContent =
            settings.cancelText ||
            config.cancelText ||
            "Cancel";

        elements.cancelButton.hidden =
            settings.showCancel === false ||
            config.showCancel === false;

        clearError();
    }


    /* ----------------------------------
       FINISH / CLOSE
    ---------------------------------- */

    /**
     * Closes the modal and resolves its promise.
     *
     * @param {boolean} result
     * @param {string|null} reason
     */
    function finish(result, reason = null) {
        if (!state.isOpen) return;

        const snapshot = {
            action: state.action,
            settings: state.settings
        };

        // Close the state and resolve the pending promise.
        state.close(result, reason);

        resetLoading(snapshot.settings);
        clearError();
        setVisible(false);

        callSafely(
            config.onClose,
            snapshot.action,
            reason
        );
    }


    /* ----------------------------------
       OPEN CONFIRMATION
    ---------------------------------- */

    /**
     * Opens a confirmation modal.
     *
     * @param {string} action
     * @param {Object} overrides
     * @returns {Promise<boolean>}
     */
    function confirm(action, overrides = {}) {

        if (state.isDestroyed) {
            return Promise.resolve(false);
        }

        if (state.isOpen) {
            return Promise.reject(
                new Error("A modal is already open.")
            );
        }

        const settings = {
            ...config,
            ...overrides
        };

        const promise = state.open(action, settings);

        configure(action, settings);

        setVisible(true);

        callSafely(config.onOpen, action);

        return promise;
    }


    /* ----------------------------------
       CANCEL
    ---------------------------------- */

    /**
     * Handles modal cancellation.
     *
     * @param {string} reason
     */
    function handleCancel(reason = "cancel") {
        if (!state.isOpen) return;

        const action = state.action;

        // Stop any active backend request.
        state.abort();

        callSafely(
            config.onCancel,
            action,
            reason
        );

        finish(false, reason);
    }


    /* ----------------------------------
       CONFIRM
    ---------------------------------- */

    /**
     * Handles the confirmation button.
     *
     * Executes the configured backend callback
     * and waits for its result.
     */
    async function handleConfirm() {

        if (!state.startProcessing()) return;

        clearError();
        showLoading();

        const controller = new AbortController();

        state.setController(controller);

        const action = state.action;
        const settings = state.settings;

        const callback =
            settings.onConfirm ||
            config.onConfirm;

        try {

            let result = true;

            if (typeof callback === "function") {

                const timeout =
                    settings.timeout ??
                    settings.confirmation?.timeout ??
                    config.confirmation?.timeout ??
                    15000;

                result = await withTimeout(
                    signal => callback(action, { signal }),
                    timeout,
                    controller.signal
                );
            }

            // The modal may have been cancelled or destroyed
            // while waiting for the backend.
            if (
                !state.isOpen ||
                state.isDestroyed ||
                controller.signal.aborted
            ) {
                return;
            }

            // Handle unsuccessful backend responses.
            if (
                result === false ||
                result?.success === false
            ) {
                throw new Error(
                    result?.message ||
                    settings.confirmation?.errorMessage ||
                    "The operation could not be completed."
                );
            }

            callSafely(
                config.onConfirmSuccess,
                action,
                result
            );

            finish(true, "confirmed");

        } catch (error) {

            // Ignore errors caused by cancellation or destruction.
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

            const message =
                error?.name === "TimeoutError"
                    ? settings.confirmation?.timeoutMessage ||
                    "The request timed out. Please try again."
                    : error?.message ||
                    settings.confirmation?.errorMessage ||
                    "Something went wrong. Please try again.";

            showError(message);

        } finally {

            // Restore the buttons only if the modal is still open.
            if (
                state.isOpen &&
                !state.isDestroyed
            ) {
                state.stopProcessing();

                state.setController(null);

                resetLoading(settings);
            }
        }
    }


    /* ----------------------------------
       DESTROY
    ---------------------------------- */

    /**
     * Destroys the confirmation controller.
     *
     * Aborts pending requests and closes
     * any currently open confirmation.
     */
    function destroy() {
        if (state.isDestroyed) return;

        if (state.isOpen) {
            state.abort();
            finish(false, "destroy");
        }

        state.destroy();
    }


    /* ----------------------------------
       PUBLIC API
    ---------------------------------- */

    return {
        confirm,
        handleConfirm,
        handleCancel,
        destroy,

        get isOpen() {
            return state.isOpen;
        },

        get isProcessing() {
            return state.isProcessing;
        }
    };
}