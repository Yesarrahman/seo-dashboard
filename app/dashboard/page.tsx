'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Users, Activity, Plus, LogOut, BarChart2, Globe } from 'lucide-react'

interface Project {
  id: string
  name: string
  website_url: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')

      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      setProjects(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen mesh-bg">
      {/* Top Navigation */}
      <nav className="bg-sapphire-dark border-b border-sapphire-mid/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sapphire-gradient flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-playfair text-lg font-bold text-white tracking-wide">SEO Autopilot</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sapphire-light text-sm hidden sm:block">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sapphire-light hover:text-white transition-colors text-sm"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 fade-in-up">
          <div>
            <p className="text-sapphire-mid text-sm font-lato uppercase tracking-widest mb-2">Dashboard</p>
            <h1 className="font-playfair text-4xl font-bold text-sapphire-dark leading-tight">
              Your Projects
            </h1>
            <p className="text-sapphire-light mt-2 font-lato">
              {projects.length} project{projects.length !== 1 ? 's' : ''} monitored
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sapphire-mid hover:bg-sapphire-dark text-white rounded-xl font-lato font-medium transition-all duration-200 shadow-sapphire-md hover:shadow-sapphire-lg hover:-translate-y-0.5 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            New Project
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 h-52 shimmer" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="fade-in-up text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-sapphire-gradient mx-auto mb-6 flex items-center justify-center">
              <Globe size={36} className="text-white" />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-sapphire-dark mb-3">No projects yet</h2>
            <p className="text-sapphire-light font-lato mb-8 max-w-sm mx-auto">
              Create your first project to start monitoring rankings, competitors, and content gaps.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sapphire-mid hover:bg-sapphire-dark text-white rounded-xl font-lato font-medium transition-all duration-200 shadow-sapphire-md hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Create First Project
            </Link>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <div key={project.id} className={`fade-in-up-delay-${Math.min(i + 1, 4)}`}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [stats, setStats] = useState({ keywords: 0, competitors: 0, changes: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [k, c, ch] = await Promise.all([
        supabase.from('keywords').select('id', { count: 'exact' }).eq('project_id', project.id),
        supabase.from('competitors').select('id', { count: 'exact' }).eq('project_id', project.id),
        supabase.from('serp_changes').select('id', { count: 'exact' }).eq('project_id', project.id),
      ])
      setStats({ keywords: k.count || 0, competitors: c.count || 0, changes: ch.count || 0 })
    } catch (e) { }
  }

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="glass-card rounded-2xl p-6 hover:shadow-sapphire-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="font-playfair text-xl font-bold text-sapphire-dark truncate group-hover:text-sapphire-mid transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Globe size={12} className="text-sapphire-light flex-shrink-0" />
              <p className="text-sm text-sapphire-light font-lato truncate">{project.website_url}</p>
            </div>
          </div>
          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-lato font-medium flex-shrink-0 ${project.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
            {project.status}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-sapphire-light/20 via-sapphire-light/40 to-transparent mb-5" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox value={stats.keywords} label="Keywords" color="text-sapphire-mid" icon={<TrendingUp size={14} />} />
          <StatBox value={stats.competitors} label="Competitors" color="text-sapphire-dark" icon={<Users size={14} />} />
          <StatBox value={stats.changes} label="Changes" color={stats.changes > 0 ? "text-amber-600" : "text-sapphire-light"} icon={<Activity size={14} />} />
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-sapphire-light/20 flex items-center justify-between">
          <span className="text-xs text-sapphire-light font-lato">
            {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs font-lato text-sapphire-mid group-hover:text-sapphire-dark font-medium transition-colors flex items-center gap-1">
            View details →
          </span>
        </div>
      </div>
    </Link>
  )
}

function StatBox({ value, label, color, icon }: { value: number; label: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-sapphire-lightest/60 rounded-xl p-3 text-center">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold font-playfair ${color}`}>{value}</div>
      <div className="text-xs text-sapphire-light font-lato mt-0.5">{label}</div>
    </div>
  )
}
