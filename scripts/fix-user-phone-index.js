/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require("mongodb");

async function fixUserPhoneIndex() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not set. Please define it and rerun the script.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("users");

    const indexes = await collection.listIndexes().toArray();
    const phoneIndex = indexes.find((index) => index.name === "phone_1");

    if (phoneIndex) {
      console.log("Dropping existing phone_1 index", phoneIndex);
      await collection.dropIndex("phone_1");
    } else {
      console.log("No phone_1 index found");
    }

    const trimResult = await collection.updateMany(
      { phone: { $type: "string" } },
      [{ $set: { phone: { $trim: { input: "$phone" } } } }],
    );
    console.log(`Trimmed phone field on ${trimResult.modifiedCount} documents`);

    const unsetResult = await collection.updateMany(
      { phone: { $in: [null, ""] } },
      { $unset: { phone: "" } },
    );
    console.log(`Unset phone field on ${unsetResult.modifiedCount} documents`);

    await collection.createIndex(
      { phone: 1 },
      {
        name: "phone_1",
        unique: true,
        sparse: true,
        partialFilterExpression: { phone: { $type: "string", $ne: "" } },
      },
    );
    console.log("Created sparse unique index on phone field");
  } catch (error) {
    console.error("Failed to fix phone index:", error);
  } finally {
    await client.close();
  }
}

fixUserPhoneIndex();
