import { getActiveFabrics } from "@/lib/actions/products";
import { NewProductForm } from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const activeFabrics = await getActiveFabrics();
  return <NewProductForm fabrics={activeFabrics} />;
}
