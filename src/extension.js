import Meta from "gi://Meta";
import St from "gi://St";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import { AutoClear } from "./auto-clear.js";
import { useClipboard } from "./clipboard.js";
import { Footer } from "./ui/footer.js";
import { Preview } from "./ui/preview.js";

export default class ClipboardWatcherExtension extends Extension {
    enable() {
        this._clipboardReadId = 0;
        this._clipboardChangeId = 0;
        this._clipboard = useClipboard();
        this._settings = this.getSettings();
        this._autoClear = AutoClear({
            getDelaySeconds: () =>
                this._settings.get_uint("clear-after-seconds"),
            onClear: () => this._clearClipboard(),
        });
        this._indicator = new PanelMenu.Button(0.5, "Clipboard Watcher");

        this._indicator.add_child(
            new St.Icon({
                icon_name: "edit-paste-symbolic",
                style_class: "system-status-icon",
            }),
        );

        this._preview = Preview();
        this._preview.clear();
        this._indicator.menu.addMenuItem(this._preview.element);

        this._footer = Footer();
        this._indicator.menu.addMenuItem(this._footer.element);
        this._footer.clear();

        this._indicator.menu.addMenuItem(
            new PopupMenu.PopupSeparatorMenuItem(),
        );
        const clearItem = new PopupMenu.PopupMenuItem("Clear");
        clearItem.connect("activate", () => this._clearClipboard());
        this._indicator.menu.addMenuItem(clearItem);

        const preferencesItem = new PopupMenu.PopupMenuItem("Preferences…");
        preferencesItem.connect("activate", () => this.openPreferences());
        this._indicator.menu.addMenuItem(preferencesItem);

        this._menuOpenSignalId = this._indicator.menu.connect(
            "open-state-changed",
            (_menu, open) => {
                if (open) this._readClipboard();
            },
        );
        this._selectionSignalId = global.display
            .get_selection()
            .connect("owner-changed", (_selection, selectionType) => {
                if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD)
                    this._handleClipboardChanged();
            });
        this._settingsSignalId = this._settings.connect(
            "changed::clear-after-seconds",
            () => this._handleClipboardChanged(),
        );

        this._handleClipboardChanged();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._clipboardReadId++;
        this._clipboardChangeId++;
        this._autoClear.cancel();
        global.display.get_selection().disconnect(this._selectionSignalId);
        this._settings.disconnect(this._settingsSignalId);
        this._indicator.menu.disconnect(this._menuOpenSignalId);
        this._selectionSignalId = null;
        this._settingsSignalId = null;
        this._menuOpenSignalId = null;
        this._indicator.destroy();
        this._indicator = null;
        this._preview = null;
        this._footer = null;
        this._autoClear = null;
        this._settings = null;
        this._clipboard = null;
    }

    async _readClipboard() {
        const readId = ++this._clipboardReadId;
        const content = await this._clipboard.getClipboardContent();

        if (!this._preview || readId !== this._clipboardReadId) return;

        this._preview.setContent(content);
        this._footer.setContent(content);
    }

    async _handleClipboardChanged() {
        const changeId = ++this._clipboardChangeId;
        const content = await this._clipboard.getClipboardContent();

        if (!this._autoClear || changeId !== this._clipboardChangeId) return;

        if (content.kind === "empty") this._autoClear.cancel();
        else this._autoClear.schedule();
    }

    _clearClipboard() {
        this._autoClear.cancel();
        this._clipboardReadId++;
        this._clipboard.clear();

        this._preview.clear();
        this._footer.clear();
    }
}
