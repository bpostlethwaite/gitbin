SHELL:= /bin/bash

test:
	@(cd test; find test-*.js | xargs -n 1 -t node)

.PHONY: test

