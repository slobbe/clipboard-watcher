import Clutter from "gi://Clutter";
import St from "gi://St";

/**
 * Creates the compact clipboard metadata label.
 *
 * @returns {{
 *   element: St.Label,
 *   setContent: (content: object) => void,
 *   clear: () => void,
 * }} Metadata component.
 */
export function Metadata() {
    const element = new St.Label({
        x_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
    });

    element.add_style_class_name("clipboard-metadata");

    /** Displays metadata from complete clipboard content. */
    function setContent(content) {
        element.text = formatContent(content);
    }

    /** Clears the displayed metadata. */
    function clear() {
        element.text = "";
    }

    return {
        element,
        setContent,
        clear,
    };
}

function formatContent({ kind, byteSize, charCount } = {}) {
    if (kind === "text" && byteSize !== null && charCount !== null) {
        const characterLabel = charCount === 1 ? "char" : "chars";

        return `${charCount} ${characterLabel} · ${formatByteSize(byteSize)}`;
    }

    if (kind === "binary" && byteSize !== null) return formatByteSize(byteSize);

    return "";
}

function formatByteSize(byteSize) {
    const units = ["B", "KB", "MB", "GB"];
    let size = byteSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return unitIndex === 0
        ? `${size} ${units[unitIndex]}`
        : `${size.toFixed(1)} ${units[unitIndex]}`;
}
