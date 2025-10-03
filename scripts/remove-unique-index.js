// Script to remove the unique index that prevents multiple reviews
// Run this script once to remove the existing database constraint

const { MongoClient } = require('mongodb');

async function removeUniqueIndex() {
  // Update this with your actual MongoDB connection string
  const uri = 'mongodb+srv://rabbilmia:G3Yth60kscsiEsJO@cluster0.61l9sjy.mongodb.net/e-commerce';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('reviews');
    
    // List existing indexes
    console.log('Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });
    
    // Drop the unique index on user + product if it exists
    try {
      await collection.dropIndex({ user: 1, product: 1 });
      console.log('✅ Successfully removed unique index on user + product');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Index not found - it may have already been removed');
      } else {
        console.error('❌ Error removing index:', error.message);
      }
    }
    
    // List indexes after removal
    console.log('\nIndexes after removal:');
    const newIndexes = await collection.listIndexes().toArray();
    newIndexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

removeUniqueIndex();