import { create } from 'zustand';

// This store will hold global state related to the user session
// and the ongoing conversation.
const useSessionStore = create((set) => ({
  sessionId: null, // Stores the unique session ID from the backend
  messages: [],    // Stores the chat history (user and AI messages)
  isLoading: false, // Indicates if an API call is in progress
  error: null,     // Stores any error messages
  resumeData: null, // Latest structured resume snapshot from backend
  progress: null,   // { currentStep, totalSteps, completed }

  // Action to set the session ID
  setSessionId: (id) => set({ sessionId: id }),

  // Action to add a new message to the chat history
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Actions to manage loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Action to set an error
  setError: (error) => set({ error: error }),

  // Resets the entire session store (e.g., for a new chat)
  resetSession: () => set({
    sessionId: null,
    messages: [],
    isLoading: false,
    error: null,
    resumeData: null,
    progress: null,
  }),
  // Update resume/progress after each backend response
  updateSessionMeta: (resumeData, progress) => set({ resumeData, progress })
}));

export default useSessionStore;
