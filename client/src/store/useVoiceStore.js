import { create } from 'zustand';

const useVoiceStore = create((set) => ({
  speechInputEnabled: true,
  speechOutputEnabled: true,
  toggleSpeechInput: () => set((s) => ({ speechInputEnabled: !s.speechInputEnabled })),
  toggleSpeechOutput: () => set((s) => ({ speechOutputEnabled: !s.speechOutputEnabled })),
}));

export default useVoiceStore;
