UUID := clipboard-watcher@slobbe.github.io
DIST_DIR := dist
ARCHIVE := $(DIST_DIR)/$(UUID).zip
SOURCES := src/extension.js src/stylesheet.css metadata.json

.PHONY: zip check install clean enable disable reload uninstall

zip: $(ARCHIVE)

check:
	node --check src/extension.js

$(ARCHIVE): $(SOURCES)
	mkdir -p $(DIST_DIR)
	zip -FS --quiet --junk-paths $@ $(SOURCES)

install: zip
	gnome-extensions install --force $(ARCHIVE)

uninstall:
	gnome-extensions uninstall $(UUID)

clean:
	rm -rf $(DIST_DIR)

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

reload:
	$(MAKE) clean
	$(MAKE) install
	@if gnome-extensions info $(UUID) >/dev/null 2>&1; then \
		$(MAKE) disable && $(MAKE) enable; \
	else \
		echo "Extension installed but is not loaded by GNOME Shell yet."; \
		echo "Restart GNOME Shell, then run: make enable"; \
	fi
	$(MAKE) clean
