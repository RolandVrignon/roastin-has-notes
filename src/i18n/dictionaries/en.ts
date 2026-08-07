import type { Dictionary } from "@/i18n/types";

const dictionary = {
  languageName: "English",
  common: {
    skipToContent: "Skip to content", language: "Language", close: "Close", back: "Back", continue: "Continue",
    createReport: "Roast my chat", myReports: "My reports", privacy: "Privacy", terms: "Terms", help: "Help",
    contact: "Contact", deleteData: "Delete my data", adultOnly: "18+ only",
  },
  seo: {
    title: "Roastin Has Notes — Your group chat, unfiltered",
    description: "Upload a WhatsApp conversation and get a private, oddly accurate report about the habits and dynamics in your chat.",
  },
  nav: { how: "How it works", data: "Your data", faq: "FAQ" },
  landing: {
    eyebrow: "The group chat report", titleBefore: "Your chat has", titleAccent: "secrets.", titleAfter: "Roastin has notes.",
    subtitle: "Upload a WhatsApp conversation. Get the unfiltered, weirdly accurate report nobody in the chat would dare to write.",
    privacyNote: "Your original chat is not kept after generation", trust: ["WhatsApp verified", "Private by default", "Ready in minutes"],
    ticker: ["Nobody asked.", "Roastin answered.", "The receipts are in."],
    howEyebrow: "Ridiculously easy", howTitle: "From group chat to main event", howText: "No questionnaires. No awkward quizzes. Roastin works with what your group already said.",
    steps: [
      { title: "Drop the receipts", text: "Export your WhatsApp chat and upload the .txt or .zip file." },
      { title: "Roastin takes notes", text: "He spots recurring patterns and writes a report grounded in the conversation." },
      { title: "Read, gasp, share", text: "Get portraits, awards, inside jokes and a verdict made for your group." },
    ],
    reportEyebrow: "A report only your chat could make", reportTitle: "Generic personality tests could never.",
    reportText: "Every observation is grounded in visible patterns: who starts the plans, who ghosts them and who has exactly one reaction emoji.",
    features: ["Participant portraits", "Group awards", "Your private dictionary", "Hidden dynamics", "Green, yellow & red flags", "Predicted reactions"],
    privacyEyebrow: "Your chat stays yours", privacyTitle: "The tea is hot. Our raw-chat storage isn’t.",
    privacyText: "We need the conversation to create the report. It is encrypted in temporary storage during generation, never saved to our application database, and deleted when processing ends.",
    privacyCards: [
      { title: "Processed for one purpose", text: "The conversation is used to generate your report." },
      { title: "Original not kept", text: "The raw upload is discarded after the generation request ends." },
      { title: "Report stays private", text: "The derived report is stored so you can return to it, and you can delete it." },
    ],
    faqEyebrow: "Before you hand over the gossip", faqTitle: "Fair questions.",
    faqs: [
      { question: "Do you keep my conversation?", answer: "We do not save the original export in our application database. It is processed to create the report, then discarded. The derived report remains private until you delete it." },
      { question: "Will people in my chat know?", answer: "Only if you tell them. Reports are private by default. A separate sharing link can be revoked." },
      { question: "Is it mean?", answer: "Roastin targets repeated behaviours and group habits, never identity, appearance or sensitive traits." },
      { question: "What chats work best?", answer: "Active groups with several participants work best, but couples, best friends, families and teams can work too." },
    ],
    finalTitle: "Your group chat already wrote the material.", finalText: "Roastin is just brave enough to say it out loud.", finalCta: "Hand over the receipts",
  },
  onboarding: {
    step: "Step", of: "of", back: "Back", continue: "Continue", close: "Close",
    errors: {
      format: "Choose a WhatsApp .txt export or its .zip archive.", size: "This beta accepts conversations up to 2 MB.",
      archive: "This archive does not contain a readable WhatsApp text export.", short: "We could not find enough messages. Choose an unedited WhatsApp text export.",
      generation: "The report could not be created. Please try again.",
    },
    types: {
      eyebrow: "Set the scene", title: "What kind of chat are we dealing with?", text: "Different groups have different laws of physics. This helps Roastin read the room.",
      options: {
        friends: { label: "Friends group", detail: "The beautiful chaos" }, partner: { label: "Partner or crush", detail: "Read at your own risk" },
        "best-friend": { label: "Best friend", detail: "A two-person institution" }, family: { label: "Family", detail: "Generational lore included" },
        work: { label: "Work or team", detail: "Professionally unprofessional" }, other: { label: "Something else", detail: "Roastin will figure it out" },
      },
    },
    context: { eyebrow: "Optional context", title: "Anything Roastin should know?", text: "A sentence is enough. Skip this if the messages speak for themselves.", placeholder: "We have known each other since university, and every holiday plan becomes a six-week negotiation…" },
    upload: {
      eyebrow: "The receipts", title: "Drop your WhatsApp export.", text: "Choose the .txt file or .zip archive from an export without media. Parsing happens in your browser before anything is sent.",
      choose: "Choose your .txt or .zip export", limits: "Maximum 2 MB · No media files", messages: "messages", participants: "participants",
      replace: "Choose a different file", privacy: "Original chat discarded after generation", sample: "Try the sample chat instead",
    },
    review: { eyebrow: "Cast of characters", title: "Make sure we got the room right.", text: "Use first names or nicknames. These are the names that will appear in your report.", chatName: "Chat name", participantName: "Display name", invalidNames: "Each participant needs a unique first name or nickname." },
    launch: {
      ready: "Roastin is ready for", messages: "messages", protagonists: "protagonists", warning: "Absolutely no idea what they are about to learn.",
      cards: ["Patterns", "Portraits", "Verdict"],
      consent: "I confirm that I am 18+, that this conversation does not involve minors, and that I consent to its temporary processing to create the report.",
      loading: "Reading between the lines. This can take a minute…", cta: "Let Roastin cook",
    },
  },
  pages: {
    privacy: {
      eyebrow: "Privacy", title: "What we process, keep and delete", intro: "This plain-language notice describes the product as it works today. It is not a promise that we store nothing.",
      sections: [
        { title: "The original conversation", paragraphs: ["Your browser reads the export locally for the initial summary. When you request a report, the conversation is sent over HTTPS, cleaned of obvious email addresses and phone numbers, encrypted with AES-256-GCM in temporary storage, and processed by our worker and configured AI provider.", "The encrypted payload is excluded from the application database and backups. It is deleted after success, failure or cancellation, with an automatic 24-hour expiry as a final safety net. We ask the AI provider not to use the request for data collection, but its own processing terms still apply."] },
        { title: "What we keep", paragraphs: ["We store the derived report, its preview, chat name, language, aggregate message and participant counts, creation dates, model identifier and a record that raw processing finished."], bullets: ["A short-lived authenticated session token, stored as a one-way hash", "Your verified WhatsApp number encrypted at rest, a blind index, consent time and short-lived login codes", "Stripe checkout and payment references", "Revocable share and delivery links", "WhatsApp template, provider message ID and delivery status"] },
        { title: "Why and for how long", paragraphs: ["We use these data to create and deliver the service, secure access, fulfil purchases, prevent abuse and meet accounting or legal duties. Reports remain available until you delete them. Login sessions currently expire after 30 days and delivery links after 7 days. Payment records may need to remain for legal and accounting reasons."], bullets: ["A final retention period for encrypted WhatsApp delivery numbers is not yet configured; you can remove that number immediately from the report.", "Operational logs must not contain chat messages, but hosting and providers may retain technical request metadata under their own policies."] },
        { title: "Your choices", paragraphs: ["You can delete a report from its private page, revoke sharing links, and remove WhatsApp delivery data. For account access, correction, export or deletion requests, use the contact page. Some transaction records may be retained where the law requires it."] },
        { title: "Processors and international transfers", paragraphs: ["Depending on enabled features, data can be processed by our hosting and database providers, OpenRouter and the selected model provider, Stripe, and Meta for WhatsApp authentication and transactional delivery. Their locations and safeguards must be documented before public launch."] },
        { title: "Launch status", paragraphs: ["The legal entity acting as data controller, its postal address, privacy contact, jurisdiction-specific legal bases and definitive retention schedule are not yet configured. This service should not be presented as legally launch-ready until those details and the treatment of non-user participants have been reviewed by counsel."] },
      ],
    },
    terms: {
      eyebrow: "Terms", title: "Rules for using Roastin", intro: "These beta terms explain the product boundaries. Final company and jurisdiction details are still required before commercial launch.",
      sections: [
        { title: "Who may use it", paragraphs: ["You must be at least 18. Do not upload conversations involving minors. You must have a lawful basis and any permission required to process and share the conversation."] },
        { title: "Acceptable use", paragraphs: ["Do not use Roastin to harass, threaten, discriminate, expose private contact details, make high-stakes decisions or analyse unlawful content. Do not try to bypass access controls or disrupt the service."] },
        { title: "The report", paragraphs: ["Reports are automated entertainment based on observable message patterns. They may be inaccurate and are not psychological, medical, legal, employment or relationship advice. Review a report before sharing it."] },
        { title: "Purchases", paragraphs: ["A report is a one-time digital purchase through Stripe. The price and currency shown at checkout apply. Refund, withdrawal and tax terms must be completed for each launch market before paid public release."] },
        { title: "Availability and liability", paragraphs: ["The beta may change, fail or be withdrawn. Nothing here excludes rights or liability that cannot legally be excluded. Final governing law, company identity and dispute terms are still pending legal review."] },
      ],
    },
    help: {
      eyebrow: "Help", title: "Get a clean export and a better report", intro: "The quickest answers for importing, privacy, access and sharing.",
      sections: [
        { title: "Export from WhatsApp", paragraphs: ["Open the chat, choose Export chat, select Without media, then upload the resulting .txt or .zip file. The current beta accepts files up to 2 MB."] },
        { title: "Import problems", paragraphs: ["Use an original WhatsApp text export with at least two participants and eight messages. Do not paste screenshots, PDFs or media archives. International date formats are supported, but unusual custom exports may fail."] },
        { title: "Privacy and safety", paragraphs: ["The original export is not stored in our application database. Reports are private by default. The product refuses conversations that appear to involve minors and removes obvious email addresses and phone numbers before AI generation."] },
        { title: "Access and sharing", paragraphs: ["Sign in with your verified WhatsApp number to create and recover reports. After payment, the private seven-day report link is sent automatically to that number. Separate sharing links remain revocable."] },
      ],
    },
    contact: {
      eyebrow: "Contact", title: "Talk to a human", intro: "For product help, privacy requests or security reports, use the official Roastin WhatsApp conversation. Include as little conversation content as possible.",
      sections: [
        { title: "Support", paragraphs: ["Send the report ID and a short description in the official Roastin WhatsApp conversation. Do not attach your chat export."] },
        { title: "Privacy requests", paragraphs: ["Start the message with “Privacy request”. We may need to verify that you control the WhatsApp account before acting. The response time and formal controller contact will be confirmed before public launch."] },
        { title: "Security", paragraphs: ["Start the message with “Security report” and avoid including exploitable details. The business WhatsApp support channel must be provisioned and monitored before launch."] },
      ],
    },
    delete: {
      eyebrow: "Delete data", title: "Remove your report or account", intro: "Report deletion is available from the private report page, and account-wide deletion is available from account settings.",
      sections: [
        { title: "Delete a report", paragraphs: ["Open the private report in the browser or account that owns it and choose Delete report. The report content and preview are cleared, and its sharing links stop working. Payment records can remain where legally required."] },
        { title: "Remove a WhatsApp number", paragraphs: ["On the paid report, remove WhatsApp delivery data. The encrypted number and its blind index are cleared and delivery links are revoked."] },
        { title: "Delete an account", paragraphs: ["Open Account settings while signed in with your verified WhatsApp number, then choose permanent deletion. Do not send the original conversation to support."] },
      ],
    },
  },
} satisfies Dictionary;

export default dictionary;
