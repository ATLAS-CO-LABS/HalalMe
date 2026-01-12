"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            className="mb-8 sm:mb-12 text-center px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              How do you want to use HalalMe?
            </h1>
            <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-gray-600">
              Choose your role to get started
            </p>
          </motion.div>

          {/* Two Main Options */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Option 1: HalalMe Delivery */}
            <motion.div
              className="rounded-2xl border-2 border-purple-200 bg-white p-6 sm:p-8 shadow-lg"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)" }}
            >
              <div className="mb-6">
                <div className="mb-4 inline-flex rounded-full bg-purple-100 p-3">
                  <svg
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
                  HalalMe Delivery
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Order halal food or join as a vendor/driver
                </p>
              </div>

              <div className="mb-6 space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Fast halal food delivery
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Separate platform for delivery services
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Join as vendor or driver
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="https://www.halalme.co.uk/en/home"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">
                    Order Food →
                  </Button>
                </a>
                <a
                  href="https://halalme.aidaform.com/merchant-registration"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 text-sm sm:text-base"
                  >
                    Vendor Signup →
                  </Button>
                </a>
                <a
                  href="https://halalme.aidaform.com/driver-registration"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 text-sm sm:text-base"
                  >
                    Driver Signup →
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Option 2: HalalMe Ecosystem */}
            <motion.div
              className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(245, 158, 11, 0.2)" }}
            >
              <div className="mb-6">
                <div className="mb-4 inline-flex rounded-full bg-amber-100 p-3">
                  <svg
                    className="h-8 w-8 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
                  HalalMe Ecosystem
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Access all HalalMe services with one account
                </p>
              </div>

              <div className="mb-6 space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Hub - Community & food sharing
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Kitchen - Recipes & meal planning
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Travel - Halal-friendly destinations
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    Fresh, Rewards & more coming soon
                  </span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/signup?role=ecosystem")}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-sm sm:text-base"
              >
                Join HalalMe Ecosystem
              </Button>
            </motion.div>
          </div>

          {/* Back to Home */}
          <motion.div
            className="mt-6 sm:mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                ← Back to Home
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
