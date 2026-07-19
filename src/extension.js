import St from "gi://St";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

import { useClipboard } from "./clipboard.js";
import { Footer } from "./ui/footer.js";
import { Preview } from "./ui/preview.js";

export default class ClipboardWatcherExtension extends Extension {
    enable() {
        this._clipboardReadId = 0;
        this._clipboard = useClipboard();
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

        this._footer = Footer({
            onClear: () => this._clearClipboard(),
        });
        this._indicator.menu.addMenuItem(this._footer.element);
        this._footer.clear();

        this._menuOpenSignalId = this._indicator.menu.connect(
            "open-state-changed",
            (_menu, open) => {
                if (open) this._readClipboard();
            },
        );

        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._clipboardReadId++;
        this._indicator.menu.disconnect(this._menuOpenSignalId);
        this._menuOpenSignalId = null;
        this._indicator.destroy();
        this._indicator = null;
        this._preview = null;
        this._footer = null;
        this._clipboard = null;
    }

    async _readClipboard() {
        const readId = ++this._clipboardReadId;
        const content = await this._clipboard.getClipboardContent();

        if (!this._preview || readId !== this._clipboardReadId) return;

        this._preview.setContent(content);
        this._footer.setContent(content);
    }

    _clearClipboard() {
        this._clipboardReadId++;
        this._clipboard.clear();

        this._preview.clear();
        this._footer.clear();
    }
}
