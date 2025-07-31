build:
	.PHONY: build

build-GolangFunction:
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -tags lambda.norpc -o bootstrap ./cmd/api
	# Optional: compress with upx
	upx --best --lzma bootstrap
	cp ./bootstrap $(ARTIFACTS_DIR)/