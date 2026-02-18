import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <div className="w-full text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Confirm Your Email
        </h2>
        <p className="text-muted-foreground">
          We&apos;ve sent a verification link to your email address.
        </p>
      </div>

      <div className="bg-secondary/10 border border-secondary/20 rounded-md p-4 mb-6 text-left">
        <p className="text-sm text-foreground">
          Check your inbox and click the confirmation link to activate your account.
          Once confirmed, you can sign in and start reporting city issues.
        </p>
      </div>

      <Button
        asChild
        className="w-full bg-primary text-primary-foreground font-semibold py-2"
      >
        <Link href="/auth/login">Back to Sign In</Link>
      </Button>
    </div>
  )
}
