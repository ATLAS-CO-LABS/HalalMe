"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Welcome Section */}
          <div className="mb-8 rounded-xl border bg-white p-6 sm:p-8 shadow-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Here's your HalalMe Ecosystem overview
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-gray-600">Orders</h3>
              <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
              <p className="mt-1 text-xs text-gray-500">No orders yet</p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-gray-600">Rewards</h3>
              <p className="mt-2 text-3xl font-bold text-amber-600">0 pts</p>
              <p className="mt-1 text-xs text-gray-500">Start earning today</p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-medium text-gray-600">Saved Items</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">0</p>
              <p className="mt-1 text-xs text-gray-500">Save your favorites</p>
            </div>
          </div>

          {/* HalalMe Services - Coming Soon */}
          <div className="mb-8 rounded-xl border bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 shadow-sm">
            <h2 className="mb-6 text-xl sm:text-2xl font-bold text-gray-900">
              HalalMe Ecosystem Services
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Kitchen - Coming Soon */}
              <div className="relative rounded-xl border-2 border-pink-200 bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                    Coming Soon
                  </span>
                </div>
                <div className="mb-4 inline-flex rounded-full bg-pink-100 p-3">
                  <svg
                    className="h-8 w-8 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">HalalMe Kitchen</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Discover recipes, meal planning, and cooking tips
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="mr-2 h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Recipe database
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="mr-2 h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Meal planning tools
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="mr-2 h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cooking guides
                  </div>
                </div>
                <Button disabled className="w-full mt-4 opacity-60 cursor-not-allowed">
                  In Development
                </Button>
              </div>

              {/* Hub - Coming Soon */}
              <div className="relative rounded-xl border-2 border-amber-200 bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Coming Soon
                  </span>
                </div>
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">HalalMe Hub</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Community sharing, events, and food connections
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="mr-2 h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Food sharing
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="mr-2 h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Community events
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="mr-2 h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Social connections
                  </div>
                </div>
                <Button disabled className="w-full mt-4 opacity-60 cursor-not-allowed">
                  In Development
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 rounded-xl border bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Available Now
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="https://www.halalme.co.uk/en/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  🚀 Order Delivery
                </Button>
              </a>
              <Link href="/#fresh">
                <Button variant="outline" className="w-full">
                  🌿 Shop Fresh
                </Button>
              </Link>
              <Link href="/#travel">
                <Button variant="outline" className="w-full">
                  ✈️ Explore Travel
                </Button>
              </Link>
              <Link href="/#rewards">
                <Button variant="outline" className="w-full">
                  🎁 View Rewards
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full">
                  ⚙️ Edit Profile
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" className="w-full">
                  ❓ Get Help
                </Button>
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-xl border bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Today"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
