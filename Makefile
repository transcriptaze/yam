BUILD := $(shell git rev-parse --short HEAD)
UNAME := $(shell uname)

ifeq ($(UNAME),Darwin)
   SED := sed -i ''
else
   SED := sed -i
endif

.DEFAULT_GOAL := build
.PHONY: sass

all: test      \
	 benchmark \
     coverage

clean:

format: 
# 	find html -name "*.html"          -exec npx prettier --write {} +
	find html/javascript -name "*.js" -exec npx prettier --write {} +
	find test            -name "*.js" -exec npx prettier --write {} +

build: format
	find html/javascript -name "*.js" -exec npx eslint   --fix {} +
	npx sass sass:html/css --no-source-map --style=expanded

test: build
	find test -name "*.js" -exec npx eslint   --fix {} +
	npm test

benchmark: build
	@echo "benchmark: nothing to do"

coverage: build
	@echo "coverage: nothincg to do"

vet: 
	@echo "vet: nothing to do"

lint:
	@echo "lint: nothing to do"

build-all: test vet lint

rollup:
	npm run package

release: build-all rollup
	rm -rf dist/yam
	mkdir -p dist/yam
	rsync -av --exclude='**/.DS_Store' ./httpd.*      dist/yam
	rsync -av --exclude='**/.DS_Store' ./dist/rollup  dist/yam/html
	tar --directory=dist/yam -cvzf dist/yam.tar.gz .
	$(SED) "s/__BUILD_NUMBER__/$(BUILD)/" dist/yam/html/rollup/about.html
	cd dist/yam && zip --recurse-paths ../yam.zip .

cloudflare:  build build-all
	rm -rf dist/cloudflare.zip
	rm -rf dist/cloudflare
	mkdir -p dist/cloudflare
	rsync -av --exclude='**/.DS_Store' ./html/       dist/cloudflare
	rsync -av --exclude='**/.DS_Store' ./cloudflare/ dist/cloudflare
	$(SED) "s/__BUILD_NUMBER__/$(BUILD)/" dist/cloudflare/about.html
	cd dist/cloudflare && zip --recurse-paths -FS ../cloudflare.zip . -x ".DS_Store"

debug:
	find html/javascript -name "*.js" -exec npx eslint   --fix {} +
	npm run debug

sass: 
	npx sass --watch sass:html/css --no-source-map  --style=expanded

run: build
	python3 httpd.py

run-rollup: build
	python3 httpd.py --host='0.0.0.0' --port=8080 --dir='dist/rollup'

