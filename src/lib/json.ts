export function safeParseAIResponse<T>(text: string, defaultValue: T): T {
  try {
    let cleanResponse = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanResponse.includes('```')) {
      const match = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) cleanResponse = match[1];
    }
    
    // Find first { and last } to isolate the JSON object
    const firstBrace = cleanResponse.indexOf('{');
    const lastBrace = cleanResponse.lastIndexOf('}');
    
    if (firstBrace !== -1) {
      if (lastBrace !== -1 && lastBrace > firstBrace) {
        // We have both, but let's see if there's trailing garbage we can strip
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
      } else {
        // Only start brace found
        cleanResponse = cleanResponse.substring(firstBrace);
      }
    }

    try {
      return JSON.parse(cleanResponse) as T;
    } catch (parseError: any) {
      // Try to "heal" the JSON if it's truncated
      // This is a common issue with local LLMs exceeding token limits
      const healed = healJSON(cleanResponse);
      try {
        return JSON.parse(healed) as T;
      } catch (secondError) {
        console.error('JSON Fix failed. Original error:', parseError.message);
        console.error('Fragment:', cleanResponse.slice(-100));
        throw parseError; // Rethrow original if healing didn't work
      }
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return defaultValue;
  }
}

/**
 * Naively attempts to fix truncated JSON by closing open quotes, arrays, and objects.
 */
function healJSON(json: string): string {
  let healed = json.trim();
  
  // 1. If we are inside a string, close it
  let charStack = [];
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < healed.length; i++) {
    const char = healed[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{' || char === '[') {
        charStack.push(char);
      } else if (char === '}') {
        if (charStack[charStack.length - 1] === '{') charStack.pop();
      } else if (char === ']') {
        if (charStack[charStack.length - 1] === '[') charStack.pop();
      }
    }
  }
  
  if (inString) {
    healed += '"';
  }
  
  // Close open structures in reverse order
  while (charStack.length > 0) {
    const last = charStack.pop();
    if (last === '{') healed += '}';
    else if (last === '[') healed += ']';
  }
  
  return healed;
}
