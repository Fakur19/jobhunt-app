import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateCoverLetter = async (resumeData: any, jobDescription: string) => {
  const prompt = `
    Generate a professional and tailored cover letter based on the following information:
    
    RESUME DATA:
    ${JSON.stringify(resumeData, null, 2)}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    The cover letter should be concise, professional, and highlight the most relevant skills and experiences.
    Return only the cover letter text.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Failed to generate cover letter.";
};

export const generateInterviewCheatSheet = async (jobTitle: string, company: string, roleDescription: string) => {
  const prompt = `
    Generate an interview cheat sheet for the following role:
    
    JOB TITLE: ${jobTitle}
    COMPANY: ${company}
    ROLE DESCRIPTION: ${roleDescription}
    
    Include:
    1. Role Summary
    2. Main Responsibilities
    3. Likely Interview Topics
    4. Smart questions to ask the interviewer
    
    Format the output clearly with headers.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Failed to generate interview cheat sheet.";
};

export const refineResume = async (resumeData: any) => {
  const prompt = `
    Refine the following resume data to be more professional, concise, and impact-oriented.
    Focus on strong action verbs and quantifiable achievements.
    
    RESUME DATA:
    ${JSON.stringify(resumeData, null, 2)}
    
    Return the refined resume data in the SAME JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response as JSON", e);
    return resumeData;
  }
};

export const chatWithAssistant = async (messages: { role: string, content: string }[], context: any) => {
  const systemInstruction = `
    You are an expert AI Job Search Assistant. 
    You have access to the user's current job search context:
    ${JSON.stringify(context, null, 2)}
    
    Help the user with their job search, provide advice, answer questions about their applications, and help them prepare for interviews.
    Be professional, encouraging, and data-driven.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
    config: {
      systemInstruction,
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
};
