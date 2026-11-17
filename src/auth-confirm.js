import { DEFAULTS } from "./config/defaults.js";

import { createModal } from "./modals/createModal.js";

import { bindModalEvents } from "./modals/bind.js";

import { createFocusManager } from "./helpers/focus.js";

import { getPrimaryColor, validColor } from "./helpers/colors.js";

import { createConfirmation } from "./confirmation/confirm.js";

import { createSuccess } from "./confirmation/success.js";

import { createOtp } from "./otp/createOtp.js";

import { bindAuthButtons } from "./binding/buttonBinding.js";


/**
 * Merge user configuration with defaults.
 */
function mergeConfig(options = {}) {

    return {

        ...DEFAULTS,

        ...options,

        confirmation: {
            ...DEFAULTS.confirmation,
            ...options.confirmation
        },

        otp: {
            ...DEFAULTS.otp,
            ...options.otp
        }

    };
}


/**
 * Creates an AuthConfirm instance.
 *
 * @param {Object} options
 *
 * @returns {Object}
 */
export function createAuthConfirm(options = {}) {

    const config = mergeConfig(options);

    let destroyed = false;

    let activeMode = null;

    let activeHandlers = {};

    let buttonCleanup = null;

    let themeMediaQuery = null;
    let themeChangeHandler = null;

    /**
     * Create modal elements.
     */
    const elements = createModal(config);

    /**
     * Focus management.
     */
    const focus = createFocusManager(
        elements.modal
    );

    /**
     * Apply primary color.
     */
    const primaryColor = getPrimaryColor(
        config.primaryColor
    );

    if (primaryColor) {

        elements.modal.style.setProperty(
            "--ac-primary",
            primaryColor
        );

    }

    const dangerColor = validColor(config.dangerColor)
        ? config.dangerColor
        : "#c92d45";

    if (dangerColor) {
        elements.modal.style.setProperty(
            "--ac-danger",
            dangerColor
        );
    }

    /**
     * Apply theme.
     */
    function setTheme(theme = "auto") {

        if (destroyed) return;

        const allowedThemes = [
            "light",
            "dark",
            "auto"
        ];

        if (!allowedThemes.includes(theme)) {
            throw new Error(
                `Invalid theme: ${theme}`
            );
        }

        // Remove the previous system-theme listener before changing modes.
        if (themeMediaQuery && themeChangeHandler) {
            if (themeMediaQuery.removeEventListener) {
                themeMediaQuery.removeEventListener(
                    "change",
                    themeChangeHandler
                );
            } else if (themeMediaQuery.removeListener) {
                // Older browsers.
                themeMediaQuery.removeListener(themeChangeHandler);
            }
        }

        themeMediaQuery = null;
        themeChangeHandler = null;

        const applyTheme = resolvedTheme => {
            elements.modal.dataset.theme = resolvedTheme;

            try {
                config.onThemeChange?.(resolvedTheme);
            } catch (error) {
                console.error("AuthConfirm theme callback error:", error);
            }
        };

        if (theme === "auto" && typeof window.matchMedia === "function") {
            themeMediaQuery = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

            themeChangeHandler = event => {
                if (!destroyed) {
                    applyTheme(event.matches ? "dark" : "light");
                }
            };

            if (themeMediaQuery.addEventListener) {
                themeMediaQuery.addEventListener(
                    "change",
                    themeChangeHandler
                );
            } else if (themeMediaQuery.addListener) {
                // Older browsers.
                themeMediaQuery.addListener(themeChangeHandler);
            }

            applyTheme(themeMediaQuery.matches ? "dark" : "light");
            return;
        }

        // If matchMedia is unavailable, auto safely falls back to light.
        applyTheme(theme === "auto" ? "light" : theme);
    }

    /**
     * Change primary color.
     */
    function setPrimaryColor(color) {

        if (destroyed) return;

        const resolvedColor = getPrimaryColor(color);

        if (!resolvedColor) {
            throw new Error("Invalid primary color.");
        }

        elements.modal.style.setProperty(
            "--ac-primary",
            resolvedColor
        );
    }

    /**
     * Set active modal mode.
     */
    function setMode(mode, handlers = {}) {

        activeMode = mode;

        activeHandlers = handlers;
    }

    /**
     * Clear active modal mode.
     */
    function clearMode(mode) {

        if (activeMode !== mode) return;

        activeMode = null;

        activeHandlers = {};
    }

    /**
     * Create confirmation controller.
     */
    const confirmation = createConfirmation(
        elements,
        config,
        focus
    );

    /**
     * Create success controller.
     */
    const success = createSuccess(
        elements,
        config,
        focus
    );

    /**
     * Create OTP controller.
     */
    const otp = createOtp(
        elements,
        config,
        focus
    );

    /**
     * Keep active handlers synchronized.
     */
    function syncMode() {

        if (confirmation.isOpen) {

            setMode("confirmation", {

                onConfirm: confirmation.handleConfirm,

                onCancel: confirmation.handleCancel

            });

            return;
        }

        if (otp.isOpen) {

            setMode("otp", {

                onConfirm: otp.handleConfirm,

                onCancel: otp.handleCancel

            });

            return;
        }

        if (success.isOpen) {

            setMode("success", {

                onConfirm: success.handleConfirm,

                onCancel: success.handleCancel

            });

            return;
        }

        activeMode = null;

        activeHandlers = {};
    }

    /**
     * Shared modal event handlers.
     */
    const unbindModalEvents = bindModalEvents(

        elements,

        config,

        () => activeHandlers,

        focus

    );

    /**
 * Public confirmation method.
 *
 * Automatically displays a success notification
 * after a successful Login or Logout.
 */
    async function confirm(action, overrides = {}) {

        if (destroyed) return false;

        if (![ "login", "logout" ].includes(action)) {
            throw new Error(
                `Unsupported action: ${action}`
            );
        }

        if (activeMode) {
            throw new Error("A modal is already open.");
        }

        const promise = confirmation.confirm(
            action,
            overrides
        );

        syncMode();

        let result;

        try {
            result = await promise;

        } finally {
            clearMode("confirmation");
        }

        // Only display success after backend confirmation.
        if (result === true && !destroyed) {

            const successSettings = overrides.success || {};

            await showSuccess({

                title: successSettings.title ||
                    (action === "login"
                        ? "Login Successful"
                        : "Logout Successful"),

                message: successSettings.message ||
                    (action === "login"
                        ? "You have successfully logged in."
                        : "You have successfully logged out."),

                ...successSettings

            });
        }

        return result;
    }

    /**
     * Public OTP method.
     *
     * Automatically displays a success notification
     * after successful OTP verification.
     */
    async function confirmOtp(overrides = {}) {

        if (destroyed) return false;

        if (activeMode) {
            throw new Error("A modal is already open.");
        }

        const promise = otp.open(overrides);

        syncMode();

        let result;

        try {
            result = await promise;

        } finally {
            clearMode("otp");
        }

        // Display success only after successful verification.
        if (result === true && !destroyed) {

            const successSettings = overrides.success || {};

            await showSuccess({

                title: successSettings.title || "OTP Verified",

                message: successSettings.message ||
                    "Your OTP has been successfully verified.",

                ...successSettings

            });
        }

        return result;
    }

    /**
     * Public success method.
     */
    async function showSuccess(overrides = {}) {

        if (destroyed) return false;

        if (activeMode) {
            throw new Error("A modal is already open.");
        }

        const promise = success.showSuccess(overrides);

        syncMode();

        try {
            return await promise;
        } finally {
            clearMode("success");
        }
    }

    /**
     * Bind authentication buttons.
     */
    function bindButtons(selector) {

        if (destroyed) {
            throw new Error(
                "AuthConfirm has been destroyed."
            );
        }

        // Prevent duplicate document listeners.
        buttonCleanup?.();

        buttonCleanup = bindAuthButtons({

            confirm,

            selector: selector || config.buttonSelector || "[data-auth-confirm]"

        });

        return buttonCleanup;
    }

    /**
     * Initialize theme.
     */
    setTheme(config.theme);

    /**
     * Destroy instance.
     */
    function destroy() {

        if (destroyed) return;

        destroyed = true;

        // Remove document-level event listeners.
        unbindModalEvents();

        buttonCleanup?.();

        buttonCleanup = null;

        // Stop listening for operating-system theme changes.
        if (themeMediaQuery && themeChangeHandler) {
            if (themeMediaQuery.removeEventListener) {
                themeMediaQuery.removeEventListener(
                    "change",
                    themeChangeHandler
                );
            } else if (themeMediaQuery.removeListener) {
                themeMediaQuery.removeListener(themeChangeHandler);
            }
        }

        themeMediaQuery = null;
        themeChangeHandler = null;

        // Destroy all controllers.
        confirmation.destroy();

        otp.destroy();

        success.destroy();

        // Remove modal.
        elements.overlay.remove();

        activeMode = null;

        activeHandlers = {};

        config.onDestroy?.();
    }

    return {

        confirm,

        confirmLogin(overrides = {}) {
            return confirm("login", overrides);
        },

        confirmLogout(overrides = {}) {
            return confirm("logout", overrides);
        },

        confirmOtp,

        showSuccess,

        setTheme,

        setPrimaryColor,

        bindButtons,

        destroy,

        get isDestroyed() {
            return destroyed;
        },

        get theme() {
            return elements.modal.dataset.theme;
        },

        get activeMode() {
            return activeMode;
        }

    };
}