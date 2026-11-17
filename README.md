AuthConfirm v1.0.0

A lightweight, reusable JavaScript authentication confirmation library.

AuthConfirm provides customizable confirmation dialogs for login and logout operations, OTP verification, and success notifications. It is designed to work with existing frontend applications and backend APIs without requiring a JavaScript framework.

Table of Contents

1. "Features" (#features)
2. "Project Structure" (#project-structure)
3. "Installation" (#installation)
4. "Quick Start" (#quick-start)
5. "Login and Logout" (#login-and-logout)
6. "Success Notifications" (#success-notifications)
7. "OTP Verification" (#otp-verification)
8. "Timeout Handling" (#timeout-handling)
9. "Button Binding" (#button-binding)
10. "Configuration" (#configuration)
11. "Theme and Colours" (#theme-and-colours)
12. "API Reference" (#api-reference)
13. "Callbacks" (#callbacks)
14. "Backend Integration Example" (#backend-integration-example)
15. "Destroying the Instance" (#destroying-the-instance)

---

Features

- Login and logout confirmation dialogs.
- Automatic success notifications after successful authentication.
- OTP verification with configurable input length.
- OTP resend functionality with a countdown timer.
- Configurable request timeouts.
- AbortController support for cancellable requests.
- Light, dark, and automatic themes.
- Customizable primary colour.
- Custom confirmation and success messages.
- Event-delegated login and logout button binding.
- Promise-based API.
- Lightweight vanilla JavaScript implementation.

---

Project Structure

The library is organized into smaller modules to make the code easier to maintain and extend.

AuthConfirm-v1.0.0/
│
└── src/
    │
    ├── auth-confirm.js
    │
    ├── config/
    │   ├── defaults.js
    │   └── messages.js
    │
    ├── helpers/
    │   ├── colors.js
    │   ├── focus.js
    │   ├── icons.js
    │   └── withTimeout.js
    │
    ├── modals/
    │   ├── createModal.js
    │   └── bind.js
    │
    ├── confirmation/
    │   ├── confirm.js
    │   ├── success.js
    │   └── modalState.js
    │
    ├── otp/
    │   ├── createOtp.js
    │   ├── verifyOtp.js
    │   ├── otpInputs.js
    │   └── otpTimer.js
    │
    ├── binding/
    │   └── buttonBinding.js
    │
    └── styles/
        └── auth-confirm.css

Each module handles a specific responsibility, helping keep the implementation organized.

---

Installation

Install AuthConfirm from npm:

```bash
npm install auth-confirm
```

Import the JavaScript module and stylesheet in your application:

```javascript
import { createAuthConfirm } from "auth-confirm";
import "auth-confirm/style.css";
```

AuthConfirm is distributed as an ES module and uses browser DOM APIs. Run your application through a local or production HTTP server rather than opening an HTML file directly using `file://`.

---

Quick Start

Create an AuthConfirm instance:

import { createAuthConfirm } from "auth-confirm";

const auth = createAuthConfirm({
    theme: "auto",
    primaryColor: "#00a65a",

    onConfirm: async (action, { signal }) => {
        console.log("Authentication action:", action);

        return true;
    }
});

The "onConfirm" callback handles the actual authentication operation.

It receives:

- "action": Either ""login"" or ""logout"".
- An options object containing an "AbortSignal".

The callback should return an explicit success value or a result object.

---

Login and Logout

AuthConfirm provides dedicated methods for login and logout confirmation.

Confirm Login

const result = await auth.confirmLogin();

if (result) {
    console.log("Login completed.");
}

Confirm Logout

const result = await auth.confirmLogout();

if (result) {
    console.log("Logout completed.");
}

Using the General Confirm Method

You can also use:

await auth.confirm("login");

await auth.confirm("logout");

Only ""login"" and ""logout"" are supported actions.

Automatic Success Notifications

When a login or logout operation succeeds, AuthConfirm automatically displays a success notification.

Default login notification:

Title: Login Successful

Message: You have successfully logged in.

Default logout notification:

Title: Logout Successful

Message: You have successfully logged out.

The confirmation promise resolves after the success notification is dismissed.

You can customize the success notification:

await auth.confirmLogin({
    success: {
        title: "Welcome Back!",
        message: "You are now logged in.",
        confirmText: "Continue"
    }
});

For logout:

await auth.confirmLogout({
    success: {
        title: "Logged Out",
        message: "You have successfully signed out.",
        confirmText: "Done"
    }
});

---

Success Notifications

You can display a success notification independently of login or logout.

await auth.showSuccess({
    title: "Operation Successful",
    message: "Your changes have been saved.",
    confirmText: "Continue"
});

The notification closes when the user clicks its confirmation button.

The promise resolves with "true" when the notification closes.

---

OTP Verification

AuthConfirm supports OTP verification through a configurable OTP interface.

Basic Setup

const auth = createAuthConfirm({
    otp: {
        length: 6,
        resendDelay: 30,
        verifyTimeout: 15000,
        resendTimeout: 15000
    },

    onVerify: async (code, { signal }) => {
        console.log("OTP entered:", code);

        return true;
    },

    onResend: async ({ signal }) => {
        console.log("Requesting another OTP...");

        return true;
    }
});

Open the OTP Interface

const result = await auth.confirmOtp();

if (result) {
    console.log("OTP verification completed.");
}

When verification succeeds, AuthConfirm automatically displays a success notification.

Default notification:

Title: OTP Verified

Message: Your OTP has been successfully verified.

Customize the OTP Interface

const result = await auth.confirmOtp({
    length: 6,
    title: "Verify Your Account",
    message: "Enter the verification code sent to your phone.",
    resendDelay: 45,

    success: {
        title: "Verification Complete",
        message: "Your account has been verified."
    }
});

OTP Verification Callback

The "onVerify" callback receives the entered code and an options object:

onVerify: async (code, { signal }) => {
    // Send code to your backend.

    return true;
}

OTP Resend Callback

The "onResend" callback requests another OTP:

onResend: async ({ signal }) => {
    // Request a new OTP from your backend.

    return true;
}

Both callbacks can be defined at the root configuration level or inside the "otp" configuration. An OTP-specific callback takes precedence over its root-level equivalent.

---

Timeout Handling

AuthConfirm supports timeouts for asynchronous operations.

This prevents confirmation and OTP interfaces from waiting indefinitely when a backend request takes too long.

Confirmation Timeout

The default confirmation timeout is 15 seconds.

Configure it using:

const auth = createAuthConfirm({
    confirmation: {
        timeout: 15000,
        loadingText: "Please wait...",
        timeoutMessage: "The request timed out. Please try again."
    }
});

OTP Timeouts

OTP verification and resend operations have separate timeout settings:

const auth = createAuthConfirm({
    otp: {
        verifyTimeout: 15000,
        resendTimeout: 15000,
        resendDelay: 30
    }
});

Disabling a Timeout

A timeout value of "0" disables the timeout for the corresponding operation.

Using AbortSignal

The callbacks receive an "AbortSignal" that can be passed to "fetch()".

Example:

onConfirm: async (action, { signal }) => {
    const response = await fetch("/api/auth/" + action, {
        method: "POST",
        signal
    });

    return response.ok;
}

Passing the signal to "fetch()" allows the request to be cancelled when the operation is aborted.

Note: Timeout and cancellation handling work best when your callback passes the provided signal to the underlying asynchronous operation.

---

Button Binding

AuthConfirm supports automatic login and logout button binding using HTML data attributes.

HTML

<button data-auth-confirm="login">
    Login
</button>

<button data-auth-confirm="logout">
    Logout
</button>

JavaScript

auth.bindButtons();

AuthConfirm uses event delegation, so matching buttons can be handled without attaching a separate event listener to every button.

The default selector is:

[data-auth-confirm]

The supported attribute values are:

- "login"
- "logout"

Custom Selector

You can provide a different selector:

auth.bindButtons(".auth-button");

The selected elements must still have the appropriate "data-auth-confirm" attribute.

Removing Button Binding

"bindButtons()" returns a cleanup function:

const unbind = auth.bindButtons();

// Remove the event listener when no longer needed.
unbind();

Calling "bindButtons()" again also replaces the previous binding managed by the instance.

---

Configuration

AuthConfirm accepts an options object when creating an instance.

General Options

Option| Default| Description
"theme"| ""auto""| Interface theme
"primaryColor"| "null"| Custom primary colour
"dangerColor"| ""#c92d45""| Danger colour setting
"title"| "null"| Custom confirmation title
"message"| "null"| Custom confirmation message
"confirmText"| "null"| Confirmation button text
"cancelText"| ""Cancel""| Cancel button text
"closeOnBackdrop"| "true"| Backdrop closing setting
"closeOnEscape"| "true"| Escape-key closing setting
"showCancel"| "true"| Cancel button visibility setting
"zIndex"| "9999"| Modal stacking order

Confirmation Options

Option| Default| Description
"timeout"| "15000"| Confirmation request timeout
"loadingText"| ""Please wait...""| Loading button text
"timeoutMessage"| ""The request timed out. Please try again.""| Timeout error message
"errorMessage"| ""Something went wrong. Please try again.""| General error message

Example:

const auth = createAuthConfirm({
    confirmation: {
        timeout: 20000,
        loadingText: "Authenticating...",
        timeoutMessage: "Authentication took too long.",
        errorMessage: "Unable to complete your request."
    }
});

OTP Options

Option| Default| Description
"length"| "6"| OTP input length
"resendDelay"| "30"| Resend countdown in seconds
"verifyTimeout"| "15000"| Verification request timeout
"resendTimeout"| "15000"| Resend request timeout
"autoFocus"| "true"| OTP autofocus setting

Additional OTP display and message settings can be supplied through the "otp" configuration, including "title", "message", "confirmText", "cancelText", "loadingText", "resendText", and error messages.

---

Theme and Colours

AuthConfirm supports three theme modes.

Light Theme

auth.setTheme("light");

Dark Theme

auth.setTheme("dark");

Automatic Theme

auth.setTheme("auto");

Automatic mode follows the user's system colour preference.

Set Primary Colour

auth.setPrimaryColor("#00a65a");

You can use any valid CSS colour value supported by the implementation.

---

API Reference

The following methods are exposed by the main AuthConfirm instance.

Method| Description
"confirm(action, overrides)"| Opens login or logout confirmation
"confirmLogin(overrides)"| Opens login confirmation
"confirmLogout(overrides)"| Opens logout confirmation
"confirmOtp(overrides)"| Opens OTP verification
"showSuccess(overrides)"| Displays a success notification
"setTheme(theme)"| Changes the interface theme
"setPrimaryColor(color)"| Changes the primary colour
"bindButtons(selector)"| Binds authentication buttons
"destroy()"| Destroys the instance

Instance Properties

Property| Description
"isDestroyed"| Indicates whether the instance has been destroyed
"theme"| Returns the current resolved theme
"activeMode"| Returns the currently active interface mode

---

Callbacks

AuthConfirm supports callbacks for authentication, OTP operations, lifecycle events, and theme changes.

Callback| Purpose
"onConfirm(action, { signal })"| Handles login or logout
"onCancel(action, reason)"| Handles cancellation
"onOpen(action)"| Called when an interface opens
"onClose(action, reason)"| Called when an interface closes
"onConfirmSuccess(action, result)"| Called after confirmation succeeds
"onVerify(code, { signal })"| Handles OTP verification
"onResend({ signal })"| Handles OTP resend
"onOtpSuccess(result)"| Called after OTP verification succeeds
"onResendSuccess(result)"| Called after OTP resend succeeds
"onThemeChange(theme)"| Called when the theme changes
"onDestroy()"| Called when the instance is destroyed

The "action" argument identifies the interface or operation, such as ""login"", ""logout"", ""otp"", or ""success"".

Callback arguments can differ slightly depending on the operation. For example, success notification lifecycle callbacks receive ""success"".

---

Backend Integration Example

This example demonstrates how AuthConfirm can communicate with a PHP backend.

import { createAuthConfirm } from "auth-confirm";

const auth = createAuthConfirm({
    theme: "auto",
    primaryColor: "#00a65a",

    confirmation: {
        timeout: 15000
    },

    onConfirm: async (action, { signal }) => {
        const response = await fetch(`/api/${action}.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            signal
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
            return {
                success: false,
                message: result.message || "Authentication failed."
            };
        }

        return {
            success: true,
            message: result.message
        };
    }
});

The backend should return a response similar to:

{
    "success": true,
    "message": "Authentication completed."
}

For a failed operation:

{
    "success": false,
    "message": "Invalid credentials."
}

AuthConfirm treats "false" and an object containing "success: false" as failed operations. Returning explicit success values is recommended.

---

Destroying the Instance

When AuthConfirm is no longer needed, destroy the instance:

auth.destroy();

Destroying the instance cleans up its managed event listeners, controllers, and modal elements.

After destruction, the instance should not be reused. Create a new instance if you need AuthConfirm again.

---

Important Notes

- AuthConfirm is a frontend confirmation and interaction library. It does not authenticate users by itself.
- Actual authentication, OTP generation, and OTP verification must be handled by your backend.
- Always validate credentials and OTP codes on the server.
- Do not rely on frontend confirmation as a security mechanism.
- Pass the supplied "AbortSignal" to "fetch()" when you want requests to support cancellation.
- Use an HTTP server when testing ES modules.
- Return explicit success or failure values from backend callbacks for predictable results.

---

Version

AuthConfirm v1.0.0

A modular, lightweight authentication confirmation and OTP interface library built with vanilla JavaScript and CSS.