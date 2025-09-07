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
	rm -rf dist/html
	mkdir -p dist/html/css
	mkdir -p dist/html/fonts
	mkdir -p dist/html/images
	mkdir -p dist/html/javascript
	cp    html/index.html  dist/html
	cp    html/favicon.ico dist/html
	cp -r html/css         dist/html
	cp -r html/fonts       dist/html
	cp -r html/images      dist/html

cloudflare:  build build-all
	rm -rf dist/cloudflare
	mkdir -p dist/cloudflare
	rsync -av --exclude='**/.DS_Store' ./html/       dist/cloudflare
	rsync -av --exclude='**/.DS_Store' ./cloudflare/ dist/cloudflare
	tar --directory=dist/cloudflare -cvzf dist/cloudflare.tar.gz .
	cd dist/cloudflare && zip --recurse-paths ../cloudflare.zip . -x ".DS_Store"

debug:
	find html/javascript -name "*.js" -exec npx eslint   --fix {} +
	npm run debug

sass: 
	npx sass --watch sass:html/css --no-source-map  --style=expanded

run: build
	python3 httpd.py
