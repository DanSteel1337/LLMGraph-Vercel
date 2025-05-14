import { SettingsForm } from "@/components/admin/settings-form"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <SettingsForm />
    </div>
  )
}
