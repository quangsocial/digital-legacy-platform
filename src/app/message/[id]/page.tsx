'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface MessageData {
  message: string
  createdAt: string
}

export default function MessagePage() {
  const params = useParams()
  const [messageData, setMessageData] = useState<MessageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(`/api/messages/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch message')
          return
        }

        setMessageData(data)
      } catch (err) {
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMessage()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading message...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Message Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Create New Message
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-green-500 text-6xl mb-4">🔓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Secret Message</h1>
            <p className="text-sm text-gray-500">
              Created: {new Date(messageData!.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {messageData!.message}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ This message has been permanently deleted and cannot be accessed again.
              </p>
            </div>
            
            <a 
              href="/" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
            >
              Create New Message
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}