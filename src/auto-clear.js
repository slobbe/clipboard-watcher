import GLib from "gi://GLib";

/**
 * Schedules clipboard clearing after the configured delay.
 *
 * @param {{getDelaySeconds: () => number, onClear: () => void}} options
 * @returns {{schedule: () => void, cancel: () => void}}
 */
export function AutoClear({ getDelaySeconds, onClear }) {
    let timeoutId = null;

    function cancel() {
        if (timeoutId === null) return;

        GLib.source_remove(timeoutId);
        timeoutId = null;
    }

    function schedule() {
        cancel();

        const delaySeconds = getDelaySeconds();
        if (delaySeconds === 0) return;

        timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            delaySeconds,
            () => {
                timeoutId = null;
                onClear();
                return GLib.SOURCE_REMOVE;
            },
        );
    }

    return { schedule, cancel };
}
