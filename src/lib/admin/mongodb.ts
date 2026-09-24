import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "";

const MONGO_DB =
  process.env.MONGO_DB_NAME ||
  process.env.MONGODB_DB ||
  "rajput-events-db";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectMongo() {
  if (!MONGO_URI) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in environment variables.",
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getMongoDbName() {
  return MONGO_DB;
}
