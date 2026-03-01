import mongoose from 'mongoose'

// Store the connection to avoid reconnecting on every request
let cached = global.mongoose || { conn: null, promise: null }
if (!global.mongoose) {
    global.mongoose = cached
}

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable (e.g., in .env.local or Vercel settings)')
    }
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            return mongoose
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}

export default connectDB
