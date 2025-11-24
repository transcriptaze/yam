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
	rm -rf dist

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
	@echo "vet:  nothing to do"

lint:
	@echo "lint: nothing to do"

build-all: test vet lint
	mkdir -p bin
	go fmt          yam.go
	go build -o bin yam.go

package: build-all
	rm -rf dist/yam
	npm run package
	$(SED) 's|content="__BUILD_NUMBER__"|content="$(BUILD)"|' dist/yam/about.html

release: package
	cd dist/yam && zip --recurse-paths ../yam.zip .

cloudflare: build
	rm -rf dist/cloudflare
	npm run cloudflare
	$(SED) 's|content="__BUILD_NUMBER__"|content="$(BUILD)"|' dist/cloudflare/about.html

cloudflare-dev:  build
	rm -rf dist/cloudflare.zip
	rm -rf dist/cloudflare
	mkdir -p dist/cloudflare

	cp -r html/*       dist/cloudflare/
	cp -r cloudflare/* dist/cloudflare/
	rm -f dist/cloudflare/.gitignore
	rm -f dist/cloudflare/LICENSE
	rm -f dist/cloudflare/package.json
	$(SED) 's|content="__BUILD_NUMBER__"|content="$(BUILD)"|' dist/cloudflare/about.html
	find dist/cloudflare -name ".DS_Store" -delete
# 	cd dist/cloudflare && zip --recurse-paths -FS ../cloudflare.zip . -x ".DS_Store"

debug:
	find html/javascript -name "*.js" -exec npx eslint   --fix {} +
	npm run debug

sass: 
	npx sass --watch sass:html/css --no-source-map  --style=expanded

run: build
	python3 yam.py

run-yam: package
	python3 yam.py --host='0.0.0.0' --port=8118 --dir='dist/yam'

run-cloudflare: cloudflare
	python3 yam.py --host='0.0.0.0' --port=8118 --dir='dist/cloudflare'

go:
	go fmt yam.go
	go run yam.go
