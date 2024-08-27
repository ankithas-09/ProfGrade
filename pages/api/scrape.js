// pages/api/scrapeData.js
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Pinecone } from '@pinecone-database/pinecone';

const pcak = process.env.PINECONE_API_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Extract relevant information from the page
      const Professor = $('div.NameTitle__Name-dowf0z-0.cfjPUG').text().trim();
      const Subject = $('a.TeacherDepartment__StyledDepartmentLink-fl79e8-0').text().trim();
      const Rating = $('div.RatingValue__Numerator-qw8sqy-2').first().text().trim();
      const Review = $('div.Comments__StyledComments-dzzyvm-0').first().text().trim();

      console.log("Professor:", Professor);
      console.log("Subject:", Subject);
      console.log("Rating:", Rating);
      console.log("Review:", Review);

      // Store the scraped data in Pinecone
      const pc = new Pinecone({ apiKey: pcak });
      const index = pc.index('rag').namespace('ns1');
      await index.upsert([{
        id: professor,
        values: [Professor, Subject, Rating, Review],
        metadata: {
          Subject,
          Rating,
          Review,
        },
      }]);

      // Return a success message
      return res.status(200).json({ 
        success: true, 
        message: 'Data successfully stored in Pinecone' 
      });
    } catch (error) {
      console.error('Error scraping data:', error);
      return res.status(500).json({ success: false, message: 'Failed to scrape and store data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
