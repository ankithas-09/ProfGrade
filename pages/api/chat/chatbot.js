import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_NAME);

const EXPECTED_DIMENSION = 1; // Update dimension to match your vector length

async function performQuery(query) {
  if (typeof query !== 'string') {
    throw new Error('Invalid query format. Expected a string.');
  }

  try {
    const queryEmbedding = await getEmbedding(query);

    if (!Array.isArray(queryEmbedding) || 
        !queryEmbedding.every(num => typeof num === 'number') ||
        queryEmbedding.length !== EXPECTED_DIMENSION) {
      throw new Error(`Invalid embedding vector format. Expected an array of ${EXPECTED_DIMENSION} numbers.`);
    }

    const topMatches = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });

    console.log('Top Matches:', topMatches); // Log top matches

    // Select the best match based on the highest score or any other relevant criteria
    const bestMatch = topMatches.matches[0];

    if (!bestMatch) {
      return {
        status: 'error',
        message: 'No relevant matches found.',
      };
    }

    // Construct response with metadata from the best match
    const metadata = bestMatch.metadata || {};
    const context = `Rating: ${metadata.Rating || 'N/A'}
Review: ${metadata.Review || 'N/A'}
Subject: ${metadata.Subject || 'N/A'}`;

    return {
      status: 'success',
      context
    };
  } catch (error) {
    console.error('Error in performQuery:', error);
    return {
      status: 'error',
      message: 'Error querying Pinecone.',
    };
  }
}

async function getEmbedding(text) {
  // Ensure the vector has exactly one dimension
  return [0.1]; // Dummy vector for testing
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { query } = req.body;
      console.log('Query:', query);

      if (typeof query !== 'string') {
        throw new Error('Invalid query format. Expected a string.');
      }
      
      const result = await performQuery(query);

      console.log('Result:', result); // Log result

      if (result.status === 'success') {
        res.status(200).json({ text: result.context });
      } else {
        res.status(500).json({ message: result.message });
      }
    } catch (error) {
      console.error('Error in POST handler:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
