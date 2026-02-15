'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, TrendingUp, TrendingDown, Users, Activity,
  Globe, BarChart2, Search, Target, Calendar, ExternalLink
} from 'lucide-react'

interface Project {
  id: string
  name: string
  website_url: string
  status: string
  created_at: string
}

interface Keyword {
  id: string
  keyword: string
  location: string
  device: string
  created_at: string
}

interface Competitor {
  id: string
  name: string
  url: string
  created_at: string
}

interface Change {
  id: string
  keyword: string
  position_before: number
  position_after: number
  change_type: string
  detected_at: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'competitors' | 'changes'>('overview')

  useEffect(() => {
    if (projectId) loadAll()
  }, [projectId])

  const loadAll = async () => {
    try {
      const [projectRes, keywordsRes, competitorsRes, changesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('keywords').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('competitors').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('serp_changes').select('*').eq('project_id', projectId).order('detected_at', { ascending: false }).limit(20),
      ])

      if (projectRes.error || !projectRes.data) {
        router.push('/dashboard')
        return
      }

      setProject(projectRes.data)
      setKeywords(keywordsRes.data || [])
      setCompetitors(competitorsRes.data || [])
      setChanges(changesRes.data || [])
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-sapphire-light border-t-sapphire-mid animate-spin mx-auto mb-4" />
          <p className="text-sapphire-light font-lato">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) return null

  const rankUps = changes.filter(c => c.change_type === 'rank_up').length
  const rankDowns = changes.filter(c => c.change_type === 'rank_down').length

