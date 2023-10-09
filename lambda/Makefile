include .env

# Set these variables if they haven't been set (env vars)

LAMBDA_NAME ?= etl
TAG ?= $(error Please set this flag)

AWS_ACCOUNT_ID ?= $(error Please set this flag)
AWS_REGION ?= ap-east-1
AWS_ECR_REPO ?= $(LAMBDA_NAME)

PORT ?= 9000

# Derived variables

DOCKER_BUILD = $(LAMBDA_NAME):$(TAG)
ECR_HOME_URL = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
ECR_URL = $(ECR_HOME_URL)/$(DOCKER_BUILD)

# Tell make that these are not files
.PHONY : docker/build docker/push docker/run docker/test lambda/invoke

docker/build :
	poetry export -f requirements.txt > requirements.txt
	docker build --platform linux/amd64 -t $(DOCKER_BUILD) .

# ! Use terraform apply instead. Use docker/build for local testing
docker/push : docker/build
	# Docker login with password from stdin
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_HOME_URL)
	# URL is needed if the image is pushed to private registry
	docker tag $(DOCKER_BUILD) $(ECR_URL)
	docker push $(ECR_URL)

# Need to manually pass credentials environment variables in non-lambda environment
docker/run :
	docker run -p $(PORT):8080 --env-file ./.env-secrets $(ECR_URL)

docker/test :
	curl -XPOST 'http://localhost:$(PORT)/2015-03-31/functions/function/invocations' -d '{}'

lambda/invoke:
	aws lambda invoke --function-name $(LAMBDA_NAME) out