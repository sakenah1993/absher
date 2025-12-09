import { nanoid } from "nanoid";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskEvaluationInput {
  userId: number;
  actionType: string;
  currentDeviceFingerprint: string;
  previousDeviceFingerprint?: string;
  currentIp: string;
  previousIp?: string;
  currentGeolocation?: string;
  previousGeolocation?: string;
  actionSensitivity?: "low" | "normal" | "high";
}

export interface RiskEvaluationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  action: "SAFE" | "GESTURE" | "PUSH" | "BLOCK";
  factors: RiskFactor[];
  challengeId?: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  detected: boolean;
}

const ACTION_SENSITIVITY_LEVELS: Record<string, "low" | "normal" | "high"> = {
  transfer_funds: "high",
  change_password: "high",
  view_documents: "normal",
  update_profile: "normal",
  logout: "low",
  view_dashboard: "low",
};

export function evaluateRisk(input: RiskEvaluationInput): RiskEvaluationResult {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  const deviceFingerprintChanged =
    input.previousDeviceFingerprint &&
    input.previousDeviceFingerprint !== input.currentDeviceFingerprint;
  factors.push({
    name: "Device Fingerprint Change",
    score: deviceFingerprintChanged ? 30 : 0,
    detected: deviceFingerprintChanged || false,
  });
  if (deviceFingerprintChanged) totalScore += 30;

  const ipChanged = input.previousIp && input.previousIp !== input.currentIp;
  factors.push({
    name: "IP Address Change",
    score: ipChanged ? 25 : 0,
    detected: ipChanged || false,
  });
  if (ipChanged) totalScore += 25;

  const geolocationShifted =
    input.previousGeolocation &&
    input.previousGeolocation !== input.currentGeolocation;
  factors.push({
    name: "Geolocation Shift",
    score: geolocationShifted ? 20 : 0,
    detected: geolocationShifted || false,
  });
  if (geolocationShifted) totalScore += 20;

  const actionSensitivity =
    input.actionSensitivity ||
    ACTION_SENSITIVITY_LEVELS[input.actionType] ||
    "normal";
  const sensitivityScore =
    actionSensitivity === "high" ? 25 : actionSensitivity === "normal" ? 12 : 0;
  factors.push({
    name: "Action Sensitivity",
    score: sensitivityScore,
    detected: sensitivityScore > 0,
  });
  totalScore += sensitivityScore;

  const riskScore = Math.min(100, Math.max(0, totalScore));

  let riskLevel: RiskLevel;
  let action: "SAFE" | "GESTURE" | "PUSH" | "BLOCK";

  if (riskScore <= 30) {
    riskLevel = "LOW";
    action = "SAFE";
  } else if (riskScore <= 60) {
    riskLevel = "MEDIUM";
    action = "GESTURE";
  } else if (riskScore <= 85) {
    riskLevel = "HIGH";
    action = "PUSH";
  } else {
    riskLevel = "CRITICAL";
    action = "BLOCK";
  }

  const result: RiskEvaluationResult = {
    riskScore,
    riskLevel,
    action,
    factors,
  };

  if (action === "PUSH") {
    result.challengeId = nanoid(16);
  }

  return result;
}

export function generateChallengeId(): string {
  return nanoid(16);
}

export function verifyGestureChallenge(gesture: string): boolean {
  return !!(gesture && gesture.length > 0);
}
