version = $(shell cat package.json | grep version | awk -F'"' '{print $$4}')

install:
	@npm install
	@spm install

publish:
	@npm publish
	@git tag $(version)
	@git push origin $(version)

test-build:
	@./bin/zpm build

test-build-all:
	@./bin/zpm build --all-in-one

test:
	@node_modules/.bin/mocha -R spec tests/index.js
