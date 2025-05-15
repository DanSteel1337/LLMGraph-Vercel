"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    console.error(`Error in ${this.props.componentName || "component"}:`, error, errorInfo)

    // Could add error reporting service here
    // reportError(error, errorInfo, this.props.componentName)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="mx-auto max-w-md border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Something went wrong</CardTitle>
            </div>
            <CardDescription className="text-red-600">
              {this.props.componentName
                ? `An error occurred in the ${this.props.componentName} component.`
                : "An error occurred in this component."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-red-100 p-4 text-sm text-red-800">
              <p className="font-medium">Error: {this.state.error?.message || "Unknown error"}</p>
              {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Stack trace</summary>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              className="border-red-200 bg-white text-red-700 hover:bg-red-50"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="border-red-200 bg-white text-red-700 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}

export default EnhancedErrorBoundary
