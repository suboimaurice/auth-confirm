/**
 * AuthConfirm - Focus Management
 *
 * Handles keyboard focus while the modal is open.
 */


/**
 * Get elements that can receive keyboard focus.
 *
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {

    return Array.from(
        container.querySelectorAll(`
            button:not(:disabled),
            input:not(:disabled),
            select:not(:disabled),
            textarea:not(:disabled),
            a[href],
            [tabindex]:not([tabindex="-1"])
        `)
    ).filter(element => {

        return element.getAttribute("aria-hidden") !== "true"
            && element.getClientRects().length > 0;
    });
}


/**
 * Manage modal focus.
 *
 * @param {HTMLElement} modal
 * @returns {Object}
 */
export function createFocusManager(modal) {

    let previousFocus = null;

    /**
     * Move focus into the modal.
     */
    function activate() {

        previousFocus = document.activeElement;

        const focusable = getFocusableElements(modal);

        if (focusable.length) {
            focusable[ 0 ].focus();
        } else {
            modal.setAttribute("tabindex", "-1");
            modal.focus();
        }
    }


    /**
     * Keep keyboard focus inside the modal.
     *
     * @param {KeyboardEvent} event
     */
    function trap(event) {

        if (event.key !== "Tab") {
            return;
        }

        const focusable = getFocusableElements(modal);

        if (!focusable.length) {
            event.preventDefault();
            modal.focus();
            return;
        }

        const first = focusable[ 0 ];

        const last = focusable[ focusable.length - 1 ];

        if (event.shiftKey) {

            if (
                document.activeElement === first ||
                !modal.contains(document.activeElement)
            ) {
                event.preventDefault();
                last.focus();
            }

        } else {

            if (
                document.activeElement === last ||
                !modal.contains(document.activeElement)
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    }


    /**
     * Restore focus to the element that was
     * focused before the modal opened.
     */
    function restore() {

        if (previousFocus?.isConnected) {
            previousFocus.focus();
        }

        previousFocus = null;
    }


    return {
        activate,
        trap,
        restore
    };
}