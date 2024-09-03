'use client'

import React from 'react'
import { Plane } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function PlannerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="bg-white text-gray-900 p-4 shadow-sm fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <Plane className="mr-2 text-blue-600" />
            <span className="font-sans tracking-wider">Flight Training LMS</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-600 transition-colors text-sm font-medium">ホーム</Link>
            <Link href="/lms" className="hover:text-blue-600 transition-colors text-sm font-medium">LMS</Link>
          </nav>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out">
            ログアウト
          </Button>
        </div>
      </header>

      <main className="flex-grow pt-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">飛行計画</h1>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <p className="text-lg mb-4">
              ここに飛行計画機能を実装します。現在開発中です。
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>天候情報の取得と表示</li>
              <li>飛行ルートの設定</li>
              <li>燃料計算</li>
              <li>チェックリストの作成</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 text-gray-600 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Flight Training LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}