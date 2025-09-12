import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

// Lazy initialization of vector store
let vectorStore: PineconeStore | null = null;

async function getVectorStore() {
  if (!vectorStore) {
    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone client
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Create vector store instance
    vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
  }
  return vectorStore;
}

// Search for similar documents in the vector store/
export async function searchSimilarDocuments(query: string, k: number = 4) {
  try {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error("Error searching similar documents:", error);
    throw error;
  }
}
