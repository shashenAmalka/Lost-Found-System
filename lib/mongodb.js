import mongoose from 'mongoose'
import dns from 'node:dns'

// Store the connection to avoid reconnecting on every request
let cached = global.mongoose || { conn: null, promise: null }
if (!global.mongoose) {
    global.mongoose = cached
}

const SRV_DNS_ERROR_HINTS = ['querySrv', 'ENOTFOUND', 'ECONNREFUSED', '_mongodb._tcp']

function isSrvDnsError(error) {
    const message = String(error?.message || '')
    return SRV_DNS_ERROR_HINTS.some((hint) => message.includes(hint))
}

export function isDbConnectionError(error) {
    if (!error) return false
    if (error.name === 'MongooseServerSelectionError') return true
    if (error.code === 'DB_CONNECTION_FAILED') return true
    return isSrvDnsError(error)
}

function buildDbError(error) {
    const wrapped = new Error('Database connection failed')
    wrapped.code = 'DB_CONNECTION_FAILED'
    wrapped.cause = error
    wrapped.message = `Database connection failed: ${error?.message || 'Unknown error'}`
    return wrapped
}

function getConfiguredDnsServers() {
    const raw = process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1'
    return raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
}

function shouldForceDnsForAtlas(uri) {
    if (!uri || !uri.startsWith('mongodb+srv://')) return false
    if (String(process.env.MONGODB_FORCE_DNS || '').toLowerCase() === 'false') return false
    return true
}

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI
    const MONGODB_URI_FALLBACK = process.env.MONGODB_URI_FALLBACK

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable (e.g., in .env.local or Vercel settings)')
    }
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = (async () => {
            try {
                return await mongoose.connect(MONGODB_URI)
            } catch (primaryErr) {
                if (shouldForceDnsForAtlas(MONGODB_URI) && isSrvDnsError(primaryErr)) {
                    const servers = getConfiguredDnsServers()
                    if (servers.length > 0) {
                        dns.setServers(servers)
                        try {
                            return await mongoose.connect(MONGODB_URI)
                        } catch (dnsRetryErr) {
                            primaryErr = dnsRetryErr
                        }
                    }
                }

                const shouldTryFallback =
                    Boolean(MONGODB_URI_FALLBACK) &&
                    MONGODB_URI.startsWith('mongodb+srv://') &&
                    isSrvDnsError(primaryErr)

                if (!shouldTryFallback) {
                    throw primaryErr
                }

                // Fallback supports networks where SRV DNS lookups are blocked.
                return mongoose.connect(MONGODB_URI_FALLBACK)
            }
        })().catch((error) => {
            cached.promise = null
            throw buildDbError(error)
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}

export default connectDB
