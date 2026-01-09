
import { HealthRecord, HealthAnalysisResult, Settings } from "../types";

export const performLocalAnalysis = (
  data: HealthRecord[], 
  settings: Settings
): HealthAnalysisResult => {
  if (data.length === 0) {
    return {
      summary: "Insufficient data for analysis.",
      healthStatus: 'Normal',
      suggestions: [],
      alerts: []
    };
  }

  const latest = data[data.length - 1];
  
  const alerts: string[] = [];
  const suggestions: string[] = ["Maintain regular hydration.", "Monitor room temperature for comfort."];
  let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';

  // Heart Rate Analysis
  if (latest.bpm > settings.thresholds.bpm.max) {
    alerts.push(`High Heart Rate (${latest.bpm.toFixed(0)} BPM) detected.`);
    suggestions.push("Try deep breathing exercises.", "Reduce caffeine intake.", "Rest in a sitting position.");
    status = 'Warning';
  } else if (latest.bpm < settings.thresholds.bpm.min) {
    alerts.push(`Low Heart Rate (${latest.bpm.toFixed(0)} BPM) detected.`);
    suggestions.push("Ensure patient is conscious and responsive.", "Consult a doctor if feeling dizzy.");
    status = 'Warning';
  }

  // Oxygen Saturation Analysis
  if (latest.spo2 < settings.thresholds.spo2.min - 5) {
    alerts.push(`Critical Oxygen Level (${latest.spo2.toFixed(1)}%)!`);
    suggestions.push("Seek immediate emergency medical assistance.", "Maintain an upright posture.");
    status = 'Critical';
  } else if (latest.spo2 < settings.thresholds.spo2.min) {
    alerts.push(`Low Oxygen Saturation (${latest.spo2.toFixed(1)}%).`);
    suggestions.push("Check sensor placement.", "Ensure room is well ventilated.");
    // Fix: Inside this else-if, status cannot be 'Critical' from the Oxygen check. 
    // We set it to Warning to reflect the moderate risk.
    status = 'Warning';
  }

  // Temperature Analysis
  if (latest.temp > settings.thresholds.temp.max) {
    alerts.push(`Elevated Body Temperature (${latest.temp.toFixed(1)}°C).`);
    suggestions.push("Apply cool compress.", "Increase fluid intake.", "Monitor for other flu-like symptoms.");
    // Preserve Critical status if already set by previous checks, otherwise upgrade to Warning
    if (status !== 'Critical') {
        status = 'Warning';
    }
  }

  // Fall Detection (G-Force)
  if (latest.accel > 3.0) {
    alerts.push("Sudden impact / Potential fall detected!");
    suggestions.push("Immediate physical check required.", "Verify for any loss of consciousness.");
    status = 'Critical';
  }

  // Summary Generation
  let summaryText = `Based on the last ${data.length} readings, your vitals are currently within the ${status.toLowerCase()} range. `;
  if (status === 'Normal') {
    summaryText += "All physiological parameters are stable. Heart rate and blood oxygen levels are optimal.";
  } else {
    summaryText += `The system detected ${alerts.length} concern(s) requiring your attention. Please follow the suggested actions below.`;
  }

  return {
    summary: summaryText,
    healthStatus: status,
    suggestions: Array.from(new Set(suggestions)), // Unique suggestions
    alerts: alerts
  };
};
