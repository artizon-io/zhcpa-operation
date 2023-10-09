variable "aws_region" {
  description = "AWS region to deploy to"

  type = string
  default = "ap-east-1"
}

variable "env_name" {
  description = "Environment name"

  type = string
  default = "dev"
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