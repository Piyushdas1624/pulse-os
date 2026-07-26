"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FloorPlanSvg from "@/components/FloorPlanSvg";
import OperationalKPIs from "@/components/OperationalKPIs";
import KitchenCPUScheduler from "@/components/KitchenCPUScheduler";
import InventoryImpactCards from "@/components/InventoryImpactCards";
import LiveEventTimeline from "@/components/LiveEventTimeline";
import { Button } from "@/components/ui/primitives";

export default function OperationsPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <div className="eyebrow mb-2">Digital twin</div>
            <h1 className="text-[2.125rem]">Floor</h1>
          </div>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => router.push("/ai-ops#audit")}
          >
            Request executive audit
          </Button>
        </div>

        <OperationalKPIs />

        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_320px]">
          <FloorPlanSvg />
          <LiveEventTimeline limit={6} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <KitchenCPUScheduler />
          <InventoryImpactCards />
        </div>
      </main>
    </>
  );
}
