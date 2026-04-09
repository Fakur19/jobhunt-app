import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. AI features will not work.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    location: { type: Type.STRING },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          dates: { type: Type.STRING },
          responsibilities: { type: Type.STRING },
        },
        required: ["company", "role", "dates", "responsibilities"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          dates: { type: Type.STRING },
        },
        required: ["school", "degree", "dates"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["name", "email", "phone", "location", "summary", "experience", "education", "skills"],
};

export const generateCoverLetter = async (resumeData: any, jobTitle: string, company: string, jobDescription: string) => {
  try {
    const prompt = `
      Generate a professional and tailored cover letter based on the following information:
      
      JOB TITLE: ${jobTitle}
      COMPANY: ${company}
      
      RESUME DATA:
      ${JSON.stringify(resumeData, null, 2)}
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      The cover letter should be concise, professional, and highlight the most relevant skills and experiences.
      Address it to the hiring manager at ${company} for the ${jobTitle} position.
      Return only the cover letter text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || "Failed to generate cover letter.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};

export const generateInterviewCheatSheet = async (jobTitle: string, company: string, roleDescription: string) => {
  try {
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
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || "Failed to generate interview cheat sheet.";
  } catch (error) {
    console.error("Error generating cheat sheet:", error);
    throw error;
  }
};

export const parseResume = async (file: File) => {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: file.type,
              },
            },
            {
              text: "Extract the professional information from this resume and return it in the specified JSON format. If a field is missing, provide an empty string or empty array as appropriate.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

export const refineResume = async (resumeData: any) => {
  try {
    const prompt = `
      Refine the following resume data to be more professional, concise, and impact-oriented.
      Focus on strong action verbs and quantifiable achievements.
      
      RESUME DATA:
      ${JSON.stringify(resumeData, null, 2)}
      
      Return the refined resume data in the SAME JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_SCHEMA,
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to refine resume:", e);
    return resumeData;
  }
};

export const generateTailoredResume = async (baseResume: any, jobDescription: string) => {
  try {
    const prompt = `
      You are an expert resume writer. Tailor the following base resume to match the requirements of the job description provided.
      
      BASE RESUME:
      ${JSON.stringify(baseResume, null, 2)}
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      Adjust the Professional Summary and highlight the most relevant skills and experiences. 
      Ensure the output is a valid JSON object matching the original resume structure.
      Do NOT invent experiences, but rephrase existing ones to emphasize relevance.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESUME_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to tailor resume:", e);
    throw e;
  }
};

export const generateAvatar = async (base64Image: string, stylePrompt: string) => {
  try {
    // Extract base64 data if it includes the prefix
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const mimeType = base64Image.includes('image/png') ? 'image/png' : 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Transform this portrait into a professional headshot. Style: ${stylePrompt}. Ensure the face remains recognizable but the clothing and background are professional.`,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("Invalid response structure from AI");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in AI response");
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
};

export const chatWithAssistant = async (messages: { role: string, content: string }[], context: any) => {
  try {
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
  } catch (error) {
    console.error("Error in chat assistant:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
};
