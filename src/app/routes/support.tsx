import { createFileRoute, Link } from '@tanstack/react-router'
import { HelpCircle, FileText, ShieldCheck, MessageSquare, ChevronRight } from 'lucide-react'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { PublicHeader } from '@/features/catalog'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

function SupportPage() {
  return (
    <div className="min-h-svh bg-zinc-950 text-zinc-100">
      <PublicHeader />

      <main className="container mx-auto px-6 pt-32 pb-20 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              How can we <span className="text-orange-500">help?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-zinc-500">
              Find answers to common questions, read our legal documents, or get in touch with our
              support team.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Help Center */}
            <section className="group rounded-3xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-orange-500/30 hover:bg-zinc-900/50">
              <div className="mb-6 rounded-2xl bg-orange-500/10 p-4 text-orange-500">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">Help Center</h3>
              <p className="mb-6 text-zinc-500">
                Browse through our frequently asked questions about streaming, account management,
                and more.
              </p>
              <Link
                to="/support"
                className="flex items-center font-bold text-orange-500 transition-all group-hover:gap-2"
              >
                Go to FAQs <ChevronRight className="h-4 w-4" />
              </Link>
            </section>

            {/* Contact Support */}
            <section className="group rounded-3xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-orange-500/30 hover:bg-zinc-900/50">
              <div className="mb-6 rounded-2xl bg-blue-500/10 p-4 text-blue-500">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">Contact Us</h3>
              <p className="mb-6 text-zinc-500">
                Can't find what you're looking for? Reach out to our dedicated support team
                directly.
              </p>
              <Link
                to="/support"
                className="flex items-center font-bold text-blue-500 transition-all group-hover:gap-2"
              >
                Send a Message <ChevronRight className="h-4 w-4" />
              </Link>
            </section>
          </div>

          <div className="space-y-8">
            <h3 className="text-center text-xl font-bold text-white">Legal Documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                to="/support"
                className="flex items-center justify-between rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <div className="text-zinc-500">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-zinc-300">Terms of Use</span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-700" />
              </Link>
              <Link
                to="/support"
                className="flex items-center justify-between rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <div className="text-zinc-500">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-zinc-300">Privacy Policy</span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-700" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
