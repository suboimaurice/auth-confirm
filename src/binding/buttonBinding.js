/**
 * Binds authentication buttons using event delegation.
 *
 * Example:
 *
 * <button data-auth-confirm="login">
 *     Login
 * </button>
 *
 * @param {Object} options
 *
 * @returns {Function}
 */
export function bindAuthButtons({

    confirm,

    selector = "[data-auth-confirm]"

}) {

    let destroyed = false;

    /**
     * Handle document clicks.
     */
    async function handleClick(event) {

        if (destroyed) return;

        const target = event.target;

        // Text nodes and other non-elements
        // do not support closest().
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest(selector);

        if (!button) return;

        if (button.disabled) return;

        const action = button.dataset.authConfirm;

        if (![ "login", "logout" ].includes(action)) {
            return;
        }

        if (button.dataset.authProcessing === "true") {
            return;
        }

        event.preventDefault();

        const wasDisabled = button.disabled;

        button.dataset.authProcessing = "true";

        button.disabled = true;

        try {

            if (action === "login") {
                await confirm("login");
            }

            if (action === "logout") {
                await confirm("logout");
            }

        } catch (error) {

            console.error(
                "AuthConfirm button error:",
                error
            );

        } finally {

            button.dataset.authProcessing = "false";

            button.disabled = wasDisabled;

        }
    }

    document.addEventListener(
        "click",
        handleClick
    );

    /**
     * Remove event listener.
     */
    return function unbind() {

        if (destroyed) return;

        destroyed = true;

        document.removeEventListener(
            "click",
            handleClick
        );

    };
}