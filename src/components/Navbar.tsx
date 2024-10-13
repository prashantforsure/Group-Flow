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
    <div className='fixed top-0 inset-x-0 h-20 border-b border-white/10 bg-black/30 backdrop-blur-xl z-[10]'>
      <div className='container max-w-7xl h-full mx-auto flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 group'>
          <div className='relative'>
            <div className='absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt'></div>
            <Sparkles className='h-8 w-8 text-white relative' />
          </div>
          <p className='hidden text-xl font-extrabold md:block bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 group-hover:bg-gradient-to-l transition-all duration-300'>
            Group Flow.
          </p>
        </Link>

        <div className='flex items-center gap-4'>
          {session?.user ? (
            <>
              <Link href='/dashboard'>
                <Button 
                  variant="ghost" 
                  className='rounded-full px-6 py-2 text-white bg-white/10 hover:bg-white/20 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:-translate-y-0.5'
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