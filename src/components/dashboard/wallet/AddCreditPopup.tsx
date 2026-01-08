// components/wallet/AddCreditPopup.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  CreditCard,
  Zap,
  Sparkles,
} from "lucide-react";
import { PRICE_PER_MESSAGE } from "@/utiles/constans/wallet";
import { useRazorpayPayment } from "@/hooks/razorpay/useRazorpayPayment";
import { toast } from "@/components/ui/sonner";

interface AddCreditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCredits: (amount: number) => void;
  currentBalance?: number;
}

const CREDIT_STEPS = [
  { credits: 500, label: "Starter", popular: true },
  { credits: 1000, label: "Basic", popular: false },
  { credits: 2500, label: "Pro", popular: true },
  { credits: 5000, label: "Business", popular: false },
  { credits: 10000, label: "Premium", popular: false },
//   { credits: 25000, label: "Enterprise", popular: true },
];

export default function AddCreditPopup({
  isOpen,
  onClose,
  onAddCredits,
  currentBalance = 0,
}: AddCreditPopupProps) {
  const [credits, setCredits] = useState(500);
  const [customCredits, setCustomCredits] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("card");
  const { initiatePayment, loading } = useRazorpayPayment();

  useEffect(() => {
    if (!isOpen) {
      setCredits(500);
      setCustomCredits("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateTotalAmount = (creditsAmount: number): number =>
      Math.round(creditsAmount * PRICE_PER_MESSAGE * 10) / 10;

  const handleCustomSubmit = () => {
    const value = parseInt(customCredits);
    if (value > 0) setCredits(value);
  };

  const handlePayment = async () => {
    initiatePayment({
      amount: calculateTotalAmount(credits),
      currency: 'INR',
      name: 'Pro Plan',
      description: 'Subscription upgrade',
      onSuccess: () => {
        toast.success("Payment successfull")
        onClose(); // ✅ close AFTER success
      },
      onFailure: () => {
        alert('Payment failed');
      },
    });
  };

  const paymentMethods = [
    { id: "razorpay", name: "Razorpay", icon: "💳", description: "Pay using UPI, QR code, or cards", },
    // { id: "card", name: "Credit Card", icon: "💳" },
    // { id: "paypal", name: "PayPal", icon: "🏷️" },
    // { id: "crypto", name: "Crypto", icon: "₿" },
  ];

  const stepIndex = CREDIT_STEPS.findIndex(
    (s) => s.credits === credits
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[800px] max-w-6xl">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-0">
            {/* HEADER */}
            <div className="px-6 pb-4 flex justify-between items-center">
              <div className="flex gap-3 justify-between items-center">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900">
                    Add Message Credits
                  </h3>
                  <p className="text-[13px] text-gray-600">
                    Current balance:{" "}
                    <span className="font-semibold text-emerald-600">
                      {currentBalance.toLocaleString()}
                    </span>{" "}
                    credits
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X />
              </Button>
            </div>

            {/* MAIN HORIZONTAL BODY */}
            <div className="px-6 pb-2 flex flex-col lg:flex-row gap-6">
              {/* LEFT — SLIDER + CUSTOM */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 bg-white rounded-2xl shadow">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold">Select Credits</h3>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm">
                            <Zap className="h-4 w-4" />
                            {credits.toLocaleString()} credits/${calculateTotalAmount(credits)}
                        </div>
                    </div>

                    <input
                        type="range"
                        min={0}
                        max={CREDIT_STEPS.length - 1}
                        value={stepIndex}
                        onChange={(e) =>
                            setCredits(CREDIT_STEPS[Number(e.target.value)].credits)
                        }
                        className="w-full accent-emerald-600"
                    />

                    <div className="flex justify-between mt-3 text-xs">
                        {CREDIT_STEPS.map((s, i) => (
                        <span
                            key={s.credits}
                            className={i === stepIndex ? "text-emerald-600 font-semibold" : "text-gray-400"}
                        >
                            <div>
                                <p className="text-center">{s.credits}</p>
                                {/* <p>{s.label}</p> */}
                            </div>
                        </span>
                        ))}
                    </div>

                </div>

                {/* CUSTOM INPUT */}
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs font-semibold text-gray-500">
                        OR CUSTOM
                    </span>
                    <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    <div className="flex gap-3 items-center mt-8">
                    <input
                        type="number"
                        value={customCredits}
                        onChange={(e) => setCustomCredits(e.target.value)}
                        placeholder="Enter custom amount"
                        className="flex-1 px-4 py-2 border-2 rounded-xl"
                    />
                    <Button onClick={handleCustomSubmit}>Apply</Button>
                    </div>
                </div>

                {/* PUSH TO BOTTOM */}
                <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Credits apply only to our platform. WhatsApp API fees are paid directly to Meta.
                    </div>
                </div>
              </div>

              {/* RIGHT — SUMMARY */}
              <div className="w-full lg:w-80 space-y-6">
                {/* SUMMARY */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-3">
                      <div>
                        <h5 className="font-semibold">Order Summary</h5>
                        <p className="text-xs text-gray-600">
                          1 credit = 1 message
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-[18px]">
                      {credits.toLocaleString()} credits
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Price / credit</p>
                        <p className="font-semibold">
                            ${PRICE_PER_MESSAGE}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-right">Total</p>
                        <p className="font-semibold text-emerald-600 text-right">
                            ${calculateTotalAmount(credits)}
                        </p>
                    </div>
                  </div>

                </div>

                {/* PAYMENT METHODS */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">
                        Payment Method
                    </h4>

                    <div
                        className={`grid gap-3 ${
                        paymentMethods.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-3"
                        }`}
                    >
                        {paymentMethods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                            selectedMethod === m.id
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-200 hover:border-emerald-300"
                            }`}
                        >
                            {/* Icon */}
                            <div className="flex h-10 w-10 text-2xl items-center justify-center rounded-lg">
                              <span className="text-2xl h-10">{m.icon}</span>
                            </div>


                            {/* Text */}
                            <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">
                                {m.name}
                            </p>
                            {m.description && (
                                <p className="text-xs text-gray-500">
                                {m.description}
                                </p>
                            )}
                            </div>
                        </button>
                        ))}
                    </div>
                </div>

                <Button
                  onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white w-full"
                >
                    {loading ? "Processing..." : `Pay $${calculateTotalAmount(credits)}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

