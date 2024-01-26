.PHONE: build
build:
	docker compose -f node-in-docker.docker-compose.yaml up -d node-in-docker --remove-orphans
	#docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm install -g npm@latest
	docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm install
	docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm run build
	docker compose -f node-in-docker.docker-compose.yaml stop node-in-docker

.PHONE: update-npm-libraries
update-npm-libraries:
	docker compose -f node-in-docker.docker-compose.yaml up -d node-in-docker --remove-orphans
	#docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm install -g npm@latest
	docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npx --yes npm-check-updates -u
	docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm run build
	docker compose -f node-in-docker.docker-compose.yaml stop node-in-docker

.PHONE: test
test:
	docker compose -f node-in-docker.docker-compose.yaml up -d node-in-docker --remove-orphans
	#docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm install -g npm@latest
	docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm install
	docker compose -f node-in-docker.docker-compose.yaml exec -it node-in-docker npm run test
	docker compose -f node-in-docker.docker-compose.yaml stop node-in-docker

.PHONE: run
run:
	make build
	docker-compose up lookout --build

.PHONE: buildx-image
buildx-image:
	make build
	docker buildx stop localremote_builder
	docker buildx rm localremote_builder
	docker buildx create --name localremote_builder --node localremote_builder0 --platform linux/amd64,linux/arm64/v8,linux/ppc64le,linux/s390x --driver-opt env.BUILDKIT_STEP_LOG_MAX_SIZE=10000000 --driver-opt env.BUILDKIT_STEP_LOG_MAX_SPEED=10000000
	docker buildx create --name localremote_builder --node localremote_builder0 --platform linux/amd64,linux/arm64/v8,linux/ppc64le,linux/s390x --driver-opt env.BUILDKIT_STEP_LOG_MAX_SIZE=10000000 --driver-opt env.BUILDKIT_STEP_LOG_MAX_SPEED=10000000
	docker buildx create --name localremote_builder --append --node pi --platform linux/arm/v6,linux/arm/v7,linux/arm/v8 ssh://root@pi4.urlip.com --driver-opt env.BUILDKIT_STEP_LOG_MAX_SIZE=10000000 --driver-opt env.BUILDKIT_STEP_LOG_MAX_SPEED=10000000
	docker buildx use localremote_builder
	docker buildx build --platform linux/amd64,linux/arm64/v8,linux/ppc64le,linux/s390x,linux/arm/v6,linux/arm/v7,linux/arm/v8 --tag ralphv/lookout:latest ./docker/Dockerfile

.PHONE: build-image
build-image:
	make build
	docker build --tag ralphv/lookout:latest -f ./docker/Dockerfile .
	docker tag ralphv/lookout:latest ralphv/lookout:$(shell jq -r .version < package.json)

.PHONE: publish-image
publish-image:
	docker push ralphv/lookout:latest
	docker push ralphv/lookout:$(shell jq -r .version < package.json)

.PHONE: trivy
trivy:
	docker run --rm -v .:/app/ aquasec/trivy fs /app/ --scanners vuln