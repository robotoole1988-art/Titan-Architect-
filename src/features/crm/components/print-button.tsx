"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The printable/shareable summary is the viewer itself (print stylesheet). */
export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()} className="gap-2">
      <Printer className="size-4" />
      Print summary
    </Button>
  );
}
