# ECR repository for Lambda container images
resource "aws_ecr_repository" "lambda" {
  name                 = "${var.project}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  lifecycle {
    prevent_destroy = false
  }
}

# ECR lifecycle policy to keep only recent images
resource "aws_ecr_lifecycle_policy" "lambda" {
  repository = aws_ecr_repository.lambda.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

resource "aws_lambda_function" "api" {
  function_name = "${var.project}-${var.environment}"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda.repository_url}:${var.image_tag}"
  role          = var.role_arn

  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      NODE_ENV               = "production"
      DATABASE_URL           = var.database_url
      SMTP_HOST              = var.smtp_host
      SMTP_USER              = var.smtp_user
      SMTP_PASS              = var.smtp_pass
      CLOUDINARY_CLOUD_NAME  = var.cloudinary_cloud_name
      CLOUDINARY_API_KEY     = var.cloudinary_api_key
      CLOUDINARY_API_SECRET  = var.cloudinary_api_secret
      JWT_SECRET             = var.jwt_secret
      BASE_URL_CLIENT        = var.base_url_client
      QR_SECRET_KEY          = var.qr_secret_key
    }
  }
}

output "function_name" {
  value = aws_lambda_function.api.function_name
}

output "invoke_arn" {
  value = aws_lambda_function.api.invoke_arn
}

output "ecr_repository_url" {
  value = aws_ecr_repository.lambda.repository_url
}

variable "project" {}
variable "environment" {}
variable "role_arn" {}
variable "database_url" {}
variable "smtp_host" {}
variable "smtp_user" {}
variable "smtp_pass" {}
variable "cloudinary_cloud_name" {}
variable "cloudinary_api_key" {}
variable "cloudinary_api_secret" {}
variable "jwt_secret" {}
variable "base_url_client" {}
variable "qr_secret_key" {}
variable "image_tag" {}
