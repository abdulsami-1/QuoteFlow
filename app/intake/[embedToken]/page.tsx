'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { BorderBeam } from '@/components/magicui/border-beam'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { NumberTicker } from '@/components/magicui/number-ticker'

interface PricingRule {
  id: string
  tierLabel: string
  minPrice: number
  maxPrice: number
  triggerKeyword: string
}

interface Service {
  id: string
  name: string
  questions: string[]
  pricingRules: PricingRule[]
}

interface IntakeConfig {
  businessName: string
  brandColor: string
  services: Service[]
}

interface Message {
  id: string
  type: 'ai' | 'user'
  text: string
}

type Stage = 'loading' | 'select-service' | 'chat' | 'processing' | 'quote' | 'error'

export default function IntakePage({ params }: { params: Promise<{ embedToken: string }> }) {
  const [embedToken, setEmbedToken] = useState('')
  const [stage, setStage] = useState<Stage>('loading')
  const [config, setConfig] = useState<IntakeConfig | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [conversationLog, setConversationLog] = useState<{ question: string; answer: string }[]>([])
  const [quoteMin, setQuoteMin] = useState(0)
  const [quoteMax, setQuoteMax] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then((p) => setEmbedToken(p.embedToken))
  }, [params])

  useEffect(() => {
    if (!embedToken) return
    fetch(`/api/intake/${embedToken}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setConfig(json.data)
          setStage(json.data.services.length === 1 ? 'chat' : 'select-service')
          if (json.data.services.length === 1) {
            startChat(json.data.services[0])
          }
        } else {
          setStage('error')
          setErrorMsg('This quote link is invalid or has expired.')
        }
      })
      .catch(() => {
        setStage('error')
        setErrorMsg('Unable to load. Please try again.')
      })
  }, [embedToken])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (stage === 'chat') inputRef.current?.focus()
  }, [stage, messages.length])

  function startChat(service: Service) {
    setSelectedService(service)
    setQuestionIndex(0)
    setConversationLog([])
    setMessages([])
    setStage('chat')
    setTimeout(() => {
      addAiMessage(service.questions[0])
    }, 300)
  }

  function addAiMessage(text: string) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: 'ai', text }])
  }

  const handleSubmitAnswer = useCallback(() => {
    if (!inputValue.trim() || !selectedService) return
    const answer = inputValue.trim()
    const question = selectedService.questions[questionIndex]

    setInputValue('')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: 'user', text: answer }])

    const newLog = [...conversationLog, { question, answer }]
    setConversationLog(newLog)

    const nextIndex = questionIndex + 1

    if (nextIndex < selectedService.questions.length) {
      setIsTyping(true)
      setQuestionIndex(nextIndex)
      setTimeout(() => {
        setIsTyping(false)
        addAiMessage(selectedService.questions[nextIndex])
      }, 800)
    } else {
      setIsTyping(false)
      setStage('processing')
      submitIntake(selectedService.id, newLog)
    }
  }, [inputValue, selectedService, questionIndex, conversationLog])

  async function submitIntake(serviceId: string, log: { question: string; answer: string }[]) {
    try {
      const res = await fetch(`/api/intake/${embedToken}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, conversationLog: log }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setQuoteMin(json.data.quoteMin)
        setQuoteMax(json.data.quoteMax)
        setStage('quote')
      } else {
        setStage('error')
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStage('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  const brandColor = config?.brandColor ?? '#6366f1'
  const totalQuestions = selectedService?.questions.length ?? 0
  const answeredCount = Math.min(questionIndex, totalQuestions)
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <Shell brandColor={brandColor} businessName="">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-5 w-5 animate-spin text-fg-tertiary" />
        </div>
      </Shell>
    )
  }

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <Shell brandColor={brandColor} businessName={config?.businessName ?? ''}>
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
            <AlertCircle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-fg-primary">{errorMsg}</p>
            <p className="text-[12px] text-fg-tertiary mt-1">Contact the business directly for a quote.</p>
          </div>
        </div>
      </Shell>
    )
  }

  // ─── Service select ───────────────────────────────────────────────────────────
  if (stage === 'select-service' && config) {
    return (
      <Shell brandColor={brandColor} businessName={config.businessName}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-[12px] font-medium text-fg-tertiary uppercase tracking-widest mb-4">
            Select a service
          </p>
          {config.services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.2, ease: 'easeOut' }}
            >
              <ShimmerButton
                shimmerColor="var(--glass-bg-hover)"
                onClick={() => startChat(service)}
                className="w-full text-left border border-border-subtle hover:border-border-strong p-4 group"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '0.75rem',
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-[13px] font-medium text-fg-primary">{service.name}</p>
                    <p className="text-[11px] text-fg-tertiary mt-0.5">
                      {service.questions.length} question{service.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-fg-disabled group-hover:text-fg-secondary transition-colors shrink-0" />
                </div>
              </ShimmerButton>
            </motion.div>
          ))}
        </motion.div>
      </Shell>
    )
  }

  // ─── Chat ────────────────────────────────────────────────────────────────────
  if (stage === 'chat' && config && selectedService) {
    return (
      <Shell brandColor={brandColor} businessName={config.businessName}>
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-[11px] text-fg-tertiary mb-2">
            <span className="font-medium text-fg-secondary">{selectedService.name}</span>
            <span>{answeredCount} / {totalQuestions}</span>
          </div>
          <div className="h-0.5 bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: brandColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-2.5 mb-4 min-h-[200px] max-h-[340px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[82%] px-4 py-2 text-[13px] leading-relaxed text-fg-primary"
                  style={
                    msg.type === 'user'
                      ? {
                          background: 'var(--brand-subtle)',
                          border: '1px solid var(--brand-border)',
                          borderRadius: '12px 12px 4px 12px',
                        }
                      : {
                          background: 'var(--glass-bubble)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px 12px 12px 4px',
                        }
                  }
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div
                  className="px-4 py-4"
                  style={{
                    background: 'var(--glass-bubble)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px 12px 12px 4px',
                  }}
                >
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-fg-tertiary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitAnswer()}
            placeholder="Type your answer…"
            className="intake-glass-input flex-1 h-11 rounded-xl px-4 text-[13px] text-fg-primary placeholder:text-fg-disabled transition-colors"
            style={{
              background: 'var(--glass-input)',
              border: '1px solid var(--glass-border)',
            }}
            disabled={isTyping}
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!inputValue.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-30 shrink-0"
            style={{ background: brandColor }}
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      </Shell>
    )
  }

  // ─── Processing ──────────────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <Shell brandColor={brandColor} businessName={config?.businessName ?? ''}>
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center"
            style={{ background: `${brandColor}1a` }}
          >
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: brandColor }} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-fg-primary">Calculating your estimate…</p>
            <p className="text-[12px] text-fg-tertiary mt-1">This takes a few seconds</p>
          </div>
        </div>
      </Shell>
    )
  }

  // ─── Quote reveal ─────────────────────────────────────────────────────────────
  if (stage === 'quote') {
    return (
      <Shell brandColor={brandColor} businessName={config?.businessName ?? ''}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.1, stiffness: 260, damping: 20 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full mb-6 bg-success-subtle"
          >
            <CheckCircle2 className="h-8 w-8 text-success" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] font-medium text-fg-tertiary uppercase tracking-widest mb-4"
          >
            Preliminary Estimate
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-3 bg-brand-subtle rounded-lg px-6 py-4 mb-1"
          >
            <NumberTicker
              value={quoteMin}
              prefix="$"
              decimalPlaces={0}
              className="text-[40px] font-bold text-brand tabular-nums leading-none"
            />
            <span className="text-fg-tertiary text-[28px] font-light leading-none">–</span>
            <NumberTicker
              value={quoteMax}
              prefix="$"
              decimalPlaces={0}
              className="text-[40px] font-bold text-brand tabular-nums leading-none"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-[13px] text-fg-tertiary mt-6 max-w-xs mx-auto leading-relaxed"
          >
            We'll review your project and follow up within{' '}
            <span className="text-fg-primary font-medium">24 hours</span> with a detailed proposal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 rounded-xl border border-border-subtle p-4"
            style={{ background: 'var(--glass-bubble)' }}
          >
            <p className="text-[11px] text-fg-tertiary leading-relaxed">
              This is a preliminary range based on your answers. Final pricing depends on full project scope.
            </p>
          </motion.div>
        </motion.div>
      </Shell>
    )
  }

  return null
}

function Shell({
  children,
  brandColor,
  businessName,
}: {
  children: React.ReactNode
  brandColor: string
  businessName: string
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
    >
      {/* Subtle glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: brandColor }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl mb-4 shadow-lg"
            style={{ background: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}
          >
            <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {businessName && (
            <h1 className="text-[15px] font-semibold text-fg-primary">{businessName}</h1>
          )}
        </div>

        {/* Card */}
        <div
          className="relative rounded-2xl p-6 shadow-xl shadow-black/40"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <BorderBeam colorFrom={brandColor} colorTo={`${brandColor}40`} duration={8} size={120} />
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-fg-disabled mt-4">
          Powered by <span className="text-fg-tertiary">QuoteFlow</span>
        </p>
      </div>
    </div>
  )
}
