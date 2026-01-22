# Build stage
FROM public.ecr.aws/lambda/nodejs:22 AS builder

WORKDIR /build

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install pnpm
RUN npm install -g pnpm@10

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm run prisma:generate

# Build TypeScript
RUN pnpm run build

# Production stage
FROM public.ecr.aws/lambda/nodejs:22

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install pnpm
RUN npm install -g pnpm@10

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/src/generated ./src/generated

# Set the CMD to your handler
CMD [ "dist/lambda.handler" ]
