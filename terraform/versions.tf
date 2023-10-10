terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.46.0"
    }
    # https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
    # https://registry.terraform.io/providers/hashicorp/null/latest
    null = {
      source = "hashicorp/null"
      version = "3.2.1"
    }
    # external = {
    #   source = "hashicorp/external"
    #   version = "2.3.1"
    # }
    # random = {
    #   source  = "hashicorp/random"
    #   version = "~> 3.5.0"
    # }
    # archive = {
    #   source  = "hashicorp/archive"
    #   version = "~> 2.3.0"
    # }
  }

  backend "s3" {
    bucket = "artizon.terraform.tfstate"
    key    = "zhop"
    region = "ap-east-1"
  }

  required_version = "~> 1.6.0"
}
