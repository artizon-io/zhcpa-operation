variable "aws_region" {
  description = "AWS region to deploy to"

  type = string
  default = "ap-east-1"
}

variable "ver" {
  description = "Version"

  type = string
}

variable "project_name" {
  description = "Name of the project"

  type = string
  default = "zhop"
}

variable "lambda_name" {
  description = "Name of the lambda function"

  type = string
  default = "etl"
}

variable "lambda_timeout" {
  description = "Timeout of the lambda function"

  type = number
  default = 300
  
}

variable "source_path" {
  description = "Root path of the lambda workspace"

  type = string
  default = "../lambda"
}

variable "docker_file_path" {
  description = "Path of the Dockerfile"

  type = string
  default = "Dockerfile"
}

variable "build_args" {
  description = "Build arguments for Docker build"

  type = map(string)
  default = {}
}

variable "host_username" {
  description = "Username of the host machine. Used for locating the Docker daemon"

  type = string
}