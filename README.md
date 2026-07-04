# ⚡ AlgoLab // Global Visualizer Sandbox

![AlgoLab Hero Banner](https://img.shields.io/badge/Status-Live_on_Google_Cloud-green?style=for-the-badge&logo=googlecloud)
![JuaraVibeCoding](https://img.shields.io/badge/Submission-%23JuaraVibeCoding-purple?style=for-the-badge&logo=google)

**AlgoLab** is an interactive, brutalist-styled educational laboratory designed to strip away the complexities of computer science concepts and make algorithms visually digestible. Built for the **Google for Developers #JuaraVibeCoding** hackathon.

---

## 🛑 The Problem
As an informatics engineering student, staring at raw code makes it incredibly difficult to grasp abstract logic. Traversals like DFS and BFS, or the theoretical rules of Formal Grammars, often feel like black boxes. Existing tools are mostly static, boring, and require rigid manual inputs that ruin the learning vibe.

## 💡 The Solution
AlgoLab acts as a bridge between abstract theory and visual understanding. 
By integrating **Google's Gemini Vision AI**, this web app allows students to literally upload a photo of a hand-drawn graph from their notebook. The AI parses the image, understands the nodes and edges, and AlgoLab immediately animates the algorithmic traversal (BFS/DFS) step-by-step.

It’s built by a student, for students. 

---

## Live Server
https://algolab-web-329176197970.asia-southeast2.run.app/

## 🛠️ Core Features

### 1. Graph Intelligence (Vision AI)
- **Image-to-Graph:** Upload a sketch of a graph, and Gemini AI will translate it into an adjacency list automatically.
- **Interactive Traversal:** Watch BFS and DFS algorithms traverse the graph node-by-node with visual stepping.
- **Deep Analysis:** Get AI-generated, step-by-step narration of the traversal process in both English and Indonesian.

### 2. Formal Automata (CFG Sandbox)
- Transform complex Context-Free Grammars (CFG) into simpler forms.
- Eliminates useless symbols and empty productions with visual feedback.
- Test custom strings against the grammar rules in real-time.

---

## 🎨 Design Philosophy
The entire user interface is built on the principles of **Swiss Modernism x Brutalist Minimalism**.
- High contrast, monochromatic palettes with stark accents.
- Exposed structural grids and raw typography (monospace & sans-serif clashes).
- Micro-animations and hover-inversions to make the platform feel like a living, breathing software terminal.

---

## ⚙️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **AI Integration:** `@google/generative-ai` (Gemini 2.5 Flash / Pro Vision)
- **Deployment:** Google Cloud Run (Containerized via Docker + Nginx)

---

## 🚀 How to Run Locally

If you want to spin up AlgoLab on your own machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/borntosleepwell/AlgoLab.git
   cd AlgoLab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyYourSecretKeyHere...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

*“If you can imagine it, you can vibe-code it.”* ✌️
