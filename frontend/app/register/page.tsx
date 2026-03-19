"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWorker, WorkerRegistrationData } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, User, Phone, MapPin, Clock } from "lucide-react";

const platforms = ["Zepto", "Blinkit", "Swiggy", "Zomato", "Dunzo"];
const zones = [
  "Koramangala",
  "Indiranagar",
  "HSR Layout",
  "Whitefield",
  "Electronic City",
  "Jayanagar",
  "Marathahalli",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState<WorkerRegistrationData>({
    name: "",
    phone: "",
    platform: "Zepto",
    city: "Bengaluru",
    zone: "Koramangala",
    deliveryHoursPerDay: 8,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "deliveryHoursPerDay" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const result = await registerWorker(form);

    if (result) {
      localStorage.setItem("workerId", result.id);
      localStorage.setItem("workerName", result.name);
      setAlert({ type: "success", message: `Welcome, ${result.name}! Redirecting to dashboard…` });
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      // Use mock data for demo
      const mockId = `worker-${Date.now()}`;
      localStorage.setItem("workerId", mockId);
      localStorage.setItem("workerName", form.name || "Worker");
      setAlert({ type: "success", message: `Registration successful! Redirecting…` });
      setTimeout(() => router.push("/dashboard"), 1500);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
            <Shield className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 mt-2">Register to get your income protection coverage</p>
        </div>

        {alert && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              alert.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {alert.message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Worker Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                <Input
                  name="name"
                  placeholder="e.g. Arjun Kumar"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 text-sm">
                    +91
                  </span>
                  <Input
                    name="phone"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Platform
                </label>
                <select
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p.toLowerCase()}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City
                </label>
                <Input
                  name="city"
                  placeholder="Bengaluru"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Zone
                </label>
                <select
                  name="zone"
                  value={form.zone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hours per Day
                </label>
                <Input
                  type="number"
                  name="deliveryHoursPerDay"
                  min={1}
                  max={16}
                  value={form.deliveryHoursPerDay}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Registering…" : "Create Account & Get Protected"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
