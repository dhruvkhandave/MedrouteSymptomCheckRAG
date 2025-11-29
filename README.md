# MedRoute Demo

A Next.js demo application that mimics Fleetline's architecture in a healthcare context. This app demonstrates a three-stage pipeline for analyzing medical symptoms:

1. **LLM Interpreter** - Extracts structured fields from natural language
2. **Constraint Validator** - Applies validation rules and defaults
3. **Optimization Layer** - Computes triage scores and urgency levels

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```
GROQ_API_KEY=your_groq_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Backend Pipeline (`/api/analyze`)

The API route processes user input through three stages:

1. **LLM Interpreter**: Uses Groq's `llama-3.1-8b-instant` to extract structured JSON from symptom descriptions
2. **Constraint Validator**: Applies validation rules (defaults, required fields, special rules like chest pain + shortness of breath)
3. **Optimization Layer**: Calculates triage scores based on severity, risk factors, and duration

### Frontend

- Clean, minimal UI built with Tailwind CSS
- Single-page application with symptom input and results display
- Toggle to view raw JSON output
- Color-coded urgency levels and severity indicators

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Groq API (llama-3.1-8b-instant)

