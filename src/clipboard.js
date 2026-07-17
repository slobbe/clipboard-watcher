import St from "gi://St";

/**
 * @typedef {Object} ClipboardContent
 * @property {"text" | "binary" | "empty"} kind
 * @property {string | null} mime
 * @property {number | null} byteSize
 * @property {string | null} content
 * @property {number | null} charCount
 */

/**
 * Creates an adapter for the current clipboard selection.
 *
 * @param {St.Clipboard} clipboard Clipboard implementation to use.
 * @param {St.ClipboardType} clipboardType Clipboard selection to access.
 * @returns {{getClipboardContent: () => Promise<ClipboardContent>, clear: () => void}} Clipboard operations.
 */
export function useClipboard(
    clipboard = St.Clipboard.get_default(),
    clipboardType = St.ClipboardType.CLIPBOARD,
) {
    function getMimeTypes() {
        return clipboard.get_mimetypes(clipboardType) ?? [];
    }

    /** @returns {Promise<ClipboardContent>} Complete clipboard content metadata. */
    function getClipboardContent() {
        return new Promise(resolve => {
            clipboard.get_text(clipboardType, async (_clipboard, text) => {
                resolve(await createContent(text, getMimeTypes()));
            });
        });
    }

    function getContentSize(mime) {
        return new Promise(resolve => {
            clipboard.get_content(clipboardType, mime, (_clipboard, bytes) => {
                resolve(bytes ? bytes.get_size() : null);
            });
        });
    }

    /** Clears the clipboard text selection. */
    function clear() {
        clipboard.set_text(clipboardType, "");
    }

    async function createContent(text, mimeTypes) {
        if (typeof text === "string" && text.trim()) {
            return {
                kind: "text",
                mime: findTextMimeType(mimeTypes),
                byteSize: new TextEncoder().encode(text).length,
                content: text,
                charCount: Array.from(text).length,
            };
        }

        const mime = findNonTextMimeType(mimeTypes);
        if (!mime) {
            return {
                kind: "empty",
                mime: null,
                byteSize: null,
                content: null,
                charCount: null,
            };
        }

        const byteSize = await getContentSize(mime);

        return {
            kind: "binary",
            mime,
            byteSize,
            content: null,
            charCount: null,
        };
    }

    return {
        getClipboardContent,
        clear,
    };
}

function findTextMimeType(mimeTypes) {
    return mimeTypes.find(type => type.startsWith("text/")) ?? "text/plain";
}

function findNonTextMimeType(mimeTypes) {
    return mimeTypes.find(type =>
        !type.startsWith("text/") &&
        !["UTF8_STRING", "STRING", "COMPOUND_TEXT"].includes(type),
    );
}
