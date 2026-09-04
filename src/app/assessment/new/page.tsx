"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Globe, Loader2, MapPin, Mic, MicOff, Sparkles, Store } from "lucide-react";
import { assessmentsApi, geoApi } from "@/lib/api-client";
import { calculateFinance, formatInr } from "@/lib/financial";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const STEPS = ["Location", "Business", "Capital", "Goals"];

const BUSINESS_CATEGORIES = [
  // 🌾 Agri-Allied
  { key: "Dairy Farming", emoji: "🐄", group: "Agri-Allied" },
  { key: "Poultry / Goat Farming", emoji: "🐔", group: "Agri-Allied" },
  { key: "Organic Fertilizer", emoji: "🌱", group: "Agri-Allied" },
  { key: "Seed & Input Retail", emoji: "🌾", group: "Agri-Allied" },
  // 🥘 FoodTech & Processing
  { key: "Grain / Pulse Milling", emoji: "⚙️", group: "FoodTech" },
  { key: "Cold Press Oil Extraction", emoji: "🫒", group: "FoodTech" },
  { key: "Paneer & Curd Processing", emoji: "🧀", group: "FoodTech" },
  { key: "Spice Packaging", emoji: "🌶️", group: "FoodTech" },
  { key: "Cold Storage", emoji: "🧊", group: "FoodTech" },
  { key: "Food Processing", emoji: "🥘", group: "FoodTech" },
  // 🧵 Rural Enterprise
  { key: "Tailoring", emoji: "🧵", group: "Rural" },
  { key: "Micro Retail", emoji: "🛒", group: "Rural" },
  { key: "Repair Services", emoji: "🔧", group: "Rural" },
  { key: "Handicrafts", emoji: "🏺", group: "Rural" },
  { key: "Digital Services", emoji: "💻", group: "Rural" },
  { key: "Other", emoji: "📦", group: "Rural" },
];

