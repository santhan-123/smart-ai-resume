const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// (Legacy) Adaptive AI question generator – superseded by deterministic flow.
const getAiResponse = async (chatHistory, resumeData) => {
  const systemMessage = {
    role: "system",
    content: `You are a friendly and encouraging AI assistant specializing in creating resumes for blue-collar workers. Your goal is to gather all necessary information conversationally, one piece at a time. The user may not be comfortable with technology, so be patient and ask simple, direct, adaptive follow-up questions.
    
    If the user's answer is vague, ask for more details. For example, if they say "I worked in construction," ask "What was your exact job title?" or "What tools or machines did you use?".
    
    Your current task is to collect the following information in a structured way:
    - Personal Info: Full Name, Phone, Email, City/State
    - Work Experience: Job Title, Company, Years Worked, Responsibilities/Keywords
    - Skills: A list of their skills
    - Education/Training: Any degrees, certifications, or training
    - Languages: Any languages they speak
    
    When you have confidently gathered ALL the required information for the resume, and there's nothing else to ask, your FINAL message to the user MUST be exactly: 
    "I have successfully gathered all the necessary information. Please type 'GENERATE RESUME' to create your professional document."
    
    Otherwise, your response should always be a single, conversational question to gather more information. Do not provide lists or a complete summary.
    
    Here is the structured data you have collected so far:
    ${JSON.stringify(resumeData, null, 2)}
    
    Based on this data and the conversation history, ask the single most logical next question to gather more information.`
  };

  const formattedChatHistory = chatHistory
    .filter(msg => msg.text && typeof msg.text === 'string' && msg.text.trim() !== '')
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

  const messages = [systemMessage, ...formattedChatHistory];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.5,
      max_tokens: 200, // Increased max_tokens slightly to ensure the full trigger phrase fits
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error.response ? error.response.data : error.message);
    return "I'm sorry, I seem to be having trouble. Could you please try again?";
  }
};

// Rewrite a short phrase into a professional resume bullet.
const professionalizeText = async (vagueText) => {
  const prompt = `Rewrite the following sentence to sound professional and more detailed, suitable for a resume.
  Example:
  Input: 'I deliver food'
  Output: 'Worked as a Delivery Associate, ensuring timely and safe delivery of orders.'
  
  Input: '${vagueText}'
  Output:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });
    return completion.choices[0].message.content.trim().replace(/^Output:\s*/, '');
  } catch (error) {
    console.error("Error professionalizing text:", error.response ? error.response.data : error.message);
    return vagueText;
  }
};

module.exports = { getAiResponse, professionalizeText };
