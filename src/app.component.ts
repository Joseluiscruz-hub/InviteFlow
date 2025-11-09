
import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  readonly prompt = signal<string>(`Diseño de invitación de 15 años, estilo fantasía celestial y gala moderna. Fondo de cielo nocturno azul cobalto con una nebulosa etérea en tonos rosa pálido y lavanda. Una lluvia sutil de estrellas fugaces y destellos plateados cae en cascada.

En el centro, el nombre 'Skarlet' en una tipografía script elegante y fluida, con un efecto de oro rosa metálico. Debajo, en una fuente sans-serif moderna y limpia, el texto 'Mis XV Años'.

El diseño debe tener un borde sutil que simule cristales o diamantes tenues. La atmósfera general debe ser mágica, soñadora y muy elegante. Colores principales: azul noche, oro rosa, plata y toques de lavanda. Formato vertical 9:16.`);
  
  readonly generatedImageUrl = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // --- Nuevas características ---

  // 1. Marcos
  readonly frames = [
    { id: 'gold', name: 'Oro', class: 'border-[12px] border-double border-yellow-300 p-2 shadow-lg shadow-yellow-400/30' },
    { id: 'silver', name: 'Plata', class: 'border-8 border-solid border-gray-300 p-1 shadow-lg shadow-gray-400/30' },
    { id: 'crystal', name: 'Cristal', class: 'border-8 border-white/60 p-2 shadow-2xl shadow-purple-500/40' },
  ];
  readonly selectedFrame = signal<string | null>(null);
  readonly selectedFrameClass = computed(() => {
    const frameId = this.selectedFrame();
    if (!frameId) return null;
    return this.frames.find(f => f.id === frameId)?.class || null;
  });

  // 2. Música
  readonly songs = [
    { name: 'Vals de Ensueño (Cinemático)', url: 'https://cdn.pixabay.com/audio/2022/11/21/audio_a1bf872b22.mp3' },
    { name: 'Noche Estrellada (Lo-fi)', url: 'https://cdn.pixabay.com/audio/2024/02/23/audio_8716ac1204.mp3' },
    { name: 'Ritmo de Fiesta (Pop)', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2ba7027b91.mp3' },
  ];
  readonly selectedSong = signal<string>('');

  // 3. Generador de QR
  readonly photoAlbumUrl = signal<string>('');
  readonly generatedQrCodeUrl = signal<string | null>(null);

  // 4. RSVP
  readonly isRsvpEnabled = signal<boolean>(false);
  readonly rsvpStatus = signal<'pending' | 'confirmed' | 'declined' | null>(null);

  // --- Métodos ---

  updatePrompt(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.prompt.set(target.value);
  }

  async generateImage(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.generatedImageUrl.set(null);
    this.generatedQrCodeUrl.set(null); // Reset QR on new generation
    this.rsvpStatus.set(null); // Reset RSVP status

    try {
      const imageUrl = await this.geminiService.generateInvitationImage(this.prompt());
      this.generatedImageUrl.set(imageUrl);
      if (this.isRsvpEnabled()) {
        this.rsvpStatus.set('pending'); // Activate RSVP for the new invitation
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido. Por favor, intenta de nuevo.';
      this.error.set(errorMessage);
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectFrame(frameId: string | null): void {
    this.selectedFrame.set(frameId);
  }

  selectSong(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSong.set(target.value);
  }

  updateAlbumUrl(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.photoAlbumUrl.set(target.value);
  }

  generateQrCode(): void {
    if (this.photoAlbumUrl().trim()) {
      try {
        const url = new URL(this.photoAlbumUrl().trim());
        const encodedUrl = encodeURIComponent(url.toString());
        this.generatedQrCodeUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`);
      } catch (error) {
        this.error.set('Por favor, introduce una URL válida para el álbum de fotos.');
      }
    }
  }

  toggleRsvp(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.isRsvpEnabled.set(target.checked);
  }

  confirmRsvp(): void {
    this.rsvpStatus.set('confirmed');
  }

  declineRsvp(): void {
    this.rsvpStatus.set('declined');
  }
}
