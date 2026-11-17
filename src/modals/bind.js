/**
 * Binds the modal's shared events.
 *
 * This module owns:
 * - Confirm button clicks
 * - Cancel button clicks
 * - Backdrop clicks
 * - Escape key
 * - Keyboard focus trapping
 *
 * The active modal mode supplies the handlers.
 *
 * @param {Object} elements
 * @param {Object} options
 * @param {Function} getHandlers
 * @param {Object} focus
 *
 * @returns {Function} Cleanup function
 */
export function bindModalEvents(
    elements,
    options,
    getHandlers,
    focus
) {

    const {
        overlay,
        confirmButton,
        cancelButton
    } = elements;

    /**
     * Get the active mode's handlers.
     */
    function handlers() {
        return getHandlers?.() || {};
    }

    /**
     * Confirm button.
     */
    function handleConfirm() {
        handlers().onConfirm?.();
    }

    /**
     * Cancel button.
     */
    function handleCancel() {
        handlers().onCancel?.("button");
    }

    /**
     * Backdrop click.
     */
    function handleBackdrop(event) {

        if (event.target !== overlay) {
            return;
        }

        if (!options.closeOnBackdrop) {
            return;
        }

        handlers().onCancel?.("backdrop");
    }

    /**
     * Keyboard events.
     */
    function handleKeydown(event) {

        if (overlay.hidden) {
            return;
        }

        focus?.trap?.(event);

        if (
            event.key === "Escape" &&
            options.closeOnEscape
        ) {

            event.preventDefault();

            handlers().onCancel?.("escape");
        }
    }

    /**
     * Register events.
     */
    confirmButton.addEventListener(
        "click",
        handleConfirm
    );

    cancelButton.addEventListener(
        "click",
        handleCancel
    );

    overlay.addEventListener(
        "click",
        handleBackdrop
    );

    document.addEventListener(
        "keydown",
        handleKeydown
    );

    /**
     * Cleanup.
     */
    return function unbind() {

        confirmButton.removeEventListener(
            "click",
            handleConfirm
        );

        cancelButton.removeEventListener(
            "click",
            handleCancel
        );

        overlay.removeEventListener(
            "click",
            handleBackdrop
        );

        document.removeEventListener(
            "keydown",
            handleKeydown
        );

    };
}