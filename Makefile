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
	cd terraform/environments/prod && terraform init

tf-plan:
	cd terraform/environments/prod && terraform plan -var-file=terraform.tfvars

tf-apply:
	cd terraform/environments/prod && terraform apply -auto-approve -var-file=terraform.tfvars

tf-deploy-prod:
	cd terraform/environments/prod && terraform apply -auto-approve -var-file=terraform.tfvars

setup: install prisma-generate
	bash scripts/setup-tf-backend.sh
	@echo "Setup complete! Run 'make dev' to start."
