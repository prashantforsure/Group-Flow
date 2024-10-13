import { getServerSession } from 'next-auth'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { authOptions } from '@/lib/auth/config'
import { UserAccountNav } from './UserAccountNav'
import { Sparkles } from 'lucide-react'

const Navbar = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div className='sticky top-0 z-50 bg-white/80 backdrop-blur-md'>
      <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
      <Link className="flex items-center space-x-2" href="/">
            <svg
              className="h-8 w-8 text-[#1ABCFE]"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="font-bold text-xl">GroupFlow</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link className="text-sm hover:text-[#A259FF] transition-colors" href="#">
              Features
            </Link>
            <Link className="text-sm hover:text-[#A259FF] transition-colors" href="#">
              Enterprise
            </Link>
            <Link className="text-sm hover:text-[#A259FF] transition-colors" href="#">
              Pricing
            </Link>
            <Link className="text-sm hover:text-[#A259FF] transition-colors" href="#">
              Community
            </Link>
          </nav>
        <div className='flex items-center gap-4'>
          {session?.user ? (
            <>
              <Link href='/dashboard'>
                <Button 
                  variant="ghost" 
                  className='rounded-full px-6 py-2 text-sm hover:text-[#A259FF] transition-colors text-black border border-slate-900'
                >
                  Dashboard
                </Button>
              </Link>
              <UserAccountNav user={{
                ...session.user,
                image: session.user.image ?? "",
                name: session.user.name ?? "",   
                email: session.user.email ?? ""  
              }} />
            </>
          ) : (
            <Link href='/auth/signin'>
              <Button 
                variant="ghost" 
                className='rounded-full px-6 py-2 text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:-translate-y-0.5'
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar