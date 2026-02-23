import Link from "next/link";

const baseUrl = "https://wa-api.me/api";

export default function DocumentationPage() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[260px,1fr] md:py-14">

        <div>
          <p className="mb-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
            WA-API Reference
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">API Documentation</h1>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground md:text-base">
            Full examples for MCP integration, sending WhatsApp messages (text/template/media/document),
            and OTP delivery.
          </p>

          <div className="mt-8 space-y-6">
            <article id="auth" className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">Authentication</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every API request needs Bearer token in headers.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`Authorization: Bearer YOUR_API_TOKEN`}
              </pre>
            </article>

            <article id="mcp" className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">MCP Server</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add this in your MCP client config to connect WA API MCP server.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`{
  "mcpServers": {
    "WA API MCP SERVER": {
      "url": "${baseUrl}/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_TOKEN"
      }
    }
  }
}`}
              </pre>
              <p className="mt-4 text-sm text-muted-foreground">
                Endpoint: <code>POST {baseUrl}/mcp</code>
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`curl -X POST "${baseUrl}/mcp" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
              </pre>
            </article>

            <article id="send-message" className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">Send Message API</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this endpoint for text, template, media, and document messages.
              </p>
              <div className="mt-3 rounded-lg bg-muted p-4 text-sm text-emerald-600 dark:text-emerald-600">
                <span className="font-medium">POST</span> <code>{baseUrl}/wa-accounts/messages</code>
              </div>
            </article>

            <article id="message-text" className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Text Example</h3>
              <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`curl -X POST "${baseUrl}/wa-accounts/messages" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "participants": [{ "number": "919876543210" }],
    "messageType": "text",
    "message": "Hello from WA-API"
  }'`}
              </pre>
            </article>

            <article id="message-template" className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Template Example</h3>
              <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`curl -X POST "${baseUrl}/wa-accounts/messages" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "participants": [{ "number": "919876543210" }],
    "messageType": "template",
    "template": {
      "name": "auth_otp",
      "language": { "code": "en" },
      "components": [
        {
          "type": "body",
          "parameters": [{ "type": "text", "text": "482901" }]
        }
      ]
    }
  }'`}
              </pre>
            </article>

            <article id="message-media" className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Media Example (Image/Video/Audio)</h3>
              <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`curl -X POST "${baseUrl}/wa-accounts/messages" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "participants": [{ "number": "919876543210" }],
    "messageType": "media",
    "media": {
      "mediaType": "IMAGE",
      "link": "https://example.com/product.jpg",
      "caption": "Latest offer"
    }
  }'`}
              </pre>
            </article>

            <article id="message-document" className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Document Example</h3>
              <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`curl -X POST "${baseUrl}/wa-accounts/messages" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "participants": [{ "number": "919876543210" }],
    "messageType": "media",
    "media": {
      "mediaType": "DOCUMENT",
      "link": "https://example.com/invoice.pdf",
      "filename": "invoice.pdf",
      "caption": "Your invoice"
    }
  }'`}
              </pre>
            </article>

            <article id="send-otp" className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">Send OTP API</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Send OTP using default <code>auth_otp</code> template or pass custom template name/language.
              </p>
              <div className="mt-3 rounded-lg bg-muted p-4 text-sm text-emerald-600 dark:text-emerald-600">
                <span className="font-medium">POST</span> <code>{baseUrl}/wa-accounts/messages/send-otp</code>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-xs bg-gray-100 dark:bg-black text-emerald-600 dark:text-emerald-600">
{`curl -X POST "${baseUrl}/wa-accounts/messages/send-otp" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "919876543210",
    "code": "482901",
    "templateName": "auth_otp",
    "language": "en"
  }'`}
              </pre>
            </article>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Need API token? Open{" "}
            <Link href="/dashboard/ai" className="font-medium text-emerald-600 hover:underline">
              API Token Management
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
