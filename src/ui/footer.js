import Clutter from "gi://Clutter";
import St from "gi://St";

import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { Metadata } from "./metadata.js";

/**
 * Creates the metadata and clear-action footer below the preview.
 *
 * @param {{onClear: () => void}} options Footer event handlers.
 * @returns {{
 *   element: PopupMenu.PopupMenuSection,
 *   setContent: (content: object) => void,
 *   clear: () => void,
 * }} Footer component.
 */
export function Footer({ onClear }) {
    const element = new PopupMenu.PopupMenuSection();
    const separator = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        can_focus: false,
        style_class: "popup-separator-menu-item",
    });
    const separatorLine = new St.Widget({
        style_class: "popup-separator-menu-item-separator",
        x_expand: true,
    });
    const row = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        can_focus: false,
    });
    const metadata = Metadata();
    const clearButton = new St.Button({
        label: "Clear",
        style_class: "clipboard-clear-button",
        track_hover: true,
        y_align: Clutter.ActorAlign.CENTER,
    });

    clearButton.connect("clicked", onClear);
    separator.add_child(separatorLine);
    row.add_child(metadata.element);
    row.add_child(clearButton);
    element.addMenuItem(separator);
    element.addMenuItem(row);

    /** Updates metadata and visibility for complete clipboard content. */
    function setContent(content) {
        metadata.setContent(content);
        element.actor.visible = content.kind !== "empty";
    }

    /** Clears metadata and hides the footer. */
    function clear() {
        metadata.clear();
        element.actor.visible = false;
    }

    return {
        element,
        setContent,
        clear,
    };
}
