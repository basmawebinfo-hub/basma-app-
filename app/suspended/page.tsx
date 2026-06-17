export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8" dir="rtl">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⛔</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">تم إيقاف حسابك</h1>
        <p className="text-muted-foreground">حسابك موقوف حالياً. يرجى التواصل مع الدعم لمزيد من المعلومات.</p>
      </div>
    </div>
  )
}
