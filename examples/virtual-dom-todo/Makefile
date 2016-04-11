BROWSERIFY  = ./node_modules/.bin/browserify
WATCHIFY    = ./node_modules/.bin/watchify
BUILD_DIR 	= build
BUNDLE 		= $(BUILD_DIR)/bundle.js
ENTRY		= src/index.js

SRC = $(ENTRY)
ifneq ($(wildcard src/client/lib),)
  SRC += $(shell find src/ -type f -name '*.js')
endif

.PHONY: all clean info

all: $(BUNDLE)

clean:
	rm -f $(BUNDLE)

info:
	@echo "Source:" $(SRC)

watch:
	$(WATCHFY) $(ENTRY) -t [ babelify --presets es2015 ] --debug --verbose -o $@

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUNDLE): $(BUILD_DIR) $(SRC)
	$(BROWSERIFY) $(ENTRY) -t [ babelify --presets es2015 ] --verbose -o $@

