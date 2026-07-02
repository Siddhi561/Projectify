import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../core/logger/logger.js';

export async function connectDB() {
    try {
        mongoose.set('strictQuery', true);

        const conn = await mongoose.connect(env.mongoUri, {
            dbName: 'projectify',
        });

        logger.info(`MongoDB connected: ${conn.connection.host}`);

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected - retrying...');
        });
    } catch (error) {
        logger.error('MOngoDB connection failed', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}