build:
	.PHONY: build

build-GolangFunction:
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -tags lambda.norpc -o bootstrap ./cmd/api
	cp ./bootstrap $(ARTIFACTS_DIR)/

test:
	go test -v ./...
