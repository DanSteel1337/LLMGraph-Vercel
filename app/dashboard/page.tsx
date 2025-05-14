import { ServiceTester } from "@/components/dashboard/service-tester"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Service Diagnostics</h1>
      <ServiceTester />
    </div>
  )
}
