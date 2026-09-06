//What it does: shared state for which ID method the patient picked and whether each consent is granted. Later screens can read selectedId and consents from here.
// import { create } from "zustand";

// export type IdMethod = "abha" | "aadhaar" | "new" | null;

// interface ConsentState {
//   voiceAnswers: boolean;
//   healthRecords: boolean;
//   careTeam: boolean;
// }

// interface KioskState {
//   selectedId: IdMethod;
//   setSelectedId: (id: IdMethod) => void;

//   consents: ConsentState;
//   toggleConsent: (key: keyof ConsentState) => void;

//   allConsentsGranted: () => boolean;
// }

// export const useKioskStore = create<KioskState>((set, get) => ({
//   selectedId: null,
//   setSelectedId: (id) => set({ selectedId: id }),

//   consents: {
//     voiceAnswers: true,
//     healthRecords: true,
//     careTeam: true,
//   },
//   toggleConsent: (key) =>
//     set((state) => ({
//       consents: { ...state.consents, [key]: !state.consents[key] },
//     })),

//   allConsentsGranted: () => {
//     const c = get().consents;
//     return c.voiceAnswers && c.healthRecords && c.careTeam;
//   },
// }));



import { create } from "zustand";

export type IdMethod = "abha" | "aadhaar" | "new" | null;
export type Language = "en" | "hi";

interface ConsentState {
  voiceAnswers: boolean;
  healthRecords: boolean;
  careTeam: boolean;
}

interface KioskState {
  language: Language;
  setLanguage: (lang: Language) => void;

  selectedId: IdMethod;
  setSelectedId: (id: IdMethod) => void;

  consents: ConsentState;
  toggleConsent: (key: keyof ConsentState) => void;

  allConsentsGranted: () => boolean;
}

export const useKioskStore = create<KioskState>((set, get) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  consents: {
    voiceAnswers: true,
    healthRecords: true,
    careTeam: true,
  },
  toggleConsent: (key) =>
    set((state) => ({
      consents: { ...state.consents, [key]: !state.consents[key] },
    })),

  allConsentsGranted: () => {
    const c = get().consents;
    return c.voiceAnswers && c.healthRecords && c.careTeam;
  },
}));