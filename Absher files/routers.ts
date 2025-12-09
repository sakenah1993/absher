import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  risk: router({
    evaluate: protectedProcedure
      .input(
        z.object({
          actionType: z.string(),
          currentDeviceFingerprint: z.string(),
          previousDeviceFingerprint: z.string().optional(),
          currentIp: z.string(),
          previousIp: z.string().optional(),
          currentGeolocation: z.string().optional(),
          previousGeolocation: z.string().optional(),
          actionSensitivity: z.enum(["low", "normal", "high"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { evaluateRisk } = await import("./riskEngine");
        const { createRiskEvent, createPushChallenge } = await import("./db");

        const result = evaluateRisk({
          userId: ctx.user.id,
          actionType: input.actionType,
          currentDeviceFingerprint: input.currentDeviceFingerprint,
          previousDeviceFingerprint: input.previousDeviceFingerprint,
          currentIp: input.currentIp,
          previousIp: input.previousIp,
          currentGeolocation: input.currentGeolocation,
          previousGeolocation: input.previousGeolocation,
          actionSensitivity: input.actionSensitivity,
        });

        await createRiskEvent({
          userId: ctx.user.id,
          actionType: input.actionType,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          riskFactors: JSON.stringify(result.factors),
          deviceFingerprintChange: result.factors.find((f) => f.name === "Device Fingerprint Change")?.detected ? 1 : 0,
          ipChange: result.factors.find((f) => f.name === "IP Address Change")?.detected ? 1 : 0,
          geolocationShift: result.factors.find((f) => f.name === "Geolocation Shift")?.detected ? 1 : 0,
          actionSensitivity: input.actionSensitivity || "normal",
        });

        if (result.action === "PUSH" && result.challengeId) {
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 5);
          await createPushChallenge({
            userId: ctx.user.id,
            challengeId: result.challengeId,
            status: "pending",
            actionDescription: `Approve ${input.actionType}`,
            expiresAt,
          });
        }

        return result;
      }),
  }),

  stepup: router({
    gesture: router({
      verify: protectedProcedure
        .input(z.object({ gesture: z.string() }))
        .mutation(async ({ ctx, input }) => {
          const { verifyGestureChallenge } = await import("./riskEngine");
          const isValid = verifyGestureChallenge(input.gesture);
          return { success: isValid, message: isValid ? "Gesture verified" : "Invalid gesture" };
        }),
    }),
    push: router({
      status: protectedProcedure
        .input(z.object({ challengeId: z.string() }))
        .query(async ({ ctx, input }) => {
          const { getPushChallengeByChallengeId } = await import("./db");
          const challenge = await getPushChallengeByChallengeId(input.challengeId);
          if (!challenge) {
            return { status: "not_found", message: "Challenge not found" };
          }
          return {
            status: challenge.status,
            expiresAt: challenge.expiresAt,
            actionDescription: challenge.actionDescription,
          };
        }),
      respond: protectedProcedure
        .input(
          z.object({
            challengeId: z.string(),
            approved: z.boolean(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { updatePushChallengeStatus } = await import("./db");
          const newStatus = input.approved ? "approved" : "rejected";
          await updatePushChallengeStatus(input.challengeId, newStatus);
          return { success: true, status: newStatus };
        }),
    }),
  }),

  sessions: router({
    recent: protectedProcedure.query(async ({ ctx }) => {
      const { getRiskEventsByUserId } = await import("./db");
      const events = await getRiskEventsByUserId(ctx.user.id, 20);
      return events;
    }),
  }),
});

export type AppRouter = typeof appRouter;
