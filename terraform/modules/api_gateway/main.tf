resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project}-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://iconcoderz.srkrcodingclub.in",
      "http://localhost:5173",
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    allow_headers = [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin"
    ]
    expose_headers = ["Content-Length", "Content-Type"]
    max_age        = 7200
    allow_credentials = true
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "any" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

variable "project" {}
variable "environment" {}
variable "lambda_invoke_arn" {}
variable "lambda_function_name" {}
