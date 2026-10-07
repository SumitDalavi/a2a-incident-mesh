.PHONY: setup dev test clean

setup:
	npm install

dev:
	npm run build
	@echo "Starting Coordinator and Agents..."
	npm run start --workspace=agents/sre-agent & \
	npm run start --workspace=agents/sec-agent & \
	npm run start --workspace=coordinator

test:
	node test.js

clean:
	npm run clean

