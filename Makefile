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

coverage: build

vet: 

lint:

build-all: test vet lint

release: build-all
	rm -rf dist/yam
	mkdir -p dist/yam
	rsync -av --exclude='**/.DS_Store' ./httpd.* dist/yam
	rsync -av --exclude='**/.DS_Store' ./html/   dist/yam/html
	tar --directory=dist/yam -cvzf dist/yam.tar.gz .
	cd dist/yam && zip --recurse-paths ../yam.zip .

cloudflare:  build build-all
	rm -rf dist/cloudflare
	mkdir -p dist/cloudflare
	rsync -av --exclude='**/.DS_Store' ./html/       dist/cloudflare
	rsync -av --exclude='**/.DS_Store' ./cloudflare/ dist/cloudflare
	cd dist/cloudflare && zip --recurse-paths ../cloudflare.zip . -x ".DS_Store"

debug:
	find html/javascript -name "*.js" -exec npx eslint   --fix {} +
	npm run debug

sass: 
	npx sass --watch sass:html/css --no-source-map  --style=expanded

run: build
	python3 httpd.py
