import { useState } from "react"
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { conciseSummary } from "../utils/summarizer"
import { scoreSimilarity } from "../utils/searchUtils"

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

async function readPdfText(file) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ 
    data: buf, 
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.4.168/build/standard_fonts/' 
  }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map(it => it.str)
      text += strings.join(' ') + '\n'
    } catch (e) {
      console.warn(`Failed to parse page ${i}:`, e)
    }
  }
  return text
}

export default function AILabPage({ corpus = [] }) {
  const [status, setStatus] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [uploadDate, setUploadDate] = useState('')
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = async (files) => {
    if (!files?.length) return
    const f = files[0]
    
    setFileName(f.name)
    setFileSize(f.size)
    setUploadDate(new Date().toLocaleString())
    setStatus('Parsing document...')
    
    let text = ''
    if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
      try { 
        text = await readPdfText(f) 
        if (!text || text.trim().length < 20) {
          setStatus('⚠️ Parsed PDF but no selectable text found. Try a text-based PDF.')
          return
        }
      } catch (e) {
        console.error('PDF parsing error:', e)
        setStatus('❌ Failed to parse PDF')
        return
      }
    } else {
      text = await f.text()
    }

    if (text.trim().length < 50) {
      setStatus('❌ Text too short for analysis')
      return
    }

    setStatus('🤖 Analyzing with AI...')
    let summaryData = null
    let usedAI = false
    
    try {
      const res = await fetch('http://localhost:8000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, max_bullets: 3 })
      })
      if (!res.ok) throw new Error(`API failed: ${res.status}`)
      summaryData = await res.json()
      usedAI = true
      console.log('✅ AI summarization successful')
    } catch (e) {
      console.warn('AI unavailable, using fallback:', e)
      setStatus('⚠️ AI unavailable, using local analysis...')
      const fallback = conciseSummary(text, 3)
      summaryData = {
        tldr: fallback.tldr,
        objectives: fallback.bullets,
        science: [],
        timeline: [],
        keywords: fallback.keywords
      }
    }
    
    if (usedAI) setStatus('✅ Analysis complete (AI-powered)')
    else setStatus('✅ Analysis complete (Local fallback)')
    
    setSummary(summaryData)
    
    setStatus('🔍 Finding similar publications...')
    const queryText = summaryData?.tldr || text.slice(0, 500)
    const scored = (corpus || []).map(p => ({
      p,
      score: scoreSimilarity(queryText, `${p.title} ${p.outcome} ${p.organism}`)
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => ({ ...x.p, similarityScore: (x.score * 100).toFixed(0) }))
    
    setRecommendations(scored)
    setStatus('')
  }

  const handleClear = () => {
    setSummary(null)
    setRecommendations([])
    setFileName('')
    setFileSize(0)
    setUploadDate('')
    setStatus('')
  }

  return (
    <div className="min-h-screen text-white relative pt-[64px]">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover object-center -z-10">
        <source src="/galaxy_space.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PDF Analyzer
              </h1>
              <p className="text-slate-400 mt-1">Upload documents for intelligent analysis and discovery</p>
            </div>
            {summary && (
              <button 
                onClick={handleClear}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear & Start Over
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Document Upload
              </h2>
              
              <div
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                  ${isDragging 
                    ? 'border-blue-400 bg-blue-500/10 scale-105' 
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
                  }
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { 
                  e.preventDefault()
                  setIsDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.pdf,.txt,.md'
                  input.onchange = (e) => handleFiles(e.target.files)
                  input.click()
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-200">
                      Drag & drop your document here
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      or click to browse (PDF, TXT, MD)
                    </p>
                  </div>
                </div>
              </div>

              {/* File Info */}
              {fileName && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 truncate">{fileName}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span>{(fileSize / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{uploadDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              {status && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">{status}</p>
                </div>
              )}
            </div>

            {/* Summary Display */}
            {summary && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Analysis Results
                </h2>

                {summary.tldr && (
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">TL;DR</h3>
                    <p className="text-slate-200 leading-relaxed">{summary.tldr}</p>
                  </div>
                )}

                {summary.objectives?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wide">Mission Objectives</h3>
                    <ul className="space-y-2">
                      {summary.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-200">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.science?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-300 mb-3 uppercase tracking-wide">Scientific Focus</h3>
                    <div className="space-y-2">
                      {summary.science.map((sci, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-200">
                          <svg className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{sci}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summary.timeline?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-300 mb-3 uppercase tracking-wide">Timeline Highlights</h3>
                    <div className="space-y-3">
                      {summary.timeline.map((time, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                          <p className="text-slate-200">{time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summary.keywords?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.keywords.map((kw, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 rounded-full text-xs font-medium text-slate-200 transition cursor-default"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Similar Research
              </h2>

              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-slate-400 text-sm">
                    Upload a document to discover similar publications
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {recommendations.map((p, idx) => (
                    <div 
                      key={`${p.link}-${idx}`} 
                      className="p-4 bg-slate-700/40 hover:bg-slate-700/60 rounded-lg transition group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-slate-200 text-sm leading-tight group-hover:text-white transition">
                          {p.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-bold flex-shrink-0">
                          {p.similarityScore}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-slate-600/60 rounded text-slate-300">
                          {p.year ?? 'n/a'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-600/60 rounded text-slate-300">
                          {p.organism}
                        </span>
                      </div>
                      {p.link && (
                        <a 
                          href={p.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1 group/link"
                        >
                          View Publication
                          <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

