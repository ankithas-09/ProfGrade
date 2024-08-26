# Rate My Professor AI Assistant

## Overview

Build the Rate My Professor AI Assistant with Next.js, OpenAI, and Pinecone. This project provides a comprehensive platform for reviewing professors by leveraging AI and advanced search technologies. Key features include:

- **Rate My Professor Support Agent:** Utilize data stored in Pinecone to assist with professor reviews.
- **Web Scraping:** Users can submit links to professors' pages. The data from these pages is scraped and inserted into Pinecone.
- **Advanced Search and Recommendation:** Users can query the system to receive personalized professor recommendations based on specific criteria.
- **Sentiment Analysis and Trend Tracking:** Gain insights into changes in professor ratings and review sentiments over time.

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Node.js
- **AI & Search:** OpenAI, Pinecone
- **Web Scraping:** Custom scraping logic

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)

### Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/rate-my-professor-ai-assistant.git
   cd rate-my-professor-ai-assistant

2. **Create .env.local file**

    ```bash
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${Your_key}
    CLERK_SECRET_KEY=${Your_key}
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

3. **Install dependencies and run development server**

    ```bash
    npm install
    npm run dev
    
4. **Access the website**

     Open your browser and navigate to http://localhost:3000 to access the website.
   
   