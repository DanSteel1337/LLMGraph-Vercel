import { LoginVerification } from "@/components/auth/login-verification"

export const metadata = {
  title: "Login Verification - UE Documentation RAG",
  description: "Verify the login process for the UE Documentation RAG system",
}

export default function VerifyLoginPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Login Process Verification</h1>
      <div className="max-w-md mx-auto">
        <LoginVerification />
      </div>
    </div>
  )
}
