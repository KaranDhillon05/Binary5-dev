"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClaim, ClaimData } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

const claimTypes = ["weather", "pollution", "zone_closure", "traffic"];
const zones = ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Electronic City", "Jayanagar", "Marathahalli"];

export default function NewClaimPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<Omit<ClaimData, "workerId">>({
    type: "weather",
    amount: 100,
    description: "",
    zone: "Koramangala",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "amount" ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const workerId = typeof window !== "undefined" ? localStorage.getItem("workerId") || "worker-001" : "worker-001";
    await createClaim({ ...form, workerId });
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/claims"), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/claims">
        <Button variant="ghost" size="sm" className="mb-6 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Claims
        </Button>
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">File a New Claim</h1>

      <Card>
        <CardHeader><CardTitle>Claim Details</CardTitle></CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Claim Submitted!</h3>
              <p className="text-gray-500 mt-2">Redirecting to claims list…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {claimTypes.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <select name="zone" value={form.zone} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {zones.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <Input type="number" name="amount" min={1} value={form.amount} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Describe the disruption..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting…" : "Submit Claim"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
