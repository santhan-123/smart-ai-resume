# Smart AI Resume Builder

Conversational resume builder for blue-collar and entry-level users. Guides the user through a simple question flow, assembles structured resume data, and generates a polished one‑page DOCX.

## Demo Video
[Watch the demo](# Smart AI Resume Builder

Conversational resume builder for blue-collar and entry-level users. Guides the user through a simple question flow, assembles structured resume data, and generates a polished one‑page DOCX.

## Demo Video
[Watch the demo](https://youtu.be/REPLACE_WITH_YOUR_DEMO)  ← replace with your recording link.

## Architecture Overview
High-level components:
- Client (React + Vite): Manages chat UI, progress bar, live preview, voice features.
- API (Express): Session lifecycle, deterministic question flow, resume export.
- Flow Service (`flow.service.js`): Ordered question list + validation + post-processing.
- AI Service (`ai.service.js`): (Optional) Professionalizes job titles / phrases via OpenAI.
- Persistence (MongoDB): Stores sessions, incremental resume data, final resume snapshot.
- Export Service (`docx.service.js`): Transforms structured JSON into a single-page DOCX.

Data flow:
1. Client creates a session → receives first prompt.
2. User answers; each answer POSTs to `/api/resume`.
3. Server validates & stores answer; returns next prompt + updated `resumeData` + `progress`.
4. When `progress.completed` is true user sends `GENERATE RESUME`.
5. Server generates DOCX and returns binary file (download triggered client-side).

```
[User] ⇄ React UI ⇄ Express API → MongoDB
                     ↘ docx.service (DOCX Buffer)
                      ↘ ai.service (OpenAI refinement)
```

## Adaptive / Deterministic Questioning
Current mode is deterministic: a fixed, validated list of questions guarantees complete, structured data (no missed fields or AI hallucinations). Each question maps to a path in `session.resumeData`. Validation uses Zod; failures return a retry prompt.

Legacy adaptive approach (still partially present in `ai.service.js`) let the model decide the next question, but was replaced for reliability and simpler UX. You can re-enable adaptive flow by calling `getAiResponse` with chat history instead of the deterministic `processAnswer` pipeline.

Enhancements applied during capture:
- Professionalize job titles (AI rewrite)
- Normalize responsibilities into bullet sentences
- Split comma-separated lists for skills / languages

## Voice Input / Output Implementation
- Input: Uses the Web Speech API (`window.SpeechRecognition` or `webkitSpeechRecognition`). Transcript is updated in state; auto-send or manual send supported.
- Output: Uses `window.speechSynthesis` with a selected voice (first available) to speak AI prompts if enabled.
- Independent toggles stored in a dedicated Zustand store (`useVoiceStore`).
- Graceful degradation: If SpeechRecognition is unsupported, mic controls are hidden / disabled.

Key considerations:
- Debounce or short cooldown between recognitions to avoid overlapping events.
- Cancel speech synthesis before speaking a new prompt to prevent queue buildup.

## Resume Export Flow
Trigger phrase: user sends `GENERATE RESUME` after `progress.completed`.
1. Controller (`resume.controller.js`) detects command.
2. A finalized `Resume` document is persisted (snapshot).
3. `docx.service.generateResume(resumeData)` builds a `docx` Document with consistent spacing.
4. Response headers:
  - `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `Content-Disposition: attachment; filename="resume_<sessionId>.docx"`
5. Client inspects `content-type` and triggers a download (Blob URL).

Why DOCX (vs PDF):
- Easy post-download edits
- Lightweight library (`docx`)
- Keeps styling logic in one place

To add PDF later: render HTML + use headless Chrome / `pdf-lib`.

## Features
- Deterministic question flow (no hallucinated fields)
- Progress tracking & live resume preview
- Single-page DOCX export (server generated)
- Voice input & optional AI voice output (Web Speech API)
- Light/Dark theme toggle
- Minimal backend (Express + MongoDB + OpenAI for text refinement only)

## Tech Stack
Backend: Node.js, Express 5, MongoDB/Mongoose, OpenAI SDK, Zod, docx
Frontend: React 19 + Vite, Material UI, Zustand, Web Speech API

## Monorepo Layout
```
smart-ai-resume/
  server/   # Express API & generation services
  client/   # React UI
```

---
## 1. Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB Atlas URI (or local MongoDB)
- OpenAI API key (for professionalizing job titles / text)
- Git + (optional) GitHub account

---
## 2. Environment Variables
Create `server/.env`:
```
PORT=4000
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=sk-...
```
(Do NOT commit real secrets.)

Client can use a `.env` (optional) for API base:
```
VITE_API_BASE=http://localhost:4000
```
Access in code with `import.meta.env.VITE_API_BASE`.

---
## 3. Install Dependencies
Run in project root (PowerShell shown):
```
cd server; npm install; cd ..
cd client; npm install; cd ..
```

---
## 4. Run Locally (Dev)
In two terminals:
```
# Terminal 1
cd server
npx nodemon src/index.js

# Terminal 2
cd client
npm run dev
```
Open http://localhost:5173 (default Vite port). Ensure server logs: `Server is running on port 4000`.

If you changed `PORT`, update client base URL logic (or use `VITE_API_BASE`).

---
## 5. Build for Production
Frontend build produces static assets:
```
cd client
npm run build
```
Output in `client/dist/`.

You have several deployment options:

### Option A: Simple Two-Service Deployment
- Deploy backend (Express) separately (e.g., Render, Railway, Fly.io, AWS, Azure, GCP).
- Deploy frontend (static) to Netlify / Vercel / GitHub Pages.
- Set client env `VITE_API_BASE` to deployed API URL.

### Option B: Serve Frontend From Express
1. Build client: `npm run build` inside `client`.
2. Copy or serve `client/dist` from Express:
   ```js
   // In server/src/index.js (example snippet)
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../../client/dist')));
   app.get('*', (_req, res) => {
     res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
   });
   ```
3. Redeploy only the server container.

### Option C: Docker (Full Stack)
Create `Dockerfile` (multi-stage):
```Dockerfile
# Frontend build
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package*.json client/
RUN cd client && npm install
COPY client client
RUN cd client && npm run build

# Backend
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server ./server
# Copy built frontend
COPY --from=client-build /app/client/dist ./server/dist
WORKDIR /app/server
ENV PORT=4000
CMD ["node","src/index.js"]
```
Add static serve snippet (see Option B) so Express serves `/dist`.
Build & run:
```
docker build -t smart-ai-resume .
docker run -p 4000:4000 --env-file server/.env smart-ai-resume
```

---
## 6. MongoDB Setup
1. Create a free cluster on MongoDB Atlas.
2. Whitelist your IP / enable 0.0.0.0 for testing.
3. Create database user & get connection string.
4. Put it in `MONGO_URI` in `server/.env`.

---
## 7. OpenAI Setup
- Get an API key from https://platform.openai.com/.
- Put it in `OPENAI_API_KEY`.
- Billing must be enabled for production usage.

---
## 8. Resume Generation Flow
1. Create session (backend seeds first question).
2. User answers sequential prompts.
3. After last step, backend replies: "Type GENERATE RESUME".
4. User sends `GENERATE RESUME` → server streams a DOCX file response.
5. Client detects binary (content-type) and triggers download.

---
## 9. Voice Features
- Uses browser `SpeechRecognition` (Chrome best support) for dictation.
- Uses `speechSynthesis` for reading AI questions aloud.
- Toggle each independently in the UI.

---
## 10. Production Hardening Checklist
- Add rate limiting (e.g., `express-rate-limit`).
- Add request logging (morgan / pino).
- Enforce CORS origin allowlist.
- Validate inbound message payload shape.
- Timeout & retry logic for OpenAI.
- Cache professionalized titles (optional).
- Add HTTPS (platform provided or reverse proxy).

---
## 11. Deployment Examples
### Deploy Backend to Render
1. New Web Service → connect GitHub repo.
2. Root: `server` directory.
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. Add env vars (PORT=4000, MONGO_URI, OPENAI_API_KEY).

### Deploy Frontend to Netlify
1. New Site → pick repo.
2. Base directory: `client`
3. Build command: `npm run build`
4. Publish directory: `client/dist`
5. Set `VITE_API_BASE` to backend URL.

### Deploy Full Stack with Fly.io (single container)
Use Docker (Option C). Run:
```
fly launch
fly secrets set MONGO_URI=... OPENAI_API_KEY=...
fly deploy
```

---
## 12. Testing (Minimal Placeholder)
Add real tests later. For now you can hit:
```
POST /api/session
POST /api/resume { sessionId, message }
```

---
## 13. Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 on /api/session | Wrong base URL in client | Set VITE_API_BASE |
| Network CORS error | Missing proper CORS config | Configure allowed origin |
| JSON parse error with 'PK' | Treating DOCX as JSON | Check response.content-type |
| Mongo auth failed | Bad MONGO_URI | Regenerate connection string |
| OpenAI 401 | Missing / invalid key | Verify OPENAI_API_KEY |

---
## 14. Contributing
PRs welcome. Please:
- Keep functions small
- Write concise comments (purpose only)
- Avoid committing secrets / large build artifacts

---
## 15. License
MIT (add LICENSE file if distributing publicly).

---
## 16. Roadmap Ideas
- Multiple work experience entries UI
- Multiple education entries
- PDF export option
- Internationalization
- Basic analytics (step drop-off)
- Offline draft persistence

---
## 17. Quick Start (Copy/Paste)
```
# Backend
cd server
npm install
cp .env.example .env   # create and fill if you add one
npx nodemon src/index.js

# Frontend
cd ../client
npm install
npm run dev
```

---
## 18. Security Notes
- Never trust client input: add validation before generate
- Rotate OpenAI key periodically
- Consider removing legacy adaptive AI path if unused

---
## 19. Contact
Open an issue or start a discussion in the repository.

---
Happy building!
)  ← replace with your recording link.

## Architecture Overview
High-level components:
- Client (React + Vite): Manages chat UI, progress bar, live preview, voice features.
- API (Express): Session lifecycle, deterministic question flow, resume export.
- Flow Service (`flow.service.js`): Ordered question list + validation + post-processing.
- AI Service (`ai.service.js`): (Optional) Professionalizes job titles / phrases via OpenAI.
- Persistence (MongoDB): Stores sessions, incremental resume data, final resume snapshot.
- Export Service (`docx.service.js`): Transforms structured JSON into a single-page DOCX.

Data flow:
1. Client creates a session → receives first prompt.
2. User answers; each answer POSTs to `/api/resume`.
3. Server validates & stores answer; returns next prompt + updated `resumeData` + `progress`.
4. When `progress.completed` is true user sends `GENERATE RESUME`.
5. Server generates DOCX and returns binary file (download triggered client-side).

```
[User] ⇄ React UI ⇄ Express API → MongoDB
                     ↘ docx.service (DOCX Buffer)
                      ↘ ai.service (OpenAI refinement)
```

## Adaptive / Deterministic Questioning
Current mode is deterministic: a fixed, validated list of questions guarantees complete, structured data (no missed fields or AI hallucinations). Each question maps to a path in `session.resumeData`. Validation uses Zod; failures return a retry prompt.

Legacy adaptive approach (still partially present in `ai.service.js`) let the model decide the next question, but was replaced for reliability and simpler UX. You can re-enable adaptive flow by calling `getAiResponse` with chat history instead of the deterministic `processAnswer` pipeline.

Enhancements applied during capture:
- Professionalize job titles (AI rewrite)
- Normalize responsibilities into bullet sentences
- Split comma-separated lists for skills / languages

## Voice Input / Output Implementation
- Input: Uses the Web Speech API (`window.SpeechRecognition` or `webkitSpeechRecognition`). Transcript is updated in state; auto-send or manual send supported.
- Output: Uses `window.speechSynthesis` with a selected voice (first available) to speak AI prompts if enabled.
- Independent toggles stored in a dedicated Zustand store (`useVoiceStore`).
- Graceful degradation: If SpeechRecognition is unsupported, mic controls are hidden / disabled.

Key considerations:
- Debounce or short cooldown between recognitions to avoid overlapping events.
- Cancel speech synthesis before speaking a new prompt to prevent queue buildup.

## Resume Export Flow
Trigger phrase: user sends `GENERATE RESUME` after `progress.completed`.
1. Controller (`resume.controller.js`) detects command.
2. A finalized `Resume` document is persisted (snapshot).
3. `docx.service.generateResume(resumeData)` builds a `docx` Document with consistent spacing.
4. Response headers:
  - `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `Content-Disposition: attachment; filename="resume_<sessionId>.docx"`
5. Client inspects `content-type` and triggers a download (Blob URL).

Why DOCX (vs PDF):
- Easy post-download edits
- Lightweight library (`docx`)
- Keeps styling logic in one place

To add PDF later: render HTML + use headless Chrome / `pdf-lib`.

## Features
- Deterministic question flow (no hallucinated fields)
- Progress tracking & live resume preview
- Single-page DOCX export (server generated)
- Voice input & optional AI voice output (Web Speech API)
- Light/Dark theme toggle
- Minimal backend (Express + MongoDB + OpenAI for text refinement only)

## Tech Stack
Backend: Node.js, Express 5, MongoDB/Mongoose, OpenAI SDK, Zod, docx
Frontend: React 19 + Vite, Material UI, Zustand, Web Speech API

## Monorepo Layout
```
smart-ai-resume/
  server/   # Express API & generation services
  client/   # React UI
```

---
## 1. Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB Atlas URI (or local MongoDB)
- OpenAI API key (for professionalizing job titles / text)
- Git + (optional) GitHub account

---
## 2. Environment Variables
Create `server/.env`:
```
PORT=4000
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=sk-...
```
(Do NOT commit real secrets.)

Client can use a `.env` (optional) for API base:
```
VITE_API_BASE=http://localhost:4000
```
Access in code with `import.meta.env.VITE_API_BASE`.

---
## 3. Install Dependencies
Run in project root (PowerShell shown):
```
cd server; npm install; cd ..
cd client; npm install; cd ..
```

---
## 4. Run Locally (Dev)
In two terminals:
```
# Terminal 1
cd server
npx nodemon src/index.js

# Terminal 2
cd client
npm run dev
```
Open http://localhost:5173 (default Vite port). Ensure server logs: `Server is running on port 4000`.

If you changed `PORT`, update client base URL logic (or use `VITE_API_BASE`).

---
## 5. Build for Production
Frontend build produces static assets:
```
cd client
npm run build
```
Output in `client/dist/`.

You have several deployment options:

### Option A: Simple Two-Service Deployment
- Deploy backend (Express) separately (e.g., Render, Railway, Fly.io, AWS, Azure, GCP).
- Deploy frontend (static) to Netlify / Vercel / GitHub Pages.
- Set client env `VITE_API_BASE` to deployed API URL.

### Option B: Serve Frontend From Express
1. Build client: `npm run build` inside `client`.
2. Copy or serve `client/dist` from Express:
   ```js
   // In server/src/index.js (example snippet)
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../../client/dist')));
   app.get('*', (_req, res) => {
     res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
   });
   ```
3. Redeploy only the server container.

### Option C: Docker (Full Stack)
Create `Dockerfile` (multi-stage):
```Dockerfile
# Frontend build
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package*.json client/
RUN cd client && npm install
COPY client client
RUN cd client && npm run build

# Backend
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server ./server
# Copy built frontend
COPY --from=client-build /app/client/dist ./server/dist
WORKDIR /app/server
ENV PORT=4000
CMD ["node","src/index.js"]
```
Add static serve snippet (see Option B) so Express serves `/dist`.
Build & run:
```
docker build -t smart-ai-resume .
docker run -p 4000:4000 --env-file server/.env smart-ai-resume
```

---
## 6. MongoDB Setup
1. Create a free cluster on MongoDB Atlas.
2. Whitelist your IP / enable 0.0.0.0 for testing.
3. Create database user & get connection string.
4. Put it in `MONGO_URI` in `server/.env`.

---
## 7. OpenAI Setup
- Get an API key from https://platform.openai.com/.
- Put it in `OPENAI_API_KEY`.
- Billing must be enabled for production usage.

---
## 8. Resume Generation Flow
1. Create session (backend seeds first question).
2. User answers sequential prompts.
3. After last step, backend replies: "Type GENERATE RESUME".
4. User sends `GENERATE RESUME` → server streams a DOCX file response.
5. Client detects binary (content-type) and triggers download.

---
## 9. Voice Features
- Uses browser `SpeechRecognition` (Chrome best support) for dictation.
- Uses `speechSynthesis` for reading AI questions aloud.
- Toggle each independently in the UI.

---
## 10. Production Hardening Checklist
- Add rate limiting (e.g., `express-rate-limit`).
- Add request logging (morgan / pino).
- Enforce CORS origin allowlist.
- Validate inbound message payload shape.
- Timeout & retry logic for OpenAI.
- Cache professionalized titles (optional).
- Add HTTPS (platform provided or reverse proxy).

---
## 11. Deployment Examples
### Deploy Backend to Render
1. New Web Service → connect GitHub repo.
2. Root: `server` directory.
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. Add env vars (PORT=4000, MONGO_URI, OPENAI_API_KEY).

### Deploy Frontend to Netlify
1. New Site → pick repo.
2. Base directory: `client`
3. Build command: `npm run build`
4. Publish directory: `client/dist`
5. Set `VITE_API_BASE` to backend URL.

### Deploy Full Stack with Fly.io (single container)
Use Docker (Option C). Run:
```
fly launch
fly secrets set MONGO_URI=... OPENAI_API_KEY=...
fly deploy
```

---
## 12. Testing (Minimal Placeholder)
Add real tests later. For now you can hit:
```
POST /api/session
POST /api/resume { sessionId, message }
```

---
## 13. Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 on /api/session | Wrong base URL in client | Set VITE_API_BASE |
| Network CORS error | Missing proper CORS config | Configure allowed origin |
| JSON parse error with 'PK' | Treating DOCX as JSON | Check response.content-type |
| Mongo auth failed | Bad MONGO_URI | Regenerate connection string |
| OpenAI 401 | Missing / invalid key | Verify OPENAI_API_KEY |

---
## 14. Contributing
PRs welcome. Please:
- Keep functions small
- Write concise comments (purpose only)
- Avoid committing secrets / large build artifacts

---
## 15. License
MIT (add LICENSE file if distributing publicly).

---
## 16. Roadmap Ideas
- Multiple work experience entries UI
- Multiple education entries
- PDF export option
- Internationalization
- Basic analytics (step drop-off)
- Offline draft persistence

---
## 17. Quick Start (Copy/Paste)
```
# Backend
cd server
npm install
cp .env.example .env   # create and fill if you add one
npx nodemon src/index.js

# Frontend
cd ../client
npm install
npm run dev
```

---
## 18. Security Notes
- Never trust client input: add validation before generate
- Rotate OpenAI key periodically
- Consider removing legacy adaptive AI path if unused

---
## 19. Contact
Open an issue or start a discussion in the repository.

---
Happy building!
