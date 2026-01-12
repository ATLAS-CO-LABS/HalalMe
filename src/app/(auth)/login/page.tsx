import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-white p-6 sm:p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your HalalMe account
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
