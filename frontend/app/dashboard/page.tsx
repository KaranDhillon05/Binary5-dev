"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkerProfile, getPolicies, getClaims, MOCK_WORKER, MOCK_POLICY, MOCK_CLAIMS, Worker, Policy, Claim } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RiskIndicator from "@/components/RiskIndicator";
import { formatCurrency, formatDate, getStatusVariant, getStatusLabel } from "@/lib/utils";
import { Clock, Package, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const workerId =
        typeof window !== "undefined"
          ? localStorage.getItem("workerId") || "worker-001"
          : "worker-001";

      const [w, policies, c] = await Promise.all([
        getWorkerProfile(workerId),
        getPolicies(workerId),
        getClaims(workerId),
      ]);

      setWorker(w || MOCK_WORKER);
      setPolicy((policies && policies[0]) || MOCK_POLICY);
      setClaims(Array.isArray(c) ? c : MOCK_CLAIMS);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const recentClaims = Array.isArray(claims) ? claims.slice(0, 3) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {worker?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {worker?.platform || "N/A"} · {worker?.zone || "N/A"}, {worker?.city || "N/A"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Active Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Active Policy</CardTitle>
          </CardHeader>
          <CardContent>
            {policy ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="info" className="capitalize">{policy?.tier || "N/A"}</Badge>
                  <Badge variant={getStatusVariant(policy?.status || "")}>{getStatusLabel(policy?.status || "")}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Weekly Premium</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(policy?.adjustedPremium || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Max Weekly Payout</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(policy?.maxWeeklyPayout || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Coverage Until</p>
                    <p className="font-semibold text-gray-900">{formatDate(policy?.coverageEnd || "")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Base Premium</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(policy?.basePremium || 0)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No active policy</p>
                <Link href="/register-policy">
                  <Button size="sm">Get Coverage</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zone Risk */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Risk Status</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskIndicator level="medium" zone={worker?.zone || ""} />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="font-semibold text-gray-900">{worker?.deliveryHoursPerDay || 0}h</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <Package className="w-4 h-4 text-green-500 mx-auto mb-1" />
                <p className="font-semibold text-gray-900">24</p>
                <p className="text-xs text-gray-500">Deliveries</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <TrendingUp className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="font-semibold text-gray-900">₹720</p>
                <p className="text-xs text-gray-500">Estimate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Claims</CardTitle>
            <Link href="/claims" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentClaims.length === 0 ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
              <AlertCircle className="w-4 h-4" />
              No claims yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-2 font-medium text-gray-500">Type</th>
                    <th className="pb-2 font-medium text-gray-500">Amount</th>
                    <th className="pb-2 font-medium text-gray-500">Status</th>
                    <th className="pb-2 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="py-2.5 capitalize">{(claim?.type || "unknown")?.replace(/_/g, " ")}</td>
                      <td className="py-2.5 font-medium">{formatCurrency(claim?.amount || 0)}</td>
                      <td className="py-2.5">
                        <Badge variant={getStatusVariant(claim?.status || "")}>
                          {getStatusLabel(claim?.status || "")}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-gray-500">{formatDate(claim?.date || "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/claims/new">
          <Button variant="default">Report Issue</Button>
        </Link>
        <Link href="/register-policy">
          <Button variant="outline">Buy / Upgrade Policy</Button>
        </Link>
        <Link href="/claims">
          <Button variant="ghost">View All Claims</Button>
        </Link>
      </div>
    </div>
  );
}
