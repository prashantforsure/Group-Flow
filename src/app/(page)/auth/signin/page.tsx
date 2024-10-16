'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen  flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#535353] rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Icons.logo className="mx-auto h-12 w-12 text-[#A259FF]" />
              </motion.div>
              <h2 className="mt-6 text-3xl font-extrabold text-white">
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
                  className="w-full py-3 px-4 flex items-center justify-center space-x-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4285F4] hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] focus:ring-offset-gray-800 transition-all duration-200"
                >
                  <Icons.google className="h-5 w-5" />
                  <span>Sign in with Google</span>
                </Button>
              </motion.div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                
                </div>

                
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-[#252525] sm:px-10">
            <p className="text-xs leading-5 text-gray-400">
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
        <p className="mt-8 text-center text-sm text-white">
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/register'
            className='font-medium text-white'
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}