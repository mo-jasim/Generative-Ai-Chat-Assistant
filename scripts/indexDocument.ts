import dotenv from "dotenv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { join } from "path";

// Load environment variables
dotenv.config();

async function indexDocument() {
  try {
    console.log("🚀 Starting document indexing...");

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Pinecone client
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    console.log("📋 Connecting to Pinecone index...");
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Create vector store instance
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    // Load the PDF document
    const pdfPath = join(process.cwd(), "cg-internal-docs.pdf");
    console.log(`📄 Loading PDF from: ${pdfPath}`);

    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    console.log(`📚 Loaded ${docs.length} pages from PDF`);

    // Add metadata to documents
    const docsWithMetadata = docs.map((doc, index) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        title: "Coders Gyan Internal Documentation",
        description: "Internal company documentation and policies",
        fileName: "cg-internal-docs.pdf",
        type: "pdf",
        indexed_at: new Date().toISOString(),
        page: index + 1,
      },
    }));

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    console.log("✂️ Splitting documents into chunks...");
    const splitDocs = await textSplitter.splitDocuments(docsWithMetadata);

    console.log(`📦 Created ${splitDocs.length} chunks`);

    // Add documents to vector store
    console.log("🔄 Adding documents to vector store...");
    await vectorStore.addDocuments(splitDocs);

    console.log("✅ Successfully indexed the internal documentation!");
    console.log(`📊 Total chunks indexed: ${splitDocs.length}`);

    return {
      success: true,
      chunksCount: splitDocs.length,
      pagesCount: docs.length,
    };
  } catch (error) {
    console.error("❌ Error indexing document:", error);
    throw error;
  }
}

// Run the indexing
if (require.main === module) {
  indexDocument()
    .then((result) => {
      console.log("🎉 Indexing completed successfully!");
      console.log(`📈 Results:`, result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Indexing failed:", error);
      process.exit(1);
    });
}

export { indexDocument };
