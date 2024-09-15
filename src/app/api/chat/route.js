import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see .env.local file)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(req) {
  try {
    const { message, conversationHistory } = await req.json();
    console.log('Received message:', message);
    console.log('Conversation history:', conversationHistory);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construct the prompt with conversation history, strict context guidelines, and recipe formatting
    const prompt = `You are an expert cooking assistant with deep knowledge of various cuisines, cooking techniques, and food-related health topics. Your primary focus is on providing detailed, helpful responses about cooking, recipes, food preparation, and the nutritional aspects of food. 

    Important: Only respond to queries related to cooking, food, or the direct health impacts of specific foods. If a question is not related to these topics, politely inform the user that you can only assist with cooking and food-related queries.

    When responding to relevant queries:
    1. Provide complete recipes or cooking instructions without asking for additional details.
    2. If multiple variations are possible, briefly mention them and focus on the most common or traditional version.
    3. Include a list of ingredients with approximate quantities for 4 servings when applicable.
    4. Describe cooking processes step-by-step.
    5. Add relevant tips or variations at the end.
    6. For food-related health queries, provide factual, nutrition-based information.

    Format your recipe responses like this:

    [RECIPE_START]
    (Your detailed recipe and instructions here)
    [RECIPE_END]

    [INGREDIENTS_JSON]
    {
      "recipeName": "Name of the Recipe",
      "ingredients": [
        {"name": "Ingredient 1", "quantity": "amount", "unit": "measurement unit"},
        {"name": "Ingredient 2", "quantity": "amount", "unit": "measurement unit"}
      ]
    }
    [/INGREDIENTS_JSON]

    Previous conversation:
    ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    User's new message: ${message}

    Please respond appropriately, keeping in mind the context and your role as a cooking and food expert:`;

    console.log('Sending prompt to Gemini:', prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log('Response from Gemini:', text);

    return new Response(JSON.stringify({ message: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
