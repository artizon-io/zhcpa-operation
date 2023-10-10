variable "aws_region" {
  description = "AWS region to deploy to"

  type    = string
  default = "ap-east-1"
}

variable "project_name" {
  description = "Name of the project"

  type    = string
  default = "zhop"
}

variable "lambda_name" {
  description = "Name of the lambda function"

  type    = string
  default = "etl"
}

variable "lambda_timeout" {
  description = "Timeout of the lambda function"

  type    = number
  default = 300

}

variable "source_path" {
  description = "Root path of the lambda workspace"

  type    = string
  default = "../lambda"
}

variable "host_username" {
  description = "Username of the host machine. Used for locating the Docker daemon"

  type = string
}

variable "app_version" {
  description = "Version of the app"

  type    = string
}

# variable "bump_app_version" {
#   description = "Whether to bump the app version"

#   type    = bool
#   default = true
# }