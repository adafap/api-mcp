import mongoose from 'mongoose';

// Connection status
let isConnected = false;

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async () => {
  // If already connected, return directly
  if (isConnected) {
    return;
  }

  try {
    // biome-ignore lint: Forbidden non-null assertion.
    const db = await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;

    console.log('✅ MongoDB connected successfully');

    // Listen for connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    // Listen for disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected');
      isConnected = false;
    });

    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};
