variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project Name"
  type        = string
  default     = "iconcoderz"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
  default     = "default"
}

variable "database_url" {
  description = "Neon Database URL"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Custom Domain Name"
  type        = string
  default     = "api.iconcoderz.srkrcodingclub.in"
}

# Secrets
variable "smtp_host" {}
variable "smtp_user" {}
variable "smtp_pass" {}
variable "cloudinary_cloud_name" {}
variable "cloudinary_api_key" {}
variable "cloudinary_api_secret" {}
variable "jwt_secret" {}
variable "base_url_client" {}
variable "qr_secret_key" {}
