

## AI Assistant for Partnership Updates

Add a conversational AI prompt box to the Partnership Updates page that lets you ask natural language questions about your emails, Slack messages, and deals.

### What You'll Get

A collapsible chat panel at the top of the Partnership Updates page with:
- A text input where you type questions like "What brands have replied in the past two weeks that I still need to follow up with?"
- Streaming AI responses that appear in real-time
- The AI has access to your synced emails, Slack messages, and deal data to answer intelligently

### Example Queries It Can Handle
- "Look at my draft emails and compile a list of any that mention 'new talent'"
- "What brands have replied to me in the past two weeks that I still need to follow up with?"
- "Summarize all updates about [talent name] this week"
- "Which deals are stalled with no recent activity?"

### How It Works

1. You type a question in the prompt box
2. A backend function queries your `talent_updates` and `deals` tables for relevant data
3. That data is sent to the AI along with your question
4. The AI analyzes the data and streams back a useful answer

---

### Technical Details

**New Edge Function: `supabase/functions/email-agent/index.ts`**
- Accepts the user's natural language query + auth token
- Queries `talent_updates` (emails, Slack messages) and `deals` tables for recent data
- Sends the data context + user question to Lovable AI (Gemini Flash) for analysis
- Streams the response back via SSE for real-time rendering
- Handles 429/402 rate limit errors gracefully

**New Hook: `src/hooks/useEmailAgent.ts`**
- Manages chat state (messages, loading, streaming)
- Handles SSE streaming with token-by-token rendering
- Exposes a `sendQuery(text)` function

**New Component: `src/components/EmailAgentChat.tsx`**
- Collapsible panel with a text input and submit button
- Displays conversation history with markdown rendering
- Shows streaming responses as they arrive
- Includes example query chips for quick access

**Updated: `src/pages/PartnershipUpdates.tsx`**
- Adds the `EmailAgentChat` component between the header and the Talent Canvases section

**Updated: `supabase/config.toml`**
- Registers the new `email-agent` function with `verify_jwt = false`

**Dependencies:**
- Will add `react-markdown` for rendering AI responses with proper formatting
- Uses existing `LOVABLE_API_KEY` (already configured) -- no new secrets needed
