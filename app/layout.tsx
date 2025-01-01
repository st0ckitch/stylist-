import './globals.css'
import { Montserrat } from 'next/font/google'
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300'], // 300 is the light weight
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${montserrat.className} antialiased`}>
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                  <Link href="/" className="flex items-center gap-2 group">
                    <Sparkles 
                      size={20} 
                      className="text-blue-500 group-hover:text-blue-600 transition-colors" 
                    />
                    <span className="text-lg tracking-widest text-gray-800 font-light">
                      STYLIST<span className="text-blue-500">.GE</span>
                    </span>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <SignedIn>
                    <UserButton afterSignOutUrl="/"/>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-light text-white hover:bg-blue-600 transition-colors">
                        Sign in
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
