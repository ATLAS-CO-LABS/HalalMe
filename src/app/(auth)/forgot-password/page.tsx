import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-lg border bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email to receive a reset link
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
