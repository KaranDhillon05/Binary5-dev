import Link from "next/link";
import { Shield, Zap, MapPin, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: "AI Risk Assessment",
    description:
      "Our ML model analyzes zone conditions, weather, pollution, and traffic patterns to calculate your personalised risk score in real time.",
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    title: "Instant Payouts",
    description:
      "Parametric triggers mean claims are validated automatically. Get paid in under 5 minutes — no paperwork, no hassle.",
  },
  {
    icon: <MapPin className="w-8 h-8 text-green-600" />,
    title: "Zone Monitoring",
    description:
      "Live monitoring of Bengaluru delivery zones. When conditions hit a threshold, your claim is triggered without you lifting a finger.",
  },
];

const steps = [
  { step: "1", title: "Register & Profile", description: "Sign up with your delivery platform and zone information." },
  { step: "2", title: "Get Risk Score", description: "Our AI calculates your risk profile based on your zone and hours." },
  { step: "3", title: "Choose Coverage", description: "Pick Basic, Standard, or Pro — pay a small weekly premium." },
  { step: "4", title: "Earn & Stay Protected", description: "Deliver with confidence. Claims are paid automatically when conditions trigger." },
];

const stats = [
  { label: "Workers Protected", value: "1,200+", icon: <Users className="w-5 h-5" /> },
  { label: "Total Paid Out", value: "₹48L", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Claim Approval Rate", value: "98%", icon: <CheckCircle className="w-5 h-5" /> },
  { label: "Avg Payout Time", value: "< 5 min", icon: <Clock className="w-5 h-5" /> },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <Shield className="w-4 h-4" />
            Parametric Income Insurance
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Income Protection for
            <br />
            <span className="text-yellow-300">Delivery Heroes</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Q-Shield uses AI to provide automatic, instant income insurance for Q-Commerce delivery
            workers. No claim forms. No waiting. Just protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold w-full sm:w-auto">
                Get Protected Today
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex justify-center mb-1 text-blue-600">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Built for the Gig Economy
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
            Traditional insurance doesn't work for delivery workers. Q-Shield does.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="p-6">
                <CardContent className="p-0 pt-0">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">
            Get covered in minutes. Start earning with peace of mind.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Coverage Today</h2>
          <p className="text-blue-100 mb-8">
            Join over 1,200 delivery workers already protected by Q-Shield.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 font-bold">
              Register Now — It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-white font-bold">Q-Shield</span>
          </div>
          <p className="text-sm">© 2026 Q-Shield. Protecting India's delivery workforce.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/claims" className="hover:text-white">Claims</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
