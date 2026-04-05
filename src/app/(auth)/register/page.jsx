'use client';

// Registration page for Zuri CRM
// Allows new culinary school admins to create a workspace account

import { useState } from 'react';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // TODO: multi-step wizard (account → school info → plan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">

      {/* TODO: Zuri logo / branding header */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-10 w-32 bg-orange-200 rounded mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900">Create your Zuri account</h1>
          <p className="text-sm text-gray-500 mt-1">Get your culinary school up and running in minutes</p>
        </div>

        {/* TODO: Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-orange-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* TODO: Step 1 — Account credentials */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <div className="h-10 bg-gray-100 rounded-lg w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
              <div className="h-10 bg-gray-100 rounded-lg w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="h-10 bg-gray-100 rounded-lg w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <div className="h-10 bg-gray-100 rounded-lg w-full" />
            </div>
          </div>

          {/* TODO: Step 2 — School info (name, country, number of students) */}
          {/* TODO: Step 3 — Plan selection (Starter / Pro / Enterprise) */}

          {/* TODO: Terms of service checkbox */}
          <div className="flex items-start gap-2 mt-6">
            <div className="h-4 w-4 mt-0.5 bg-gray-200 rounded flex-shrink-0" />
            <p className="text-xs text-gray-500">
              I agree to Zuri&apos;s Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Submit button */}
          <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors">
            Create account
          </button>

          {/* TODO: OAuth providers (Google SSO) */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>
          <div className="h-10 bg-gray-100 rounded-lg w-full" />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
