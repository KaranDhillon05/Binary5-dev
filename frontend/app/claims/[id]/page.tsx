"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_CLAIMS } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusVariant, getStatusLabel } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

function FraudGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score < 0.3 ? "#22c55e" : score < 0.6 ? "#f59e0b" : "#ef4444";
  const label = score < 0.3 ? "Low" : score < 0.6 ? "Medium" : "High";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center rotate-90">
          <span className="text-lg font-bold" style={{ color }}>
            {score.toFixed(2)}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium mt-1" style={{ color }}>
        {label} Fraud Risk
      </p>
    </div>
  );
}

const statusTimeline = [
  { key: "filed", label: "Filed", icon: <Clock className="w-4 h-4" /> },
  { key: "verified", label: "Verified", icon: <AlertCircle className="w-4 h-4" /> },
  { key: "paid", label: "Paid / Resolved", icon: <CheckCircle className="w-4 h-4" /> },
];

function getTimelineStep(status: string): number {
  if (status === "rejected") return 1;
  if (status === "manual_review") return 1;
  if (status === "fast_verify") return 1;
  if (status === "auto_approved" || status === "approved") return 2;
  return 0;
}

export default function ClaimDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const claim = MOCK_CLAIMS.find((c) => c.id === id) || {
    id: id || "unknown",
    type: "weather",
    amount: 150,
    status: "auto_approved",
    date: new Date().toISOString().split("T")[0],
    fraudScore: 0.15,
    zone: "Koramangala",
    description: "Weather disruption caused significant delivery delays.",
  };

  const timelineStep = getTimelineStep(claim.status);
  const isRejected = claim.status === "rejected";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/claims">
        <Button variant="ghost" size="sm" className="mb-6 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Claims
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {claim.type.replace("_", " ")} Claim
            </h1>
            <p className="text-gray-500 font-mono text-sm mt-1">{claim.id}</p>
          </div>
          <Badge variant={getStatusVariant(claim.status)} className="text-sm">
            {getStatusLabel(claim.status)}
          </Badge>
        </div>
        <p className="text-3xl font-extrabold text-blue-700 mt-3">{formatCurrency(claim.amount)}</p>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Claim Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {statusTimeline.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${
                      i <= timelineStep && !isRejected
                        ? "bg-green-500"
                        : i === 1 && isRejected
                        ? "bg-red-500"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i === 1 && isRejected ? <XCircle className="w-4 h-4" /> : s.icon}
                  </div>
                  <p className="text-xs mt-1 text-gray-600 text-center w-20">{s.label}</p>
                </div>
                {i < statusTimeline.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-5 ${
                      i < timelineStep && !isRejected ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Fraud Score */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <FraudGauge score={claim.fraudScore ?? 0.1} />
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Zone</p>
              <p className="font-medium text-gray-900">{claim.zone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Filed On</p>
              <p className="font-medium text-gray-900">{formatDate(claim.date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Description</p>
              <p className="font-medium text-gray-900">
                {claim.description || `${claim.type.replace("_", " ")} disruption in the delivery zone.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Info */}
      {(claim.status === "auto_approved" || claim.status === "approved") && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Payout Processed</h3>
                <p className="text-sm text-green-700">
                  {formatCurrency(claim.amount)} has been credited to your registered UPI ID.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
