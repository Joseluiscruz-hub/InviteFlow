
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables for security.
    // It should not be hardcoded in the application.
    if (!process.env.API_KEY) {
      throw new Error('API_KEY is not set in environment variables.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateInvitationImage(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-3.0-generate-002', // Using the recommended, available model
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '9:16', // Ideal for invitations
        },
      });
      
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('No se pudo generar la imagen. La respuesta de la API estaba vacía.');
      }

      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Provide a more user-friendly error message
      if (error instanceof Error && error.message.includes('API key not valid')) {
          throw new Error('La clave de API no es válida. Por favor, verifica la configuración.');
      }
      throw new Error('Hubo un problema al generar la imagen. Intenta ajustar tu descripción o inténtalo más tarde.');
    }
  }
}
