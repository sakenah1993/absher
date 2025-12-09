import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

let fpPromise: Promise<any> | null = null;

/**
 * Initialize FingerprintJS
 * Note: In production, you would need a valid API key from FingerprintJS
 * For this demo, we'll use the public API which has limited accuracy
 */
export async function initializeFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load({
      // Using public API - in production, use your own API key
      apiKey: 'public',
    });
  }
  return fpPromise;
}

/**
 * Get device fingerprint
 * Returns a unique identifier for the current device/browser combination
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await initializeFingerprint();
    const result = await fp.get();
    
    // The visitorId is a unique identifier for this device/browser combination
    return result.visitorId;
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    // Fallback to a basic fingerprint if FingerprintJS fails
    return generateFallbackFingerprint();
  }
}

/**
 * Get detailed fingerprint data including confidence score
 */
export async function getDetailedFingerprint() {
  try {
    const fp = await initializeFingerprint();
    const result = await fp.get();
    
    return {
      visitorId: result.visitorId,
      confidence: result.confidence.score,
      timestamp: new Date(),
      components: result.components,
    };
  } catch (error) {
    console.error('Error getting detailed fingerprint:', error);
    return {
      visitorId: generateFallbackFingerprint(),
      confidence: 0.5,
      timestamp: new Date(),
      components: {},
    };
  }
}

/**
 * Fallback fingerprinting using basic browser characteristics
 * Used when FingerprintJS is unavailable
 */
function generateFallbackFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() || 'unknown',
    (navigator as any).deviceMemory?.toString() || 'unknown',
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
  ];

  // Simple hash function
  let hash = 0;
  const str = components.join('|');
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Compare two fingerprints to detect device changes
 * Returns true if fingerprints are different (device changed)
 */
export function compareFingerprints(
  currentFingerprint: string,
  previousFingerprint: string | null
): boolean {
  if (!previousFingerprint) {
    return false; // First time, no previous fingerprint to compare
  }
  
  return currentFingerprint !== previousFingerprint;
}

/**
 * Get browser information for additional device context
 */
export function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
