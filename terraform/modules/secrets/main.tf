resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project}/${var.environment}/db-url"
  description             = "Neon PostgreSQL connection string"
  recovery_window_in_days = 7

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = jsonencode({ url = var.database_url })
}

resource "aws_secretsmanager_secret" "smtp_credentials" {
  name                    = "${var.project}/${var.environment}/smtp-credentials"
  description             = "SMTP credentials for email sending"
  recovery_window_in_days = 7

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "smtp_credentials" {
  secret_id = aws_secretsmanager_secret.smtp_credentials.id
  secret_string = jsonencode({
    host     = var.smtp_host
    user     = var.smtp_user
    password = var.smtp_pass
    port     = 587
  })
}

resource "aws_secretsmanager_secret" "cloudinary_api" {
  name                    = "${var.project}/${var.environment}/cloudinary-api"
  description             = "Cloudinary API credentials"
  recovery_window_in_days = 7

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "cloudinary_api" {
  secret_id = aws_secretsmanager_secret.cloudinary_api.id
  secret_string = jsonencode({
    cloud_name = var.cloudinary_cloud_name
    api_key    = var.cloudinary_api_key
    api_secret = var.cloudinary_api_secret
  })
}

variable "project" {}
variable "environment" {}
variable "database_url" {}
variable "smtp_host" {}
variable "smtp_user" {}
variable "smtp_pass" {}
variable "cloudinary_cloud_name" {}
variable "cloudinary_api_key" {}
variable "cloudinary_api_secret" {}

output "database_url_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "smtp_credentials_arn" {
  value = aws_secretsmanager_secret.smtp_credentials.arn
}

output "cloudinary_api_arn" {
  value = aws_secretsmanager_secret.cloudinary_api.arn
}
