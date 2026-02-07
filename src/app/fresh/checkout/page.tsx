'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  MapPin,
  Phone,
  User,
  Mail,
  Lock,
  ArrowLeft,
  Check,
  Leaf,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'address' | 'payment' | 'confirm'>('address');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('confirm');
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    clearCart();
    router.push('/fresh/order-success');
  };

  // Redirect if cart is empty
  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900 pt-24 px-4">
        <div className="mx-auto max-w-2xl text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">
              Add some meals to your cart before checking out.
            </p>
            <motion.button
              onClick={() => router.push('/fresh')}
              className="bg-lime-500 hover:bg-lime-400 text-gray-900 px-8 py-4 rounded-full font-bold inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Browse Meals
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-950 to-gray-900">
      {/* Header */}
      <section className="pt-24 pb-8 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/fresh/cart"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-lime-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to cart
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Checkout</h1>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[
              { key: 'address', label: 'Address', icon: MapPin },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'confirm', label: 'Confirm', icon: Check },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isPast =
                (currentStep === 'payment' && step.key === 'address') ||
                (currentStep === 'confirm' && (step.key === 'address' || step.key === 'payment'));
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-lime-500 text-gray-900'
                        : isPast
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="font-semibold hidden sm:inline">{step.label}</span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-8 md:w-16 h-1 rounded-full ${
                        isPast ? 'bg-green-500/40' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Address Step */}
              {currentStep === 'address' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="w-6 h-6 text-lime-400" />
                      <h2 className="text-xl font-bold text-white">Delivery Address</h2>
                    </div>

                    <form onSubmit={handleSubmitAddress} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                            placeholder="+44 7123 456789"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Delivery Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                            placeholder="123 Main Street, Apt 4B"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                            placeholder="London"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Postcode</label>
                          <input
                            type="text"
                            name="postcode"
                            value={formData.postcode}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                            placeholder="SW1A 1AA"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        className="w-full bg-lime-500 hover:bg-lime-400 text-gray-900 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue to Payment
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="w-6 h-6 text-lime-400" />
                      <h2 className="text-xl font-bold text-white">Payment Details</h2>
                    </div>

                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            required
                            maxLength={19}
                            className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Name on Card</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                          placeholder="JOHN DOE"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                            maxLength={5}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">CVV</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              required
                              maxLength={4}
                              className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-500 transition-colors"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-700/50 rounded-xl p-3 flex items-center gap-3 mt-4">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-400 text-sm">
                          Your payment info is secure and encrypted
                        </p>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('address')}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
                        >
                          Back
                        </button>
                        <motion.button
                          type="submit"
                          className="flex-1 bg-lime-500 hover:bg-lime-400 text-gray-900 px-6 py-4 rounded-xl font-bold transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Review Order
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Confirm Step */}
              {currentStep === 'confirm' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Check className="w-6 h-6 text-lime-400" />
                      <h2 className="text-xl font-bold text-white">Review & Confirm</h2>
                    </div>

                    {/* Delivery Info */}
                    <div className="mb-6">
                      <h3 className="text-gray-400 text-sm font-semibold mb-2">DELIVERY TO</h3>
                      <div className="bg-gray-700/50 rounded-xl p-4">
                        <p className="text-white font-semibold">{formData.fullName}</p>
                        <p className="text-gray-400">{formData.address}</p>
                        <p className="text-gray-400">{formData.city}, {formData.postcode}</p>
                        <p className="text-gray-400 mt-2">{formData.phone}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mb-6">
                      <h3 className="text-gray-400 text-sm font-semibold mb-2">PAYMENT METHOD</h3>
                      <div className="bg-gray-700/50 rounded-xl p-4 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                        <span className="text-white">
                          •••• •••• •••• {formData.cardNumber.slice(-4) || '****'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="text-gray-400 text-sm font-semibold mb-2">ORDER ITEMS</h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.meal.id}
                            className="bg-gray-700/50 rounded-xl p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white">{item.quantity}x</span>
                              <span className="text-gray-300">{item.meal.name}</span>
                            </div>
                            <span className="text-lime-400 font-semibold">
                              £{(item.meal.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('payment')}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
                        disabled={isProcessing}
                      >
                        Back
                      </button>
                      <motion.button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className="flex-1 bg-lime-500 hover:bg-lime-400 text-gray-900 px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
                        whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          `Pay £${totalPrice.toFixed(2)}`
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-800 rounded-2xl border border-gray-700 p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.meal.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {item.quantity}x {item.meal.name}
                      </span>
                      <span className="text-white">
                        £{(item.meal.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>£{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery</span>
                    <span className="text-lime-400">Free</span>
                  </div>
                  <div className="flex justify-between text-white text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-lime-400">£{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Halal Badge */}
                <div className="bg-lime-500/10 border border-lime-500/30 rounded-xl p-3 mt-4 flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-lime-400 flex-shrink-0" />
                  <p className="text-lime-300 text-xs">
                    100% Halal Certified
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
