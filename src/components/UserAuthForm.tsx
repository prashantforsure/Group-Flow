'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
        </div>
       
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => signIn('google')}
              variant="outline"
              className="w-full"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}