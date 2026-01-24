variable "project" {
  type = string
}

variable "environment" {
  type    = string
  default = "default"
}

variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "smtp_host" {
  type = string
}

variable "smtp_user" {
  type = string
}

variable "smtp_pass" {
  type      = string
  sensitive = true
}

variable "cloudinary_cloud_name" {
  type = string
}

variable "cloudinary_api_key" {
  type = string
}

variable "cloudinary_api_secret" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "base_url_client" {
  type = list(string)
}

variable "qr_secret_key" {
  type      = string
  sensitive = true
}

variable "image_tag" {
  type = string
}
