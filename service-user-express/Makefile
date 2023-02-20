DIST=./dist
VERSION=1.0.0

build:
	cp package-lock.json package-lock.json.backup
	npm run build
	cp Dockerfile dist/
	cp package.json package-lock.json dist/
	cp keycloak.json dist/
	cd dist && docker build --rm --force-rm -t api-user:${VERSION} .
clean:
	rm -rf dist
	docker rmi api-user:${VERSION}

docker-check-user-api:
	docker compose -f docker-user-api.yaml config
