//components/layout/login-header.tsx

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Plane } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// This is a mock function. Replace it with your actual authentication logic.
const useAuth = () => {
  return {
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "/placeholder.svg?height=32&width=32"
    }
  }
}

export default function LoginHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm fixed w-full z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <Plane className="mr-2 text-blue-600" />
          <span className="font-sans tracking-wider">Flight Training LMS</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/" className="text-gray-600 hover:text-blue-600">ホーム</Link></li>
            <li><Link href="/lms" className="text-gray-600 hover:text-blue-600">LMS</Link></li>
            <li><Link href="/planner" className="text-gray-600 hover:text-blue-600">飛行計画</Link></li>
          </ul>
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" forceMount>
            <DropdownMenuItem>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link href="/profile">プロフィール</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link href="/settings">設定</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <button onClick={handleLogout}>
                ログアウト
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}