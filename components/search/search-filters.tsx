import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function SearchFilters() {
  // In a real implementation, these would be dynamic and connected to state
  const categories = [
    { id: "getting-started", label: "Getting Started" },
    { id: "blueprints", label: "Blueprints" },
    { id: "materials", label: "Materials" },
    { id: "animation", label: "Animation" },
    { id: "physics", label: "Physics" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox id={category.id} />
                  <Label htmlFor={category.id} className="text-sm">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Date</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="last-week" />
                <Label htmlFor="last-week" className="text-sm">
                  Last Week
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="last-month" />
                <Label htmlFor="last-month" className="text-sm">
                  Last Month
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="last-year" />
                <Label htmlFor="last-year" className="text-sm">
                  Last Year
                </Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
