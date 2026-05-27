import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKeyLine = envFile.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : null;
if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}



async function listModels() {
  try {
    // The SDK might not have a direct listModels method on genAI in this version,
    // we can fetch it directly from the REST API to be safe.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach(model => {
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- ${model.name.replace('models/', '')} (${model.version})`);
        }
      });
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

listModels();
