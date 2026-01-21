terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "iconcoderz-tf-state-backend"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "iconcoderz-tf-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
