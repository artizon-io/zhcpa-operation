# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity
data "aws_caller_identity" "this" {}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecr_authorization_token
data "aws_ecr_authorization_token" "this" {}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/cloudwatch_log_group
# data "aws_cloudwatch_log_group" "this" {
#   name = var.lambda_name
# }

data "aws_secretsmanager_secret_version" "this" {
  secret_id = var.project_name
}

// https://registry.terraform.io/providers/hashicorp/external/latest/docs/data-sources/external
# data "external" "app_version" {
#   program = ["poetry", "version --short"]
#   working_dir = var.source_path
# }

# resource "null_resource" "app_version" {
#   # https://developer.hashicorp.com/terraform/language/resources/provisioners/local-exec
#   provisioner "local-exec" {
#     command     = "poetry version --short > VERSION"
#     working_dir = var.source_path
#   }
# }

# data "local_file" "app_version" {
#   filename   = "${var.source_path}/VERSION"
#   depends_on = [null_resource.app_version]
# }

locals {
  ecr_url       = format("%v.dkr.ecr.%v.amazonaws.com", data.aws_caller_identity.this.account_id, var.aws_region)
  ecr_image_url = format("%v/%v:%v", local.ecr_url, aws_ecr_repository.this.id, local.app_version)
  app_version   = var.app_version
  # app_version    = trim(data.local_file.app_version.content, " ")
  # app_version = data.external.app_version.result
  secrets = jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)
  # envs             = { for tuple in regexall("(.*)=(.*)", file(".env")) : tuple[0] => sensitive(tuple[1]) }
  # bump_app_version = coalesce(local.envs["BUMP_APP_VERSION"], true)
}

provider "aws" {
  region = var.aws_region
}

provider "docker" {
  host = format("unix:///Users/%v/.docker/run/docker.sock", var.host_username)

  registry_auth {
    address  = local.ecr_url
    username = data.aws_ecr_authorization_token.this.user_name
    password = data.aws_ecr_authorization_token.this.password
  }
}

provider "null" {
}

resource "null_resource" "generate_requirement_txt" {
  # https://developer.hashicorp.com/terraform/language/resources/provisioners/local-exec
  provisioner "local-exec" {
    command     = "poetry export -f requirements.txt > requirements.txt"
    working_dir = var.source_path
  }
}

# https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs/resources/image
resource "docker_image" "this" {
  name         = local.ecr_image_url
  force_remove = true

  build {
    # https://docs.docker.com/build/building/context/
    context    = var.source_path
    dockerfile = "Dockerfile"
    build_args = {}
    platform   = "linux/amd64"
  }

  depends_on = [null_resource.generate_requirement_txt]
}

# https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs/resources/registry_image
resource "docker_registry_image" "this" {
  name = docker_image.this.name

  keep_remotely = true # Whether to delete remote image on terraform destroy. Shadowed by aws_ecr_repository.force_delete
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository
resource "aws_ecr_repository" "this" {
  name                 = var.lambda_name
  image_tag_mutability = "IMMUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Manages the lifecycle of docker image in a registry
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_lifecycle_policy
resource "aws_ecr_lifecycle_policy" "this" {
  repository = aws_ecr_repository.this.id
  policy = jsonencode({
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

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "this" {
  function_name = var.lambda_name
  timeout       = var.lambda_timeout
  image_uri     = docker_registry_image.this.name
  package_type  = "Image"

  role = aws_iam_role.this.arn

  environment {
    variables = {
      VERSION = local.app_version
    }
  }
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "this" {
  name = "${var.lambda_name}-role"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "secretmanager_policy" {
  name = "secretmanager-read"
  role = aws_iam_role.this.id

  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [{
      "Effect" : "Allow",
      "Action" : "secretsmanager:GetSecretValue",
      "Resource" : data.aws_secretsmanager_secret_version.this.arn
    }]
  })
}

# ! Cannot get lambda to log to custom log group
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group
# resource "aws_cloudwatch_log_group" "this" {
#   name              = var.lambda_name
#   retention_in_days = 7
#   lifecycle {
#     prevent_destroy = false
#   }
# }

resource "aws_iam_role_policy" "log_policy" {
  name = "log"
  role = aws_iam_role.this.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      # Let lambda function creates its own log group
      # https://docs.aws.amazon.com/lambda/latest/operatorguide/access-logs.html
      {
        "Effect" : "Allow",
        "Action" : "logs:CreateLogGroup",
        "Resource" : "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.this.account_id}:*"
      },
      {
        Action : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.this.account_id}:log-group:/aws/lambda/${var.lambda_name}:*"
      }
    ]
  })
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule
# https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html
resource "aws_cloudwatch_event_rule" "this" {
  name = var.lambda_name
  # https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cron-expressions.html
  # https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rate-expressions.html
  schedule_expression = "cron(0 3 * * ? *)"
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target
resource "aws_cloudwatch_event_target" "this" {
  rule = aws_cloudwatch_event_rule.this.name
  arn  = aws_lambda_function.this.arn
}
