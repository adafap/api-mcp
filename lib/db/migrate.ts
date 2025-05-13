import mongoose from 'mongoose';
import { performance } from 'node:perf_hooks';

/**
 * MongoDB migration script
 * This script is used to initialize the database and perform any necessary migrations
 */
async function migrate() {
  const start = performance.now();

  try {
    // Connect to MongoDB
    console.log('⏳ Connecting to MongoDB...');
    // biome-ignore lint: Forbidden non-null assertion.
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log('✅ MongoDB connection successful');

    // MongoDB doesn't need migration scripts like PostgreSQL
    // Collections will be created automatically on first use
    console.log(
      '✅ MongoDB migration not needed, collections will be created automatically on first use',
    );

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');

    const end = performance.now();
    console.log('✅ Operation completed, took', end - start, 'ms');
  } catch (error) {
    console.error('❌ MongoDB operation failed', error);
    process.exit(1);
  }
}

migrate().catch((error) => {
  console.error('❌ Migration failed');
  console.error(error);
  process.exit(1);
});
