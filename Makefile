UUID := clipboard-watcher@slobbe.github.io
DIST_DIR := dist
ARCHIVE := $(DIST_DIR)/$(UUID).zip
SOURCES := src/extension.js src/stylesheet.css metadata.json

.PHONY: zip install clean enable disable reinstall uninstall

zip: $(ARCHIVE)

$(ARCHIVE): $(SOURCES)
	mkdir -p $(DIST_DIR)
	zip --quiet --junk-paths $@ $(SOURCES)

install: zip
	gnome-extensions install --force $(ARCHIVE)

clean:
	rm -rf $(DIST_DIR)

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

reinstall: clean install
	@if gnome-extensions info $(UUID) >/dev/null 2>&1; then \
		$(MAKE) disable && $(MAKE) enable; \
	else \
		echo "Extension installed but is not loaded by GNOME Shell yet."; \
		echo "Restart GNOME Shell, then run: make enable"; \
	fi

uninstall:
	gnome-extensions uninstall $(UUID)
