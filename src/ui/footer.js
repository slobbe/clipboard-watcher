import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { Metadata } from "./metadata.js";

/**
 * Creates the metadata footer below the preview.
 * @returns {{
 *   element: PopupMenu.PopupMenuSection,
 *   setContent: (content: object) => void,
 *   clear: () => void,
 * }} Footer component.
 */
export function Footer() {
    const element = new PopupMenu.PopupMenuSection();
    const row = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        can_focus: false,
        style_class: "clipboard-metadata-row",
    });
    const metadata = Metadata();

    row.add_child(metadata.element);
    element.addMenuItem(row);

    /** Updates metadata and visibility for complete clipboard content. */
    function setContent(content) {
        metadata.setContent(content);
        row.visible = content.kind !== "empty";
    }

    /** Clears metadata and hides its row. */
    function clear() {
        metadata.clear();
        row.visible = false;
    }

    return {
        element,
        setContent,
        clear,
    };
}
