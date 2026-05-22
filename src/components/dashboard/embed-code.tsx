"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function buildSnippet(appUrl: string, botId: string, apiKey: string) {
  return `<!-- ChatForge Widget -->
<script
  src="${appUrl}/widget.js"
  data-bot-id="${botId}"
  data-api-key="${apiKey || "YOUR_API_KEY"}"
  async
></script>`;
}

export function EmbedCode({
  botId,
  appUrl,
}: {
  botId: string;
  appUrl: string;
}) {
  const storageKey = `chatforge-embed-key-${botId}`;
  const [apiKey, setApiKey] = useState("");
  const [code, setCode] = useState(() => buildSnippet(appUrl, botId, ""));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setApiKey(saved);
      setCode(buildSnippet(appUrl, botId, saved));
    }
  }, [appUrl, botId, storageKey]);

  const preview = useMemo(
    () => buildSnippet(appUrl, botId, apiKey),
    [appUrl, botId, apiKey],
  );

  function applyKeyToCode() {
    const key = apiKey.trim();
    if (!key) {
      toast.error("Előbb illeszd be az API kulcsot.");
      return;
    }
    localStorage.setItem(storageKey, key);
    const next = code.includes("YOUR_API_KEY")
      ? code.replace(/YOUR_API_KEY/g, key)
      : code.replace(/data-api-key="[^"]*"/, `data-api-key="${key}"`);
    setCode(next);
    toast.success("API kulcs beírva a kódba");
  }

  function syncFromKeyField() {
    const key = apiKey.trim();
    if (!key) return;
    localStorage.setItem(storageKey, key);
    setCode(buildSnippet(appUrl, botId, key));
  }

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Kód másolva");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beágyazás a weboldalba</CardTitle>
        <CardDescription>
          1) Generálj kulcsot az API Keys oldalon. 2) Illeszd be alább. 3) Másold a kódot a
          weboldal {`</body>`} elé.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="embed-api-key" className="text-sm font-medium text-foreground">
            API kulcs (cf_…)
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="embed-api-key"
              type="text"
              placeholder="cf_xxxxxxxx — másold az API Keys oldalról"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={syncFromKeyField}
              className="min-w-[200px] flex-1 font-mono text-sm"
            />
            <Button type="button" variant="secondary" onClick={applyKeyToCode}>
              Kulcs beírása
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Nincs kulcsod?{" "}
            <Link href="/dashboard/api-keys" className="text-indigo-400 hover:underline">
              API Keys → Generate key
            </Link>{" "}
            — a teljes kulcsot csak egyszer látod, másold azonnal.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="embed-code" className="text-sm font-medium text-foreground">
            Embed kód (szerkeszthető)
          </label>
          <textarea
            id="embed-code"
            rows={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-white/15 bg-black/30 p-4 font-mono text-xs leading-relaxed text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
          />
          <p className="text-xs text-muted-foreground">
            A szürke mezőben bármit átírhatsz. A{" "}
            <code className="text-indigo-300">YOUR_API_KEY</code> részt cseréld a saját kulcsodra,
            vagy használd a „Kulcs beírása” gombot.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Kód másolása
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setCode(preview);
              toast.message("Kód frissítve a kulcs mező alapján");
            }}
          >
            Sablon visszaállítása
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
