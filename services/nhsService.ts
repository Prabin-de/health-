
import { NHSCondition } from '../types';

const NHS_API_BASE = 'https://api.nhs.uk';

/** API key loaded from the VITE_NHS_API_KEY environment variable. */
const API_KEY: string = import.meta.env.VITE_NHS_API_KEY ?? '';

export type { NHSCondition };

interface NHSLinkRole {
  '@type': string;
  name: string;
  description?: string;
  url: string;
}

interface NHSApiResponse {
  significantLink?: NHSLinkRole[];
}

/**
 * Fetch a list of health conditions from the NHS Digital API.
 * Returns an empty array when no API key is configured.
 */
export async function fetchNHSConditions(): Promise<NHSCondition[]> {
  if (!API_KEY) {
    throw new Error(
      'NHS API key is not configured. Add VITE_NHS_API_KEY to your .env file.'
    );
  }

  const response = await fetch(`${NHS_API_BASE}/conditions`, {
    headers: { 'subscription-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`NHS API returned ${response.status}: ${response.statusText}`);
  }

  const data: NHSApiResponse = await response.json();

  return (data.significantLink ?? [])
    .filter(item => item['@type'] === 'LinkRole')
    .map(item => ({
      name: item.name,
      description: item.description ?? '',
      url: item.url,
    }));
}
