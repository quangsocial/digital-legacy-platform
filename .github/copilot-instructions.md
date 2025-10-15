<!-- Digital Legacy Platform - Next.js + Supabase + Resend API -->

## Project Overview
This is a digital legacy platform that allows users to create and schedule messages, media, and important information to be sent to loved ones in the future. The platform serves as an online digital will/testament service.

**Core Features:**
- **Legacy Messages**: Text, images, videos (YouTube links), financial accounts info
- **Scheduled Delivery**: Set future dates for automatic sending
- **Cancellation System**: Users can cancel pending messages anytime
- **Reminder Notifications**: Alert users X days before scheduled delivery
- **Multi-recipient Support**: Send different messages to different people
- **Secure Storage**: All content encrypted and stored safely

## Tech Stack
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for backend services (auth, database, storage)
- Resend for email functionality
- Vercel for deployment

## User Journey
1. User registers and creates profile
2. Creates legacy messages (text, media, financial info)
3. Sets recipients and delivery dates
4. Receives periodic reminders to cancel if needed
5. Messages automatically sent on scheduled date if not cancelled

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=your_app_url
```

## Development Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Implement proper error handling and validation
- Use Supabase Auth for user management
- Use Supabase RLS policies for security
- Keep components modular and reusable
- Implement comprehensive logging for scheduled operations