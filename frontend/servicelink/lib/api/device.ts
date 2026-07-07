const DEVICE_ID_KEY = "sl_device_id";

/**
 * Returns a stable UUID identifying this browser/device, creating one
 * on first call and persisting it in localStorage. This is the identifier
 * ProviderDevicePin rows are keyed on — it is NOT sensitive on its own
 * (it only unlocks a login flow paired with a correct PIN or OTP), but it
 * should never be regenerated once created or every device will look "new".
 */
export function getOrCreateDeviceId(): string {
    if (typeof window === "undefined") return "";

    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

/** Only called on explicit "log out and forget this device". */
export function clearDeviceId(): void {
    localStorage.removeItem(DEVICE_ID_KEY);
}