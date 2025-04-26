import { SimpleComponent } from "@/components/simple-component"
import { TestComponent } from "@/components/test-component"

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Minimal Next.js Project</h1>
      <p className="mb-4">This is a minimal project to isolate syntax issues.</p>
      <SimpleComponent title="Test Component" />
      <TestComponent />
    </main>
  )
}
