'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link className="flex items-center space-x-2" href="#">
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
            <span className="font-bold text-xl">TaskFlow</span>
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
          <div className="flex items-center space-x-4">
            <Link className="text-sm hover:text-[#A259FF] transition-colors" href="#">
              Log in
            </Link>
            <Button className="bg-[#A259FF] hover:bg-[#1ABCFE] text-white transition-colors">
              Get TaskFlow free
            </Button>
          </div>
        </div>
      </header> */}
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Collaborate without boundaries
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            TaskFlow brings your teams together, boosting productivity and creativity in one intuitive platform.
          </p>
          <Button className="animate-fade-in-up animation-delay-400 bg-[#A259FF] hover:bg-[#1ABCFE] text-white text-lg py-6 px-8 rounded-full transition-colors">
            Get started — it's free
          </Button>
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF] to-[#1ABCFE] rounded-lg transform -rotate-1"></div>
            <img
              src="/placeholder.svg?height=400&width=800"
              alt="TaskFlow Dashboard"
              className="relative rounded-lg shadow-xl mx-auto transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        </section>
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Trusted by industry leaders</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, index) => (
                <div key={index} className="text-2xl font-bold">{company}</div>
              ))}
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Seamless task management</h2>
              <p className="text-xl text-gray-600 mb-8">
                Create, assign, and track tasks with ease. Our intuitive interface makes project management a breeze for teams of all sizes.
              </p>
              <Button variant="outline" className="text-[#A259FF] border-[#A259FF] hover:bg-[#A259FF] hover:text-white transition-colors">
                Learn more
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#1ABCFE] rounded-full opacity-10 transform translate-x-4 translate-y-4"></div>
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Task Management Feature"
                className="relative rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-r from-[#A259FF] to-[#1ABCFE] text-white py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to transform your workflow?</h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              Join thousands of teams already using TaskFlow to collaborate seamlessly and boost productivity.
            </p>
            <Button className="bg-white text-[#A259FF] hover:bg-gray-100 text-lg py-6 px-8 rounded-full transition-colors">
              Start your free trial
            </Button>
          </div>
        </section>
      </main>
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Features</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Enterprise</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Security</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Community</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Developers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Legal</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-[#A259FF] transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Stay Connected</h3>
              <form className="space-y-2">
                <Input type="email" placeholder="Enter your email" className="w-full" />
                <Button className="w-full bg-[#A259FF] hover:bg-[#1ABCFE] text-white transition-colors">
                  Subscribe to newsletter
                </Button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2024 TaskFlow, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}