import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const EMPTY_PREVIEW = "Clipboard is empty";
const MAX_PREVIEW_LINES = 5;

/**
 * Creates the clipboard preview menu item.
 *
 * @returns {{
 *   element: PopupMenu.PopupMenuItem,
 *   setContent: (content: object) => void,
 *   clear: () => void,
 * }} Preview component.
 */
export function Preview() {
    const element = new PopupMenu.PopupMenuItem("", {
        reactive: false,
        can_focus: false,
    });
    const label = element.label;

    label.add_style_class_name("clipboard-preview");

    /** Formats and displays complete clipboard content. */
    function setContent(content) {
        const presentation = formatContent(content);

        label.text = presentation.text;
        label.remove_style_class_name(
            presentation.isEmpty
                ? "clipboard-preview-content"
                : "clipboard-preview-empty",
        );
        label.add_style_class_name(
            presentation.isEmpty
                ? "clipboard-preview-empty"
                : "clipboard-preview-content",
        );
    }

    /** Restores the empty clipboard placeholder. */
    function clear() {
        setContent({ kind: "empty" });
    }

    return {
        element,
        setContent,
        clear,
    };
}

function formatContent({ kind, content, mime } = {}) {
    if (kind === "text") {
        const previewText = formatText(content ?? "");
        if (previewText) return { text: previewText, isEmpty: false };
    }

    if (kind === "binary" && mime) return { text: `[${mime}]`, isEmpty: false };

    return { text: EMPTY_PREVIEW, isEmpty: true };
}

function formatText(text) {
    const lines = text
        .trim()
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => line.trim());

    if (lines.length === 0) return null;

    return lines.length > MAX_PREVIEW_LINES
        ? `${lines.slice(0, MAX_PREVIEW_LINES).join("\n")}\n…`
        : lines.join("\n");
}
