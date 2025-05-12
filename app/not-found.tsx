import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-medium">Page Not Found</h2>
        <p className="text-gray-500">The page you are looking for doesn't exist or has been moved.</p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
