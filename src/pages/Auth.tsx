import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Auth = () => {
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Login • Magic Ledger"
  }, [])

  const handleSendMagicLink = () => {
    toast({ title: "Magic link sent (demo)", description: `Check your inbox: ${email}` })
    navigate("/welcome")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign in to Magic Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block text-sm mb-2" htmlFor="email">Email</label>
          <div className="flex gap-2">
            <Input id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={handleSendMagicLink} disabled={!email}>
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Passwordless login via email. To enable real emails, connect Supabase SMTP later.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth
