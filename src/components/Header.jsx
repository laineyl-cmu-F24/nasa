import { Rocket } from "lucide-react"

export default function Header() {
  return (
    <header className="mb-10 flex items-center space-x-3">
      <Rocket className="text-yellow-400 w-8 h-8" />
      <h1 className="text-3xl font-bold">NASA Bioscience Dashboard</h1>
    </header>
  )
}
