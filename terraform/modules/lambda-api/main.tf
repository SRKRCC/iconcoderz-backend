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
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 5
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
  image_uri     = "${aws_ecr_repository.lambda.repository_url}:latest"
  role          = var.role_arn

  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      NODE_ENV     = var.environment
      DATABASE_URL = var.database_url
    }
  }

  lifecycle {
    ignore_changes = [image_uri]
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
