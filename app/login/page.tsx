'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BarChart2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setMessage('Check your email for a confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sapphire-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-sapphire-light/10" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart2 size={20} className="text-white" />
            </div>
            <span className="font-playfair text-xl font-bold text-white tracking-wide">SEO Autopilot</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="font-playfair text-4xl font-bold text-white leading-tight mb-6">
            Automate your<br />
            <span className="text-sapphire-light italic">SEO intelligence.</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🔍', text: 'Track rankings for unlimited keywords' },
              { icon: '👀', text: 'Monitor competitors automatically' },
              { icon: '📈', text: 'Receive weekly AI-powered reports' },
              { icon: '💡', text: 'Discover content opportunities instantly' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sapphire-lightest/80 font-lato text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sapphire-light/60 text-xs font-lato">
            Powered by Groq AI · Serper · Supabase
          </p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-sapphire-lightest">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-sapphire-gradient flex items-center justify-center">
              <BarChart2 size={20} className="text-white" />
            </div>
            <span className="font-playfair text-xl font-bold text-sapphire-dark">SEO Autopilot</span>
          </div>

          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-bold text-sapphire-dark">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-sapphire-light font-lato mt-2 text-sm">
              {isSignUp ? 'Start monitoring your SEO performance' : 'Sign in to your dashboard'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-white rounded-xl p-1 mb-8 shadow-sapphire-sm border border-sapphire-light/20">
            <button
              onClick={() => { setIsSignUp(false); setError(''); setMessage(''); setName('') }}
              className={`flex-1 py-2.5 text-sm font-lato font-medium rounded-lg transition-all duration-200 ${
                !isSignUp ? 'bg-sapphire-mid text-white shadow-sm' : 'text-sapphire-light hover:text-sapphire-dark'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); setMessage('') }}
              className={`flex-1 py-2.5 text-sm font-lato font-medium rounded-lg transition-all duration-200 ${
                isSignUp ? 'bg-sapphire-mid text-white shadow-sm' : 'text-sapphire-light hover:text-sapphire-dark'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">

            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-lato font-medium text-sapphire-dark mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="w-full px-4 py-3 bg-white border border-sapphire-light/30 rounded-xl text-sm font-lato text-sapphire-dark placeholder-sapphire-light/60 focus:outline-none focus:ring-2 focus:ring-sapphire-mid/30 focus:border-sapphire-mid transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-lato font-medium text-sapphire-dark mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-white border border-sapphire-light/30 rounded-xl text-sm font-lato text-sapphire-dark placeholder-sapphire-light/60 focus:outline-none focus:ring-2 focus:ring-sapphire-mid/30 focus:border-sapphire-mid transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-lato font-medium text-sapphire-dark mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-11 bg-white border border-sapphire-light/30 rounded-xl text-sm font-lato text-sapphire-dark placeholder-sapphire-light/60 focus:outline-none focus:ring-2 focus:ring-sapphire-mid/30 focus:border-sapphire-mid transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sapphire-light hover:text-sapphire-mid transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-sapphire-light font-lato mt-1.5">Minimum 6 characters</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-lato text-red-700">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-lato text-emerald-700">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sapphire-mid hover:bg-sapphire-dark text-white rounded-xl font-lato font-semibold text-sm transition-all duration-200 shadow-sapphire-md hover:shadow-sapphire-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>

          {isSignUp && (
            <p className="text-center text-xs text-sapphire-light font-lato mt-6">
              By signing up you agree to our terms of service
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
