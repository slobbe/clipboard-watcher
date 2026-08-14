import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const TIMEOUTS = [
    ["Disabled", 0],
    ["15 seconds", 15],
    ["30 seconds", 30],
    ["1 minute", 60],
    ["5 minutes", 300],
    ["15 minutes", 900],
    ["30 minutes", 1800],
    ["1 hour", 3600],
];

export default class ClipboardWatcherPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const _ = this.gettext.bind(this);
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({ title: "Privacy" });
        const row = new Adw.ComboRow({
            title: "Clear clipboard after",
            subtitle:
                "Automatically clears copied content after it remains unchanged.",
            model: Gtk.StringList.new(TIMEOUTS.map(([label]) => label)),
        });
        const selected = TIMEOUTS.findIndex(
            ([, seconds]) =>
                seconds === settings.get_uint("clear-after-seconds"),
        );

        row.selected = selected >= 0 ? selected : 0;
        row.connect("notify::selected", () => {
            settings.set_uint("clear-after-seconds", TIMEOUTS[row.selected][1]);
        });

        const version = this.metadata["version-name"] ?? _("Development build");
        const footer = new Gtk.Label({
            label: `${GLib.markup_escape_text(this.metadata.name, -1)} v${GLib.markup_escape_text(version, -1)} · <a href="${GLib.markup_escape_text(this.metadata.url, -1)}">${_("GitHub")}</a>`,
            use_markup: true,
            xalign: 0.5,
            yalign: 0.5,
            justify: Gtk.Justification.CENTER,
            margin_top: 6,
            margin_bottom: 6,
            wrap: true,
        });
        const footerGroup = new Adw.PreferencesGroup();

        footer.add_css_class("dim-label");
        footerGroup.add(footer);

        group.add(row);
        page.add(group);
        page.add(footerGroup);
        window.add(page);
    }
}
