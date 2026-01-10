// components/wallet/AddCreditPopup.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  Zap,
  Sparkles,
} from "lucide-react";
import { CURRENCY_CONFIG, CurrencyCode, PRICE_PER_CREDIT_USD } from "@/utiles/constans/wallet";
import { useRazorpayPayment } from "@/hooks/razorpay/useRazorpayPayment";
import { toast } from "@/components/ui/sonner";
import { detectCurrency } from "@/lib/wallet/pricing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { initiatePayment, loading } = useRazorpayPayment();
  const [currency, setCurrency] = useState<CurrencyCode>(() => detectCurrency());
  const { rate, symbol, name } = CURRENCY_CONFIG[currency];
  const [customError, setCustomError] = useState<string | null>(null);


  useEffect(() => {
    if (!isOpen) {
      setCredits(500);
      setCustomCredits("");
      setCurrency("USD");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pricePerCredit: number = Number(
    (PRICE_PER_CREDIT_USD / rate).toFixed(3)
  );
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // const calculateTotalAmount = (creditsAmount: number, currency: string): number =>
  //   creditsToAmount({ credits: creditsAmount, currency });
  const totalAmount = () => {
    return Number((credits * pricePerCredit).toFixed(1));
  };

  const handleCustomSubmit = () => {
    const value = Number(customCredits);

    if (isNaN(value)) {
      setCustomError("Please enter a valid number");
      return;
    }

    if (value < 500) {
      setCustomError("Minimum 500 credits required");
      return;
    }
    setCustomError(null);
    setCredits(value);
  };

  const handlePayment = async () => {
    initiatePayment({
      amount: totalAmount(),
      currency,
      name: 'Pro Plan',
      description: 'Subscription upgrade',
      onSuccess: () => {
        toast.success("Payment successfull")
        onAddCredits(credits); // optimistic
        onClose(); // ✅ close AFTER success
      },
      onFailure: () => {
        alert('Payment failed');
      },
    });
  };

  const stepIndex = Math.max(
    0,
    CREDIT_STEPS.findIndex((s) => s.credits === credits)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[800px] max-w-6xl">
        <Card className="bg-white dark:bg-[#161717] border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Add Message Credits
              </CardTitle>

              <CardDescription>
                Current balance:{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentBalance.toLocaleString()}
                </span>{" "}
                credits
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_CONFIG).map(([code, cfg]) => (
                    <SelectItem key={code} value={code}>
                      {code} ({cfg.symbol}) — {cfg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* MAIN HORIZONTAL BODY */}
            <div className="px-6 pb-2 flex flex-col lg:flex-row gap-6">
              {/* LEFT — SLIDER + CUSTOM */}
              <div className="flex-1 flex flex-col">
                <Card className="py-3">
                  <CardHeader className="flex items-center justify-between px-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {/* <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> */}
                        Select Credits
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                        <Zap className="h-4 w-4" />
                        {credits.toLocaleString()} credits/{formatter.format(totalAmount())}
                    </div>
                  </CardHeader>
                  <CardContent className="px-3">
                      <input
                          type="range"
                          min={0}
                          max={CREDIT_STEPS.length - 1}
                          value={stepIndex}
                          onChange={(e) =>
                              setCredits(CREDIT_STEPS[Number(e.target.value)].credits)
                          }
                          className="w-full accent-emerald-600 dark:accent-emerald-400"
                      />
                      <div className="flex justify-between mt-3 text-xs">
                          {CREDIT_STEPS.map((s, i) => (
                          <span
                              key={s.credits}
                              className={i === stepIndex ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-400"}
                          >
                              <div>
                                  <p className="text-center">{s.credits}</p>
                                  {/* <p>{s.label}</p> */}
                              </div>
                          </span>
                          ))}
                      </div>
                  </CardContent>
                </Card>

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
                        inputMode="numeric"
                        step={1}
                        min={500}
                        value={customCredits}
                        onChange={(e) => {
                          // Remove decimals & non-numbers
                          const value = e.target.value.replace(/\D/g, "");
                          setCustomCredits(value);
                          setCustomError(null);
                        }}
                        placeholder="Enter custom credits (min 500)"
                        className={`flex-1 px-4 py-2 border-2 rounded-xl ${
                          customError ? "border-red-500" : ""
                        }`}
                      />

                      <Button variant="outline" onClick={handleCustomSubmit}>
                        Apply
                      </Button>
                    </div>

                    {customError && (
                      <p className="text-sm text-red-600 mt-2">
                        {customError}
                      </p>
                    )}

                </div>

                {/* PUSH TO BOTTOM */}
                <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800/40 dark:border-red-200 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Credits apply only to our platform. WhatsApp API fees are paid directly to Meta.
                    </div>
                </div>
              </div>

              {/* RIGHT — SUMMARY */}
              <div className="w-full lg:w-80 space-y-6">
                {/* SUMMARY */}
                <Card className="py-3 bg-gradient-to-r from-indigo-50 dark:from-emerald-900/20 to-purple-50 dark:to-green-900/20">
                  <CardHeader className="flex items-center justify-between px-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {/* <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> */}
                        Order Summary
                      </CardTitle>
                      <CardDescription className="text-xs">                    
                        1 credit = 1 message
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 text-right font-bold text-[18px]">
                        {credits.toLocaleString()} credits
                    </div>
                  </CardHeader>
                  <CardContent className="px-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Price / credit</p>
                        <p className="font-semibold">
                          {formatter.format(pricePerCredit)}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-right">Total</p>
                        <p className="font-semibold text-emerald-600 text-right">
                            {formatter.format(totalAmount())}
                        </p>
                    </div>
                  </div>
                  </CardContent>
                </Card>

                {/* PAYMENT METHODS */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">
                        Payment Method
                    </h4>

                    <Card className="py-4 border border-emerald-500">
                      <CardHeader className="flex items-center justify-between px-6">
                        <div className="flex-1 text-2xl h-10">
                          💳
                        </div>
                        <div className="flex-5">
                          <CardTitle>
                            {/* <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> */}
                            Razorpay
                          </CardTitle>
                          <CardDescription className="text-xs">                    
                            Pay using UPI, QR code, or cards
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                </div>

                <Button
                  onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full"
                >
                    {loading ? "Processing..." : `Pay ${formatter.format(totalAmount())}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

