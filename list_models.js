const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    // Note: The Node SDK might not expose listModels directly on the instance in older versions, 
    // but let's try calling the REST API directly to be safe.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).filter(name => name.includes("flash")));
  } catch(e) {
    console.log(e);
  }
}

run();
