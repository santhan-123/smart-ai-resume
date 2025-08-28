import { useEffect } from 'react';
import useSessionStore from '../store/useSessionStore';
import { createSession, sendMessage } from '../api';
import { v4 as uuidv4 } from 'uuid';

const useChat = () => {
  const { sessionId, messages, isLoading, error, setSessionId, addMessage, setLoading, setError, resetSession, updateSessionMeta, resumeData, progress } = useSessionStore();

  useEffect(() => {
    const initChat = async () => {
      if (!sessionId) {
        setLoading(true);
        setError(null);
        try {
          const { sessionId: newSessionId, initialMessage } = await createSession();
          setSessionId(newSessionId);
          addMessage({ id: uuidv4(), text: initialMessage, sender: 'ai', timestamp: new Date() });
        } catch (err) {
          setError(err.message);
          addMessage({ id: uuidv4(), text: `Error: ${err.message}`, sender: 'ai', timestamp: new Date() });
        } finally {
          setLoading(false);
        }
      }
    };
    initChat();
  }, [sessionId, setSessionId, addMessage, setLoading, setError]);

  const sendUserMessage = async (text) => {
    if (!sessionId || isLoading) return;

    addMessage({ id: uuidv4(), text, sender: 'user', timestamp: new Date() });
    setLoading(true);
    setError(null);

    try {
  const response = await sendMessage(sessionId, text);

      if (response.type === 'docx') {
        // Handle DOCX download
        const url = window.URL.createObjectURL(response.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        addMessage({ id: uuidv4(), text: `Your resume "${response.filename}" has been generated and downloaded!`, sender: 'ai', timestamp: new Date() });
        resetSession(); // Optionally reset session after download
      } else {
        // Handle JSON response (AI message)
        // Corrected destructuring: access 'data' property from 'response.data'
  const { aiResponse, resumeData: rd, progress: pg } = response; 
  addMessage({ id: uuidv4(), text: aiResponse, sender: 'ai', timestamp: new Date() });
  if (rd || pg) updateSessionMeta(rd, pg);
      }
    } catch (err) {
      setError(err.message);
      addMessage({ id: uuidv4(), text: `Error: ${err.message}`, sender: 'ai', timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    resetSession();
  };

  return {
    messages,
    isLoading,
    error,
    sendUserMessage,
    startNewChat,
  sessionId,
  resumeData,
  progress
  };
};

export default useChat;