  return (
    <div className="min-h-screen mesh-bg">
      {/* Nav */}
      <nav className="bg-sapphire-dark border-b border-sapphire-mid/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-sapphire-gradient flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-playfair text-lg font-bold text-white tracking-wide">SEO Autopilot</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-sapphire-light hover:text-white transition-colors text-sm font-lato">
            <ArrowLeft size={15} />
            All Projects
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Project Header */}
        <div className="fade-in-up mb-8">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-lato font-medium ${project.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-sapphire-light font-lato flex items-center gap-1">
                    <Calendar size={12} />
                    Created {new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="font-playfair text-3xl font-bold text-sapphire-dark">{project.name}</h1>
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 mt-2 text-sapphire-mid hover:text-sapphire-dark transition-colors font-lato text-sm group"
                >
                  <Globe size={14} />
                  {project.website_url}
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <QuickStat icon={<Search size={18} />} value={keywords.length} label="Keywords" />
                <QuickStat icon={<Target size={18} />} value={competitors.length} label="Competitors" />
                <QuickStat icon={<Activity size={18} />} value={changes.length} label="Changes" highlight={changes.length > 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Rank Change Banner (if changes exist) */}
        {changes.length > 0 && (
          <div className="fade-in-up-delay-1 grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-emerald-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
                <div>
                  <div className="font-playfair text-2xl font-bold text-emerald-700">{rankUps}</div>
                  <div className="text-xs text-sapphire-light font-lato">Rankings Improved</div>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 border-l-4 border-red-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <TrendingDown size={20} className="text-red-500" />
                </div>
                <div>
                  <div className="font-playfair text-2xl font-bold text-red-600">{rankDowns}</div>
                  <div className="text-xs text-sapphire-light font-lato">Rankings Dropped</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="fade-in-up-delay-2 mb-6">
          <div className="flex gap-1 bg-white/60 backdrop-blur p-1 rounded-xl w-fit border border-sapphire-light/20">
            {(['overview', 'keywords', 'competitors', 'changes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-lato font-medium capitalize transition-all duration-200 ${activeTab === tab
                  ? 'bg-sapphire-mid text-white shadow-sapphire-sm'
                  : 'text-sapphire-light hover:text-sapphire-dark'
                  }`}
              >
                {tab}
                {tab === 'changes' && changes.length > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-700 text-xs rounded-full px-1.5 py-0.5">
                    {changes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="fade-in-up-delay-3">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keywords Preview */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-xl font-bold text-sapphire-dark">Keywords</h2>
                  <button onClick={() => setActiveTab('keywords')} className="text-xs text-sapphire-mid hover:text-sapphire-dark font-lato transition-colors">
                    View all →
                  </button>
                </div>
                {keywords.length === 0 ? (
                  <EmptyState text="No keywords tracked yet" />
                ) : (
                  <div className="space-y-3">
                    {keywords.slice(0, 4).map(kw => (
                      <div key={kw.id} className="flex items-center justify-between p-3 bg-sapphire-lightest/60 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Search size={14} className="text-sapphire-light" />
                          <span className="text-sm font-lato text-sapphire-dark font-medium">{kw.keyword}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sapphire-light bg-white px-2 py-0.5 rounded-lg border border-sapphire-light/20">{kw.device}</span>
                          <span className="text-xs text-sapphire-light">{kw.location}</span>
                        </div>
                      </div>
                    ))}
                    {keywords.length > 4 && (
                      <p className="text-xs text-sapphire-light text-center font-lato pt-1">+{keywords.length - 4} more keywords</p>
                    )}
                  </div>
                )}
              </div>

              {/* Competitors Preview */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-xl font-bold text-sapphire-dark">Competitors</h2>
                  <button onClick={() => setActiveTab('competitors')} className="text-xs text-sapphire-mid hover:text-sapphire-dark font-lato transition-colors">
                    View all →
                  </button>
                </div>
                {competitors.length === 0 ? (
                  <EmptyState text="No competitors tracked yet" />
                ) : (
                  <div className="space-y-3">
                    {competitors.slice(0, 4).map(comp => (
                      <div key={comp.id} className="flex items-center justify-between p-3 bg-sapphire-lightest/60 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users size={14} className="text-sapphire-light flex-shrink-0" />
                          <span className="text-sm font-lato text-sapphire-dark font-medium truncate">{comp.name || comp.url}</span>
                        </div>
                        <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-sapphire-light hover:text-sapphire-mid transition-colors flex-shrink-0 ml-2">
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    ))}
                    {competitors.length > 4 && (
                      <p className="text-xs text-sapphire-light text-center font-lato pt-1">+{competitors.length - 4} more competitors</p>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Changes Preview */}
              <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-xl font-bold text-sapphire-dark">Recent Rank Changes</h2>
                  <button onClick={() => setActiveTab('changes')} className="text-xs text-sapphire-mid hover:text-sapphire-dark font-lato transition-colors">
                    View all →
                  </button>
                </div>
                {changes.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity size={32} className="text-sapphire-light mx-auto mb-3" />
                    <p className="text-sapphire-light font-lato text-sm">No changes detected yet. Automation will populate this.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sapphire-light/20">
                          <th className="text-left py-2 px-3 text-xs text-sapphire-light font-lato font-medium uppercase tracking-wider">Keyword</th>
                          <th className="text-center py-2 px-3 text-xs text-sapphire-light font-lato font-medium uppercase tracking-wider">Before</th>
                          <th className="text-center py-2 px-3 text-xs text-sapphire-light font-lato font-medium uppercase tracking-wider">After</th>
                          <th className="text-center py-2 px-3 text-xs text-sapphire-light font-lato font-medium uppercase tracking-wider">Change</th>
                          <th className="text-right py-2 px-3 text-xs text-sapphire-light font-lato font-medium uppercase tracking-wider">Detected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sapphire-light/10">
                        {changes.slice(0, 8).map(change => {
                          const diff = (change.position_before || 0) - (change.position_after || 0)
                          const isUp = diff > 0
                          return (
                            <tr key={change.id} className="hover:bg-sapphire-lightest/40 transition-colors">
                              <td className="py-3 px-3 font-lato text-sapphire-dark font-medium">{change.keyword}</td>
                              <td className="py-3 px-3 text-center text-sapphire-light font-lato">#{change.position_before}</td>
                              <td className="py-3 px-3 text-center font-lato font-bold text-sapphire-dark">#{change.position_after}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium font-lato px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                  }`}>
                                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                  {Math.abs(diff)}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right text-xs text-sapphire-light font-lato">
                                {new Date(change.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KEYWORDS TAB */}
          {activeTab === 'keywords' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-playfair text-xl font-bold text-sapphire-dark mb-5">All Keywords ({keywords.length})</h2>
              {keywords.length === 0 ? (
                <EmptyState text="No keywords tracked yet" />
              ) : (
                <div className="space-y-3">
                  {keywords.map(kw => (
                    <div key={kw.id} className="flex items-center justify-between p-4 bg-sapphire-lightest/60 rounded-xl hover:bg-sapphire-lightest transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sapphire-mid/10 flex items-center justify-center">
                          <Search size={15} className="text-sapphire-mid" />
                        </div>
                        <div>
                          <p className="font-lato font-semibold text-sapphire-dark">{kw.keyword}</p>
                          <p className="text-xs text-sapphire-light font-lato">{kw.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white border border-sapphire-light/20 text-sapphire-mid px-2.5 py-1 rounded-lg font-lato capitalize">{kw.device}</span>
                        <span className="text-xs text-sapphire-light font-lato">
                          {new Date(kw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMPETITORS TAB */}
          {activeTab === 'competitors' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-playfair text-xl font-bold text-sapphire-dark mb-5">All Competitors ({competitors.length})</h2>
              {competitors.length === 0 ? (
                <EmptyState text="No competitors tracked yet" />
              ) : (
                <div className="space-y-3">
                  {competitors.map(comp => (
                    <div key={comp.id} className="flex items-center justify-between p-4 bg-sapphire-lightest/60 rounded-xl hover:bg-sapphire-lightest transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sapphire-dark/10 flex items-center justify-center">
                          <Target size={15} className="text-sapphire-dark" />
                        </div>
                        <div>
                          <p className="font-lato font-semibold text-sapphire-dark">{comp.name || 'Competitor'}</p>
                          <p className="text-xs text-sapphire-light font-lato break-all">{comp.url}</p>
                        </div>
                      </div>
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-sapphire-mid hover:text-sapphire-dark font-lato transition-colors flex-shrink-0 ml-4"
                      >
                        Visit <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHANGES TAB */}
          {activeTab === 'changes' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-playfair text-xl font-bold text-sapphire-dark mb-5">All Rank Changes ({changes.length})</h2>
              {changes.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={40} className="text-sapphire-light mx-auto mb-4" />
                  <p className="font-playfair text-lg text-sapphire-dark mb-2">No changes yet</p>
                  <p className="text-sm text-sapphire-light font-lato">Your automation will detect and log ranking changes here each week.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-sapphire-light/20">
                        <th className="text-left py-3 px-4 text-xs text-sapphire-light font-lato font-semibold uppercase tracking-wider">Keyword</th>
                        <th className="text-center py-3 px-4 text-xs text-sapphire-light font-lato font-semibold uppercase tracking-wider">Before</th>
                        <th className="text-center py-3 px-4 text-xs text-sapphire-light font-lato font-semibold uppercase tracking-wider">After</th>
                        <th className="text-center py-3 px-4 text-xs text-sapphire-light font-lato font-semibold uppercase tracking-wider">Change</th>
                        <th className="text-right py-3 px-4 text-xs text-sapphire-light font-lato font-semibold uppercase tracking-wider">Detected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sapphire-light/10">
                      {changes.map(change => {
                        const diff = (change.position_before || 0) - (change.position_after || 0)
                        const isUp = diff > 0
                        return (
                          <tr key={change.id} className="hover:bg-sapphire-lightest/40 transition-colors">
                            <td className="py-3.5 px-4 font-lato text-sapphire-dark font-medium">{change.keyword}</td>
                            <td className="py-3.5 px-4 text-center text-sapphire-light font-lato">#{change.position_before}</td>
                            <td className="py-3.5 px-4 text-center font-playfair font-bold text-sapphire-dark">#{change.position_after}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium font-lato px-2.5 py-1 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                }`}>
                                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                {Math.abs(diff)} positions
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-xs text-sapphire-light font-lato">
                              {new Date(change.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickStat({ icon, value, label, highlight = false }: {
  icon: React.ReactNode; value: number; label: string; highlight?: boolean
}) {
  return (
    <div className="text-center bg-sapphire-lightest/40 rounded-xl px-5 py-3">
      <div className={`flex justify-center mb-1 ${highlight ? 'text-amber-500' : 'text-sapphire-light'}`}>{icon}</div>
      <div className={`font-playfair text-2xl font-bold ${highlight ? 'text-amber-600' : 'text-sapphire-dark'}`}>{value}</div>
      <div className="text-xs text-sapphire-light font-lato">{label}</div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-10">
      <p className="text-sapphire-light font-lato text-sm">{text}</p>
    </div>
  )
}
