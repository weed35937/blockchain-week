.PHONY: all build

all: test build

mirror: test build-mirror

test:
	deno test --unstable --allow-read utils/test.js

link-check:
	lychee spec/**/*.yaml

format:
	deno fmt utils/*.js data/*/events/*/*.js README.md

fmt: format

build:
	deno --version
	deno run --unstable --allow-read --allow-write utils/build.js tag=$(tag)

build-mirror:
	deno run --unstable --allow-read --allow-write utils/mirror.js

sync:
	deno run --unstable --allow-read --allow-write --allow-net utils/sync.js $(event)

imgs:
	deno run --unstable --allow-read --allow-write --allow-run utils/imgs.js $(event)

tag:
	deno run --unstable --allow-run utils/tag.js

inspect:
	deno run --inspect-brk --unstable --allow-read utils/test.js

fsync:
	rm -rf cache/sync
	@make sync

twitter-stats:
	deno run --unstable --allow-read --allow-write --allow-env --allow-net utils/twitter-stats.js $(complete)

install:
	deno cache ./utils/*.js

reinstall:
	deno cache --reload ./utils/*.js