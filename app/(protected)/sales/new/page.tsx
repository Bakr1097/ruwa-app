import { getProductsWithVariants } from "@/lib/actions/sales";
import { NewSaleForm } from "./NewSaleForm";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const { products, variants } = await getProductsWithVariants();
  return <NewSaleForm products={products} variants={variants} />;
}
