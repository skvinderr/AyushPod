/**
 * Shared Types for MediKiosk (AyushPod)
 * Represents FHIR-like resources and Ayurvedic specific schemas
 */

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
}

export interface Condition {
  id: string;
  patientId: string;
  chiefComplaint: string;
  clinicalStatus: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
  onsetDateTime?: string; // ISO Date String
  notes?: string;
}

export interface Observation {
  id: string;
  patientId: string;
  code: string; // e.g., 'blood-pressure', 'heart-rate'
  value: string | number;
  unit?: string;
  effectiveDateTime: string;
}

// Ayurvedic specific types (Dashavidha Pariksha)
export interface DashavidhaPariksha {
  prakriti?: string; // Vata, Pitta, Kapha, etc.
  vikriti?: string;  // Morbidity
  sara?: string;     // Tissue vitality
  samhanana?: string; // Compactness
  pramana?: string;  // Proportion
  satmya?: string;   // Adaptability
  sattva?: string;   // Mental stamina
  aharashakti?: string; // Digestive capacity
  vyayamashakti?: string; // Exercise capacity
  vaya?: string;     // Age/aging rate
}

export interface HistoryRecord {
  id: string;
  patient: Patient;
  conditions: Condition[];
  observations: Observation[];
  dashavidhaPariksha?: DashavidhaPariksha;
  recordedAt: string; // ISO Date String
}

export interface Document {
  id: string;
  patientId: string;
  title: string;
  type: 'prescription' | 'report' | 'other';
  url: string; // S3 or local path
  uploadedAt: string;
}
