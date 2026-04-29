.PHONY: run build deploy-prod deploy-test

# Run development build
run:
	@echo "Running dev server..."
	npm start

# Build target
build:
	@echo "Building the project..."
	npm run build

# Production deployment – run the build, then deploy with production flag.
deploy-prod: build
	@echo "Deploying to production..."
	vercel --prod

# Test deployment – run the build, then deploy without the production flag.
deploy-test: build
	@echo "Deploying for testing..."
	vercel
