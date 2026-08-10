BUILD := $(shell git rev-parse --short HEAD)
UNAME := $(shell uname)
VERSION ?= v0.3.3

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
	find html/javascript -name "*.js" -exec npx prettier --write {} +
	find test            -name "*.js" -exec npx prettier --write {} +

build: format
	npx sass sass:html/css --no-source-map --style=expanded
	find html/javascript -name "*.js" -exec npx eslint --fix {} +

test: build
	find test -name "*.js" -exec npx eslint --fix {} +
	npm test

benchmark: build
	@echo "benchmark: nothing to do"

coverage: build
	@echo "coverage: nothing to do"

vet: 
	@echo "vet:  nothing to do"

lint:
	@echo "lint: nothing to do"

build-all: test vet lint go
	mkdir -p dist/yam/linux
	mkdir -p dist/yam/arm
	mkdir -p dist/yam/arm7
	mkdir -p dist/yam/arm6
	mkdir -p dist/yam/darwin-x64
	mkdir -p dist/yam/darwin-arm64
	mkdir -p dist/yam/windows
	env GOOS=linux   GOARCH=amd64         GOWORK=off go build -trimpath -o dist/yam/linux        ./...
	env GOOS=linux   GOARCH=arm64         GOWORK=off go build -trimpath -o dist/yam/arm          ./...
	env GOOS=linux   GOARCH=arm   GOARM=7 GOWORK=off go build -trimpath -o dist/yam/arm7         ./...
	env GOOS=linux   GOARCH=arm   GOARM=6 GOWORK=off go build -trimpath -o dist/yam/arm6         ./...
	env GOOS=darwin  GOARCH=amd64         GOWORK=off go build -trimpath -o dist/yam/darwin-x64   ./...
	env GOOS=darwin  GOARCH=arm64         GOWORK=off go build -trimpath -o dist/yam/darwin-arm64 ./...
	env GOOS=windows GOARCH=amd64         GOWORK=off go build -trimpath -o dist/yam/windows      ./...

package: build-all
	mkdir -p dist/yam
	rm -rf dist/yam/html
	cp -r html dist/yam/
	$(SED) 's|content="__BUILD_NUMBER__"|content="$(BUILD)"|' dist/yam/html/about.html

release: package
	cd dist/yam/html && zip --recurse-paths ../../yam-$(VERSION).zip .
	tar --directory=dist/yam/linux        --exclude=".DS_Store" -cvzf dist/yam-$(VERSION)-linux-x64.tar.gz    .
	tar --directory=dist/yam/arm          --exclude=".DS_Store" -cvzf dist/yam-$(VERSION)-arm-x64.tar.gz      .
	tar --directory=dist/yam/arm7         --exclude=".DS_Store" -cvzf dist/yam-$(VERSION)-arm7.tar.gz         .
	tar --directory=dist/yam/arm6         --exclude=".DS_Store" -cvzf dist/yam-$(VERSION)-arm6.tar.gz         .
	tar --directory=dist/yam/darwin-x64   --exclude=".DS_Store" -cvzf dist/yam-$(VERSION)-darwin-x64.tar.gz   .
	tar --directory=dist/yam/darwin-arm64 --exclude=".DS_Store" -cvzf dist/yam-$(VERSION)-darwin-arm64.tar.gz .
	cd dist/yam/windows && zip --recurse-paths ../../yam-$(VERSION)-windows-x64.zip . -x ".DS_Store"

cloudflare-build:  build
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

cloudflare: cloudflare-build
	cd dist/cloudflare && zip --recurse-paths -FS ../cloudflare.zip . -x ".DS_Store"
	npx wrangler pages deploy --project-name yam dist/cloudflare

debug:
	npm run vm

sass: 
	npx sass --watch sass:html/css --no-source-map  --style=expanded

run: build
	python3 yam.py

run-yam: package
	python3 yam.py --host='0.0.0.0' --port=8118 --dir='dist/yam/html'

run-cloudflare: cloudflare
	python3 yam.py --host='0.0.0.0' --port=8118 --dir='dist/cloudflare'

go:
	mkdir -p bin
	go fmt yam.go
	go build -ldflags "-X main.BUILD=$(BUILD)" -o bin

go-help: go
	./bin/yam --help

go-run: go
	./bin/yam

