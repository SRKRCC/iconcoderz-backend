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

resource "aws_secretsmanager_secret" "jwt_config" {
  name                    = "${var.project}/${var.environment}/jwt-config"
  description             = "JWT configuration"
  recovery_window_in_days = 7

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "jwt_config" {
  secret_id = aws_secretsmanager_secret.jwt_config.id
  secret_string = jsonencode({
    secret = var.jwt_secret
  })
}

resource "aws_secretsmanager_secret" "client_config" {
  name                    = "${var.project}/${var.environment}/client-config"
  description             = "Client URL configuration"
  recovery_window_in_days = 7

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "client_config" {
  secret_id = aws_secretsmanager_secret.client_config.id
  secret_string = jsonencode({
    base_url = var.base_url_client
  })
}

resource "aws_secretsmanager_secret" "qr_config" {
  name                    = "${var.project}/${var.environment}/qr-config"
  description             = "QR code secret key for verification"
  recovery_window_in_days = 7

  tags = {
    Application = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "qr_config" {
  secret_id = aws_secretsmanager_secret.qr_config.id
  secret_string = jsonencode({
    secret_key = var.qr_secret_key
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
variable "jwt_secret" {}
variable "base_url_client" {}
variable "qr_secret_key" {}

output "database_url_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "smtp_credentials_arn" {
  value = aws_secretsmanager_secret.smtp_credentials.arn
}

output "cloudinary_api_arn" {
  value = aws_secretsmanager_secret.cloudinary_api.arn
}

output "jwt_config_arn" {
  value = aws_secretsmanager_secret.jwt_config.arn
}

output "client_config_arn" {
  value = aws_secretsmanager_secret.client_config.arn
}

output "qr_config_arn" {
  value = aws_secretsmanager_secret.qr_config.arn
}
