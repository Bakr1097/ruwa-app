import { getProductsForDropdown, getWorkshopUsers } from "@/lib/actions/production";
import { NewProductionJobForm } from "./NewProductionJobForm";

export const dynamic = "force-dynamic";

export default async function NewProductionJobPage({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const [productList, workshopUsers] = await Promise.all([
    getProductsForDropdown(),
    getWorkshopUsers(),
  ]);

  return (
    <NewProductionJobForm
      products={productList}
      workshopUsers={workshopUsers}
      preselectedProductId={searchParams.product ?? ""}
    />
  );
}
