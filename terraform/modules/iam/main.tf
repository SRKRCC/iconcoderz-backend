resource "aws_iam_role" "lambda_execution" {
  name = "${var.project}-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "lambda_cloudwatch_logs" {
  name = "${var.project}-${var.environment}-logs"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "arn:aws:logs:ap-south-1:*:log-group:/aws/lambda/${var.project}-${var.environment}*:*"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.project}-${var.environment}-secrets"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
      Resource = "arn:aws:secretsmanager:ap-south-1:*:secret:${var.project}/${var.environment}/*"
    }]
  })
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_execution.arn
}

variable "project" {}
variable "environment" {}
