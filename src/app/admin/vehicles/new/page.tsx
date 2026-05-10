import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NewVehiclePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Nuevo vehículo</h1>
      <VehicleForm mode="create" />
    </div>
  );
}
