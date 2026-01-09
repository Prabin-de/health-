
import { ThingSpeakResponse, HealthRecord } from '../types';

export const fetchHealthData = async (
  channelId: string,
  apiKey: string,
  results: number = 60
): Promise<HealthRecord[]> => {
  try {
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data: ThingSpeakResponse = await response.json();
    
    return data.feeds.map(feed => ({
      created_at: feed.created_at,
      entry_id: feed.entry_id,
      temp: parseFloat(feed.field1) || 0,
      spo2: parseFloat(feed.field2) || 0,
      bpm: parseFloat(feed.field3) || 0,
      accel: parseFloat(feed.field4) || 0,
      room_temp: parseFloat(feed.field5) || 0,
      humidity: parseFloat(feed.field6) || 0,
    }));
  } catch (error) {
    console.error('Error fetching ThingSpeak data:', error);
    return [];
  }
};

export const fetchMonthlyHistory = async (
  channelId: string,
  apiKey: string
): Promise<HealthRecord[]> => {
  return fetchHealthData(channelId, apiKey, 8000);
};

export const generateMockData = (count: number = 60): HealthRecord[] => {
  const now = new Date();
  return Array.from({ length: count }).map((_, i) => {
    const date = new Date(now.getTime() - (count - i) * 60000);
    return {
      created_at: date.toISOString(),
      entry_id: i,
      bpm: 65 + Math.random() * 20,
      spo2: 96 + Math.random() * 4,
      temp: 36.5 + Math.random() * 1.0,
      accel: Math.random() * 2,
      room_temp: 24 + Math.random() * 4,
      humidity: 45 + Math.random() * 10,
    };
  });
};
