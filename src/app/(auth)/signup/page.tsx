import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="rounded-lg border bg-white p-6 sm:p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Join HalalMe and start your journey
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
