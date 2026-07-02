/**
 * Blueprint validator — enforces the Section Primitive Registry (ADR-021).
 *
 * A blueprint is only renderable if every section identifier and component type
 * resolves to a registered primitive with a legal variant, every required
 * content slot is populated, and no section uses an aspect its primitive does
 * not support. The validator is the contract between the generator and the
 * future Renderer: what passes here can be composed 1:1 from hand-crafted
 * primitives.
 */

import type { PrimitiveRegistry, SectionPrimitive } from "./registry";
import type { ComponentBlueprint } from "./components";
import type { SectionBlueprint } from "./section";
import type { WebsiteBlueprint } from "./website-blueprint";

export interface BlueprintValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<string>;
}

function variantOf(element: {
  extensions?: Record<string, unknown>;
}): string | undefined {
  const variant = element.extensions?.variant;
  return typeof variant === "string" ? variant : undefined;
}

function validateComponent(
  component: ComponentBlueprint,
  registry: PrimitiveRegistry,
  where: string,
  errors: string[],
): void {
  const primitive = registry[component.type];
  if (!primitive) {
    errors.push(
      `${where}: component type "${component.type}" is not a registered primitive`,
    );
    return;
  }
  const variant = variantOf(component);
  if (variant !== undefined && !primitive.variants.includes(variant)) {
    errors.push(
      `${where}: variant "${variant}" is not legal for primitive "${primitive.id}" (legal: ${primitive.variants.join(", ")})`,
    );
  }
}

function validateSlots(
  section: SectionBlueprint,
  primitive: SectionPrimitive,
  where: string,
  errors: string[],
): void {
  const requirements = section.contentRequirements ?? [];
  for (const slot of primitive.contentSlots) {
    const entry = requirements.find((requirement) =>
      requirement.startsWith(`${slot}:`),
    );
    if (!entry || entry.slice(slot.length + 1).trim().length === 0) {
      errors.push(
        `${where}: required content slot "${slot}" of primitive "${primitive.id}" is not populated`,
      );
    }
  }
}

function validateAspects(
  section: SectionBlueprint,
  primitive: SectionPrimitive,
  where: string,
  errors: string[],
): void {
  if (!primitive.aspects.animation && section.animation) {
    errors.push(
      `${where}: primitive "${primitive.id}" does not support the animation aspect`,
    );
  }
  if (!primitive.aspects.interaction && (section.interaction?.length ?? 0) > 0) {
    errors.push(
      `${where}: primitive "${primitive.id}" does not support the interaction aspect`,
    );
  }
  if (!primitive.aspects.media && (section.media?.length ?? 0) > 0) {
    errors.push(
      `${where}: primitive "${primitive.id}" does not support the media aspect`,
    );
  }
}

function validateSection(
  section: SectionBlueprint,
  registry: PrimitiveRegistry,
  where: string,
  errors: string[],
): void {
  const primitive = registry[section.identifier];
  if (!primitive) {
    errors.push(
      `${where}: identifier "${section.identifier}" is not a registered primitive`,
    );
    return;
  }

  const variant = variantOf(section);
  if (variant === undefined) {
    errors.push(
      `${where}: no variant selected for primitive "${primitive.id}" (extensions.variant)`,
    );
  } else if (!primitive.variants.includes(variant)) {
    errors.push(
      `${where}: variant "${variant}" is not legal for primitive "${primitive.id}" (legal: ${primitive.variants.join(", ")})`,
    );
  }

  validateSlots(section, primitive, where, errors);
  validateAspects(section, primitive, where, errors);

  for (const component of section.suggestedComponents ?? []) {
    validateComponent(component, registry, `${where} → component "${component.id}"`, errors);
  }
}

/**
 * Validate a blueprint against a primitive registry. Returns every violation —
 * it does not stop at the first — so a failing blueprint is fully diagnosable.
 */
export function validateBlueprint(
  blueprint: WebsiteBlueprint,
  registry: PrimitiveRegistry,
): BlueprintValidationResult {
  const errors: string[] = [];

  for (const page of blueprint.pages.pages) {
    const seenIds = new Set<string>();
    for (const section of page.sections) {
      const where = `page "${page.name}" → section "${section.id}"`;
      if (seenIds.has(section.id)) {
        errors.push(`${where}: duplicate section id "${section.id}"`);
      }
      seenIds.add(section.id);
      validateSection(section, registry, where, errors);
    }
  }

  return { valid: errors.length === 0, errors };
}
