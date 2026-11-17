/**

* AuthConfirm - Modal State Manager
* 
* Responsible for tracking the lifecycle state of a modal.
* 
* This module does not:
* - Create DOM elements.
* - Display modal content.
* - Execute backend requests.
* - Handle button events.
* 
* It only manages modal state and pending promises.
  */

/**

* Create a modal state manager.

* 

* @returns {Object}
  */
export function createModalState() {

    let active = false;
    let processing = false;
    let destroyed = false;

    let currentAction = null;
    let currentSettings = null;

    let activeController = null;
    let pendingResolve = null;

    /**
    
    * Open a modal and create its pending promise.
    
    * 
    
    * @param {string} action
    
    * @param {Object} settings
    
    * 
    
    * @returns {Promise<boolean>}
      */
    function open(action, settings = {}) {

        if (destroyed) {
            return Promise.resolve(false);
        }

        if (active) {
            return Promise.reject(
                new Error("A modal is already open.")
            );
        }

        active = true;
        processing = false;

        currentAction = action;
        currentSettings = settings;

        return new Promise(resolve => {
            pendingResolve = resolve;
        });
    }

    /**
    
    * Mark the modal as processing.
    
    * 
    
    * @returns {boolean}
      */
    function startProcessing() {

        if (!active || processing || destroyed) {
            return false;
        }

        processing = true;

        return true;
    }

    /**
    
    * Stop processing.
      */
    function stopProcessing() {
        processing = false;
    }

    /**
    
    * Store the active AbortController.
    * 
    * @param {AbortController|null} controller
      */
    function setController(controller) {
        activeController = controller;
    }

    /**
    
    * Abort the current operation.
      */
    function abort() {

        activeController?.abort();

        activeController = null;
    }

    /**
    
    * Resolve and close the modal.
    
    * 
    
    * @param {boolean} result
    
    * 
    
    * @returns {Object|null}
      */
    function close(result, reason = null) {

        if (!active) {
            return null;
        }

        const state = {
            action: currentAction,
            settings: currentSettings,
            reason
        };

        active = false;
        processing = false;

        activeController = null;

        const resolve = pendingResolve;

        pendingResolve = null;

        currentAction = null;
        currentSettings = null;

        resolve?.(result);

        return state;
    }

    /**
    
    * Destroy the state manager.
      */
    function destroy() {

        if (destroyed) return;

        destroyed = true;

        abort();

        close(false, "destroy");
    }

    return {

        open,
        close,

        startProcessing,
        stopProcessing,

        setController,
        abort,

        destroy,

        get isOpen() {
            return active;
        },

        get isProcessing() {
            return processing;
        },

        get isDestroyed() {
            return destroyed;
        },

        get action() {
            return currentAction;
        },

        get settings() {
            return currentSettings;
        }

    };
}