
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Ticket, ServiceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getQueueInsights = async (tickets: Ticket[]) => {
  const waitingCount = tickets.filter(t => t.status === 'Menunggu').length;
  const completedCount = tickets.filter(t => t.status === 'Selesai').length;
  
  const prompt = `
    Analisis data antrian berikut:
    - Total antrian menunggu: ${waitingCount}
    - Total selesai: ${completedCount}
    
    Berikan ringkasan singkat dalam Bahasa Indonesia tentang situasi saat ini, 
    rekomendasi untuk petugas, dan prediksi kepadatan (Low/Medium/High).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            expectedTraffic: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ['summary', 'recommendation', 'expectedTraffic']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      summary: "Gagal mengambil analisis AI.",
      recommendation: "Lanjutkan layanan seperti biasa.",
      expectedTraffic: "Medium"
    };
  }
};

export const getSmartGreeting = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Buatkan satu kalimat sapaan ramah dan motivasi singkat untuk pelanggan yang sedang menunggu antrian di bank/kantor layanan. Maksimal 15 kata.",
    });
    return response.text;
  } catch (error) {
    return "Terima kasih telah bersabar menunggu giliran Anda.";
  }
};

export const generateQueueVoice = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: `Ucapkan dengan nada perempuan yang anggun, ramah, dan profesional: ${text}` 
        }] 
      }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// Audio Utilities
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
