"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus, TrendingUp, Clock, Users, MessagesSquare, Search, X, Menu, Home } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { mockPosts, mockUsers } from "@/data/hubMockData";
import PostCard from "@/components/hub/PostCard";
import CreatePostModal from "@/components/hub/CreatePostModal";
import EditPostModal from "@/components/hub/EditPostModal";
import UserProfileModal from "@/components/hub/UserProfileModal";
import { PostCardSkeletonList } from "@/components/hub/PostCardSkeleton";
import EmptyState from "@/components/hub/EmptyState";

type TabType = "latest" | "trending" | "following";

export default function HubPage() {
  const [activeTab, setActiveTab] = useState<TabType>("latest");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState(mockPosts);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleNewPost = (content: string, image?: string) => {
    const newPost = {
      id: `post-${Date.now()}`,
      user: {
        id: "current-user",
        name: "You",
        username: "@you",
        avatar: "/images/services/kitchen.jpg",
      },
      content,
      image,
      type: "post" as const,
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      timestamp: "Just now",
    };
    setPosts([newPost, ...posts]);
    setIsCreatePostOpen(false);
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setIsEditPostOpen(true);
  };

  const handleSaveEdit = (content: string, image?: string) => {
    if (editingPostId) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPostId ? { ...post, content, image } : post
        )
      );
      setEditingPostId(null);
    }
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserProfileOpen(true);
  };

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);
  const userPosts = posts.filter((p) => p.user.id === selectedUserId);
  const editingPost = posts.find((p) => p.id === editingPostId);

  const tabs = [
    { id: "latest" as TabType, label: "Latest", icon: Clock },
    { id: "trending" as TabType, label: "Trending", icon: TrendingUp },
    { id: "following" as TabType, label: "Following", icon: Users },
  ];

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(searchLower) ||
      post.user.name.toLowerCase().includes(searchLower) ||
      post.user.username.toLowerCase().includes(searchLower) ||
      (post.recipeTitle && post.recipeTitle.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 sticky top-16 z-40">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Desktop Back Button */}
              <Link href="/hub" className="hidden md:block">
                <motion.button
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              <h1
                className="text-lg md:text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                HalalMe Hub
              </h1>
            </div>
            <motion.button
              onClick={() => setIsCreatePostOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white px-3 md:px-4 py-2 rounded-full font-semibold shadow-lg text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Post</span>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-700 mt-3"
              >
                <div className="py-3 space-y-2">
                  <Link href="/hub" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors">
                      <Home className="w-5 h-5" />
                      <span className="font-semibold">Hub Home</span>
                    </div>
                  </Link>
                  <Link href="/kitchen" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-semibold">Back to Kitchen</span>
                    </div>
                  </Link>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors">
                      <Home className="w-5 h-5" />
                      <span className="font-semibold">Main Site</span>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs - Separate Row */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pb-3 pt-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-semibold transition-all whitespace-nowrap text-xs md:text-sm ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-auto max-w-4xl px-4 md:px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, users, recipes..."
              className="w-full bg-gray-800 text-white rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A1E] border border-gray-700 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            />
            {searchQuery && (
              <motion.button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">
        {isLoading ? (
          <PostCardSkeletonList count={3} />
        ) : filteredPosts.length === 0 && searchQuery ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No posts found matching "${searchQuery}". Try a different search term.`}
            action={{
              label: "Clear Search",
              onClick: () => setSearchQuery(""),
            }}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No posts yet"
            description="Be the first to share something with the community!"
            action={{
              label: "Create Post",
              onClick: () => setIsCreatePostOpen(true),
            }}
          />
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onUserClick={handleUserClick}
                  isOwnPost={post.user.id === "current-user"}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && filteredPosts.length > 0 && !searchQuery && (
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="bg-gray-800 text-gray-300 hover:text-white px-8 py-3 rounded-full font-semibold border border-gray-700 hover:border-[#FF8A1E] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More Posts
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleNewPost}
      />

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          isOpen={isEditPostOpen}
          onClose={() => {
            setIsEditPostOpen(false);
            setEditingPostId(null);
          }}
          onSubmit={handleSaveEdit}
          initialContent={editingPost.content}
          initialImage={editingPost.image}
        />
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => {
            setIsUserProfileOpen(false);
            setSelectedUserId(null);
          }}
          user={selectedUser}
          userPosts={userPosts}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
