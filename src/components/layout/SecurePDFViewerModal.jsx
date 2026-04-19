/**
 * SecurePDFViewerModal — generic reusable secure PDF viewer
 * ──────────────────────────────────────────────────────────
 * Props:
 *   title       {string}   — shown in header
 *   endpoint    {string}   — authenticated API route to fetch the PDF from
 *   langOptions {Array?}   — optional language toggle
 *                            [{ key, label, endpoint, title }, ...]
 *   scrollMode  {boolean?} — if true, renders all pages stacked vertically
 *                            (no page-by-page nav). Default: false.
 *   onClose     {Function}
 *
 * Security measures:
 *   • Canvas rendering via PDF.js — no native browser PDF toolbar
 *   • Right-click context menu blocked on the viewer
 *   • Ctrl+S / Ctrl+P / Cmd+S / Cmd+P suppressed while open
 *   • PDF fetched behind JWT auth — direct asset URL not exposed to users
 *   • ArrayBuffer cleared; no blob URL left on device after close
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const PDFJS_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
const SCALE        = 1.4

function loadPDFJS() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return }
    const script = document.createElement('script')
    script.src = PDFJS_CDN
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('Failed to load PDF.js'))
    document.head.appendChild(script)
  })
}

export default function SecurePDFViewerModal({ title, endpoint, langOptions, scrollMode = false, onClose }) {
  const { token } = useAuth()

  // ── Paged mode refs ───────────────────────────────────────────────────────
  const canvasRef      = useRef(null)
  const renderTask     = useRef(null)

  // ── Scroll mode ref ───────────────────────────────────────────────────────
  const scrollContainerRef = useRef(null)

  const pdfRef = useRef(null)

  // ── Language ──────────────────────────────────────────────────────────────
  const hasLangs     = Array.isArray(langOptions) && langOptions.length > 1
  const [activeLang, setActiveLang] = useState(hasLangs ? langOptions[0].key : null)
  const activeOption   = hasLangs ? (langOptions.find(l => l.key === activeLang) ?? langOptions[0]) : null
  const activeEndpoint = activeOption ? activeOption.endpoint : endpoint
  const activeTitle    = activeOption ? activeOption.title    : title

  // ── State ─────────────────────────────────────────────────────────────────
  const [status,      setStatus]      = useState('loading')
  const [totalPages,  setTotalPages]  = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [renderingAll, setRenderingAll] = useState(false)  // scroll mode: pages being painted
  const [errorMsg,    setErrorMsg]    = useState('')

  // ── Block Ctrl/Cmd + S / P while open ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onClose])

  // ── Fetch & load PDF ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setCurrentPage(1)
    setTotalPages(0)
    setRenderingAll(false)
    if (pdfRef.current) { pdfRef.current.destroy(); pdfRef.current = null }

    async function fetchAndLoad() {
      try {
        const pdfjs = await loadPDFJS()
        const res = await fetch(activeEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        const buffer = await res.arrayBuffer()
        if (cancelled) return
        const pdf = await pdfjs.getDocument({ data: buffer }).promise
        if (cancelled) { pdf.destroy(); return }
        pdfRef.current = pdf
        setTotalPages(pdf.numPages)
        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          console.error('[SecurePDFViewer]', err)
          setErrorMsg(err.message || 'Failed to load document')
          setStatus('error')
        }
      }
    }

    fetchAndLoad()
    return () => {
      cancelled = true
      if (pdfRef.current) { pdfRef.current.destroy(); pdfRef.current = null }
    }
  }, [token, activeEndpoint])

  // ── PAGED MODE: render single page to canvas ──────────────────────────────
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfRef.current || !canvasRef.current) return
    try {
      if (renderTask.current) { renderTask.current.cancel(); renderTask.current = null }
      const page     = await pdfRef.current.getPage(pageNum)
      const viewport = page.getViewport({ scale: SCALE })
      const canvas   = canvasRef.current
      canvas.width   = viewport.width
      canvas.height  = viewport.height
      const task     = page.render({ canvasContext: canvas.getContext('2d'), viewport })
      renderTask.current = task
      await task.promise
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[SecurePDFViewer] render error', err)
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'ready' && !scrollMode) renderPage(currentPage)
  }, [status, currentPage, renderPage, scrollMode])

  // ── SCROLL MODE: render all pages sequentially into container ─────────────
  useEffect(() => {
    if (status !== 'ready' || !scrollMode) return
    let cancelled = false

    async function renderAll() {
      if (!pdfRef.current || !scrollContainerRef.current) return
      setRenderingAll(true)
      const container = scrollContainerRef.current
      // Clear any previous render
      while (container.firstChild) container.removeChild(container.firstChild)

      const numPages = pdfRef.current.numPages
      for (let i = 1; i <= numPages; i++) {
        if (cancelled) break
        try {
          const page     = await pdfRef.current.getPage(i)
          const viewport = page.getViewport({ scale: SCALE })
          const canvas   = document.createElement('canvas')
          canvas.width   = viewport.width
          canvas.height  = viewport.height
          Object.assign(canvas.style, {
            display:     'block',
            maxWidth:    '100%',
            borderRadius: '3px',
            marginBottom: '6px',
            boxShadow:   '0 2px 12px rgba(0,0,0,0.45)',
            flexShrink:  '0',
          })
          canvas.oncontextmenu = (e) => e.preventDefault()
          container.appendChild(canvas)
          if (!cancelled) {
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
          }
        } catch (err) {
          if (err?.name !== 'RenderingCancelledException') {
            console.error(`[SecurePDFViewer] scroll render page ${i}`, err)
          }
        }
      }
      if (!cancelled) setRenderingAll(false)
    }

    renderAll()
    return () => { cancelled = true }
  }, [status, scrollMode])

  const goToPrev     = () => setCurrentPage(p => Math.max(1, p - 1))
  const goToNext     = () => setCurrentPage(p => Math.min(totalPages, p + 1))
  const blockCtxMenu = (e) => e.preventDefault()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative flex flex-col bg-[#1a1a2e] rounded-2xl shadow-2xl"
        style={{ width: 'min(92vw, 880px)', height: 'min(94vh, 960px)' }}
        onContextMenu={blockCtxMenu}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0 gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
        >
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm tracking-wide truncate">{activeTitle}</p>
            {status === 'ready' && (
              <p className="text-white/40 text-xs mt-0.5">
                {scrollMode
                  ? renderingAll
                    ? `Loading pages…`
                    : `${totalPages} pages`
                  : `Page ${currentPage} of ${totalPages}`
                }
              </p>
            )}
          </div>

          {/* Language toggle */}
          {hasLangs && (
            <div
              className="flex items-center rounded-lg overflow-hidden shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {langOptions.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setActiveLang(l.key)}
                  className="px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    background: activeLang === l.key ? 'rgba(46,150,255,0.85)' : 'transparent',
                    color:      activeLang === l.key ? '#fff' : 'rgba(255,255,255,0.45)',
                    cursor:     activeLang === l.key ? 'default' : 'pointer',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Viewport ───────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-auto flex items-start justify-center py-4 px-4"
          style={{ background: '#2d2d2d', userSelect: 'none', WebkitUserSelect: 'none' }}
          onContextMenu={blockCtxMenu}
        >
          {/* Loading / error states (both modes) */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/50">
              <Loader size={32} className="animate-spin" />
              <p className="text-sm">Loading document…</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
              <p className="text-sm font-medium">Failed to load document</p>
              <p className="text-xs text-white/40">{errorMsg}</p>
            </div>
          )}

          {/* PAGED MODE */}
          {status === 'ready' && !scrollMode && (
            <canvas
              ref={canvasRef}
              onContextMenu={blockCtxMenu}
              style={{ display: 'block', boxShadow: '0 4px 32px rgba(0,0,0,0.5)', borderRadius: 4, maxWidth: '100%' }}
            />
          )}

          {/* SCROLL MODE — imperative canvas injection target */}
          {status === 'ready' && scrollMode && (
            <div
              ref={scrollContainerRef}
              style={{ width: '100%' }}
              onContextMenu={blockCtxMenu}
            />
          )}
        </div>

        {/* ── Paged navigation (paged mode only) ─────────────────────────── */}
        {status === 'ready' && !scrollMode && totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-4 py-3 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={goToPrev}
              disabled={currentPage <= 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-white/60 text-sm tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNext}
              disabled={currentPage >= totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
