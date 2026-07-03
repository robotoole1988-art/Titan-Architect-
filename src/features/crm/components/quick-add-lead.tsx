"use client";

/**
 * Level-1 quick-add (ADR-026): the minimum to get a lead on the board, with
 * the trade chosen from the canonical taxonomy — no free typing unless the
 * founder explicitly picks "Other…" (flagged unclassified).
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTHER_TRADE_VALUE, TradeSelect } from "@/components/common/trade-fields";
import { getTradeDefinition } from "@/core/trade-taxonomy";
import { quickAddLead } from "../api/actions";

export function QuickAddLead() {
  const [tradeChoice, setTradeChoice] = useState("roofing");
  const [otherTrade, setOtherTrade] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      action={async (formData: FormData) => {
        setSaving(true);
        try {
          formData.set(
            "trade",
            tradeChoice === OTHER_TRADE_VALUE
              ? otherTrade.trim()
              : (getTradeDefinition(tradeChoice)?.label ?? tradeChoice),
          );
          formData.set(
            "tradeId",
            tradeChoice === OTHER_TRADE_VALUE ? "" : tradeChoice,
          );
          await quickAddLead(formData);
          setOtherTrade("");
        } finally {
          setSaving(false);
        }
      }}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card/40 p-4"
    >
      <div className="flex min-w-40 flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-name">Business name</Label>
        <Input id="quick-name" name="name" required placeholder="e.g. Kerbside Kings" />
      </div>
      <div className="flex min-w-44 flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-trade">Trade</Label>
        <TradeSelect
          id="quick-trade"
          value={tradeChoice}
          otherText={otherTrade}
          onChange={setTradeChoice}
          onOtherTextChange={setOtherTrade}
        />
      </div>
      <div className="flex min-w-32 flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-location">Location</Label>
        <Input id="quick-location" name="location" required placeholder="e.g. York" />
      </div>
      <div className="flex min-w-36 flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-phone">Phone (optional)</Label>
        <Input id="quick-phone" name="phone" type="tel" placeholder="07…" />
      </div>
      <div className="flex min-w-40 flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-email">Email (optional)</Label>
        <Input id="quick-email" name="email" type="email" placeholder="name@…" />
      </div>
      <Button type="submit" disabled={saving} className="gap-1.5">
        <Plus className="size-4" />
        {saving ? "Adding…" : "Add lead"}
      </Button>
    </form>
  );
}
