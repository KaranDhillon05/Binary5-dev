"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPolicy } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RiskIndicator from "@/components/RiskIndicator";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Star } from "lucide-react";

const tiers = [
  {
    id: "basic",
    name: "Basic",
    premium: 45,
    maxPayout: 500,
    coverage: ["Weather disruption", "Pollution alerts"],
    color: "border-gray-200",
    badge: null,
  },
  {
    id: "standard",
    name: "Standard",
    premium: 82,
    maxPayout: 1000,
    coverage: ["Weather disruption", "Pollution alerts", "Zone closures"],
    color: "border-blue-500",
    badge: "ML Suggested",
  },
  {
    id: "pro",
    name: "Pro",
    premium: 120,
    maxPayout: 1500,
    coverage: ["All Standard risks", "Traffic disruption", "Priority support"],
    color: "border-purple-500",
    badge: null,
  },
];

export default function RegisterPolicyPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState("standard");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    const workerId =
      typeof window !== "undefined"
        ? localStorage.getItem("workerId") || "worker-001"
        : "worker-001";
    await createPolicy(workerId, selectedTier);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Get Your Coverage</h1>
        <p className="text-gray-500 mt-2">Three easy steps to income protection</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Risk Profile */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Risk Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RiskIndicator level="medium" zone="Koramangala" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Risk Score</p>
                <p className="text-xl font-bold text-yellow-600">0.42</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Suggested Tier</p>
                <p className="text-xl font-bold text-blue-600">Standard</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Zone</p>
                <p className="font-semibold text-gray-900">Koramangala</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Avg Daily Hours</p>
                <p className="font-semibold text-gray-900">9h</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue to Tier Selection →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Tier Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Choose Your Coverage Tier</h2>
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`cursor-pointer border-2 transition-all ${
                selectedTier === tier.id ? tier.color : "border-gray-200"
              } ${selectedTier === tier.id ? "shadow-md" : ""}`}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                      {tier.badge && (
                        <Badge variant="info" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {tier.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-blue-700 mt-1">
                      {formatCurrency(tier.premium)}<span className="text-sm font-normal text-gray-500">/week</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Max Weekly Payout</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(tier.maxPayout)}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {tier.coverage.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {selectedTier === tier.id && (
                  <div className="mt-3 text-xs text-blue-600 font-medium">✓ Selected</div>
                )}
              </CardContent>
            </Card>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Continue to Payment →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                <p className="text-gray-500 mt-2">Your policy is now active. Redirecting…</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                  <p className="text-3xl font-extrabold text-blue-700">
                    {formatCurrency(tiers.find((t) => t.id === selectedTier)?.premium ?? 82)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{selectedTier} Plan · Weekly</p>
                </div>

                {/* Mock QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-40 h-40 rounded-xl border-2 border-blue-200 flex items-center justify-center bg-white"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,#e5e7eb 0,#e5e7eb 1px,transparent 1px,transparent 10px),repeating-linear-gradient(90deg,#e5e7eb 0,#e5e7eb 1px,transparent 1px,transparent 10px)",
                    }}
                  >
                    <div className="w-20 h-20 bg-gray-900 rounded flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className={`w-5 h-5 ${i % 2 === 0 ? "bg-white" : "bg-gray-900"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Scan with any UPI app</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or enter UPI ID
                  </label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                  <Button className="flex-1" onClick={handlePurchase} disabled={loading}>
                    {loading ? "Processing…" : "Confirm Payment"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
