
export interface AudioCompressionOptions {
  quality?: number; // 0.1 to 1.0
  bitRate?: number; // kbps
  sampleRate?: number; // Hz
}

export class AudioCompressor {
  private static instance: AudioCompressor;

  static getInstance(): AudioCompressor {
    if (!AudioCompressor.instance) {
      AudioCompressor.instance = new AudioCompressor();
    }
    return AudioCompressor.instance;
  }

  async compressAudio(
    audioBlob: Blob, 
    options: AudioCompressionOptions = {}
  ): Promise<Blob> {
    const {
      quality = 0.7,
      bitRate = 64,
      sampleRate = 22050
    } = options;

    try {
      // Convert blob to audio buffer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Resample audio to lower sample rate for compression
      const resampledBuffer = await this.resampleAudio(audioBuffer, sampleRate);

      // Convert back to blob with compression
      const compressedBlob = await this.audioBufferToBlob(resampledBuffer, quality);

      console.log(`Audio compressed: ${(audioBlob.size / 1024).toFixed(1)}KB -> ${(compressedBlob.size / 1024).toFixed(1)}KB`);
      
      return compressedBlob;
    } catch (error) {
      console.warn('Audio compression failed, using original:', error);
      return audioBlob;
    }
  }

  private async resampleAudio(audioBuffer: AudioBuffer, targetSampleRate: number): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioBuffer.sampleRate === targetSampleRate) {
      return audioBuffer;
    }

    const ratio = audioBuffer.sampleRate / targetSampleRate;
    const newLength = Math.round(audioBuffer.length / ratio);
    const resampledBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      targetSampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = resampledBuffer.getChannelData(channel);

      for (let i = 0; i < newLength; i++) {
        const sourceIndex = i * ratio;
        const index = Math.floor(sourceIndex);
        const fraction = sourceIndex - index;

        if (index + 1 < inputData.length) {
          outputData[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
        } else {
          outputData[i] = inputData[index];
        }
      }
    }

    return resampledBuffer;
  }

  private async audioBufferToBlob(audioBuffer: AudioBuffer, quality: number): Promise<Blob> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();

    // Convert to WAV format with quality compression
    return this.bufferToWav(renderedBuffer, quality);
  }

  private bufferToWav(buffer: AudioBuffer, quality: number): Blob {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = Math.max(1, Math.floor(quality * 2)); // 1 or 2 bytes
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
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample));
        
        if (bytesPerSample === 2) {
          view.setInt16(offset, intSample * 0x7FFF, true);
          offset += 2;
        } else {
          view.setInt8(offset, intSample * 0x7F);
          offset += 1;
        }
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  getEstimatedCompressedSize(originalSize: number, quality: number): number {
    return Math.round(originalSize * quality * 0.6); // Rough estimate
  }
}

export const audioCompressor = AudioCompressor.getInstance();
