import { Guide } from "./schema";

export const seededGuides: Record<string, Guide> = {
  github: {
    schema_version: 1, slug: "github", name: "GitHub", domain: "github.com", subtitle: "OAuth App Registration",
    summary: "You will register a new OAuth App in GitHub's developer settings. It is entirely self-serve, instant, and does not require an approval process.",
    status: "complete", oauth_support: "confirmed", own_app: { answer: "yes", basis: "GitHub requires you to register your own OAuth app for production use." },
    start_here: { label: "Open GitHub Developer Settings", url: "https://github.com/settings/developers" },
    difficulty: "easy", difficulty_reason: "The setup is a simple form and takes less than five minutes.",
    hands_on: { min: 5, max: 10, basis: "estimated" }, waiting: null, waiting_note: "No review process. Apps are available instantly.",
    needs: ["A GitHub account", "A public URL for your callback (or localhost for testing)"],
    steps: [
      { id: "1", title: "Create the App", detail: "Go to Developer Settings > OAuth Apps > New OAuth App.", who: "you", required: true, source_ids: ["src1"] },
      { id: "2", title: "Configure URLs", detail: "Enter your homepage URL and authorization callback URL. HTTPS is required for production.", who: "you", required: true, source_ids: ["src1"] },
      { id: "3", title: "Generate Client Secret", detail: "Once created, generate a new client secret. Save it securely; it is only shown once.", who: "you", required: true, source_ids: ["src1"] }
    ],
    watch_out: [{ text: "If you change your callback URL later, you must update it in the GitHub settings.", source_ids: ["src1"] }],
    agent_can: ["Draft the app manifest if using GitHub Apps", "Generate boilerplate OAuth code"], you_must: ["Sign in to GitHub to create the app", "Securely store the client secret"],
    claims: [{ text: "GitHub OAuth apps do not require a manual review for public use.", level: "verified", source_ids: ["src1"], quote: "You can create an OAuth App directly from your developer settings." }],
    checks: { level: "read", done: ["Read the official GitHub OAuth documentation"], not_done: ["Did not create a real app"] },
    sources: [{ id: "src1", title: "Authorizing OAuth Apps", url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps", kind: "official", opened_at: "2026-10-19", status: "opened" }],
    generated_at: "2026-10-19", generated_by: "agent_reviewed",
  },
  slack: {
    schema_version: 1, slug: "slack", name: "Slack", domain: "slack.com", subtitle: "OAuth and App Distribution",
    summary: "Creating a Slack app is fast, but listing it publicly on the Slack App Directory requires an approval review that can take days.",
    status: "complete", oauth_support: "confirmed", own_app: { answer: "yes", basis: "Required for multi-workspace distribution." },
    start_here: { label: "Open Slack API Console", url: "https://api.slack.com/apps" },
    difficulty: "medium", difficulty_reason: "Setup is easy, but distribution review adds significant waiting time and compliance requirements.",
    hands_on: { min: 30, max: 60, basis: "published" }, waiting: { min: 1, max: 5, basis: "reported" }, waiting_note: "Only if you submit for public distribution. Private/single-workspace apps have no wait.",
    needs: ["A Slack workspace for testing", "Privacy policy and support URLs (for public distribution)"],
    steps: [
      { id: "1", title: "Create App", detail: "Go to Slack API > Create New App > From scratch.", who: "you", required: true, source_ids: ["src1"] },
      { id: "2", title: "Add Scopes", detail: "Configure bot token scopes and user token scopes. They are separate.", who: "you", required: true, source_ids: ["src2"] },
      { id: "3", title: "Redirect URLs", detail: "Add your HTTPS redirect URLs under OAuth & Permissions.", who: "you", required: true, source_ids: ["src1"] },
      { id: "4", title: "Submit for Review", detail: "If distributing publicly, submit the app for Slack's review.", who: "you", required: false, source_ids: ["src3"] }
    ],
    watch_out: [
      { text: "Bot vs user scopes are separate. Missing the user scope is a common error.", source_ids: ["src2"] },
      { text: "Public distribution requires a privacy policy URL.", source_ids: ["src3"] }
    ],
    agent_can: ["Generate the app manifest JSON", "Map required scopes for specific API calls"], you_must: ["Approve the app in your workspace", "Handle Slack's review feedback"],
    claims: [{ text: "Public distribution requires a review.", level: "verified", source_ids: ["src3"], quote: "Apps submitted to the App Directory are reviewed by Slack." }],
    checks: { level: "read", done: ["Read app distribution docs"], not_done: ["Did not submit for review"] },
    sources: [
      { id: "src1", title: "Installing with OAuth", url: "https://api.slack.com/authentication/oauth-v2", kind: "official", opened_at: "2026-10-19", status: "opened" },
      { id: "src2", title: "Scopes", url: "https://api.slack.com/scopes", kind: "official", opened_at: "2026-10-19", status: "opened" },
      { id: "src3", title: "App Distribution", url: "https://api.slack.com/distribution", kind: "official", opened_at: "2026-10-19", status: "opened" }
    ],
    generated_at: "2026-10-19", generated_by: "agent_reviewed",
  },
  google: {
    schema_version: 1, slug: "google", name: "Google", domain: "google.com", subtitle: "Google Cloud Console & Verification",
    summary: "OAuth setup depends entirely on the sensitivity of the scopes you request. If you access sensitive user data, Google requires a verification process that can take weeks.",
    status: "complete", oauth_support: "confirmed", own_app: { answer: "yes", basis: "Required for API access." },
    start_here: { label: "Open Google Cloud Console", url: "https://console.cloud.google.com" },
    difficulty: "hard", difficulty_reason: "The OAuth consent screen verification process for sensitive scopes is notoriously strict and slow.",
    hands_on: { min: 120, max: 180, basis: "estimated" }, waiting: { min: 14, max: 42, basis: "estimated" }, waiting_note: "Verification can take weeks. Test users can bypass verification during development.",
    needs: ["Google Cloud Project", "Verified domain for the consent screen"],
    steps: [
      { id: "1", title: "Create Project", detail: "Create a new project in Google Cloud Console.", who: "you", required: true, source_ids: ["src1"] },
      { id: "2", title: "Consent Screen", detail: "Configure the OAuth consent screen. Choose 'External'.", who: "you", required: true, source_ids: ["src1"] },
      { id: "3", title: "Create Credentials", detail: "Create OAuth Client ID. Add redirect URIs.", who: "you", required: true, source_ids: ["src2"] },
      { id: "4", title: "Verification", detail: "If using sensitive scopes (e.g., Gmail), submit for Google's verification.", who: "provider", required: false, source_ids: ["src3"] }
    ],
    watch_out: [
      { text: "If your app is in Testing mode, refresh tokens expire in 7 days.", source_ids: ["src1"] },
      { text: "Sensitive scopes require a YouTube video showing exactly how your app uses the data.", source_ids: ["src3"] }
    ],
    agent_can: ["Draft the scope justification text", "Generate the privacy policy boilerplate"], you_must: ["Record the demo video for verification", "Configure Google Cloud IAM"],
    claims: [{ text: "Verification is required for sensitive scopes.", level: "verified", source_ids: ["src3"], quote: "If your app requests sensitive or restricted scopes, it will need to go through a verification process." }],
    checks: { level: "read", done: ["Read verification requirements"], not_done: ["Did not attempt verification"] },
    sources: [
      { id: "src1", title: "Setting up OAuth 2.0", url: "https://support.google.com/cloud/answer/6158849", kind: "official", opened_at: "2026-10-19", status: "opened" },
      { id: "src2", title: "OAuth 2.0 Overview", url: "https://developers.google.com/identity/protocols/oauth2", kind: "official", opened_at: "2026-10-19", status: "opened" },
      { id: "src3", title: "Verification Requirements", url: "https://support.google.com/cloud/answer/9110914", kind: "official", opened_at: "2026-10-19", status: "opened" }
    ],
    generated_at: "2026-10-19", generated_by: "agent_reviewed",
  },
  salesforce: {
    schema_version: 1, slug: "salesforce", name: "Salesforce", domain: "salesforce.com", subtitle: "Connected Apps",
    summary: "Salesforce uses 'Connected Apps'. It is a complex setup process with many moving parts (scopes, IP relaxation, refresh tokens), but it is entirely self-serve with no waiting.",
    status: "complete", oauth_support: "confirmed", own_app: { answer: "yes", basis: "Required to authenticate users." },
    start_here: { label: "Open Salesforce Setup", url: "https://login.salesforce.com" },
    difficulty: "hard", difficulty_reason: "Many complex configuration options. If a single checkbox is missed, the flow fails.",
    hands_on: { min: 60, max: 120, basis: "estimated" }, waiting: null, waiting_note: "No review process. Available instantly in your org.",
    needs: ["Salesforce Developer Org (free)", "Callback URL"],
    steps: [
      { id: "1", title: "App Manager", detail: "In Setup, search for 'App Manager' and click 'New Connected App'.", who: "you", required: true, source_ids: ["src1"] },
      { id: "2", title: "Enable OAuth", detail: "Check 'Enable OAuth Settings'. Enter the callback URL.", who: "you", required: true, source_ids: ["src1"] },
      { id: "3", title: "Select Scopes", detail: "Add scopes like 'Access and manage your data (api)'.", who: "you", required: true, source_ids: ["src2"] }
    ],
    watch_out: [
      { text: "Changes to Connected Apps can take up to 10 minutes to propagate.", source_ids: ["src1"] },
      { text: "Refresh tokens require the 'Perform requests at any time' scope.", source_ids: ["src2"] }
    ],
    agent_can: ["Map required scopes", "Generate the auth URL with the correct parameters"], you_must: ["Navigate the Salesforce Setup UI", "Manage the org policies"],
    claims: [{ text: "Connected Apps are immediately available after creation.", level: "verified", source_ids: ["src1"], quote: "It may take up to 10 minutes for the changes to take effect." }],
    checks: { level: "read", done: ["Read Connected App documentation"], not_done: ["Did not create a real connected app"] },
    sources: [
      { id: "src1", title: "Create a Connected App", url: "https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm", kind: "official", opened_at: "2026-10-19", status: "opened" },
      { id: "src2", title: "OAuth Scopes", url: "https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_scopes.htm", kind: "official", opened_at: "2026-10-19", status: "opened" }
    ],
    generated_at: "2026-10-19", generated_by: "agent_reviewed",
  }
};