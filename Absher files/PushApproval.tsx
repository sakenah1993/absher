import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { X, Smartphone, Clock } from "lucide-react";
import { toast } from "sonner";

interface PushApprovalProps {
  onClose: () => void;
  actionType: string;
  riskResult: any;
  challengeId: string;
}

export default function PushApproval({
  onClose,
  actionType,
  riskResult,
  challengeId,
}: PushApprovalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isResponding, setIsResponding] = useState(false);
  const statusQuery = trpc.stepup.push.status.useQuery(
    { challengeId },
    { refetchInterval: 2000 }
  );
  const respondMutation = trpc.stepup.push.respond.useMutation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Challenge expired");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handleApprove = async () => {
    setIsResponding(true);
    try {
      const result = await respondMutation.mutateAsync({
        challengeId,
        approved: true,
      });
      toast.success("✓ Push approval accepted! Action approved.");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error("Failed to respond to push approval");
      console.error(error);
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    setIsResponding(true);
    try {
      const result = await respondMutation.mutateAsync({
        challengeId,
        approved: false,
      });
      toast.error("✗ Push approval rejected. Action blocked.");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error("Failed to respond to push approval");
      console.error(error);
    } finally {
      setIsResponding(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-900">Push Approval Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-slate-600 mb-4">
            A push notification has been sent to your trusted phone. Approve or reject this action:
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-orange-800 font-semibold mb-2">
              Action: <span className="capitalize">{actionType}</span>
            </p>
            <p className="text-sm text-orange-800">
              <strong>Risk Score:</strong> {riskResult.riskScore}/100 ({riskResult.riskLevel})
            </p>
            <p className="text-sm text-orange-800 mt-2">
              This high-risk action requires confirmation from your trusted device.
            </p>
          </div>

          {/* Status */}
          <div className="bg-slate-100 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>

            {statusQuery.data?.status === "pending" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-700">Waiting for approval...</span>
              </div>
            )}

            {statusQuery.data?.status === "approved" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-emerald-700 font-semibold">Approved!</span>
              </div>
            )}

            {statusQuery.data?.status === "rejected" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700 font-semibold">Rejected</span>
              </div>
            )}
          </div>

          {/* Challenge ID */}
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-500 mb-1">Challenge ID</p>
            <p className="text-xs font-mono text-slate-700 break-all">{challengeId}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            onClick={handleReject}
            disabled={isResponding}
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isResponding}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isResponding ? "Processing..." : "Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}
