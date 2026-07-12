import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.DATABASE_URL as string;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default client;