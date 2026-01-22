data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../../../dist"
  output_path = "${path.module}/lambda.zip"
  excludes    = ["node_modules"]
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.project}-${var.environment}"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  handler = "lambda.handler"
  runtime = "nodejs20.x"
  role    = var.role_arn

  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      NODE_ENV     = var.environment
      DATABASE_URL = var.database_url
    }
  }
}

output "function_name" {
  value = aws_lambda_function.api.function_name
}

output "invoke_arn" {
  value = aws_lambda_function.api.invoke_arn
}

variable "project" {}
variable "environment" {}
variable "role_arn" {}
variable "database_url" {}
