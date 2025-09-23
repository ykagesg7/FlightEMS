import { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

interface VoiceSearchActions {
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export const useVoiceSearch = (): VoiceSearchState & VoiceSearchActions => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 音声認識の初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();

        const recognition = recognitionRef.current;

        // 日本語対応
        recognition.lang = 'ja-JP';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // 音声認識開始時の処理
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript('');
        };

        // 音声認識結果の処理
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
        };

        // 音声認識終了時の処理
        recognition.onend = () => {
          setIsListening(false);

          // 自動タイムアウト（5秒）
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };

        // エラー処理
        recognition.onerror = (event) => {
          setIsListening(false);
          setError(`音声認識エラー: ${event.error}`);
        };

        // 音声認識開始時の処理
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript('');

          // 5秒で自動停止
          timeoutRef.current = setTimeout(() => {
            if (recognition && recognition.state === 'listening') {
              recognition.stop();
            }
          }, 5000);
        };
      } else {
        setIsSupported(false);
        setError('お使いのブラウザは音声認識をサポートしていません');
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 音声認識開始
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('音声認識を開始できませんでした');
      }
    }
  }, [isListening]);

  // 音声認識停止
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // トランスクリプトのクリア
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript
  };
};

// 型定義の拡張
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
