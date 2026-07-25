import { AnalystCapability } from './src/lib/ai/features/advisor/capabilities/AnalystCapability';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const res = await AnalystCapability.execute({ age: 30, monthlyIncome: 100000 });
    console.log("SUCCESS", res);
  } catch (e) {
    console.error("FAILED", e);
  }
}
run();
