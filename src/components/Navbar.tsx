import { getServerSession } from 'next-auth'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { authOptions } from '@/lib/auth/config'
import { UserAccountNav } from './UserAccountNav'
import { PlusCircle, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const Navbar = async () => {
  const session = await getServerSession(authOptions)

  return (
    <div className='sticky top-0 z-50  backdrop-blur-lg'>
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
        
        <div className='flex items-center gap-4'>
          {session?.user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link href='/dashboard'>
                  <Button 
                    variant="ghost" 
                    className='rounded-full px-6 py-2 text-sm hover:text-[#A259FF] transition-colors text-black border border-slate-900'
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href='/groups'>
                  <Button 
                    variant="ghost" 
                    className='rounded-full px-6 py-2 text-sm hover:text-[#1ABCFE] transition-colors text-black border border-slate-900 flex items-center gap-2'
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Group
                  </Button>
                </Link>
              </div>
              <div className="md:hidden hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <nav className="flex flex-col gap-4">
                      <Link href='/dashboard'>
                        <Button 
                          variant="ghost" 
                          className='w-full justify-start rounded-full px-6 py-2 text-sm hover:text-[#A259FF] transition-colors text-black border border-slate-900'
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Link href='/groups'>
                        <Button 
                          variant="ghost" 
                          className='w-full justify-start rounded-full px-6 py-2 text-sm hover:text-[#1ABCFE] transition-colors text-black border border-slate-900 flex items-center gap-2'
                        >
                          <PlusCircle className="h-4 w-4" />
                          Create Group
                        </Button>
                      </Link>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
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