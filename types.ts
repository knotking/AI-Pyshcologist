
export enum ConnectionState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  CLOSED = 'CLOSED',
  ERROR = 'ERROR',
}

export type Speaker = 'user' | 'model';

export interface TranscriptionEntry {
  speaker: Speaker;
  text: string;
}

export interface CurrentTranscription {
  user: string;
  model: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  SELECTION = 'SELECTION',
  INTERVIEW = 'INTERVIEW',
  FEEDBACK = 'FEEDBACK',
}

export interface ResumeAnalysis {
  summary: string;
  skills: string[];
}

export interface InterviewSettings {
  voice: string;
  language: string;
}

export interface FeedbackData {
  score: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  summary: string;
}
