"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getClaims, MOCK_CLAIMS, Claim } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusVariant, getStatusLabel } from "@/lib/utils";
import { Plus, Eye } from "lucide-react";

type FilterType = "all" | "auto_approved" | "fast_verify" | "manual_review" | "rejected";

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "auto_approved", label: "Auto Approved" },
  { key: "fast_verify", label: "Fast Verify" },
  { key: "manual_review", label: "Manual Review" },
  { key: "rejected", label: "Rejected" },
];

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function load() {
      const workerId =
        typeof window !== "undefined"
          ? localStorage.getItem("workerId") || "worker-001"
          : "worker-001";
      const data = await getClaims(workerId);
      setClaims(data || MOCK_CLAIMS);
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    filter === "all" ? claims : claims.filter((c) => c.status === filter || (filter === "auto_approved" && c.status === "approved"));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
          <p className="text-gray-500 mt-1">Track and manage your insurance claims</p>
        </div>
        <Link href="/claims/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            File New Claim
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claims ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No claims found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 font-medium text-gray-500">ID</th>
                    <th className="pb-3 font-medium text-gray-500">Type</th>
                    <th className="pb-3 font-medium text-gray-500">Amount</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                    <th className="pb-3 font-medium text-gray-500">Date</th>
                    <th className="pb-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs text-gray-600">{claim.id}</td>
                      <td className="py-3 capitalize">{claim.type.replace("_", " ")}</td>
                      <td className="py-3 font-medium">{formatCurrency(claim.amount)}</td>
                      <td className="py-3">
                        <Badge variant={getStatusVariant(claim.status)}>
                          {getStatusLabel(claim.status)}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(claim.date)}</td>
                      <td className="py-3">
                        <Link href={`/claims/${claim.id}`}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
