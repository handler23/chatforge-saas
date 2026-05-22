import { BarChart3, Code2, MessageSquare, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Smart AI replies",
    description: "Train your bot with a custom system prompt for your business.",
  },
  {
    icon: Code2,
    title: "One-line embed",
    description: "Copy a script tag and add the widget to any website instantly.",
  },
  {
    icon: BarChart3,
    title: "Usage & billing",
    description: "Monthly message limits tied to Stripe subscription plans.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description: "API keys hashed, RLS on Supabase, server-side OpenAI calls.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to sell chatbots
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for agencies and local business owners.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
