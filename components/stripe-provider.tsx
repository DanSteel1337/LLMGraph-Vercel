"use client"

import { type ReactNode, useState, useEffect } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe outside of component to avoid recreating it
let stripePromise: ReturnType<typeof loadStripe> | null = null

const getStripePromise = () => {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey)
  }

  return stripePromise
}

export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState(() => getStripePromise())

  // Only set stripe once on mount
  useEffect(() => {
    if (!stripe) {
      setStripe(getStripePromise())
    }
  }, [stripe])

  if (!stripe) {
    return <div>Loading payment system...</div>
  }

  return <Elements stripe={stripe}>{children}</Elements>
}
