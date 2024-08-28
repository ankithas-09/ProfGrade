import * as cheerio from 'cheerio';
import axios from 'axios';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIApi, Configuration } from 'openai';

const pcak = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    try {
      // Scrape the website for data
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const Professor = $('div.NameTitle__Name-dowf0z-0.cfjPUG').text().trim();
      const Subject = $('a.TeacherDepartment__StyledDepartmentLink-fl79e8-0').text().trim();
      const Rating = $('div.RatingValue__Numerator-qw8sqy-2').first().text().trim();
      const Review = $('div.Comments__StyledComments-dzzyvm-0').first().text().trim();

      console.log("Professor:", Professor);
      console.log("Subject:", Subject);
      console.log("Rating:", Rating);
      console.log("Review:", Review);

      // Generate embeddings using OpenAI
      const configuration = new Configuration({
        apiKey: openaiApiKey,
      });
      const openai = new OpenAIApi(configuration);

      const embeddingResponse = await openai.createEmbedding({
        model: 'text-embedding-ada-002', // Use the appropriate model for embeddings
        input: [Review],
      });

      const embedding = embeddingResponse.data.data[0].embedding;

      // Store the scraped data and embeddings in Pinecone
      const pc = new Pinecone({ apiKey: pcak });
      const index = pc.index('rag').namespace('namespace');

      await index.upsert([{
        id: Professor, // Unique ID, you could also use a combination of name and subject
        values: embedding, // Embedding values
        metadata: {
          Subject,
          Rating,
          Review,
        },
      }]);

      // Return a success message
      return res.status(200).json({ 
        success: true, 
        message: 'Data and embeddings successfully stored in Pinecone' 
      });
    } catch (error) {
      console.error('Error scraping data or storing in Pinecone:', error);
      return res.status(500).json({ success: false, message: 'Failed to scrape and store data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
