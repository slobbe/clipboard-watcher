import St from "gi://St";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const PREVIEW_LINE_LENGTH = 40;
const PREVIEW_LINE_COUNT = 3;
const MAX_PREVIEW_LENGTH = PREVIEW_LINE_LENGTH * PREVIEW_LINE_COUNT;

export default class ClipboardWatcherExtension extends Extension {
    enable() {
        this._indicator = new PanelMenu.Button(
            0,
            "Clipboard Watcher",
        );

        this._indicator.add_child(
            new St.Icon({
                icon_name: "edit-paste-symbolic",
                style_class: "system-status-icon",
            }),
        );

        this._previewItem = new PopupMenu.PopupMenuItem(
            "",
            {
                reactive: false,
                can_focus: false,
            },
        );
        this._previewItem.label.add_style_class_name("clipboard-preview");
        this._setPreview("Clipboard is empty");
        this._indicator.menu.addMenuItem(this._previewItem);

        this._indicator.menu.addMenuItem(
            new PopupMenu.PopupSeparatorMenuItem(),
        );

        const refreshItem = new PopupMenu.PopupMenuItem("Refresh");
        refreshItem.connect("activate", () => {
            this._readClipboard();
        });

        const clearItem = new PopupMenu.PopupMenuItem("Clear");
        clearItem.connect("activate", () => {
            this._clearClipboard();
        });

        this._indicator.menu.addMenuItem(refreshItem);
        this._indicator.menu.addMenuItem(clearItem);

        this._indicator.menu.connect("open-state-changed", (_menu, open) => {
            if (open)
                this._readClipboard();
        });

        Main.panel.addToStatusArea(
            this.uuid,
            this._indicator,
        );
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        this._previewItem = null;
    }

    _readClipboard() {
        const clipboard = St.Clipboard.get_default();

        clipboard.get_text(
            St.ClipboardType.CLIPBOARD,
            (_clipboard, text) => {
                if (!this._previewItem)
                    return;

                const preview = this._formatPreview(text ?? "");
                this._setPreview(preview);
            },
        );
    }

    _clearClipboard() {
        const clipboard = St.Clipboard.get_default();

        clipboard.set_text(
            St.ClipboardType.CLIPBOARD,
            "",
        );

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
        if (!text)
            return "Clipboard is empty";

        const characters = Array.from(text.replace(/\s+/g, " ").trim());
        if (characters.length === 0)
            return "Clipboard is empty";

        const isTruncated = characters.length > MAX_PREVIEW_LENGTH;
        const visibleCharacters = characters.slice(
            0,
            isTruncated ? MAX_PREVIEW_LENGTH - 1 : MAX_PREVIEW_LENGTH,
        );
        const lines = [];

        for (let index = 0; index < visibleCharacters.length; index += PREVIEW_LINE_LENGTH) {
            lines.push(visibleCharacters.slice(index, index + PREVIEW_LINE_LENGTH).join(""));
        }

        return `${lines.join("\n")}${isTruncated ? "…" : ""}`;
    }
}
