
export type SupportedAudioFormat = 'webm' | 'wav' | 'mp3' | 'ogg';

export interface AudioConversionOptions {
  format: SupportedAudioFormat;
  quality?: number;
  bitRate?: number;
}

export class AudioFormatConverter {
  private static instance: AudioFormatConverter;

  static getInstance(): AudioFormatConverter {
    if (!AudioFormatConverter.instance) {
      AudioFormatConverter.instance = new AudioFormatConverter();
    }
    return AudioFormatConverter.instance;
  }

  getSupportedFormats(): SupportedAudioFormat[] {
    const formats: SupportedAudioFormat[] = [];
    
    if (this.isFormatSupported('webm')) formats.push('webm');
    if (this.isFormatSupported('wav')) formats.push('wav');
    if (this.isFormatSupported('mp3')) formats.push('mp3');
    if (this.isFormatSupported('ogg')) formats.push('ogg');
    
    return formats;
  }

  isFormatSupported(format: SupportedAudioFormat): boolean {
    const testRecorder = () => {
      try {
        const mimeTypes = {
          webm: 'audio/webm;codecs=opus',
          wav: 'audio/wav',
          mp3: 'audio/mpeg',
          ogg: 'audio/ogg;codecs=opus'
        };
        
        return MediaRecorder.isTypeSupported(mimeTypes[format]);
      } catch {
        return false;
      }
    };

    return testRecorder();
  }

  async convertAudio(
    audioBlob: Blob, 
    options: AudioConversionOptions
  ): Promise<Blob> {
    const { format, quality = 0.8, bitRate = 128 } = options;

    try {
      // If already in target format, return as-is
      if (audioBlob.type.includes(format)) {
        return audioBlob;
      }

      // Convert via Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      switch (format) {
        case 'wav':
          return this.convertToWav(audioBuffer);
        case 'webm':
          return this.convertToWebM(audioBuffer, quality);
        case 'mp3':
          return this.convertToMp3(audioBuffer, bitRate);
        case 'ogg':
          return this.convertToOgg(audioBuffer, quality);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error(`Audio conversion to ${format} failed:`, error);
      return audioBlob; // Return original if conversion fails
    }
  }

  private convertToWav(audioBuffer: AudioBuffer): Blob {
    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private async convertToWebM(audioBuffer: AudioBuffer, quality: number): Promise<Blob> {
    // For WebM, we'll use MediaRecorder if available
    const stream = new MediaStream();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    const destination = audioContext.createMediaStreamDestination();
    
    source.buffer = audioBuffer;
    source.connect(destination);
    stream.addTrack(destination.stream.getAudioTracks()[0]);

    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'audio/webm' }));
      };

      mediaRecorder.onerror = reject;

      source.start();
      mediaRecorder.start();
      
      setTimeout(() => {
        mediaRecorder.stop();
        source.stop();
      }, (audioBuffer.duration * 1000) + 100);
    });
  }

  private convertToMp3(audioBuffer: AudioBuffer, bitRate: number): Blob {
    // For MP3, we'll convert to WAV as fallback since MP3 encoding requires external libraries
    console.warn('MP3 encoding not fully supported, converting to WAV instead');
    return this.convertToWav(audioBuffer);
  }

  private convertToOgg(audioBuffer: AudioBuffer, quality: number): Blob {
    // For OGG, we'll convert to WAV as fallback since OGG encoding requires external libraries
    console.warn('OGG encoding not fully supported, converting to WAV instead');
    return this.convertToWav(audioBuffer);
  }

  getMimeType(format: SupportedAudioFormat): string {
    const mimeTypes = {
      webm: 'audio/webm;codecs=opus',
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
      ogg: 'audio/ogg;codecs=opus'
    };
    return mimeTypes[format];
  }

  getFileExtension(format: SupportedAudioFormat): string {
    return format;
  }
}

export const audioFormatConverter = AudioFormatConverter.getInstance();
