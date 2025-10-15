'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateMessagePage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [expirationHours, setExpirationHours] = useState(24)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    messageId: string
    messageUrl: string
    expiresAt: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          expirationHours,
          recipientEmail: recipientEmail.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to create message')
        return
      }

      setResult(data)
    } catch (error) {
      alert('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Message Created!</h1>
              <p className="text-gray-600">Your secret message has been created successfully.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Message URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={result.messageUrl}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(result.messageUrl)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message ID:
                </label>
                <input
                  type="text"
                  value={result.messageId}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At:
                </label>
                <input
                  type="text"
                  value={new Date(result.expiresAt).toLocaleString()}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setMessage('')
                  setRecipientEmail('')
                }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
              >
                Create Another Message
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-blue-500 text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Secret Message</h1>
            <p className="text-gray-600">Create a secure message that will self-destruct after being read.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Secret Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your secret message here..."
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Time
              </label>
              <select
                id="expiration"
                value={expirationHours}
                onChange={(e) => setExpirationHours(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>1 week</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                If provided, we'll send an email notification with the secret link.
              </p>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg mr-4"
              >
                {loading ? 'Creating...' : 'Create Secret Message'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}