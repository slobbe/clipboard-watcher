import St from "gi://St";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const MAX_PREVIEW_LENGTH = 40;

export default class ClipboardWatcherExtension extends Extension {
    enable() {
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

        this._indicator.menu.addMenuItem(
            new PopupMenu.PopupSeparatorMenuItem(),
        );

        const clearItem = new PopupMenu.PopupMenuItem("Clear");
        clearItem.connect("activate", () => {
            this._clearClipboard();
        });

        this._indicator.menu.addMenuItem(clearItem);

        this._indicator.menu.connect("open-state-changed", (_menu, open) => {
            if (open) this._readClipboard();
        });

        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        this._previewItem = null;
    }

    _readClipboard() {
        const clipboard = St.Clipboard.get_default();

        clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => {
            if (!this._previewItem) return;

            const mimeTypes = clipboard.get_mimetypes(
                St.ClipboardType.CLIPBOARD,
            ) ?? [];
            this._setPreview(this._formatClipboardPreview(text, mimeTypes));
        });
    }

    _formatClipboardPreview(text, mimeTypes) {
        if (text)
            return this._formatPreview(text);

        const mimeType = mimeTypes.find(type =>
            !type.startsWith("text/") &&
            !["UTF8_STRING", "STRING", "COMPOUND_TEXT"].includes(type),
        );

        if (!mimeType)
            return "Clipboard is empty";

        return `[${mimeType}]`;
    }

    _clearClipboard() {
        const clipboard = St.Clipboard.get_default();

        clipboard.set_text(St.ClipboardType.CLIPBOARD, "");

        this._setPreview("Clipboard is empty");
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

    _formatPreview(text) {
        const preview = text.trim();

        if (!preview) return "Clipboard is empty";

        return preview;
    }
}
