/**

* AuthConfirm - Timeout Helper
* 
* Executes an asynchronous task with timeout
* and external cancellation support.
* 
* Responsibilities:
* - Execute asynchronous tasks.
* - Enforce request timeouts.
* - Support external AbortSignals.
* - Abort underlying operations when possible.
* - Prevent multiple promise settlements.
* - Clean up timers and event listeners.
    */

/**

* Runs an asynchronous task with a timeout.

* 

* @param {Function} task

* Async function receiving an AbortSignal.

* 

* @param {number} timeout

* Maximum execution time in milliseconds.

* Use 0 to disable the timeout.

* 

* @param {AbortSignal|null} externalSignal

* Optional signal used to cancel the task externally.

* 

* @returns {Promise<*>}
  */
export function withTimeout(
    task,
    timeout = 15000,
    externalSignal = null
) {

    return new Promise((resolve, reject) => {

        if (typeof task !== "function") {
            reject(new TypeError("Task must be a function."));
            return;
        }


        // Normalize timeout.
        timeout = Number(timeout);

        if (!Number.isFinite(timeout) || timeout < 0) {
            reject(new RangeError("Timeout must be a non-negative number."));
            return;
        }


        const controller = new AbortController();

        let timer = null;

        let settled = false;


        /* ----------------------------------
           CLEANUP
        ---------------------------------- */

        /**
         * Remove timers and event listeners.
         */
        function cleanup() {

            if (timer !== null) {

                clearTimeout(timer);

                timer = null;
            }

            externalSignal?.removeEventListener(
                "abort",
                handleExternalAbort
            );
        }


        /* ----------------------------------
           SETTLEMENT
        ---------------------------------- */

        /**
         * Finish the promise only once.
         *
         * @param {Function} callback
         * @param {*} value
         */
        function finish(callback, value) {

            if (settled) return;

            settled = true;

            cleanup();

            callback(value);
        }


        /* ----------------------------------
           ABORT
        ---------------------------------- */

        /**
         * Create a standardized abort error.
         */
        function createAbortError() {

            const error = new Error("Operation cancelled.");

            error.name = "AbortError";

            return error;
        }


        /**
         * Handle external cancellation.
         */
        function handleExternalAbort() {

            if (settled) return;

            const error = createAbortError();

            controller.abort();

            finish(reject, error);
        }


        /* ----------------------------------
           EXTERNAL SIGNAL
        ---------------------------------- */

        // Handle an already-aborted signal.
        if (externalSignal?.aborted) {

            handleExternalAbort();

            return;
        }


        if (externalSignal) {

            externalSignal.addEventListener(
                "abort",
                handleExternalAbort,
                { once: true }
            );

        }


        /* ----------------------------------
           TIMEOUT
        ---------------------------------- */

        if (timeout > 0) {

            timer = setTimeout(() => {

                if (settled) return;

                const error = new Error(
                    "The operation timed out."
                );

                error.name = "TimeoutError";

                controller.abort();

                finish(reject, error);

            }, timeout);

        }


        /* ----------------------------------
           EXECUTE TASK
        ---------------------------------- */

        Promise.resolve()

            .then(() => {

                // Avoid starting an operation that
                // has already been cancelled.
                if (settled) return;

                return task(controller.signal);

            })

            .then(

                result => {
                    if (!settled) {
                        finish(resolve, result);
                    }
                },

                error => {
                    if (!settled) {
                        finish(reject, error);
                    }
                }

            );

    });

}

