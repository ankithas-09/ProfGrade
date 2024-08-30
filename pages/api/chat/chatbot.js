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

const isProfessorRelatedQuery = (query) => {
  const professorKeywords = [
    // Core terms
    "professor",
    "prof",
    "teacher",
    "instructor",
    "faculty",
    "lecturer",
    "class",
    "course",
    "subject",
    "department",
    "major",
    "minor",
    "teach",
    "lecture",
    "grade",
    "grading",
    "rating",
    "review",
    "difficulty",
    "style",
    "availability",
    "office hours",

    // Academic terms
    "syllabus",
    "curriculum",
    "semester",
    "quarter",
    "term",
    "exam",
    "test",
    "quiz",
    "assignment",
    "homework",
    "project",
    "midterm",
    "final",
    "paper",
    "essay",
    "thesis",

    // Academic levels
    "undergraduate",
    "graduate",
    "phd",
    "doctoral",
    "masters",
    "freshman",
    "sophomore",
    "junior",
    "senior",

    // Course types
    "seminar",
    "lecture",
    "lab",
    "workshop",
    "tutorial",

    // Teaching styles
    "hands-on",
    "theoretical",
    "practical",
    "discussion-based",
    "interactive",
    "online",
    "in-person",
    "hybrid",

    // Evaluation terms
    "workload",
    "tough",
    "easy",
    "fair",
    "strict",
    "lenient",
    "helpful",
    "knowledgeable",
    "engaging",
    "boring",

    // Academic fields (add more as needed)
    "math",
    "science",
    "engineering",
    "humanities",
    "arts",
    "social sciences",
    "business",
    "economics",
    "psychology",
    "computer science",
    "biology",
    "chemistry",
    "physics",

    // Miscellaneous
    "gpa",
    "credits",
    "prerequisites",
    "textbook",
    "materials",
    "attendance",
    "participation",
    "curve",
    "extra credit",
    "research",
    "internship",
    "ta",
    "teaching assistant",
  ];

  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();

  // Check for exact matches first
  if (professorKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return true;
  }

  // Check for partial matches (e.g., "prof" in "professor")
  if (
    professorKeywords.some((keyword) =>
      lowerQuery
        .split(" ")
        .some((word) => word.startsWith(keyword) || keyword.startsWith(word))
    )
  ) {
    return true;
  }

  // Check for common academic phrases
  const academicPhrases = [
    "how is",
    "who is the best",
    "recommend a",
    "looking for",
    "need help with",
    "advice on",
    "opinions about",
    "experiences with",
    "thoughts on",
    "anyone taken",
    "has anyone",
    "tell me about",
  ];

  if (academicPhrases.some((phrase) => lowerQuery.includes(phrase))) {
    return true;
  }

  return false;
};

const openai = new OpenAI();

export async function POST(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST requests are allowed" });
    }

    try {
        const { conversation } = req.body;

        // Log the request body for debugging
        console.log("Request Body:", JSON.stringify(req.body, null, 2));

        // Validate the request body
        if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
            return res.status(400).json({ message: "Request body is not valid. Expected an array of messages." });
        }

        const userQuery = conversation[conversation.length - 1].content;

        // Check if userQuery is defined
        if (!userQuery) {
            return res.status(400).json({ message: "User query is missing." });
        }

        // Validate if the query is related to professors
        if (!isProfessorRelatedQuery(userQuery)) {
            return res.status(400).json({
                message: "I'm sorry, but I can only assist with queries related to professors and their courses. Could you please ask a question about a professor, their teaching style, or a specific course?",
            });
        }

        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const index = pc.index("rag").namespace("ns1");

        // Generate embedding with a vector dimension of 1
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: userQuery,
            encoding_format: "float",
        });

        // Extracting only the first dimension for the query
        const vector = [embedding.data[0].embedding[0]]; // Take the first element to match dimension 1

        const results = await index.query({
            topK: 5,
            includeMetadata: true,
            vector: vector, // Use the adjusted vector
        });

        const structuredResults = results.matches.map((match) => ({
            professor: match.metadata.professor || match.id,
            review: match.metadata.review || match.metadata.summary,
            subject: match.metadata.subject || match.metadata.department,
            stars: match.metadata.stars || match.metadata.overallRating,
        }));

        const lastMessageContent = userQuery + JSON.stringify(structuredResults);
        const lastDataWithoutLastMessage = conversation.slice(0, conversation.length - 1);

        // Adjusting the roles to valid ones
        const messages = [
            { role: "system", content: systemprompt },
            ...lastDataWithoutLastMessage.map((msg) => ({
                role: msg.role === "bot" ? "assistant" : msg.role, // Change 'bot' to 'assistant'
                content: msg.content,
            })),
            { role: "user", content: lastMessageContent },
        ];

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
            stream: false,
        });

        const structuredResponse = {
            message: completion.choices[0].message.content,
            results: structuredResults,
        };

        return res.status(200).json(structuredResponse);
    } catch (error) {
        console.error("Error in API route:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// Default export for the handler
export default function handler(req, res) {
    return POST(req, res);
}
