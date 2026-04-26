.PHONY: test

test:
	npm run test:file $(filter-out $@,$(MAKECMDGOALS))

%:
	@:
