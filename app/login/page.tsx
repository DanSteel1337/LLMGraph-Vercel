import { LoginForm } from "@/components/auth/login-form"
import { AuthDebug } from "@/components/auth/auth-debug"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <div className="mt-8 bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
        <AuthDebug />
      </div>
    </div>
  )
}
