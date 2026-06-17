export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8" >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⛔</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Your account is suspended</h1>
        <p className="text-muted-foreground">Your account is currently suspended. Please contact support for more information.</p>
      </div>
    </div>
  )
}
