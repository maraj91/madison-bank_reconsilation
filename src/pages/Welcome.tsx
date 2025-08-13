import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Welcome = () => {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = "Welcome • Magic Ledger"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">You are now signed in via magic link.</p>
        <Button onClick={() => navigate("/dashboard")}>Continue</Button>
      </div>
    </div>
  )
}

export default Welcome
