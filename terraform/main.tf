module "iam" {
  source      = "./modules/iam"
  project     = var.project
  environment = var.environment
}

module "lambda_api" {
  source                = "./modules/lambda-api"
  project               = var.project
  environment           = var.environment
  role_arn              = module.iam.lambda_role_arn
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
  image_tag             = "latest"
}

module "api_gateway" {
  source               = "./modules/api_gateway"
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
