import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { X, Zap } from "lucide-react";
import { toast } from "sonner";

interface GestureChallengeProps {
  onClose: () => void;
  actionType: string;
  riskResult: any;
}

export default function GestureChallenge({
  onClose,
  actionType,
  riskResult,
}: GestureChallengeProps) {
  const [gesture, setGesture] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyMutation = trpc.stepup.gesture.verify.useMutation();

  const gestures = ["Swipe Up", "Swipe Down", "Swipe Left", "Swipe Right", "Double Tap"];

  const handleGestureSelect = async (selectedGesture: string) => {
    setGesture(selectedGesture);
    setIsVerifying(true);

    try {
      const result = await verifyMutation.mutateAsync({
        gesture: selectedGesture,