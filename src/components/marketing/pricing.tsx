import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Try it on one site",
    features: ["100 messages/mo", "1 chatbot", "Embed widget"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    description: "For growing shops",
    features: ["2,000 messages/mo", "3 chatbots", "Chat history", "API keys"],
    cta: "Start trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$79",
    description: "For agencies",
    features: ["10,000 messages/mo", "10 chatbots", "Priority support"],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">Simple pricing</h2>
          <p className="mt-3 text-muted-foreground">
            Sell monthly subscriptions to local businesses.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "ring-2 ring-indigo-400/50 shadow-xl shadow-indigo-500/10"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="pt-2 text-4xl font-bold text-foreground">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    variant={plan.highlighted ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
