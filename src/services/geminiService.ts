import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const resumeSchema = {
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
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          dates: { type: Type.STRING },
          responsibilities: { type: Type.STRING },
        },
        required: ["role", "company", "dates", "responsibilities"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          dates: { type: Type.STRING },
        },
        required: ["degree", "school", "dates"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["name", "email", "phone", "location", "summary", "experience", "education", "skills"],
};

export const parseResume = async (file: File): Promise<ResumeData> => {
  const base64 = await fileToBase64(file);
  const mimeType = file.type;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: mimeType,
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
      responseSchema: resumeSchema,
    },
  });

  if (!response.text) {
    throw new Error("Failed to parse resume");
  }

  return JSON.parse(response.text) as ResumeData;
};

export const refineResumeWithAI = async (resume: ResumeData): Promise<ResumeData> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Refine and improve the following resume data. Make the summary more impactful, the responsibilities more achievement-oriented, and ensure the skills are well-categorized. Return the improved data in the same JSON format.\n\n${JSON.stringify(resume)}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
    },
  });

  if (!response.text) {
    throw new Error("Failed to refine resume");
  }

  return JSON.parse(response.text) as ResumeData;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:mime/type;base64, prefix
      resolve(base64String.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};
