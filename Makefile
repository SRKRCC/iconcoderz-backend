.PHONY: install dev build prisma-generate prisma-push tf-plan tf-apply setup

install:
	pnpm install

dev:
	pnpm run dev

build:
	pnpm run build

prisma-generate:
	pnpm prisma generate

prisma-push:
	pnpm prisma db push

prisma-studio:
	pnpm prisma studio

tf-init:
	cd terraform && terraform init

tf-plan:
	cd terraform && terraform workspace select dev || terraform workspace new dev
	cd terraform && terraform plan -var-file=environments/dev/terraform.tfvars

tf-apply:
	cd terraform && terraform workspace select dev
	cd terraform && terraform apply -auto-approve -var-file=environments/dev/terraform.tfvars

tf-deploy-prod:
	cd terraform && terraform workspace select prod || terraform workspace new prod
	cd terraform && terraform apply -auto-approve -var-file=environments/prod/terraform.tfvars

setup: install prisma-generate
	bash scripts/setup-tf-backend.sh
	@echo "Setup complete! Run 'make dev' to start."
