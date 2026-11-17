/**
 * AuthConfirm - OTP Inputs
 *
 * Creates and manages individual OTP input fields.
 *
 * Responsibilities:
 * - Create numeric OTP inputs.
 * - Handle keyboard navigation.
 * - Handle OTP paste and autofill.
 * - Detect completed codes.
 * - Enable/disable inputs.
 * - Clean up event listeners.
 */

/**
 * Create OTP input fields.
 *
 * @param {HTMLElement} container
 * @param {number} length
 * @param {Function} onComplete
 *
 * @returns {Object}
 */
export function createOtpInputs(
    container,
    length = 6,
    onComplete = () => { }
) {

    length = Math.max(1, Math.floor(Number(length) || 6));

    const inputs = [];

    let completedCode = null;

    container.innerHTML = "";

    container.classList.add("ac-otp-inputs");


    /* ----------------------------------
       CREATE INPUTS
    ---------------------------------- */

    for (let i = 0; i < length; i++) {

        const input = document.createElement("input");

        input.type = "text";

        input.inputMode = "numeric";

        input.autocomplete = "one-time-code";

        input.maxLength = 1;

        input.pattern = "[0-9]";

        input.className = "ac-otp-input";

        input.setAttribute(
            "aria-label",
            `OTP digit ${i + 1}`
        );

        input.dataset.index = i;

        container.appendChild(input);

        inputs.push(input);
    }


    /* ----------------------------------
       GET CODE
    ---------------------------------- */

    /**
     * Get the complete OTP.
     *
     * @returns {string}
     */
    function getCode() {

        return inputs
            .map(input => input.value)
            .join("");
    }


    /* ----------------------------------
       COMPLETION
    ---------------------------------- */

    /**
     * Check whether all inputs are completed.
     */
    function checkComplete() {

        const code = getCode();

        if (
            code.length !== length ||
            !/^\d+$/.test(code)
        ) {
            completedCode = null;
            return;
        }

        // Prevent duplicate completion callbacks.
        if (completedCode === code) return;

        completedCode = code;

        onComplete(code);
    }


    /* ----------------------------------
       NAVIGATION
    ---------------------------------- */

    /**
     * Move focus to the next input.
     *
     * @param {number} index
     */
    function focusNext(index) {

        if (index < length - 1) {
            inputs[ index + 1 ].focus();
        }
    }


    /**
     * Move focus to the previous input.
     *
     * @param {number} index
     */
    function focusPrevious(index) {

        if (index > 0) {
            inputs[ index - 1 ].focus();
        }
    }


    /* ----------------------------------
       INPUT HANDLING
    ---------------------------------- */

    /**
     * Handle individual input.
     */
    function handleInput(event) {

        const input = event.target;

        const index = Number(input.dataset.index);

        // Keep numbers only.
        const value = input.value
            .replace(/\D/g, "");

        // Handle multiple digits from autofill.
        if (value.length > 1) {

            distributeCode(value, index);

            return;
        }

        input.value = value;

        if (value) {
            focusNext(index);
        }

        checkComplete();
    }


    /**
     * Distribute multiple digits across inputs.
     *
     * @param {string} value
     * @param {number} startIndex
     */
    function distributeCode(value, startIndex = 0) {

        const digits = value
            .replace(/\D/g, "")
            .slice(0, length - startIndex);

        inputs.forEach((input, index) => {

            if (index >= startIndex) {
                input.value = "";
            }

        });

        [ ...digits ].forEach((digit, index) => {

            inputs[ startIndex + index ].value = digit;

        });

        const nextEmpty = inputs.find(input => !input.value);

        (nextEmpty || inputs[ length - 1 ]).focus();

        checkComplete();
    }


    /* ----------------------------------
       KEYBOARD HANDLING
    ---------------------------------- */

    /**
     * Handle keyboard navigation.
     */
    function handleKeydown(event) {

        const input = event.target;

        const index = Number(input.dataset.index);

        if (event.key === "Backspace") {

            if (!input.value) {
                focusPrevious(index);
            }

        }

        if (event.key === "ArrowLeft") {

            event.preventDefault();

            focusPrevious(index);

        }

        if (event.key === "ArrowRight") {

            event.preventDefault();

            focusNext(index);

        }
    }


    /* ----------------------------------
       PASTE HANDLING
    ---------------------------------- */

    /**
     * Handle OTP paste.
     */
    function handlePaste(event) {

        event.preventDefault();

        const pasted = event.clipboardData
            ?.getData("text") || "";

        distributeCode(pasted);
    }


    /* ----------------------------------
       REGISTER EVENTS
    ---------------------------------- */

    inputs.forEach(input => {

        input.addEventListener(
            "input",
            handleInput
        );

        input.addEventListener(
            "keydown",
            handleKeydown
        );

        input.addEventListener(
            "paste",
            handlePaste
        );

    });


    /* ----------------------------------
       RESET
    ---------------------------------- */

    /**
     * Clear all input fields.
     */
    function reset() {

        completedCode = null;

        inputs.forEach(input => {
            input.value = "";
        });

        inputs[ 0 ]?.focus();
    }


    /* ----------------------------------
       FOCUS
    ---------------------------------- */

    /**
     * Focus the first input.
     */
    function focus() {

        inputs[ 0 ]?.focus();
    }


    /* ----------------------------------
       DISABLE
    ---------------------------------- */

    /**
     * Disable or enable inputs.
     *
     * @param {boolean} disabled
     */
    function setDisabled(disabled) {

        inputs.forEach(input => {
            input.disabled = disabled;
        });
    }


    /* ----------------------------------
       DESTROY
    ---------------------------------- */

    /**
     * Remove event listeners and input elements.
     */
    function destroy() {

        inputs.forEach(input => {

            input.removeEventListener(
                "input",
                handleInput
            );

            input.removeEventListener(
                "keydown",
                handleKeydown
            );

            input.removeEventListener(
                "paste",
                handlePaste
            );

        });

        inputs.length = 0;

        container.innerHTML = "";
    }


    /* ----------------------------------
       PUBLIC API
    ---------------------------------- */

    return {
        inputs,
        getCode,
        reset,
        focus,
        setDisabled,
        destroy
    };

}