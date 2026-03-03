import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '@/features/auth'

export const Route = createFileRoute('/login')({
  component: UserLoginPage,
})

function UserLoginPage() {
  return <AuthPage initialMode="login" />
}
