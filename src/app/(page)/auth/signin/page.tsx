'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen  flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-300 to-blue-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Icons.logo className="mx-auto h-12 w-12 text-[#A259FF]" />
              </motion.div>
              <h2 className="mt-6 text-3xl font-extrabold text-black">
                Sign in to GroupFlow
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Collaborate and manage tasks efficiently
              </p>
            </div>

            <div className="mt-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={() => signIn('google')}
                  variant="outline"
                  className="w-full py-3 px-4 flex items-center justify-center space-x-2  border-transparent text-sm font-medium rounded-lg border border-slate-300   hover:bg-[#9db4e6] "
                >
                  <Icons.google className="h-5 w-5" />
                  <span>Sign in with Google</span>
                </Button>
              </motion.div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white"></div>
                  </div>
                
                </div>

                
              </div>
            </div>
          </div>
          <div className="px-6 py-2 bg-[#252525] sm:px-10">
            <p className="text-xs leading-5 text-white">
              By signing in, you agree to our{' '}
              <Link href="#" className="font-medium text-[#A259FF] hover:text-[#B78AFF] transition-colors duration-200">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="font-medium text-[#A259FF] hover:text-[#B78AFF] transition-colors duration-200">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-transparent">
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/signin'
            className='font-medium text-transparent'
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}