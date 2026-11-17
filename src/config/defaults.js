/**
 * AuthConfirm - Default Configuration
 *
 * Contains the default settings used when creating
 * an AuthConfirm instance.
 *
 * Users can override these settings during initialization.
 */

export const DEFAULTS = {

    // Actions supported by AuthConfirm.
    actions: [ "login", "logout" ],

    // Appearance settings.
    theme: "auto",
    primaryColor: null,
    dangerColor: "#c92d45",

    // General modal content.
    title: null,
    message: null,
    confirmText: null,
    cancelText: "Cancel",

    // Modal behaviour.
    closeOnBackdrop: true,
    closeOnEscape: true,
    showCancel: true,

    // Layer positioning.
    zIndex: 9999,

    // Optional button selector.
    buttonSelector: null,

    /**
     * Confirmation settings.
     *
     * These settings control what happens when
     * a user clicks the confirmation button.
     */
    confirmation: {

        // Maximum time to wait for a backend response.
        timeout: 15000,

        // Text displayed while processing.
        loadingText: "Please wait...",

        // Message displayed when a request times out.
        timeoutMessage:
            "The request timed out. Please try again.",

        // Message displayed when a request fails.
        errorMessage:
            "Something went wrong. Please try again."
    },

    /**
     * OTP settings.
     *
     * OTP-specific settings will be implemented
     * in a later chunk.
     */
    otp: {

        length: 6,

        resendDelay: 30,

        verifyTimeout: 15000,

        resendTimeout: 15000,

        autoFocus: true
    },

    // Lifecycle callbacks.
    onConfirm: null,
    onCancel: null,
    onOpen: null,
    onClose: null,

    onConfirmSuccess: null,

    onVerify: null,
    onResend: null,
    onOtpSuccess: null,

    onThemeChange: null,
    onDestroy: null
};