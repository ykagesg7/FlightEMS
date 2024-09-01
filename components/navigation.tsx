import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Flight LMS
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/lms" className="hover:underline">
              LMS Dashboard
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}