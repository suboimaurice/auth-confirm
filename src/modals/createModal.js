/**
 * AuthConfirm - Modal Factory
 *
 * Creates the modal structure and adds it to the document.
 *
 * This module is responsible ONLY for creating the DOM.
 * It does not handle confirmation, callbacks or OTP logic.
 */


/**
 * Create the AuthConfirm modal.
 *
 * @param {Object} config - AuthConfirm configuration.
 * @returns {Object} References to the modal elements.
 */
export function createModal(config) {

    // Main overlay.
    const overlay = document.createElement("div");

    overlay.className = "ac-overlay";
    overlay.hidden = true;

    overlay.style.zIndex = config.zIndex;

    // Modal container.
    const modal = document.createElement("div");

    modal.className = "ac-modal";

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "ac-title");
    modal.setAttribute("aria-describedby", "ac-message");

    // Modal content.
    modal.innerHTML = `

        <div class="ac-icon">
            <span class="ac-icon-symbol"></span>
        </div>

        <h2 class="ac-title" id="ac-title"></h2>

        <p class="ac-message" id="ac-message"></p>

        <div class="ac-error"
             role="alert"
             aria-live="assertive"
             hidden>
        </div>

        <div class="ac-actions">

            <button
                type="button"
                class="ac-cancel">
                ${escapeHTML(config.cancelText)}
            </button>

            <button
                type="button"
                class="ac-confirm">
                Confirm
            </button>

        </div>

    `;

    // Add modal to overlay.
    overlay.appendChild(modal);

    // Add overlay to document.
    document.body.appendChild(overlay);

    // Return references for other modules.
    return {

        overlay,

        modal,

        icon: modal.querySelector(".ac-icon"),

        iconSymbol: modal.querySelector(".ac-icon-symbol"),

        title: modal.querySelector(".ac-title"),

        message: modal.querySelector(".ac-message"),

        error: modal.querySelector(".ac-error"),

        actions: modal.querySelector(".ac-actions"),

        confirmButton: modal.querySelector(".ac-confirm"),

        cancelButton: modal.querySelector(".ac-cancel")
    };
}


/**
 * Escape HTML special characters.
 *
 * Prevents configuration text from being interpreted
 * as HTML when inserted into the modal.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[ character ];
    });
}