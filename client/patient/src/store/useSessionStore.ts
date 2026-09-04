import { create } from 'zustand';

interface PatientInfo {
  id?: string;
  name?: string;
  age?: number;
  gender?: string;
  abhaId?: string;
}

interface SessionState {
  language: string;
  consentStatus: boolean;
  patientInfo: PatientInfo;
  historyAnswers: Record<string, any>;
  setLanguage: (lang: string) => void;
  setConsentStatus: (status: boolean) => void;
  updatePatientInfo: (info: Partial<PatientInfo>) => void;
  updateHistoryAnswer: (key: string, answer: any) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  language: 'en',
  consentStatus: false,
  patientInfo: {},
  historyAnswers: {},
  setLanguage: (language) => set({ language }),
  setConsentStatus: (consentStatus) => set({ consentStatus }),
  updatePatientInfo: (info) =>
    set((state) => ({
      patientInfo: { ...state.patientInfo, ...info },
    })),
  updateHistoryAnswer: (key, answer) =>
    set((state) => ({
      historyAnswers: { ...state.historyAnswers, [key]: answer },
    })),
  resetSession: () =>
    set({
      language: 'en',
      consentStatus: false,
      patientInfo: {},
      historyAnswers: {},
    }),
}));
