import { describe, expect, it } from "vitest";
import { evaluateRisk, verifyGestureChallenge } from "./riskEngine";

describe("Risk Engine", () => {
  describe("evaluateRisk", () => {
    it("returns LOW risk for safe action with no changes", () => {
      const result = evaluateRisk({
        userId: 1,
        actionType: "view_dashboard",
        currentDeviceFingerprint: "fp123",
        previousDeviceFingerprint: "fp123",
        currentIp: "192.168.1.1",
        previousIp: "192.168.1.1",
        currentGeolocation: "25.2048,55.2708,AE",
        previousGeolocation: "25.2048,55.2708,AE",
        actionSensitivity: "low",
      });

      expect(result.riskLevel).toBe("LOW");
      expect(result.action).toBe("SAFE");
      expect(result.riskScore).toBeLessThanOrEqual(30);
    });

    it("returns MEDIUM risk for device fingerprint change", () => {
      const result = evaluateRisk({
        userId: 1,
        actionType: "view_documents",
        currentDeviceFingerprint: "fp456",
        previousDeviceFingerprint: "fp123",
        currentIp: "192.168.1.1",
        previousIp: "192.168.1.1",
        currentGeolocation: "25.2048,55.2708,AE",
        previousGeolocation: "25.2048,55.2708,AE",
      });

      expect(result.riskLevel).toBe("MEDIUM");
      expect(result.action).toBe("GESTURE");
      expect(result.riskScore).toBeGreaterThan(30);
      expect(result.riskScore).toBeLessThanOrEqual(60);
    });

    it("returns HIGH risk for multiple factors including device and IP change", () => {
      const result = evaluateRisk({
        userId: 1,
        actionType: "transfer_funds",
        currentDeviceFingerprint: "fp456",
        previousDeviceFingerprint: "fp123",
        currentIp: "203.0.113.1",
        previousIp: "192.168.1.1",
        currentGeolocation: "25.2048,55.2708,AE",
        previousGeolocation: "25.2048,55.2708,AE",
        actionSensitivity: "high",
      });

      expect(result.riskLevel).toBe("HIGH");
      expect(result.action).toBe("PUSH");
      expect(result.riskScore).toBeGreaterThan(60);
      expect(result.riskScore).toBeLessThanOrEqual(85);
      expect(result.challengeId).toBeDefined();
    });

    it("returns CRITICAL risk for multiple changes", () => {
      const result = evaluateRisk({
        userId: 1,
        actionType: "change_password",
        currentDeviceFingerprint: "fp456",
        previousDeviceFingerprint: "fp123",
        currentIp: "203.0.113.1",
        previousIp: "192.168.1.1",
        currentGeolocation: "40.7128,74.0060,US",
        previousGeolocation: "25.2048,55.2708,AE",
        actionSensitivity: "high",
      });

      expect(result.riskLevel).toBe("CRITICAL");
      expect(result.action).toBe("BLOCK");
      expect(result.riskScore).toBeGreaterThan(85);
    });

    it("includes all risk factors in result", () => {
      const result = evaluateRisk({
        userId: 1,
        actionType: "transfer_funds",
        currentDeviceFingerprint: "fp456",
        previousDeviceFingerprint: "fp123",
        currentIp: "203.0.113.1",
        previousIp: "192.168.1.1",
        currentGeolocation: "40.7128,74.0060,US",
        previousGeolocation: "25.2048,55.2708,AE",
      });

      expect(result.factors).toHaveLength(4);
      expect(result.factors.map((f) => f.name)).toContain("Device Fingerprint Change");
      expect(result.factors.map((f) => f.name)).toContain("IP Address Change");
      expect(result.factors.map((f) => f.name)).toContain("Geolocation Shift");
      expect(result.factors.map((f) => f.name)).toContain("Action Sensitivity");
    });
  });

  describe("verifyGestureChallenge", () => {
    it("returns true for valid gesture", () => {
      const result = verifyGestureChallenge("swipe_right");
      expect(result).toBe(true);
    });

    it("returns false for empty gesture", () => {
      const result = verifyGestureChallenge("");
      expect(result).toBe(false);
    });
  });
});
