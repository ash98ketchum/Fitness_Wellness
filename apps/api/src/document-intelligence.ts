import fs from 'fs';

import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY });
const prisma = new PrismaClient();

// Need to handle pdf-parse commonjs import
const pdfParseLib = require('pdf-parse');

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParseLib(dataBuffer);
  return data.text;
}

export async function processMedicalReport(filePath: string, userId: string, originalName: string) {
  try {
    const textContent = await extractTextFromPDF(filePath);
    
    // We send this to Groq to extract structured medical information
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized medical document extraction AI. Extract the key findings, diagnosis, abnormal values, and general patient health metrics from the provided text. Return ONLY a valid JSON object.",
        },
        {
          role: "user",
          content: `Extract structured JSON from this medical report. Include fields like 'diagnosis', 'abnormalValues', 'keyMetrics', 'summary'.\n\nREPORT TEXT:\n${textContent.substring(0, 4000)}`,
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let structuredData = {};
    if (completion.choices[0]?.message?.content) {
      try {
        structuredData = JSON.parse(completion.choices[0].message.content);
      } catch (e) {
        console.error("Failed to parse LLM JSON output", e);
      }
    }

    // Mocking text embedding since we bypassed pgvector
    // In production: const embedding = await openai.embeddings.create(...)
    const mockEmbedding = Array(1536).fill(0.01);

    // Store in UserVectorMemory
    await prisma.userVectorMemory.create({
      data: {
        userId,
        content: textContent,
        metadata: JSON.stringify({
          sourceFile: originalName,
          structuredData,
          type: 'MEDICAL_REPORT'
        }),
        embedding: JSON.stringify(mockEmbedding) // local fallback
      }
    });

    return structuredData;
  } catch (error) {
    console.error("Document Intelligence Error:", error);
    throw new Error("Failed to process document");
  }
}
