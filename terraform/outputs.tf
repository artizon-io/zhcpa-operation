output "APP_NAME" {
  description = "Application name"
  value       = var.lambda_name
}

output "APP_VERSION" {
  description = "Application version"
  value       = var.app_version
}

output "AWS_ACCOUNT_ID" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.this.account_id
}

output "AWS_REGION" {
  description = "AWS region"
  value       = var.aws_region
}

output "ECR_URL" {
  description = "AWS ECR URL"
  value       = local.ecr_url
}

output "IMAGE_URL" {
  description = "Docker image URL"
  value       = local.ecr_image_url
}
