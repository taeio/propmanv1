"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cog, Moon, Sun, Save, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { withRoleProtection } from "@/hoc/withRoleProtection";

interface StripeConnectStatus {
  connected: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

function SettingsPage() {
  const { profile, isAuthenticated, updateProfile, saveProfile, setTheme } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await saveProfile();
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = profile.themePreference === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const fetchStripeStatus = async () => {
    if (!isAuthenticated || profile.role !== 'property_manager') return;
    
    try {
      const response = await fetch('/api/stripe/connect/status');
      if (response.ok) {
        const data = await response.json();
        setStripeStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    }
  };

  const handleConnectStripe = async () => {
    setIsLoadingStripe(true);
    setStripeError("");
    
    try {
      const response = await fetch('/api/stripe/connect/create-account-link', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create account link');
      }
      
      const data = await response.json();
      window.location.href = data.url;
    } catch (error: any) {
      setStripeError(error.message || 'Failed to connect Stripe');
      setIsLoadingStripe(false);
    }
  };

  useEffect(() => {
    fetchStripeStatus();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe_connected') === 'true') {
      setSaveMessage('Stripe account connected successfully!');
      setTimeout(() => {
        window.history.replaceState({}, '', '/settings');
        setSaveMessage('');
        fetchStripeStatus();
      }, 3000);
    }
  }, [isAuthenticated, profile.role]);

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-gray-100"
      >
        <Cog className="w-7 h-7" />
        Settings
      </motion.h1>

      {/* Not authenticated message */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
          <p className="text-blue-800 dark:text-blue-200 mb-2">
            Please log in to access your settings
          </p>
          <button
            onClick={() => window.location.href = "/auth"}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </div>
      )}

      {/* Profile settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Profile Information</h2>
        
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            value={profile.firstName}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            placeholder="First Name"
            disabled={!isAuthenticated}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            value={profile.lastName}
            onChange={(e) => updateProfile({ lastName: e.target.value })}
            placeholder="Last Name"
            disabled={!isAuthenticated}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            value={profile.email}
            onChange={(e) => updateProfile({ email: e.target.value })}
            placeholder="Email"
            disabled={!isAuthenticated}
          />
        </div>
      </div>

      {/* Theme settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme Preference
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current: {profile.themePreference === "light" ? "Light Mode" : "Dark Mode"}
            </p>
          </div>
          <button
            onClick={handleThemeToggle}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {profile.themePreference === "light" ? (
              <>
                <Moon size={18} />
                Switch to Dark
              </>
            ) : (
              <>
                <Sun size={18} />
                Switch to Light
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stripe Connect (Property Managers Only) */}
      {isAuthenticated && profile.role === 'property_manager' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
            <CreditCard size={24} />
            Payment Processing
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your Stripe account to receive rent payments from tenants and make payments to contractors.
          </p>

          {stripeStatus?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 size={20} />
                <span className="font-medium">Stripe Account Connected</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Details Submitted:</span>
                  <span className={stripeStatus.detailsSubmitted ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                    {stripeStatus.detailsSubmitted ? "Yes" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Charges Enabled:</span>
                  <span className={stripeStatus.chargesEnabled ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                    {stripeStatus.chargesEnabled ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Payouts Enabled:</span>
                  <span className={stripeStatus.payoutsEnabled ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                    {stripeStatus.payoutsEnabled ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {!stripeStatus.detailsSubmitted && (
                <button
                  onClick={handleConnectStripe}
                  disabled={isLoadingStripe}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Complete Stripe Setup
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <AlertCircle size={20} />
                <span className="font-medium">No Payment Account Connected</span>
              </div>
              
              <button
                onClick={handleConnectStripe}
                disabled={isLoadingStripe}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <CreditCard size={18} />
                {isLoadingStripe ? "Connecting..." : "Connect Stripe Account"}
              </button>
            </div>
          )}

          {stripeError && (
            <p className="text-sm text-red-600 dark:text-red-400">{stripeError}</p>
          )}
        </div>
      )}

      {/* Save button */}
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !profile.isDirty}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          
          {saveMessage && (
            <p className={`text-sm ${saveMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {saveMessage}
            </p>
          )}
          
          {!profile.isDirty && !saveMessage && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No changes to save
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default withRoleProtection(SettingsPage, "both");
