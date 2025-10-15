'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runSetup = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Setup failed')
        setResult(data)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Setup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Database Setup
            </h1>
            <p className="text-gray-600">
              Thiết lập database cho Digital Legacy Platform
            </p>
          </div>

          {!result && !error && (
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Cần thiết lập database
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Click nút bên dưới để tự động tạo các tables cần thiết trong Supabase
                </p>
                <div className="text-left text-sm text-blue-600">
                  <p className="font-medium mb-2">Sẽ tạo các tables:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>profiles - Thông tin user</li>
                    <li>recipients - Người nhận di chúc</li>
                    <li>legacy_messages - Nội dung di chúc</li>
                    <li>message_recipients - Liên kết message-recipient</li>
                    <li>notification_logs - Log thông báo</li>
                    <li>user_settings - Cài đặt user</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={runSetup}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                {loading ? 'Đang thiết lập...' : 'Bắt đầu thiết lập Database'}
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tạo database schema...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-red-500 text-2xl mr-3">❌</div>
                <h3 className="font-semibold text-red-800">Thiết lập thất bại</h3>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              
              {result?.manual_setup && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <p className="text-yellow-800 font-medium mb-2">
                    Giải pháp thay thế:
                  </p>
                  <p className="text-yellow-700 text-sm">
                    {result.manual_setup}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={runSetup}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
                >
                  Thử lại
                </button>
                <a 
                  href="/SUPABASE_SETUP.md"
                  target="_blank"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
                >
                  Xem hướng dẫn manual
                </a>
              </div>
            </div>
          )}

          {result && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-green-500 text-2xl mr-3">📋</div>
                <h3 className="font-semibold text-green-800">SQL Commands Ready!</h3>
              </div>
              
              <p className="text-green-700 mb-4">{result.message}</p>

              {result.instructions && (
                <div className="bg-blue-50 rounded p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    {result.instructions.map((step: string, i: number) => (
                      <li key={i}>{i + 1}. {step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {result.alternativeMethod && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Phương pháp đơn giản:</h4>
                  <p className="text-yellow-700 text-sm">{result.alternativeMethod}</p>
                </div>
              )}

              <div className="bg-gray-100 rounded p-4 mb-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-2">SQL Commands ({result.totalCommands} commands):</h4>
                <div className="text-xs font-mono space-y-2">
                  {result.sqlCommands && result.sqlCommands.slice(0, 3).map((cmd: string, i: number) => (
                    <div key={i} className="bg-white p-2 rounded border">
                      <pre className="whitespace-pre-wrap">{cmd}</pre>
                    </div>
                  ))}
                  {result.sqlCommands && result.sqlCommands.length > 3 && (
                    <div className="text-center text-gray-500">
                      ... và {result.sqlCommands.length - 3} commands khác
                    </div>
                  )}
                </div>
              </div>

              <div className="space-x-4">
                <a 
                  href="https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Mở Supabase SQL Editor
                </a>
                <button
                  onClick={() => {
                    const fullScript = result.sqlCommands?.join('\n\n') || ''
                    navigator.clipboard.writeText(fullScript)
                    alert('SQL script đã được copy!')
                  }}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Copy All SQL
                </button>
                <a 
                  href="/dashboard"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Đến Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}