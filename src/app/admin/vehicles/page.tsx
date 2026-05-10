import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";
import { VehicleListTable } from "@/components/admin/VehicleListTable";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  const list = await db.query.vehicles.findMany({
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.updatedAt)],
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Vehículos</h1>
        <Link
          href="/admin/vehicles/new"
          className="rounded-[var(--radius-sm)] px-4 py-2 text-sm text-white"
          style={{ background: "var(--brand)" }}
        >
          + Nuevo vehículo
        </Link>
      </div>
      <VehicleListTable vehicles={list} />
    </div>
  );
}
