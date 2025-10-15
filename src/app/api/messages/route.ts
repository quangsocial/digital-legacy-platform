import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendSecretMessageEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { message, expirationHours, recipientEmail } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (expirationHours || 24))

    // Insert message into database
    const { data: messageData, error } = await supabase
      .from('secret_messages')
      .insert({
        message,
        expires_at: expiresAt.toISOString(),
        recipient_email: recipientEmail || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    const messageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/message/${messageData.id}`

    // Send email if recipient email is provided
    if (recipientEmail) {
      const emailResult = await sendSecretMessageEmail({
        to: recipientEmail,
        subject: 'You have received a secret message',
        messageId: messageData.id,
        messageUrl,
      })

      if (!emailResult.success) {
        console.error('Error sending email:', emailResult.error)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      messageId: messageData.id,
      messageUrl,
      expiresAt: messageData.expires_at,
    })
  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}