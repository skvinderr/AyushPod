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
  chiefComplaint: string | null;
  redFlag: boolean;
  historyAnswers: Record<string, any>;
  setLanguage: (lang: string) => void;
  setConsentStatus: (status: boolean) => void;
  setChiefComplaint: (complaint: string | null) => void;
  setRedFlag: (flag: boolean) => void;
  updatePatientInfo: (info: Partial<PatientInfo>) => void;
  updateHistoryAnswer: (key: string, answer: any) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  language: 'en',
  consentStatus: false,
  patientInfo: {},
  chiefComplaint: null,
  redFlag: false,
  historyAnswers: {},
  setLanguage: (language) => set({ language }),
  setConsentStatus: (consentStatus) => set({ consentStatus }),
  setChiefComplaint: (chiefComplaint) => set({ chiefComplaint }),
  setRedFlag: (redFlag) => set({ redFlag }),
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
      chiefComplaint: null,
      redFlag: false,
      historyAnswers: {},
    }),
}));
