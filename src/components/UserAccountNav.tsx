'use client'

import { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from './ui/dropdown-menu'
import Link from 'next/link'

import { Settings, LogOut, Rss, PlusCircle } from 'lucide-react'
import { UserAvatar } from './UserAvatar'

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, 'name' | 'image' | 'email'>
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <UserAvatar
          user={{ name: user.name || null, image: user.image || null }}
          className="h-8 w-8 ring-2 ring-white hover:ring-gray-300 transition-all duration-200"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white rounded-xl shadow-lg py-1" align="end">
        <Link href='/profile'>
        <div className="flex items-center gap-3 p-3 border-b border-gray-100">
          <UserAvatar
            user={{ name: user.name || null, image: user.image || null }}
            className="h-8 w-8"
          />
          <div className="flex flex-col">
            {user.name && <p className="font-semibold text-sm">{user.name}</p>}
            {user.email && (
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>
        </Link>
       
        
        <DropdownMenuItem asChild className="py-2 px-4 hover:bg-gray-50">
          <Link href="/" className="flex items-center gap-3">
            <Rss className="h-4 w-4 text-gray-500" />
            <span>Feed</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="py-2 px-4 hover:bg-gray-50 hover:pointer">
          <Link href="/r/create" className="flex items-center gap-3">
            <PlusCircle className="h-4 w-4 text-gray-500" />
            <span>
              Create Community
              </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="py-2 px-4 hover:bg-gray-50">
          <Link href="/settings" className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-gray-500" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-2 px-4 hover:bg-gray-50">
          <Link href="/guideline" className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-gray-500" />
            <span>Terms and Condition</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 border-gray-100" />
        
        <DropdownMenuItem
          className="py-2 px-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-red-500"
          onSelect={(event) => {
            event.preventDefault()
            signOut({
              callbackUrl: `${window.location.origin}/auth/signin`,
            })
          }}>
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}