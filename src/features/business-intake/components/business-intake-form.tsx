"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessIntake } from "../hooks/use-business-intake";
import {
  BUSINESS_GOALS,
  MARKETING_BUDGETS,
  URGENCY_LEVELS,
  type BusinessGoal,
  type BusinessIntakeDraft,
  type MarketingBudget,
  type UrgencyLevel,
} from "../model/types";

const BUDGET_ITEMS = MARKETING_BUDGETS.map((value) => ({ value, label: value }));
const GOAL_ITEMS = BUSINESS_GOALS.map((value) => ({ value, label: value }));
const URGENCY_ITEMS = URGENCY_LEVELS.map((value) => ({ value, label: value }));

const EMPTY_DRAFT: BusinessIntakeDraft = {
  businessName: "",
  trade: "",
  location: "",
  services: "",
  targetCustomer: "",
  monthlyMarketingBudget: "£500 – £1,000 / month",
  currentWebsiteUrl: "",
  mainGoal: "More leads",
  urgencyLevel: "Medium",
};

export function BusinessIntakeForm() {
  const { create } = useBusinessIntake();
  const [draft, setDraft] = useState<BusinessIntakeDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function setField<K extends keyof BusinessIntakeDraft>(
    key: K,
    value: BusinessIntakeDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setJustSaved(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    if (!draft.trade.trim()) {
      setError("Trade is required.");
      return;
    }
    if (!draft.location.trim()) {
      setError("Location is required.");
      return;
    }
    setError(null);
    create({
      ...draft,
      businessName: draft.businessName.trim(),
      trade: draft.trade.trim(),
      location: draft.location.trim(),
      currentWebsiteUrl: draft.currentWebsiteUrl.trim(),
    });
    setDraft(EMPTY_DRAFT);
    setJustSaved(true);
  }

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="intake-name">Business name</Label>
            <Input
              id="intake-name"
              value={draft.businessName}
              onChange={(event) => setField("businessName", event.target.value)}
              placeholder="e.g. Rapid Response Plumbing"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="intake-trade">Trade</Label>
              <Input
                id="intake-trade"
                value={draft.trade}
                onChange={(event) => setField("trade", event.target.value)}
                placeholder="e.g. Plumbing"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="intake-location">Location</Label>
              <Input
                id="intake-location"
                value={draft.location}
                onChange={(event) => setField("location", event.target.value)}
                placeholder="e.g. Manchester"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="intake-services">Services</Label>
            <Textarea
              id="intake-services"
              value={draft.services}
              onChange={(event) => setField("services", event.target.value)}
              rows={3}
              placeholder="The main services this business offers…"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="intake-customer">Target customer</Label>
            <Textarea
              id="intake-customer"
              value={draft.targetCustomer}
              onChange={(event) =>
                setField("targetCustomer", event.target.value)
              }
              rows={2}
              placeholder="Who is the ideal customer?"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Monthly marketing budget</Label>
              <Select
                value={draft.monthlyMarketingBudget}
                items={BUDGET_ITEMS}
                onValueChange={(value) =>
                  setField("monthlyMarketingBudget", value as MarketingBudget)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETING_BUDGETS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Main goal</Label>
              <Select
                value={draft.mainGoal}
                items={GOAL_ITEMS}
                onValueChange={(value) =>
                  setField("mainGoal", value as BusinessGoal)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_GOALS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="intake-url">Current website URL</Label>
              <Input
                id="intake-url"
                value={draft.currentWebsiteUrl}
                onChange={(event) =>
                  setField("currentWebsiteUrl", event.target.value)
                }
                placeholder="https://… (optional)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Urgency level</Label>
              <Select
                value={draft.urgencyLevel}
                items={URGENCY_ITEMS}
                onValueChange={(value) =>
                  setField("urgencyLevel", value as UrgencyLevel)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {justSaved && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-400">
              <Check className="size-4" />
              Intake saved — see it in the list.
            </p>
          )}

          <div className="flex items-center justify-end">
            <Button type="submit">Save intake</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
