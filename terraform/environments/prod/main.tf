terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket       = "iconcoderz-terraform-state"
    key          = "prod/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "iam" {
  source      = "../../modules/iam"
  project     = var.project
  environment = var.environment
}

module "secrets" {
  source      = "../../modules/secrets"
  project     = var.project
  environment = var.environment

  database_url          = var.database_url
  smtp_host             = var.smtp_host
  smtp_user             = var.smtp_user
  smtp_pass             = var.smtp_pass
  cloudinary_cloud_name = var.cloudinary_cloud_name
  cloudinary_api_key    = var.cloudinary_api_key
  cloudinary_api_secret = var.cloudinary_api_secret
  jwt_secret            = var.jwt_secret
  base_url_client       = var.base_url_client
  qr_secret_key         = var.qr_secret_key
}

module "lambda_api" {
  source       = "../../modules/lambda-api"
  project      = var.project
  environment  = var.environment
  role_arn     = module.iam.lambda_role_arn
  database_url = var.database_url
  image_tag    = var.image_tag
}

module "api_gateway" {
  source               = "../../modules/api_gateway"
  project              = var.project
  environment          = var.environment
  lambda_invoke_arn    = module.lambda_api.invoke_arn
  lambda_function_name = module.lambda_api.function_name
}

output "api_url" {
  value = module.api_gateway.api_endpoint
}

output "lambda_function_name" {
  value = module.lambda_api.function_name
}

output "lambda_role_arn" {
  value = module.iam.lambda_role_arn
}

output "ecr_repository_url" {
  value = module.lambda_api.ecr_repository_url
}

output "secret_database_url_arn" {
  value = module.secrets.database_url_arn
}