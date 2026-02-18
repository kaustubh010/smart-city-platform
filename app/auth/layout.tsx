export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">CityReport</h1>
            <p className="text-muted-foreground">Smart City Issue Reporting Platform</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
