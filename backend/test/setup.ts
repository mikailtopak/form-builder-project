// test/setup.ts
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Global test timeout
jest.setTimeout(10000);

console.log('🧪 E2E Test Setup Complete');