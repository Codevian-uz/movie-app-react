import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '@/features/auth'

export const Route = createFileRoute('/register')({
  component: UserRegisterPage,
})

function UserRegisterPage() {
  return <AuthPage initialMode="register" />
}
