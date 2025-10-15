import './globals.css'

export const metadata = {
  title: 'Secret Message App',
  description: 'Send secret messages with expiration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[var(--bg)] text-[var(--fg)]">
      <body className="font-ui antialiased">
        {children}
      </body>
    </html>
  )
}