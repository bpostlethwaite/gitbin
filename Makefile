SHELL:= /bin/bash

test:
	@find test/*_test.js | xargs -n 1 -t node

.PHONY: test   
