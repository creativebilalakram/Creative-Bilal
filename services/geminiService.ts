import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A 2-3 sentence preliminary summary of visible defects.",
    },
    severityScore: {
      type: Type.NUMBER,
      description: "A calculated severity score from 0 (perfect) to 100 (critical failure) based on visual evidence.",
    },
    topCategories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of the top 3 defect categories detected (e.g. 'Water Damage', 'Structural Crack').",
    },
    issues: {
      type: Type.ARRAY,
      description: "Detailed list of detected issues.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Category of the defect." },
          visualDescription: { type: Type.STRING, description: "What is visually present in the photo." },
          possibleCause: { type: Type.STRING, description: "Probable cause based on visual evidence only." },
          severity: { type: Type.STRING, enum: ["Low", "Moderate", "High"], description: "Severity rating." },
          urgency: { type: Type.STRING, enum: ["Immediate", "Within 2 weeks", "Monitor"], description: "Recommended urgency." },
          recommendation: { type: Type.STRING, description: "Specific recommended action." },
        },
        required: ["category", "visualDescription", "possibleCause", "severity", "urgency", "recommendation"],
      },
    },
    nextSteps: {
      type: Type.ARRAY,
      description: "3 practical next steps for the homeowner.",
      items: { type: Type.STRING },
    },
    disclaimer: {
      type: Type.STRING,
      description: "The mandatory disclaimer text.",
    },
  },
  required: ["summary", "severityScore", "topCategories", "issues", "nextSteps", "disclaimer"],
};

export const analyzeBuildingImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are a qualified Australian building inspector producing a thorough visual report for homeowners.
    
    Your task is to analyze the provided image and return a structured assessment.
    
    For the 'Quick Scan' portion (summary, severityScore, topCategories):
    - Provide a specific 0-100 severity score based on the visual risk. DO NOT use round numbers (e.g. use 72 or 84, not 70 or 80) to ensure accuracy.
    - Identify the top categories immediately visible.
    
    For the 'Full Report' portion (issues, nextSteps):
    - For each detected issue provide: Category, Visual description, Probable cause, Severity, Suggested next steps, and Recommended urgency.
    - Be precise and professional.
    - Avoid alarmist language but be clear about risks.
    
    MANDATORY DISCLAIMER:
    "This is a preliminary visual scan only. A certified inspector must confirm on-site. Results are indicative and not a substitute for a professional inspection."
    
    Only talk about what the image shows — do NOT speculate beyond the photo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this image for building defects.",
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};