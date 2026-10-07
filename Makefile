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
	npm run test

clean:
	npm run clean
