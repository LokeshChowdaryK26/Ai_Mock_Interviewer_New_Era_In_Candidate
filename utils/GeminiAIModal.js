const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const modelNames = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function generateChatResponse(prompt, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const modelName = modelNames[attempt % modelNames.length];

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (error) {
      lastError = error;
      const message = error?.message || "";
      const isTemporaryFailure = /429|5\d\d|high demand|temporar|rate limit/i.test(message);

      if (!isTemporaryFailure || attempt === retries) {
        throw error;
      }
    }
  }

  throw lastError;
}

export const chatSession = genAI.getGenerativeModel({ model: modelNames[0] }).startChat({
  generationConfig,
  safetySettings,
});

