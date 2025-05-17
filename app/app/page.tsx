// This is a simple redirect page to handle the Pages Router redirect
import { redirect } from "next/navigation"

export default function AppPage() {
  redirect("/")
}
