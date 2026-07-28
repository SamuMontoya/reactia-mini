import { redirect } from "next/navigation";

// The product lives at /reactia-mini. The root exists only to forward there,
// so no scaffolding page (and no framework branding) is ever served.
export default function Home() {
  redirect("/reactia-mini");
}
