
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

import { Icons } from "@/components/ui/icons"
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Page() {
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      
      if (response.ok) {
        // Registration successful, redirect to sign in page
        router.push('/auth/signin')
      } else {
        // Handle registration error
        const error = await response.text()
        console.error('Registration failed:', error)
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Registration error:', error)
      // You might want to show an error message to the user here
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative p-8">
          <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-900">Sign In</h2>
          
        </div>
        <div className="bg-gray-50 px-8 py-6">
          
          <div className="">
            <Button
              onClick={() => signIn('google')}
              variant="outline"
              className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <Icons.google className="mr-2 h-5 w-5" />
              Sign up with Google
            </Button>
          </div>
          <p className='px-8 text-center text-sm text-muted-foreground pt-2'>
    Don't have an account?{' '}
    <Link
      href='/auth/register'
      className='hover:text-brand text-sm underline underline-offset-4'>
      Register
    </Link>
  </p>
        </div>
      </motion.div>
    </div>
  )

}