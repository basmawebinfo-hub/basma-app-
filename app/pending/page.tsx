import { Clock } from "lucide-react"
export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Account pending approval</h1>
        <p className="text-muted-foreground">Your account is under review. You'll get access once an admin approves it. This usually takes a short time.</p>
        <form action="/api/auth/signout" method="post"></form>
      </div>
    </div>
  )
}
