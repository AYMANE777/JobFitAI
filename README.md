# ATS CV Optimizer (100% Free & Local)

This application helps users optimize their resumes for Applicant Tracking Systems (ATS) using local Large Language Models (LLMs).

## Features
- **Local Privacy**: All processing happens on your local machine using Ollama. No data is sent to external clouds.
- **Cost-Free**: No OpenAI API keys or credit card required.
- **ATS-Optimized**: Tailors CV content to specific job descriptions with high accuracy.
- **Export Ready**: Download your optimized CV as a professional PDF.

## 🚀 Setup Instructions

### 1. Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com).

### 2. Pull Required Models
Run the following commands in your terminal:
```bash
ollama pull llama3:8b
```

### 3. Install Project Dependencies
```bash
bun install
```

### 4. Run the Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Portfolio Note
> **This system uses local LLMs (LLaMA / Mistral) to avoid vendor lock-in, reduce operational costs, and guarantee user data privacy.**

## Tech Stack
- **Frontend**: React (Next.js 15)
- **Backend**: Next.js API Routes (TypeScript)
- **LLM Engine**: Ollama (Running Llama 3)
- **Styling**: Tailwind CSS
- **PDF Parsing**: pdf-parse
