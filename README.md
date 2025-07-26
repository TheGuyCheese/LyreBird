<h1>
  <a href="https://github.com/your-username/lyrebird">
    <img src="https://raw.githubusercontent.com/velcorum/test2/refs/heads/main/WhatsApp%20Image%202025-07-26%20at%2014.14.11_997e1017.jpg" alt="Author" width="50" style="border-radius: 50%; margin-right: 15px; vertical-align: middle;"/>
  </a>
  LyreBird: 3D Interactive AI Chatbot
</h1>

LyreBird is an innovative 3D interactive chatbot application built with Next.js, React Three Fiber, and Google's Generative AI. It provides an immersive experience where users can interact with a 3D avatar in a virtual environment, engage in intelligent conversations, and experience real-time speech-to-text and text-to-speech functionalities. The project leverages Retrieval-Augmented Generation (RAG) with a Supabase vector database to provide more context-aware and accurate responses.

## Features

-   **3D Interactive Environment**: Built with React Three Fiber (`@react-three/fiber`) and Drei, allowing users to interact with a 3D world.
-   **AI Chatbot**: Powered by the Google Generative AI (`@google/generative-ai`) for intelligent and natural conversations.
-   **Speech Recognition & Synthesis**: Integrates real-time speech-to-text using `react-speech-recognition` and realistic text-to-speech using the ElevenLabs API.
-   **Retrieval-Augmented Generation (RAG)**: Enhances chatbot responses by retrieving relevant information from a Supabase PostgreSQL vector database.
-   **Chat History**: Stores and retrieves conversation history for persistent user sessions.
-   **Customizable 3D Avatars**: Supports `.vrm` and `.glb` avatar formats for a personalized experience.
-   **Modern UI/UX**: Built with Next.js 13+ (App Router), TypeScript, and styled with Tailwind CSS and shadcn/ui components.
-   **Dashboard and Event Pages**: Includes additional pages for user dashboards and event information.

## Technologies Used

| Category              | Technology                                                              |
| :-------------------- | :---------------------------------------------------------------------- |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS                                |
| **3D Graphics** | React Three Fiber, Drei, Three.js                                       |
| **AI & ML** | Google Generative AI (for chat), ElevenLabs API (for text-to-speech)    |
| **Backend** | Next.js API Routes                                                      |
| **Database** | Supabase (PostgreSQL with pgvector for RAG)                             |
| **UI Components** | shadcn/ui                                                               |
| **Speech Recognition**| `react-speech-recognition`                                              |

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Node.js (v18.x or later)
-   npm, yarn, or pnpm
-   A Supabase account for the database and vector store.
-   API keys for Google Generative AI and ElevenLabs.

### Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables. You can get the Supabase URL and anon key from your Supabase project dashboard.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Generative AI
GOOGLE_API_KEY=your_google_api_key

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/lyrebird.git](https://github.com/your-username/lyrebird.git)
    cd lyrebird
    ```

2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

The project follows the standard Next.js App Router structure.

```
.
├── public/
│   └── avatars/         # 3D avatar models (.vrm, .glb)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/    # API routes for chat and history
│   │   │   └── speech/  # API route for text-to-speech
│   │   ├── chat/        # Chat page UI
│   │   ├── dashboard/   # Dashboard page UI
│   │   ├── events/      # Events page UI
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Main application page with 3D scene
│   ├── components/
│   │   ├── ui/          # Reusable UI components (shadcn/ui)
│   │   ├── InteractiveObjectsScene.tsx
│   │   └── LearningScene.tsx
│   └── lib/
│       ├── rag.ts       # RAG implementation logic
│       ├── supabase.ts  # Supabase client configuration
│       ├── utils.ts     # Utility functions
│       └── vector-rag.ts # RAG logic using vector search
├── next.config.js
├── package.json
└── tailwind.config.js
```

## API Endpoints

The application uses Next.js API Routes to handle backend logic.

-   `POST /api/chat`: Handles incoming chat messages, processes them with Google Generative AI (and optionally RAG), and returns the AI's response.
-   `GET /api/chat/history`: Fetches all chat session histories.
-   `GET /api/chat/history/[sessionId]`: Fetches the chat history for a specific session.
-   `POST /api/speech`: Takes text as input and returns an audio stream from the ElevenLabs text-to-speech API.

## 3D Avatars

This project uses 3D avatars for user interaction. The models are located in the `public/avatars/` directory. You can add your own `.vrm` or `.glb` files to this directory and load them within the 3D scenes.

## Retrieval-Augmented Generation (RAG)

The RAG implementation enhances the chatbot's capabilities by providing it with external knowledge. The steps are outlined in `rag steps.md` and implemented in `src/lib/rag.ts` and `src/lib/vector-rag.ts`. It works by:

1.  Taking a user's query.
2.  Converting the query into a vector embedding.
3.  Searching the Supabase vector database for relevant documents.
4.  Passing the retrieved documents along with the original query to the Google Generative AI model as context.
5.  Returning a more informed and accurate response to the user.

## License

This project is licensed under the terms of the LICENSE file. Please see the `LICENSE` file for more details.
