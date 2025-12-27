import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
}

export async function callOllama(
  prompt: string, 
  model: string = process.env.OLLAMA_MODEL || "gpt-4o",
  format: "json" | undefined = "json"
): Promise<string> {
    // Try OpenAI first if API key is present
    if (process.env.OPENAI_API_KEY) {
      console.log(`Attempting OpenAI extraction with model: ${model}`);
      try {
      const validOpenAIModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
      let actualModel = model;
      
      // If model name doesn't look like a standard OpenAI model, use gpt-4o as default for cloud
      if (!validOpenAIModels.includes(model)) {
        if (model.toLowerCase().includes('cloud') || (model.toLowerCase().includes('gpt') && !model.includes(':'))) {
          actualModel = 'gpt-4o';
        }
      }

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: actualModel,
        response_format: format === 'json' ? { type: 'json_object' } : undefined,
      });
      return completion.choices[0].message.content || '';
    } catch (error: any) {
      console.warn(`OpenAI attempt failed (Model: ${model}): ${error.message}. Falling back to Ollama if available.`);
      // If it's a quota or auth error, we definitely want to try Ollama
    }
  }

  // Fallback / Primary (if no OpenAI key): Ollama
  console.log(`Attempting Ollama extraction with model: ${model}`);
  
  const tryOllama = async (modelName: string) => {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt,
        stream: false,
        format,
        options: {
          num_ctx: 16384,
          num_predict: 8192,
          temperature: 0.1
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama returned ${response.status}: ${errorText || response.statusText}`);
    }

    const result: OllamaResponse = await response.json();
    return result.response;
  };

  try {
    let text = await tryOllama(model);

    if (text.includes('```')) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) text = match[1];
    }
    return text.trim();
  } catch (error: any) {
    console.error(`Primary Ollama model (${model}) failed: ${error.message}`);
    
    // If the primary model failed and it looks like a cloud model or custom name,
    // try a few standard fallback models that are commonly present
    const fallbacks = ['llama3', 'mistral', 'phi3', 'llama2', 'deepseek-r1'];
    
    for (const fallback of fallbacks) {
      if (fallback === model) continue; // Skip if it's the same
      
      console.log(`Trying fallback Ollama model: ${fallback}`);
      try {
        let text = await tryOllama(fallback);
        if (text.includes('```')) {
          const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (match) text = match[1];
        }
        console.log(`Success with fallback model: ${fallback}`);
        return text.trim();
      } catch (fallbackError: any) {
        console.warn(`Fallback model ${fallback} also failed: ${fallbackError.message}`);
      }
    }

    throw new Error(`AI Service Error: ${error.message}. Ensure your local Ollama is running and has a model pulled (e.g., 'ollama pull llama3').`);
  }
}
