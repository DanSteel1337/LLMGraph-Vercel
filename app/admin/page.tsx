import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Vector RAG Admin</h1>
      <AdminDashboard />
    </div>
  )
}
