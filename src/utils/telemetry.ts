/**
 * TRD Non-Functional Requirement:
 * Telemetry Simulation: Add a simulated analytics ping. Log a specific message to the console
 * (e.g., [Analytics] User interacted with End-to-End Frequent Flyer Portal) whenever a primary action is completed.
 */

export interface TelemetryEvent {
  timestamp: string;
  action: string;
  details?: Record<string, unknown>;
}

// In-memory buffer of recent telemetry logs for inspection in UI or audit logs
export const telemetryLogBuffer: TelemetryEvent[] = [];

/**
 * Logs a standardized analytics event matching TRD requirements.
 */
export function logTelemetry(action: string, details?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const detailStr = details ? ` | ${JSON.stringify(details)}` : '';
  const message = `[Analytics] User interacted with End-to-End Frequent Flyer Portal: ${action}${detailStr}`;

  // Print to console as required by TRD
  console.log(message);

  telemetryLogBuffer.unshift({
    timestamp,
    action,
    details,
  });

  // Keep buffer bounded
  if (telemetryLogBuffer.length > 50) {
    telemetryLogBuffer.pop();
  }

  return message;
}
