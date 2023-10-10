# include .env
include .terraform.env

APP_VERSION ?= $(error Please set this flag)
APP_NAME ?= $(error Please set this flag)
AWS_ACCOUNT_ID ?= $(error Please set this flag)
AWS_REGION ?= $(error Please set this flag)
ECR_URL ?= $(error Please set this flag)
IMAGE_URL ?= $(error Please set this flag)

PORT ?= 9000

IMAGE_NAME = $(APP_NAME):$(APP_VERSION)
# ECR_URL = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
# IMAGE_URL = $(ECR_URL)/$(IMAGE_NAME)

# Tell make that these are not files
.PHONY : docker/build docker/push docker/run/remote docker/run/local invoke/remove invoke/local test run docker/login

docker/build :
	poetry export -f requirements.txt > requirements.txt
	docker build --platform linux/amd64 -t $(IMAGE_NAME) .

docker/login :
	# Docker login with password from stdin
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_URL)

# ! Use terraform apply instead. Use docker/build for local testing
docker/push : docker/build docker/login
	# URL is needed if the image is pushed to private registry
	docker tag $(IMAGE_NAME) $(IMAGE_URL)
	docker push $(IMAGE_URL)

# Need to manually pass credentials environment variables in non-lambda environment
docker/run/remote : docker/login
	docker run -p $(PORT):8080 --env-file ./.aws.env $(IMAGE_URL)

invoke/remote :
	aws lambda invoke --function-name $(APP_NAME) out

docker/run/local : docker/build
	docker run -p $(PORT):8080 --env-file ./.aws.env $(IMAGE_NAME)

invoke/local :
	curl -XPOST 'http://localhost:$(PORT)/2015-03-31/functions/function/invocations' -d '{}'

test :
	poetry run pytest

test/last-failed :
	poetry run pytest --lf

run :
	poetry run python -m op