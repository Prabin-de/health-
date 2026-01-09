
export interface HealthRecord {
  created_at: string;
  entry_id: number;
  bpm: number;
  spo2: number;
  temp: number;
  accel: number; 
  room_temp: number;
  humidity: number;
}

export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string; 
  field2: string; 
  field3: string; 
  field4: string; 
  field5: string; 
  field6: string; 
}

export interface ThingSpeakResponse {
  channel: any;
  feeds: ThingSpeakFeed[];
}

export interface User {
  patientName: string;
  patientCode: string;
  verifiedAt: string;
}

export interface Settings {
  channelId: string;
  readApiKey: string;
  writeApiKey: string;
  refreshInterval: number;
  thresholds: {
    bpm: { min: number; max: number };
    spo2: { min: number };
    temp: { min: number; max: number };
  };
}

export interface HealthAnalysisResult {
  summary: string;
  healthStatus: 'Normal' | 'Warning' | 'Critical';
  suggestions: string[];
  alerts: string[];
}