const QUICK_START_SCENARIOS = [
  { label: "Hoskote Dairy", village: "Hoskote", block: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", pin_code: "562114", capital: 100000, business: "Dairy Farming" },
  { label: "Rural Tailoring", village: "Nandagudi", block: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", pin_code: "562122", capital: 50000, business: "Tailoring" },
  { label: "Pulse Milling", village: "Sulibele", block: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", pin_code: "562129", capital: 20000, business: "Grain / Pulse Milling" },
];

const ANALYSIS_STAGES = [
  "Resolving geographic coordinates (OpenStreetMap)",
  "Scanning 5km competitor density via Overpass API",
  "Evaluating local rural market indicators",
  "Calculating deterministic financing structure",
  "Evaluating business resilience & risk matrix",
  "Generating financial model & unit economics",
  "Finalizing assessment report",
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [analysing, setAnalysing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoInfo, setGeoInfo] = useState<{ source?: string; coordinates?: string; lat?: number; lon?: number } | null>(null);
  const [form, setForm] = useState({
    village: "",
    block: "",
    district: "",
    state: "",
    pin_code: "",
    capital: "",
    business: "",
    customBusiness: "",
    goals: "",
  });
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const finance = form.capital ? calculateFinance(Number(form.capital)) : null;

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function startVoiceFormFill() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = "hi-IN"; // Supports bilingual Hinglish/Hindi/English
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListeningVoice(true);
      setVoiceTranscript("");
      toast.info("🎙️ Listening... बोलिए: 'गाँव का नाम, बिज़नेस का नाम और पूँजी' (Speak village, business & capital)");
    };

    recognition.onend = () => setIsListeningVoice(false);

    recognition.onerror = () => {
      setIsListeningVoice(false);
      toast.error("Could not capture speech. Please check your microphone permissions.");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join(" ");
      setVoiceTranscript(transcript);

      if (e.results[0].isFinal) {
        parseVoiceInput(transcript);
      }
    };

    recognition.start();
  }

  function parseVoiceInput(text: string) {
    const lower = text.toLowerCase();
    const updates: Partial<typeof form> = {};
    const detected: string[] = [];

    // 1. Capital parsing
    let cap = 0;
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/i);
    const thousandMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k|hazar|hazaar|हजार)/i);
    const directNumMatch = lower.match(/(?:rupees|rs\.?|inr|capital|paisa|paise|amount)?\s*(\d{4,7})/i);

    if (lakhMatch) {
      cap = parseFloat(lakhMatch[1]) * 100000;
    } else if (thousandMatch) {
      cap = parseFloat(thousandMatch[1]) * 1000;
    } else if (directNumMatch) {
      cap = parseInt(directNumMatch[1], 10);
    } else if (lower.includes("ek lakh") || lower.includes("one lakh") || lower.includes("एक लाख")) {
      cap = 100000;
    } else if (lower.includes("do lakh") || lower.includes("two lakh") || lower.includes("दो लाख")) {
      cap = 200000;
    } else if (lower.includes("pachas hazar") || lower.includes("fifty thousand") || lower.includes("पचास हजार")) {
      cap = 50000;
    } else if (lower.includes("bees hazar") || lower.includes("twenty thousand") || lower.includes("बीस हजार")) {
      cap = 20000;
    }

    if (cap > 0) {
      updates.capital = String(cap);
      detected.push(`₹${cap.toLocaleString("en-IN")} Capital`);
    }

    // 2. Business Category parsing
    let biz = "";
    if (lower.includes("dairy") || lower.includes("doodh") || lower.includes("milk") || lower.includes("गाय") || lower.includes("भैंस") || lower.includes("डेयरी")) {
      biz = "Dairy";
    } else if (lower.includes("poultry") || lower.includes("murgi") || lower.includes("chicken") || lower.includes("egg") || lower.includes("मुर्गी") || lower.includes("पोल्ट्री")) {
      biz = "Poultry";
    } else if (lower.includes("tailor") || lower.includes("silai") || lower.includes("kapde") || lower.includes("सिलाई") || lower.includes("टेलर")) {
      biz = "Tailoring";
    } else if (lower.includes("food") || lower.includes("processing") || lower.includes("achar") || lower.includes("papad") || lower.includes("खाद्य")) {
      biz = "Food Processing";
    } else if (lower.includes("retail") || lower.includes("dukan") || lower.includes("kirana") || lower.includes("shop") || lower.includes("दुकान") || lower.includes("किराना")) {
      biz = "Retail";
    } else if (lower.includes("agri") || lower.includes("kheti") || lower.includes("farming") || lower.includes("खेती") || lower.includes("कृषि")) {
      biz = "Agriculture";
    } else if (lower.includes("repair") || lower.includes("garage") || lower.includes("mechanic") || lower.includes("रिपेयर")) {
      biz = "Repair services";
    } else if (lower.includes("digital") || lower.includes("csc") || lower.includes("computer") || lower.includes("cyber") || lower.includes("डिजिटल")) {
      biz = "Digital services";
    } else if (lower.includes("handicraft") || lower.includes("hathkargha") || lower.includes("clay") || lower.includes("हस्तशिल्प")) {
      biz = "Handicrafts";
    }

    if (biz) {
      updates.business = biz;
      detected.push(`${biz} Business`);
    }

    // 3. Location parsing
    const inVillageMatch = lower.match(/(?:in|at|village|gaon|me|mein|near|गाँव|में)\s+([a-zA-Z\u0900-\u097F]+)/i);
    if (inVillageMatch) {
      const rawLoc = inVillageMatch[1];
      const blacklist = ["dairy", "poultry", "retail", "tailoring", "business", "start", "ek", "do", "lakh", "rupaye", "rupees"];
      if (!blacklist.includes(rawLoc.toLowerCase()) && rawLoc.length > 2) {
        const cleanVillage = rawLoc.charAt(0).toUpperCase() + rawLoc.slice(1);
        updates.village = cleanVillage;
        updates.district = updates.district || "Bengaluru Rural";
        updates.state = updates.state || "Karnataka";
        detected.push(`Village: ${cleanVillage}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      setForm((f) => ({ ...f, ...updates }));
      toast.success(`🎯 Voice AI Extracted: ${detected.join(" • ")}`);
      // Automatically advance to business/capital if recognized
      if (updates.village && !updates.business) setStep(2);
      else if (updates.business && !updates.capital) setStep(3);
      else if (updates.village && updates.business && updates.capital) setStep(4);
    } else {
      toast.warning("Could not clearly detect details. Try saying: 'Hoskote Dairy 1 lakh'");
    }
  }


  // Auto geocode when 6-digit PIN is entered
  useEffect(() => {
    if (form.pin_code && /^\d{6}$/.test(form.pin_code)) {
      lookupPin(form.pin_code);
    }
  }, [form.pin_code]);

  async function lookupPin(pin: string) {
    setGeoLoading(true);
    try {
      const res = await geoApi.lookup({ pincode: pin });
      if (res) {
        setForm((f) => ({
          ...f,
          village: f.village || res.village || "",
          district: res.district || f.district,
          state: res.state || f.state,
        }));
        setGeoInfo({
          source: res.source,
          coordinates: res.coordinates || `${res.lat}° N, ${res.lon}° E`,
          lat: res.lat,
          lon: res.lon,
        });
      }
    } catch {
      // Graceful fallback
    } finally {
      setGeoLoading(false);
    }
  }

  function handleUseMyLocation() {
    if ("geolocation" in navigator) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setGeoInfo({
            source: "Live GPS (Device)",
            coordinates: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
            lat,
            lon,
          });
          
          try {
            // 1. Try Backend reverse geocode API
            const res = await geoApi.reverse({ lat, lon });
            if (res && res.district) {
              setForm((f) => ({
                ...f,
                village: res.village || f.village || "Current Location",
                district: res.district || f.district,
                state: res.state || f.state,
                pin_code: res.pincode || f.pin_code || "",
              }));
              toast.success(`📍 Located: ${res.village}, ${res.district} (${res.state})`);
              return;
            }
          } catch {
            // 2. Direct client-side Nominatim reverse geocode fallback (100% Free, No API key)
            try {
              const directRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
                { headers: { "Accept-Language": "en" } }
              );
              if (directRes.ok) {
                const data = await directRes.json();
                const addr = data.address || {};
                const village = addr.village || addr.suburb || addr.town || addr.city_district || addr.city || "Current Area";
                const district = addr.state_district || addr.county || addr.district || addr.city || "District";
                const state = addr.state || "State";
                const pincode = addr.postcode || "";

                setForm((f) => ({
                  ...f,
                  village: village,
                  district: district,
                  state: state,
                  pin_code: pincode || f.pin_code,
                }));
                toast.success(`📍 Located: ${village}, ${district}`);
                return;
              }
            } catch {
              // Graceful fallback
            }
          } finally {
            setGeoLoading(false);
          }

          // Fallback if reverse geocode is empty
          update("village", "Hoskote");
          update("district", "Bengaluru Rural");
          update("state", "Karnataka");
          update("pin_code", "562114");
          toast.info("Using sample location (Hoskote, Bengaluru Rural)");
        },
        (error) => {
          setGeoLoading(false);
          console.warn("Geolocation error:", error.message);
          toast.warning("Location access denied or unavailable. Set to sample location.");
          update("village", "Hoskote");
          update("district", "Bengaluru Rural");
          update("state", "Karnataka");
          update("pin_code", "562114");
          lookupPin("562114");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      update("village", "Hoskote");
      update("district", "Bengaluru Rural");
      update("state", "Karnataka");
      update("pin_code", "562114");
      lookupPin("562114");
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.village.trim()) errs.village = "Village is required.";
      if (!form.district.trim()) errs.district = "District is required.";
      if (!form.state.trim()) errs.state = "State is required.";
      if (form.pin_code && !/^\d{6}$/.test(form.pin_code)) errs.pin_code = "PIN code must be 6 digits.";
    }
    if (step === 2) {
      const biz = form.business || form.customBusiness;
      if (!biz) errs.business = "Select or enter a business category.";
    }
    if (step === 3) {
      const cap = Number(form.capital);
      if (!form.capital || isNaN(cap) || cap <= 0) errs.capital = "Enter a valid capital amount greater than zero.";
      if (cap > 5_000_000) errs.capital = "Capital exceeds the supported assessment range (Rs. 50 lakh).";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    await handleSubmit();
  }

  async function handleSubmit() {
    setAnalysing(true);
    for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
      setAnalysisStage(i);
      await new Promise((r) => setTimeout(r, 400));
    }

    const business = form.business || form.customBusiness;
    try {
      const assessment = await assessmentsApi.create({
        village: form.village,
        block: form.block || undefined,
        district: form.district || undefined,
        state: form.state || undefined,
        pin_code: form.pin_code || undefined,
        latitude: geoInfo?.lat,
        longitude: geoInfo?.lon,
        business_name: business,
        business_category: business,
        goals: form.goals || undefined,
        available_capital: Number(form.capital),
      });
      toast.success("Assessment complete!");
      router.push(`/assessment/${assessment.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create assessment.";
      toast.error(msg);
      setAnalysing(false);
      setAnalysisStage(0);
    }
  }

  function loadQuickStart(idx: number) {
    const s = QUICK_START_SCENARIOS[idx];
    setForm({
      village: s.village,
      block: s.block,
      district: s.district,
      state: s.state,
      pin_code: s.pin_code,
      capital: String(s.capital),
      business: s.business,
      customBusiness: "",
      goals: "Validate demand, confirm supplier pricing and test repayment capacity before borrowing.",
    });
    lookupPin(s.pin_code);
    setStep(4);
  }

  if (analysing) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="max-w-xl mx-auto pt-8">
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>Preparing your assessment</CardTitle>
                <CardDescription>
                  Combining market intelligence, financial model and risk analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ANALYSIS_STAGES.map((stage, i) => (
                  <div
                    key={stage}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${i <= analysisStage ? "border-[#166534]/30 bg-[#f0fdf4]" : "border-[#e5e7eb] bg-white"}`}
                  >
                    {i < analysisStage ? (
                      <CheckCircle2 className="size-5 text-[#16a34a] shrink-0" />
                    ) : i === analysisStage ? (
                      <Loader2 className="size-5 text-[#166534] animate-spin shrink-0" />
                    ) : (
                      <div className="size-5 rounded-full border-2 border-[#d1d5db] shrink-0" />
                    )}
                    <span className={`text-sm ${i <= analysisStage ? "text-[#1f2937] font-medium" : "text-[#9ca3af]"}`}>
                      {stage}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold">New Business Assessment</h1>
            <p className="text-sm text-[#66715f] mt-1">
              Tell us your location, capital and business idea — we&apos;ll do the analysis.
            </p>
          </div>

          {/* Step indicator */}
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`rounded-xl border p-3 text-left transition-colors ${step === i + 1 ? "border-[#166534] bg-[#f0fdf4]" : i + 1 < step ? "border-[#d1d5db] bg-white cursor-pointer" : "border-[#e5e7eb] bg-white opacity-50 cursor-default"}`}
              >
                <p className="text-xs text-[#9ca3af]">0{i + 1}</p>
                <p className={`text-sm font-semibold ${step === i + 1 ? "text-[#166534]" : "text-[#1f2937]"}`}>{s}</p>
              </button>
            ))}
          </div>

          {/* Voice AI Auto-Fill Assistant */}
          <div className="rounded-2xl border-2 border-[#166534]/30 bg-gradient-to-r from-[#f0fdf4] via-white to-[#fffbeb] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`size-11 rounded-2xl grid place-items-center transition-all ${isListeningVoice ? "bg-[#dc2626] text-white animate-pulse" : "bg-[#166534] text-white"}`}>
                {isListeningVoice ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#166534] uppercase tracking-wider">🎙️ Voice AI Auto-Fill</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[10px] font-semibold px-2 py-0.5">
                    <Sparkles className="size-3" /> Hindi / English
                  </span>
                </div>
                <p className="text-xs text-[#4b5563] mt-0.5">
                  {isListeningVoice ? (
                    <span className="font-medium text-[#dc2626] animate-pulse">
                      {voiceTranscript || "Listening... Bolna shuru kijiye (e.g. 'Hoskote Dairy 1 lakh')"}
                    </span>
                  ) : (
                    "बोलकर पूरा फॉर्म भरें — 'गाँव, बिज़नेस और पूँजी' बोलें और फॉर्म भर जाएगा।"
                  )}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={startVoiceFormFill}
              className={`shrink-0 text-xs font-bold transition-all ${
                isListeningVoice
                  ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white animate-bounce"
                  : "bg-[#166534] hover:bg-[#14532d] text-white"
              }`}
            >
              {isListeningVoice ? "🛑 Stop Listening" : "🎙️ Speak to Auto-Fill"}
            </Button>
          </div>

          {/* Quick Start */}
          <div className="grid gap-2 sm:grid-cols-3">
            {QUICK_START_SCENARIOS.map((d, i) => (
              <button
                key={d.label}
                onClick={() => loadQuickStart(i)}
                className="rounded-xl border border-[#d8d1bd] bg-white p-3 text-left hover:border-[#d97706] hover:shadow-sm transition-all"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#d97706]">Quick Start</p>
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="text-xs text-[#66715f]">{formatInr(d.capital)} capital</p>
              </button>
            ))}
          </div>

          {/* Validation errors */}
          {Object.values(errors).filter(Boolean).length > 0 && (
            <Card className="border-[#fca5a5] bg-[#fef2f2]">
              <CardContent className="pt-4 pb-4">
                {Object.values(errors).filter(Boolean).map((e) => (
                  <p key={e} className="text-sm text-[#dc2626]">• {e}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Where do you want to start?</CardTitle>
                    <CardDescription>Enter your village and location details.</CardDescription>
                  </div>
                  {geoInfo && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] border border-[#166534]/30 px-3 py-1 text-xs font-medium text-[#166534]">
                      <Globe className="size-3.5 animate-pulse text-[#16a34a]" />
                      {geoInfo.source || "OpenStreetMap (Live)"}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Village / Town *</label>
                  <Input value={form.village} onChange={(e) => update("village", e.target.value)} placeholder="Village name" aria-invalid={!!errors.village} />
                  {errors.village && <p className="text-xs text-[#dc2626]">{errors.village}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Block / Taluk</label>
                  <Input value={form.block} onChange={(e) => update("block", e.target.value)} placeholder="Block or Taluk" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">District *</label>
                  <Input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="District" aria-invalid={!!errors.district} />
                  {errors.district && <p className="text-xs text-[#dc2626]">{errors.district}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">State *</label>
                  <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="State" aria-invalid={!!errors.state} />
                  {errors.state && <p className="text-xs text-[#dc2626]">{errors.state}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">PIN Code</label>
                    {geoLoading && <span className="text-[10px] text-[#166534] flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Detecting…</span>}
                  </div>
                  <Input value={form.pin_code} onChange={(e) => update("pin_code", e.target.value)} placeholder="6-digit PIN (e.g. 562114)" maxLength={6} aria-invalid={!!errors.pin_code} />
                  {errors.pin_code && <p className="text-xs text-[#dc2626]">{errors.pin_code}</p>}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#d8d1bd] hover:bg-[#f0fdf4] hover:text-[#166534]"
                    onClick={handleUseMyLocation}
                    disabled={geoLoading}
                  >
                    {geoLoading ? (
                      <><Loader2 className="size-4 mr-2 animate-spin text-[#166534]" /> Detecting GPS…</>
                    ) : (
                      <><MapPin className="size-4 mr-2 text-[#166534]" /> Use My Location</>
                    )}
                  </Button>
                </div>
                {geoInfo?.coordinates && (
                  <div className="sm:col-span-2 rounded-xl bg-[#f8f7f2] border border-[#e2dccb] px-3.5 py-2.5 flex items-center justify-between text-xs text-[#66715f]">
                    <span>📍 GPS Coordinates: <strong className="text-[#1f2937] font-semibold">{geoInfo.coordinates}</strong></span>
                    <span className="text-[#166534] font-medium">✓ Ready for 5km competitor scan</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2 — Business */}
          {step === 2 && (
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>What business are you planning?</CardTitle>
                <CardDescription>Select a category or enter a custom business idea.</CardDescription>
              </CardHeader>
              <CardContent>
                {(["Agri-Allied", "FoodTech", "Rural"] as const).map((group) => (
                  <div key={group} className="mb-5">
                    <p className="text-xs font-semibold text-[#d97706] uppercase tracking-wider mb-2">
                      {group === "Agri-Allied" ? "🌾 Agri-Allied" : group === "FoodTech" ? "🥘 FoodTech & Processing" : "🧵 Rural Enterprise"}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {BUSINESS_CATEGORIES.filter((c) => c.group === group).map(({ key, emoji }) => (
                        <button
                          key={key}
                          onClick={() => update("business", key)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:shadow-sm ${form.business === key ? "border-[#166534] bg-[#f0fdf4] shadow-sm" : "border-[#e5e7eb] bg-white"}`}
                        >
                          <span className="text-xl">{emoji}</span>
                          <p className={`text-sm font-medium ${form.business === key ? "text-[#166534]" : "text-[#1f2937]"}`}>
                            {key}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-4 space-y-1">
                  <label className="text-sm font-medium">Or enter a custom business idea</label>
                  <Input
                    value={form.customBusiness}
                    onChange={(e) => {
                      update("customBusiness", e.target.value);
                      if (e.target.value) update("business", "");
                    }}
                    placeholder="e.g., Mushroom cultivation, Solar panel servicing…"
                  />
                </div>
                {errors.business && <p className="mt-2 text-xs text-[#dc2626]">{errors.business}</p>}
              </CardContent>
            </Card>
          )}

          {/* Step 3 — Capital */}
          {step === 3 && (
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>How much can you contribute?</CardTitle>
                <CardDescription>
                  Based on the 10% beneficiary contribution structure. This is not guaranteed loan approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your available capital (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] font-medium">₹</span>
                    <Input
                      type="number"
                      value={form.capital}
                      onChange={(e) => update("capital", e.target.value)}
                      placeholder="100000"
                      className="pl-7"
                      aria-invalid={!!errors.capital}
                    />
                  </div>
                  {errors.capital && <p className="text-xs text-[#dc2626]">{errors.capital}</p>}
                  <p className="text-xs text-[#66715f]">
                    Enter the amount you can personally contribute — this determines the project scale.
                  </p>
                </div>
                {finance && finance.scheme && (
                  <div className="rounded-2xl bg-[#0f2d1c] p-5 text-white space-y-3">
                    <div>
                      <p className="text-xs text-white/50">Your contribution</p>
                      <p className="text-2xl font-bold">{formatInr(finance.margin)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Estimated project capacity</p>
                      <p className="text-xl font-bold">{formatInr(finance.projectCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Potential financing (indicative)</p>
                      <p className="text-xl font-bold">{formatInr(finance.cappedLoanAmount)}</p>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Indicative — final sanction depends on eligibility and agency approval.
                    </p>
                  </div>
                )}
                {finance && !finance.scheme && (
                  <div className="rounded-2xl bg-[#fef2f2] border border-[#fca5a5] p-4 text-sm text-[#991b1b]">
                    {finance.unsupportedReason}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4 — Goals */}
          {step === 4 && (
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>Optional business details</CardTitle>
                <CardDescription>
                  Help us refine your assessment. You can skip this and click Analyze.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Goals, experience or notes (optional)</label>
                  <Textarea
                    value={form.goals}
                    onChange={(e) => update("goals", e.target.value)}
                    placeholder="e.g., I have 3 years of dairy experience, 1 acre of land, targeting 50 households for milk delivery..."
                    rows={4}
                  />
                </div>
                {/* Summary */}
                <div className="rounded-xl bg-[#f8f7f2] border border-[#e2dccb] p-4 space-y-2 text-sm">
                  <p className="font-semibold text-[#1f2937]">Assessment summary</p>
                  <p className="text-[#66715f]">Location: <span className="text-[#1f2937]">{form.village}, {form.district}, {form.state}</span></p>
                  <p className="text-[#66715f]">Business: <span className="text-[#1f2937]">{form.business || form.customBusiness}</span></p>
                  <p className="text-[#66715f]">Capital: <span className="text-[#1f2937] font-semibold">{form.capital ? formatInr(Number(form.capital)) : "—"}</span></p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>← Back</Button>
            ) : (
              <div />
            )}
            <Button
              size="lg"
              className="bg-[#166534] hover:bg-[#14532d]"
              onClick={handleNext}
            >
              {step < 4 ? (
                <>Continue <ChevronRight className="size-4 ml-1" /></>
              ) : (
                "Analyze My Business"
              )}
            </Button>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
