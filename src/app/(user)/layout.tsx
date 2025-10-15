import UserHeader from '@/components/user/UserHeader'
import UserFooter from '@/components/user/UserFooter'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />
      <main className="flex-1">
        {children}
      </main>
      <UserFooter />
    </div>
  )
}
