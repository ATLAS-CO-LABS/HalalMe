"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, this would update the user profile
    console.log("Saving profile:", { name, email });
    setIsEditing(false);
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account information
            </p>
          </div>

          {/* Profile Form */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || "");
                        setEmail(user?.email || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Password
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Update your password to keep your account secure
            </p>
            <Button variant="outline">Change Password</Button>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-900">
              Danger Zone
            </h2>
            <p className="mb-4 text-sm text-red-700">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
