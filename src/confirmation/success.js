import { COPY } from "../config/messages.js";

import { getActionIcon } from "../helpers/icons.js";


/**
 * Creates the success notification controller.
 *
 * @param {Object} elements
 * @param {Object} config
 * @param {Object} focus
 *
 * @returns {Object}
 */
export function createSuccess(elements, config, focus) {

    let active = false;
    let destroyed = false;

    let resolvePromise = null;

    /**
     * Run optional user callbacks without allowing callback errors
     * to interrupt the modal lifecycle.
     */
    function callSafely(callback, ...args) {
        if (typeof callback !== "function") return;

        try {
            callback(...args);
        } catch (error) {
            console.error("AuthConfirm success callback error:", error);
        }
    }

    /**
     * Open success notification.
     *
     * @param {Object} overrides
     *
     * @returns {Promise<boolean>}
     */
    function showSuccess(overrides = {}) {

        if (destroyed) {
            return Promise.resolve(false);
        }

        if (active) {
            return Promise.reject(
                new Error("A modal is already open.")
            );
        }

        const settings = {
            ...COPY.success,
            ...overrides
        };

        active = true;

        elements.modal.classList.add("ac-is-success");

        elements.iconSymbol.innerHTML =
            getActionIcon("success");

        elements.title.textContent =
            settings.title || "Success";

        elements.message.textContent =
            settings.message || "";

        elements.error.hidden = true;

        elements.confirmButton.textContent =
            settings.confirmText || "Continue";

        elements.cancelButton.hidden = true;

        elements.confirmButton.disabled = false;

        elements.overlay.hidden = false;

        focus?.activate?.();

        // Create the promise before calling user code. A throwing callback
        // must never leave the success modal open without a resolvable promise.
        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        callSafely(config.onOpen, "success");

        return promise;
    }

    /**
     * Close success notification.
     */
    function close() {

        if (!active) return;

        active = false;

        elements.overlay.hidden = true;

        elements.modal.classList.remove("ac-is-success");

        focus?.restore?.();

        resolvePromise?.(true);

        resolvePromise = null;

        callSafely(config.onClose, "success");
    }

    /**
     * Shared event handlers.
     */
    function handleConfirm() {
        close();
    }

    function handleCancel() {
        close();
    }

    /**
     * Destroy module.
     */
    function destroy() {

        if (destroyed) return;

        destroyed = true;

        if (active) {
            close();
        }
    }

    return {

        showSuccess,

        handleConfirm,

        handleCancel,

        destroy,

        get isOpen() {
            return active;
        }

    };
}