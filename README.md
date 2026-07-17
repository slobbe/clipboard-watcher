# Clipboard Watcher

A GNOME Shell extension that shows the current clipboard contents in the panel menu.

## Features

- Panel indicator with a clipboard preview
- Automatic refresh when the menu opens, plus a clear action

## Install

Clone the repository:

```sh
git clone https://github.com/slobbe/clipboard-watcher
cd clipboard-watcher
```

Package and install the extension:

```sh
make install
```

Then restart GNOME Shell (log out and back in on Wayland), then enable it:

```sh
make enable
```

## License

[MIT](LICENSE)
