export type ContentPage = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>;
};

export type Dictionary = {
  languageName: string;
  common: {
    skipToContent: string;
    language: string;
    close: string;
    back: string;
    continue: string;
    createReport: string;
    myReports: string;
    privacy: string;
    terms: string;
    help: string;
    contact: string;
    deleteData: string;
    adultOnly: string;
  };
  seo: { title: string; description: string };
  nav: { how: string; data: string; faq: string };
  landing: {
    eyebrow: string;
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    subtitle: string;
    privacyNote: string;
    trust: string[];
    ticker: string[];
    howEyebrow: string;
    howTitle: string;
    howText: string;
    steps: Array<{ title: string; text: string }>;
    reportEyebrow: string;
    reportTitle: string;
    reportText: string;
    features: string[];
    privacyEyebrow: string;
    privacyTitle: string;
    privacyText: string;
    privacyCards: Array<{ title: string; text: string }>;
    faqEyebrow: string;
    faqTitle: string;
    faqs: Array<{ question: string; answer: string }>;
    finalTitle: string;
    finalText: string;
    finalCta: string;
  };
  onboarding: {
    step: string;
    of: string;
    back: string;
    continue: string;
    close: string;
    errors: { format: string; size: string; archive: string; short: string; generation: string };
    types: {
      eyebrow: string;
      title: string;
      text: string;
      options: Record<"friends" | "partner" | "best-friend" | "family" | "work" | "other", { label: string; detail: string }>;
    };
    context: { eyebrow: string; title: string; text: string; placeholder: string };
    upload: {
      eyebrow: string;
      title: string;
      text: string;
      choose: string;
      limits: string;
      messages: string;
      participants: string;
      replace: string;
      privacy: string;
      sample: string;
    };
    review: { eyebrow: string; title: string; text: string; chatName: string; participantName: string; invalidNames: string };
    launch: {
      ready: string;
      messages: string;
      protagonists: string;
      warning: string;
      cards: string[];
      consent: string;
      loading: string;
      cta: string;
    };
  };
  pages: {
    privacy: ContentPage;
    terms: ContentPage;
    help: ContentPage;
    contact: ContentPage;
    delete: ContentPage;
  };
};
