'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface KeywordEntry   { keyword: string; location: string; device: string }
interface CompetitorEntry { url: string; name: string }

interface WizardData {
  name: string
  websiteUrl: string
  keywords: KeywordEntry[]
  competitors: CompetitorEntry[]
  frequency: string
  alertThreshold: number
}

const STEPS = ['Project Info', 'Keywords', 'Competitors', 'Frequency', 'Alerts', 'Review']

export default function ProjectWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<WizardData>({
    name: '',
    websiteUrl: '',
    keywords: [
      { keyword: '', location: 'United States', device: 'desktop' },
      { keyword: '', location: 'United States', device: 'desktop' },
      { keyword: '', location: 'United States', device: 'desktop' },
    ],
    competitors: [
      { url: '', name: '' },
      { url: '', name: '' },
      { url: '', name: '' },
    ],
    frequency: 'weekly',
    alertThreshold: 3,
  })

  const set = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData(prev => ({ ...prev, [key]: value }))

  const setKw = (i: number, field: keyof KeywordEntry, value: string) => {
    const kws = [...data.keywords]
    kws[i] = { ...kws[i], [field]: value }
    set('keywords', kws)
  }

  const setComp = (i: number, field: keyof CompetitorEntry, value: string) => {
    const comps = [...data.competitors]
    comps[i] = { ...comps[i], [field]: value }
    set('competitors', comps)
  }

  const canProceed = () => {
    if (step === 1) return data.name.trim() && data.websiteUrl.trim()
    if (step === 2) return data.keywords.some(k => k.keyword.trim())
    if (step === 3) return data.competitors.some(c => c.url.trim())
    return true
  }

  const submit = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Create project
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name: data.name, website_url: data.websiteUrl, status: 'active' })
        .select()
        .single()
      if (projErr) throw projErr

      // 2. Settings
      const { error: settErr } = await supabase.from('project_settings').insert({
        project_id: project.id,
        monitoring_frequency: data.frequency,
        alert_rank_drop_threshold: data.alertThreshold,
        alert_on_competitor_changes: true,
        alert_on_new_content_gaps: true,
      })
      if (settErr) throw settErr

      // 3. Keywords
      const validKws = data.keywords.filter(k => k.keyword.trim())
      if (validKws.length > 0) {
        const { error: kwErr } = await supabase.from('keywords').insert(
          validKws.map(k => ({ project_id: project.id, keyword: k.keyword, location: k.location, device: k.device }))
        )
        if (kwErr) throw kwErr
      }

      // 4. Competitors
      const validComps = data.competitors.filter(c => c.url.trim())
      if (validComps.length > 0) {
        const { error: compErr } = await supabase.from('competitors').insert(
          validComps.map(c => ({
            project_id: project.id,
            url: c.url,
            name: c.name.trim() || new URL(c.url).hostname,
          }))
        )
        if (compErr) throw compErr
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Failed to create project')
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

      {/* Step progress */}
      <div className="px-8 pt-8 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((_, idx) => {
            const s = idx + 1
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-full h-1.5 rounded-full transition-colors ${
                  s < step ? 'bg-indigo-500' : s === step ? 'bg-indigo-300' : 'bg-gray-200'
                }`} />
              </div>
            )
          })}
        </div>
        <p className="text-sm text-gray-500">
          Step {step} of 6 —{' '}
          <span className="font-semibold text-gray-700">{STEPS[step - 1]}</span>
        </p>
      </div>

      <div className="px-8 py-8">

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Project</h2>
              <p className="text-gray-500 mt-1 text-sm">Name your project and add your website.</p>
            </div>
            <Field label="Project Name">
              <Input value={data.name} onChange={e => set('name', e.target.value)} placeholder="e.g. My SEO Campaign" />
            </Field>
            <Field label="Website URL">
              <Input type="url" value={data.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://example.com" />
            </Field>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Keywords</h2>
              <p className="text-gray-500 mt-1 text-sm">Add up to 3 keywords to track in search results.</p>
            </div>
            {data.keywords.map((kw, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Keyword {i + 1}</p>
                <Input value={kw.keyword} onChange={e => setKw(i, 'keyword', e.target.value)} placeholder="e.g. best seo tools" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Location</label>
                    <Input value={kw.location} onChange={e => setKw(i, 'location', e.target.value)} placeholder="United States" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Device</label>
                    <select value={kw.device} onChange={e => setKw(i, 'device', e.target.value)} className={inputCls}>
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Competitors</h2>
              <p className="text-gray-500 mt-1 text-sm">Add 3–5 competitor URLs to monitor.</p>
            </div>
            {data.competitors.map((comp, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Competitor {i + 1}</p>
                <Input type="url" value={comp.url} onChange={e => setComp(i, 'url', e.target.value)} placeholder="https://competitor.com" />
                <Input value={comp.name} onChange={e => setComp(i, 'name', e.target.value)} placeholder="Name (optional)" />
              </div>
            ))}
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monitoring Frequency</h2>
              <p className="text-gray-500 mt-1 text-sm">How often should automations run?</p>
            </div>
            {[
              { value: 'weekly',       label: 'Weekly',       desc: 'Every Monday — recommended' },
              { value: 'twice_weekly', label: 'Twice Weekly', desc: 'Monday & Thursday' },
              { value: 'daily',        label: 'Daily',        desc: 'Every day — uses more API credits' },
            ].map(opt => (
              <label key={opt.value} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                data.frequency === opt.value ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input type="radio" name="freq" value={opt.value} checked={data.frequency === opt.value}
                  onChange={() => set('frequency', opt.value)} className="accent-indigo-600" />
                <div>
                  <p className="font-medium text-gray-800">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Alert Settings</h2>
              <p className="text-gray-500 mt-1 text-sm">Choose when to receive notifications.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Alert if rank drops by <span className="text-indigo-600 font-bold">{data.alertThreshold}+</span> positions
              </label>
              <input type="range" min={1} max={10} value={data.alertThreshold}
                onChange={e => set('alertThreshold', Number(e.target.value))}
                className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 (very sensitive)</span>
                <span>10 (major drops only)</span>
              </div>
            </div>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4" />
              <span className="text-sm text-gray-700">Alert on competitor page changes</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4" />
              <span className="text-sm text-gray-700">Alert when new content gaps are found</span>
            </label>
          </div>
        )}

        {/* Step 6 */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review & Create</h2>
              <p className="text-gray-500 mt-1 text-sm">Everything look correct?</p>
            </div>
            <ReviewBlock title="Project">
              <ReviewRow label="Name"      value={data.name} />
              <ReviewRow label="Website"   value={data.websiteUrl} />
              <ReviewRow label="Frequency" value={data.frequency.replace('_', ' ')} />
              <ReviewRow label="Alert at"  value={`${data.alertThreshold}+ position drop`} />
            </ReviewBlock>
            <ReviewBlock title={`Keywords (${data.keywords.filter(k => k.keyword).length})`}>
              {data.keywords.filter(k => k.keyword).map((k, i) => (
                <ReviewRow key={i} label={`#${i + 1}`} value={`${k.keyword} · ${k.location} · ${k.device}`} />
              ))}
            </ReviewBlock>
            <ReviewBlock title={`Competitors (${data.competitors.filter(c => c.url).length})`}>
              {data.competitors.filter(c => c.url).map((c, i) => (
                <ReviewRow key={i} label={c.name || `#${i + 1}`} value={c.url} />
              ))}
            </ReviewBlock>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep((step - 1) as Step)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 6 ? (
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors font-medium"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? 'Creating...' : '🚀 Create Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent'

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-4 py-2.5 text-sm">
      <span className="text-gray-500 w-32 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium truncate">{value}</span>
    </div>
  )
}
