import { useState, useEffect } from 'react';

const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(''); // <-- Here's the state
  const [speechError, setSpeechError] = useState(null);

  const [recognition, setRecognition] = useState(null);
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.interimResults = false;
      recognizer.continuous = false;

      recognizer.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognizer.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setIsListening(false);
      };

      recognizer.onerror = (event) => {
        setSpeechError(event.error);
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognizer);
    } else {
      setSpeechError('Speech recognition is not supported in this browser.');
    }

    if (SpeechSynthesis) {
      setSynth(window.speechSynthesis);
    } else {
      setSpeechError('Text-to-speech is not supported in this browser.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript(''); // Clear previous transcript on start
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const speak = (text) => {
    if (synth && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    }
  };

  return {
    isListening,
    transcript,
    setTranscript, // <-- Expose setTranscript here
    speechError,
    startListening,
    stopListening,
    speak,
  };
};

export default useSpeech;
