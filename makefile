# Default target (when you just run `make` without specifying a target)
help:
	@echo "Available targets:"
	@echo "  checks:  Run linting."
	@echo "  testall: Run Unit and Integration tests."

checks:
	yarn eslint

all:
   @echo "Execution start:"
   yarn install
   yarn build
   yarn start

test:
	yarn test

clean:
	rm -f node_modules

