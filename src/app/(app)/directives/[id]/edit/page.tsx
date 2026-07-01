import { DirectiveFormPage } from "@/features/directives";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DirectiveFormPage mode="edit" id={id} />;
}
