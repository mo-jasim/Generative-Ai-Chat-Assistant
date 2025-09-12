// Test script to verify RAG functionality
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import { searchSimilarDocuments } from "../lib/vectorStore.js";

async function testRAG() {
  try {
    console.log("🧪 Testing RAG functionality...");

    // Check if environment variables are loaded
    if (!process.env.PINECONE_API_KEY) {
      console.error("❌ PINECONE_API_KEY not found in environment");
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found in environment");
      return;
    }

    console.log("✅ Environment variables loaded");

    // Test search queries
    const testQueries = [
      "company policies",
      "vacation policy",
      "coding standards",
      "employee guidelines",
      "Coders Gyan procedures",
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);

      const results = await searchSimilarDocuments(query, 2);

      if (results.length > 0) {
        console.log(`✅ Found ${results.length} relevant documents`);
        results.forEach((doc, index) => {
          console.log(`📄 Document ${index + 1}:`);
          console.log(`   Title: ${doc.metadata.title || "Untitled"}`);
          console.log(
            `   Content preview: ${doc.pageContent.substring(0, 150)}...`
          );
          console.log(`   Metadata: Page ${doc.metadata.page || "N/A"}`);
        });
      } else {
        console.log("❌ No documents found");
      }
    }

    console.log("\n🎉 RAG testing completed!");
  } catch (error) {
    console.error("❌ Error testing RAG:", error);
  }
}

// Run the test
testRAG()
  .then(() => {
    console.log("Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
