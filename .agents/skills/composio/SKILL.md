---
name: composio
description: Connects AI agents to 150+ external tools and applications (Google Calendar, Gmail, Slack, HubSpot, Salesforce, Notion, GitHub) using Composio.
---

# Composio Integration Skill

## Overview
Composio provides a managed authentication (OAuth) and tool execution layer for AI agents, allowing agents to interact with 150+ external tools including Google Workspace, Microsoft 365, CRMs, and communication apps.

## Configuration
- **API Key**: `COMPOSIO_API_KEY` in `.env.local`
- **Base Endpoint**: `https://backend.composio.dev/api/v1`

## Workspace Implementation
The integration in WealthPilot AI is implemented in:
- `lib/composio.ts`: Core wrapper for connection initiation, account listing, and action execution.
- `app/api/integrations/composio/connect/route.ts`: Starts OAuth flow.
- `app/api/integrations/composio/connections/route.ts`: Lists connected apps.
- `app/api/integrations/composio/sync-calendar/route.ts`: Synchronizes Google Calendar meetings.
- `app/api/integrations/composio/send-email/route.ts`: Sends emails via Gmail.
- `components/dashboard/integrations-hub.tsx`: Settings UI with live search & filters.

## Core Patterns

### 1. Initiate OAuth Connection
```typescript
import { initiateComposioConnection } from "@/lib/composio";

const { redirectUrl } = await initiateComposioConnection(
  userId,
  "googlecalendar",
  "http://localhost:3000/dashboard/settings?connected=googlecalendar"
);
```

### 2. Execute Actions
```typescript
import { executeComposioAction } from "@/lib/composio";

// Find calendar events
const events = await executeComposioAction(userId, "GOOGLECALENDAR_FIND_EVENTS", {
  timeMin: new Date().toISOString(),
  maxResults: 10,
});

// Send Gmail email
await executeComposioAction(userId, "GMAIL_SEND_MESSAGE", {
  recipientEmail: "client@example.com",
  subject: "Meeting Follow-up",
  body: "Thank you for meeting with us today.",
});

// Post Slack notification
await executeComposioAction(userId, "SLACK_SEND_MESSAGE", {
  channel: "#advisory-alerts",
  text: "High priority client review scheduled.",
});
```

## Supported Apps in Workspace
- **Calendar**: Google Calendar, Outlook Calendar, Calendly, Cal.com
- **Email**: Gmail, Outlook, SendGrid, Mailchimp
- **CRM**: Salesforce Financial Services, HubSpot, Wealthbox, Redtail, Zoho, Pipedrive
- **Communication**: Slack, Microsoft Teams, Discord, Twilio SMS, WhatsApp
- **Storage**: Google Drive, OneDrive, Dropbox, Box, Notion, DocuSign
- **Productivity**: Google Sheets, Airtable, Linear, Asana, Monday.com, ClickUp, Jira, Trello
- **Finance**: QuickBooks Online, Xero, Stripe, Plaid
