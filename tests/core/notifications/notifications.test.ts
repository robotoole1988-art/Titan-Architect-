import { describe, expect, it, vi } from "vitest";
import type { Business, Enquiry } from "@/core/business";
import {
  buildEnquiryNotification,
  createConsoleChannel,
  createResendChannel,
  sendSafely,
} from "@/core/notifications";

/** The notification seam (ADR-030). */

const business = {
  id: "biz-1",
  name: "Kerbside Kings",
  ownerEmail: "owner@kerbside.example",
  contact: { email: "fallback@kerbside.example" },
} as Business;

const enquiry = {
  id: "enq-1",
  businessId: "biz-1",
  name: "Sandra Hughes",
  contact: "07700 900123",
  message: "Resin quote please",
  sourcePage: "/sale",
  createdAt: "2026-07-09T10:00:00.000Z",
  status: "new",
} as Enquiry;

describe("buildEnquiryNotification", () => {
  it("addresses the owner and the founder with full context + deep link", () => {
    const message = buildEnquiryNotification(business, enquiry, {
      founderEmail: "robert@titan.example",
      appOrigin: "https://app.titan.example",
    });
    expect(message.to).toEqual([
      "owner@kerbside.example",
      "robert@titan.example",
    ]);
    expect(message.subject).toContain("Sandra Hughes");
    expect(message.subject).toContain("Kerbside Kings");
    const body = message.lines.join("\n");
    expect(body).toContain("07700 900123");
    expect(body).toContain("Resin quote please");
    expect(body).toContain("/sale");
    expect(message.actionUrl).toBe(
      "https://app.titan.example/crm/accounts?enquiry=enq-1",
    );
  });

  it("falls back to the contact email when ownerEmail is unset, deduplicating", () => {
    const bare = { ...business, ownerEmail: undefined } as Business;
    const message = buildEnquiryNotification(bare, enquiry, {
      founderEmail: "fallback@kerbside.example", // same as contact → dedupe
      appOrigin: "http://localhost:4100",
    });
    expect(message.to).toEqual(["fallback@kerbside.example"]);
  });
});

describe("channels", () => {
  it("Resend adapter posts the message with the injected transport", async () => {
    const transport = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "email-1" }),
    });
    const channel = createResendChannel({
      apiKey: "re_test",
      from: "TITAN <leads@titan.example>",
      transport,
    });
    const result = await channel.send({
      to: ["owner@kerbside.example"],
      subject: "New enquiry",
      lines: ["line one"],
      actionUrl: "https://app/enq",
    });
    expect(result.delivered).toBe(true);
    expect(transport).toHaveBeenCalledOnce();
    const [url, init] = transport.mock.calls[0];
    expect(url).toContain("api.resend.com");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const payload = JSON.parse(init.body);
    expect(payload.to).toEqual(["owner@kerbside.example"]);
    expect(payload.from).toBe("TITAN <leads@titan.example>");
  });

  it("reports failure without throwing when the provider errors", async () => {
    const transport = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: "invalid from" }),
    });
    const channel = createResendChannel({
      apiKey: "re_test",
      from: "bad",
      transport,
    });
    const result = await channel.send({ to: ["a@b.c"], subject: "s", lines: [] });
    expect(result.delivered).toBe(false);
    expect(result.detail).toContain("422");
  });

  it("console channel delivers by logging (the dev fallback)", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    const channel = createConsoleChannel();
    const result = await channel.send({
      to: ["owner@kerbside.example"],
      subject: "New enquiry — Sandra",
      lines: ["contact: 07700"],
      actionUrl: "http://localhost:4100/crm/accounts?enquiry=enq-1",
    });
    expect(result.delivered).toBe(true);
    expect(log.mock.calls.flat().join("\n")).toContain("Sandra");
    log.mockRestore();
  });

  it("sendSafely NEVER throws — failures are logged", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken = { send: () => Promise.reject(new Error("smtp down")) };
    await expect(
      sendSafely(broken, { to: ["a@b.c"], subject: "s", lines: [] }),
    ).resolves.toMatchObject({ delivered: false });
    expect(error.mock.calls.flat().join(" ")).toContain("smtp down");
    error.mockRestore();
  });
});
