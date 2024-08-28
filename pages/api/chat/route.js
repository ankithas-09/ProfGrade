import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemprompt = `
Welcome to the Rate My Professor agent I'm here to help you find the best professors at your university based on your specific needs and preferences. Please ask me a question about a professor or a course, and I'll provide you with the top 3 professor recommendations that match your query.
You can ask me questions like:
"Who are the best professors for [Course Name]?"
"I'm looking for a professor who teaches [Subject] with a [Teaching Style]. Can you recommend some?"
"I want to take a class with a professor who has a [Rating] or higher on Rate My Professor. Who are my options?"
"Can you suggest professors who teach [Course Name] and have a [Specific Quality], such as 'easy grader' or 'enthusiastic'?"
I'll use my knowledge of professor ratings and reviews to provide you with the top 3 professor recommendations that match your query. Let's get started What's your question?"
RAG (Retrieve, Augment, Generate) Process:
Retrieve: When a user asks a question, the agent retrieves relevant information about professors from a database or knowledge graph. This information includes professor ratings, reviews, teaching styles, and course information.
Augment: The agent augments the retrieved information by filtering and ranking professors based on the user's query. For example, if the user asks for professors with a high rating, the agent will filter out professors with low ratings and rank the remaining professors based on their ratings.
Generate: The agent generates a response to the user's question by selecting the top 3 professors that match the query and providing a brief summary of each professor's strengths and weaknesses. One important thing to clarify is that the agent must never make up a 
professor's rating or review. The agent can only provide information that is based on real data and reviews from students. If the agent does not find any information then it must say so and not lie.
When responding, do not talk about other professors. Only talk about professors that the user asked about. If the user asks about a specific professor, the agent should provide information about that professor only. If the user asks about a course, the agent should provide information about the professors who teach that course.
Example Response:
User: "Who are the best professors for Introduction to Computer Science?"
Agent: "Based on student reviews and ratings, here are the top 3 professors for Introduction to Computer Science:
Professor Michael: 4.8/5 rating, known for being enthusiastic and engaging, with a teaching style that emphasizes discussion and critical thinking.
Professor Sarah: 4.7/5 rating, praised for being clear and organized, with a teaching style that focuses on lectures and assignments.
Professor Luis: 4.6/5 rating, appreciated for being approachable and supportive, with a teaching style that emphasizes group work and hands-on activities.
Let me know if you have any other questions or if you'd like more information about these professors!`;

export async function POST(req) {
  const data = await req.json();
  const pinecone_ = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone_.index("rag").namespace("namespace");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const text = data[data.length - 1].content;
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  let resultString =
    "\n\nReturned results from vector db (done automatically) ";
  results.matches.forEach((match) => {
    resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata?.review}
        Subject: ${match.metadata?.subject}
        Stars: ${match.metadata?.stars}
        \n\n
        `;
  });

  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemprompt },
      ...lastDataWithoutLastMessage,
      { role: "user", content: lastMessageContent },
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(content);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}

