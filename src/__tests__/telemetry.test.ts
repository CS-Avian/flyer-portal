import { logTelemetry, telemetryLogBuffer } from '../utils/telemetry';

describe('Telemetry Simulation Engine', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('logs the exact mandated message format to the console on primary interactions', () => {
    const action = 'Register Frequent Flyer Member';
    const metadata = { tier: 'Platinum', airport: 'JFK' };

    const message = logTelemetry(action, metadata);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Analytics] User interacted with End-to-End Frequent Flyer Portal: Register Frequent Flyer Member')
    );
    expect(message).toContain('[Analytics] User interacted with End-to-End Frequent Flyer Portal');
  });

  it('buffers telemetry events in the audit log for floor staff review', () => {
    const initialCount = telemetryLogBuffer.length;
    logTelemetry('Execute Award Flight Redemption', { miles: 25000 });

    expect(telemetryLogBuffer.length).toBe(initialCount + 1);
    expect(telemetryLogBuffer[0].action).toBe('Execute Award Flight Redemption');
    expect(telemetryLogBuffer[0].details).toEqual({ miles: 25000 });
  });
});
