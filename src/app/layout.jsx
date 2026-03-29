import '@/styles/globals.css'

export const metadata = {
  title: 'Zuri — Vertical SaaS for Culinary Business',
  description: 'CRM, Marketing, Operations, and AI in one place',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
