import { SearchInterface } from "@/components/search/search-interface"

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Search the Unreal Engine documentation RAG system</p>
      </div>

      <SearchInterface />
    </div>
  )
}
