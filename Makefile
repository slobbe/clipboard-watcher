UUID := clipboard-watcher@slobbe.github.io
DIST_DIR := dist
ARCHIVE := $(DIST_DIR)/$(UUID).zip
SOURCE_FILES := $(shell find src -type f)
METADATA_FILE := metadata.json
PACKAGE_FILES := $(SOURCE_FILES) $(METADATA_FILE)
JAVASCRIPT_FILES := $(shell find src -type f -name '*.js')

.PHONY: zip check lint format-check format install clean enable disable reload uninstall

zip: $(ARCHIVE)

check:
	@for source in $(JAVASCRIPT_FILES); do node --check $$source || exit $$?; done

lint:
	npm run lint

format-check:
	npm run format:check

format:
	npm run format

$(ARCHIVE): $(PACKAGE_FILES)
	mkdir -p $(DIST_DIR)
	rm -f $@
	cd src && zip -qr ../$@ .
	zip -q $@ $(METADATA_FILE)

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
