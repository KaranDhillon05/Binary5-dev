"use client";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CLAIMS } from "@/lib/api";
import { formatCurrency, formatDate, getStatusVariant, getStatusLabel } from "@/lib/utils";
import { Users, FileText, AlertTriangle, TrendingUp } from "lucide-react";

const AdminMap = dynamic(() => import("@/components/AdminMap"), { ssr: false });

const statsCards = [
  { label: "Total Policies", value: "1,247", icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Claims", value: "38", icon: <FileText className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Fraud Rings Detected", value: "3", icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
  { label: "Total Payout", value: "₹4,82,000", icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-50" },
];

const fraudAlerts = [
  { id: "ring-001", zone: "Whitefield", workers: 7, risk: "high" },
  { id: "ring-002", zone: "Electronic City", workers: 4, risk: "medium" },
  { id: "ring-003", zone: "Marathahalli", workers: 3, risk: "medium" },
];

function fraudScoreColor(score: number) {
  if (score < 0.3) return "text-green-600";
  if (score < 0.6) return "text-amber-600";
  return "text-red-600";
}

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and fraud monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Fraud Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Fraud Ring Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.risk === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{alert.zone}</p>
                    <p className="text-xs text-gray-500">{alert.workers} workers · Ring {alert.id}</p>
                  </div>
                  <Badge variant={alert.risk === "high" ? "danger" : "warning"}>
                    {alert.risk === "high" ? "High" : "Medium"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Claims Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="pb-2 font-medium text-gray-500">Worker</th>
                      <th className="pb-2 font-medium text-gray-500">Zone</th>
                      <th className="pb-2 font-medium text-gray-500">Type</th>
                      <th className="pb-2 font-medium text-gray-500">Amount</th>
                      <th className="pb-2 font-medium text-gray-500">Status</th>
                      <th className="pb-2 font-medium text-gray-500">Fraud</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_CLAIMS.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-mono text-xs text-gray-600">
                          {claim.id.replace("clm", "wkr")}
                        </td>
                        <td className="py-2.5 text-gray-700">{claim.zone}</td>
                        <td className="py-2.5 capitalize">{claim.type.replace("_", " ")}</td>
                        <td className="py-2.5 font-medium">{formatCurrency(claim.amount)}</td>
                        <td className="py-2.5">
                          <Badge variant={getStatusVariant(claim.status)}>
                            {getStatusLabel(claim.status)}
                          </Badge>
                        </td>
                        <td className={`py-2.5 font-semibold ${fraudScoreColor(claim.fraudScore ?? 0)}`}>
                          {(claim.fraudScore ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Claims Map — Bengaluru</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMap />
          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Low activity (1–2 claims)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">Medium activity (3 claims)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">High fraud risk (4+ claims)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
