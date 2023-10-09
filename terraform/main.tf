# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity
data "aws_caller_identity" "this" {}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecr_authorization_token
data "aws_ecr_authorization_token" "this" {}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecr_repository
# data "aws_ecr_repository" "ecr" {
#   name = "zhop-etl"
# }

locals {
  ecr_address    = format("%v.dkr.ecr.%v.amazonaws.com", data.aws_caller_identity.this.account_id, var.aws_region)
  ecr_repo       = aws_ecr_repository.this.id
  image_tag      = var.env_name
  ecr_image_name = format("%v/%v:%v", local.ecr_address, local.ecr_repo, local.image_tag)
}

provider "aws" {
  region = var.aws_region
}

provider "docker" {
  host = format("unix:///Users/%v/.docker/run/docker.sock", var.host_username)

  registry_auth {
    address  = local.ecr_address
    username = data.aws_ecr_authorization_token.this.user_name
    password = data.aws_ecr_authorization_token.this.password
  }
}

# https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs/resources/image
resource "docker_image" "this" {
  name         = local.ecr_image_name
  force_remove = true

  build {
    # https://docs.docker.com/build/building/context/
    context    = var.source_path
    dockerfile = var.docker_file_path
    build_args = var.build_args
  }
}

# Manages the lifecycle of docker image in a registry
# https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs/resources/registry_image
resource "docker_registry_image" "this" {
  name = docker_image.this.name

  keep_remotely = true # Whether to delete remote image on terraform destroy. Shadowed by aws_ecr_repository.force_delete
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository
resource "aws_ecr_repository" "this" {
  name                 = "zhop-etl"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_lifecycle_policy
resource "aws_ecr_lifecycle_policy" "this" {
  repository = local.ecr_repo
  policy     = jsonencode({
    "rules" : [
      {
        "rulePriority" : 1,
        "description" : "Keep only the last 2 images",
        "selection" : {
          "tagStatus" : "any",
          "countType" : "imageCountMoreThan",
          "countNumber" : 2
        },
        "action" : {
          "type" : "expire"
        }
      }
    ]
  })
}

# https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/pet
# resource "random_pet" "lambda_bucket_name" {
#   prefix = "zhop"
#   length = 4
# }

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
# resource "aws_s3_bucket" "lambda_bucket" {
#   bucket = random_pet.lambda_bucket_name.id
# }

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "lambda_fn" {
  function_name = "zhop-etl-${var.env_name}"
  timeout       = 10 # seconds
  image_uri     = "${docker_registry_image.this.name}"
  package_type  = "Image"

  role = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      ENVIRONMENT = var.env_name
    }
  }
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda_role" {
  name = "zhop-etl-${var.env_name}"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}
