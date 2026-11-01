import AuthForm from '@/components/AuthForm'

export default function Page() {
  return (
    <main className="page page-center page-login">
      <AuthForm mode="login" />
    </main>
  )
}