# Push Notifications

How to enable and use push notifications for MY PUP.

## Backend

- **Device tokens**: Store device tokens (e.g. from Web Push or FCM) per user so the server can send targeted pushes.
- **Send flow**: When creating a notification (e.g. new message, like, follow), optionally call a push service to send a push to the user’s devices.
- **Endpoints**: Use existing notification creation; add a subscription endpoint (e.g. `POST /api/push/subscribe`) that saves the subscription (endpoint + keys) for the current user.

## Frontend

- **Permission**: Use `Notification.requestPermission()` and only subscribe after permission is granted.
- **Service worker**: Register a service worker that handles `push` events and shows a notification (title/body/click action).
- **Subscription**: Use the Push API (`registration.pushManager.subscribe()`) and send the subscription JSON to the backend.

## Optional stack

- **web-push** (Node): Generate VAPID keys, send payloads to Web Push endpoints.
- **Firebase Cloud Messaging (FCM)**: Alternative for web and mobile; requires Firebase project and credentials.

## Current state

- Notification preferences and in-app notifications are implemented.
- Push delivery (browser/mobile) requires: VAPID keys, subscription storage, and a job or trigger that sends via web-push (or FCM) when a notification is created.
