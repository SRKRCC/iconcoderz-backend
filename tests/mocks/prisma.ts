import { PrismaClient } from "../../src/generated/prisma/client.js";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

// Mock the prisma client
// ensuring that we are mocking the default export or named export as used in the app
import { prisma } from "../../src/utils/prisma";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
