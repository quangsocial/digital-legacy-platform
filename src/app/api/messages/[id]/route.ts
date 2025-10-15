import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get message from database
    const { data: message, error } = await supabase
      .from('secret_messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if message has expired
    const now = new Date()
    const expiresAt = new Date(message.expires_at)
    
    if (now > expiresAt) {
      // Delete expired message
      await supabase
        .from('secret_messages')
        .delete()
        .eq('id', id)
      
      return NextResponse.json({ error: 'Message has expired' }, { status: 410 })
    }

    // Check if message has already been read
    if (message.is_read) {
      return NextResponse.json({ error: 'Message has already been read' }, { status: 410 })
    }

    // Mark message as read and delete it
    await supabase
      .from('secret_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Delete the message after reading (for security)
    await supabase
      .from('secret_messages')
      .delete()
      .eq('id', id)

    return NextResponse.json({
      success: true,
      message: message.message,
      createdAt: message.created_at,
    })
  } catch (error) {
    console.error('Error in GET /api/messages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}