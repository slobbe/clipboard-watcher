import Clutter from "gi://Clutter";
import St from "gi://St";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const MAX_PREVIEW_LINES = 5;

export default class ClipboardWatcherExtension extends Extension {
    enable() {
        this._clipboardReadId = 0;
        this._indicator = new PanelMenu.Button(0, "Clipboard Watcher");

        this._indicator.add_child(
            new St.Icon({
                icon_name: "edit-paste-symbolic",
                style_class: "system-status-icon",
            }),
        );

        this._previewItem = new PopupMenu.PopupMenuItem("", {
            reactive: false,
            can_focus: false,
        });
        this._previewItem.label.add_style_class_name("clipboard-preview");
        this._setPreview("Clipboard is empty");
        this._indicator.menu.addMenuItem(this._previewItem);

        this._footerSeparator = new PopupMenu.PopupSeparatorMenuItem();
        this._indicator.menu.addMenuItem(this._footerSeparator);

        this._footerRow = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
        });
        this._metadataLabel = new St.Label({
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });

        const clearButton = new St.Button({
            label: "Clear",
            style_class: "clipboard-clear-button",
            track_hover: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        clearButton.connect("clicked", () => {
            this._clearClipboard();
        });

        this._footerRow.add_child(this._metadataLabel);
        this._footerRow.add_child(clearButton);
        this._indicator.menu.addMenuItem(this._footerRow);
        this._setFooterVisible(false);

        this._indicator.menu.connect("open-state-changed", (_menu, open) => {
            if (open) this._readClipboard();
        });

        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._clipboardReadId++;
        this._indicator?.destroy();
        this._indicator = null;
        this._previewItem = null;
        this._metadataLabel = null;
        this._footerRow = null;
        this._footerSeparator = null;
    }

    _readClipboard() {
        const clipboard = St.Clipboard.get_default();
        const readId = ++this._clipboardReadId;

        clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
            if (!this._previewItem || readId !== this._clipboardReadId) return;

            const mimeTypes = clipboard.get_mimetypes(
                St.ClipboardType.CLIPBOARD,
            ) ?? [];
            const preview = this._formatClipboardPreview(text, mimeTypes);

            this._setPreview(preview);
            this._setFooterVisible(preview !== "Clipboard is empty");
            if (text && preview !== "Clipboard is empty") {
                this._setMetadata(this._formatMetadata(text));
                return;
            }

            const mimeType = this._findNonTextMimeType(mimeTypes);
            if (mimeType)
                this._readNonTextSize(clipboard, mimeType, readId);
            else
                this._setMetadata(null);
        });
    }

    _formatClipboardPreview(text, mimeTypes) {
        if (text)
            return this._formatPreview(text);

        const mimeType = this._findNonTextMimeType(mimeTypes);

        if (!mimeType)
            return "Clipboard is empty";

        return `[${mimeType}]`;
    }

    _findNonTextMimeType(mimeTypes) {
        return mimeTypes.find(type =>
            !type.startsWith("text/") &&
            !["UTF8_STRING", "STRING", "COMPOUND_TEXT"].includes(type),
        );
    }

    _readNonTextSize(clipboard, mimeType, readId) {
        this._setMetadata(null);
        clipboard.get_content(
            St.ClipboardType.CLIPBOARD,
            mimeType,
            (_clipboard, bytes) => {
                if (!this._metadataLabel || readId !== this._clipboardReadId)
                    return;

                this._setMetadata(
                    bytes ? this._formatByteSize(bytes.get_size()) : null,
                );
            },
        );
    }

    _clearClipboard() {
        const clipboard = St.Clipboard.get_default();
        this._clipboardReadId++;

        clipboard.set_text(St.ClipboardType.CLIPBOARD, "");

        this._setPreview("Clipboard is empty");
        this._setFooterVisible(false);
        this._setMetadata(null);
    }

    _setPreview(preview) {
        const isEmpty = preview === "Clipboard is empty";
        const label = this._previewItem.label;

        label.text = preview;
        label.remove_style_class_name(
            isEmpty ? "clipboard-preview-content" : "clipboard-preview-empty",
        );
        label.add_style_class_name(
            isEmpty ? "clipboard-preview-empty" : "clipboard-preview-content",
        );
    }

    _setMetadata(metadata) {
        this._metadataLabel.text = metadata ?? "";
    }

    _setFooterVisible(visible) {
        this._footerRow.visible = visible;
        this._footerSeparator.visible = visible;
    }

    _formatMetadata(text) {
        const characterCount = Array.from(text).length;
        const byteCount = new TextEncoder().encode(text).length;

        return `${characterCount} ${characterCount === 1 ? "char" : "chars"} · ${this._formatByteSize(byteCount)}`;
    }

    _formatByteSize(byteCount) {
        const units = ["B", "KB", "MB", "GB"];
        let size = byteCount;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return unitIndex === 0
            ? `${size} ${units[unitIndex]}`
            : `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    _formatPreview(text) {
        const lines = text
            .trim()
            .split(/\r?\n/)
            .filter(line => line.trim())
            .map(line => line.trim());

        if (lines.length === 0) return "Clipboard is empty";

        return lines.length > MAX_PREVIEW_LINES
            ? `${lines.slice(0, MAX_PREVIEW_LINES).join("\n")}\n…`
            : lines.join("\n");
    }
}
