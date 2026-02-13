'use client'

import { useEffect, useState } from 'react'
import { supabase, type Project } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Plus, TrendingUp, TrendingDown, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    getUser()
    loadProjects()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserEmail(user?.email ?? '')
  }

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">SEO Automation</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-500 mt-1 text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            <Plus size={17} />
            New Project
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
                <div className="grid grid-cols-3 gap-4">
                  {[1,2,3].map(j => <div key={j} className="h-14 bg-gray-100 rounded" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Create your first project to start monitoring rankings and competitors
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              <Plus size={18} />
              Create First Project
            </Link>
          </div>
        )}

        {/* Project grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [stats, setStats] = useState({ keywords: 0, competitors: 0, changes: 0, up: 0, down: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [kwRes, compRes, changesRes] = await Promise.all([
      supabase.from('keywords').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
      supabase.from('competitors').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
      supabase.from('serp_changes').select('id, change_type', { count: 'exact' }).eq('project_id', project.id),
    ])

    const changes = changesRes.data || []
    setStats({
      keywords: kwRes.count || 0,
      competitors: compRes.count || 0,
      changes: changesRes.count || 0,
      up: changes.filter(c => c.change_type === 'rank_up').length,
      down: changes.filter(c => c.change_type === 'rank_down').length,
    })
  }

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-400 truncate mt-0.5">{project.website_url}</p>
          </div>
          <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
            project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.keywords}</div>
            <div className="text-xs text-gray-400 mt-0.5">Keywords</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.competitors}</div>
            <div className="text-xs text-gray-400 mt-0.5">Competitors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.changes}</div>
            <div className="text-xs text-gray-400 mt-0.5">Changes</div>
          </div>
        </div>

        {(stats.up + stats.down) > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
            {stats.up > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <TrendingUp size={13} /> {stats.up} up
              </span>
            )}
            {stats.down > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <TrendingDown size={13} /> {stats.down} down
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">this week</span>
          </div>
        )}
      </div>
    </Link>
  )
}
