import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing seed data
  await prisma.notification.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.pricingRule.deleteMany()
  await prisma.service.deleteMany()
  await prisma.businessConfig.deleteMany()
  await prisma.user.deleteMany({ where: { email: 'admin@quoteflow.demo' } })

  // Create user
  const passwordHash = await bcrypt.hash('demo1234', 12)
  const user = await prisma.user.create({
    data: {
      email: 'admin@quoteflow.demo',
      name: 'Alex Rivera',
      passwordHash,
    },
  })
  console.log('✅ Created user:', user.email)

  // Create business config
  const business = await prisma.businessConfig.create({
    data: {
      userId: user.id,
      name: 'Artisan Web Studio',
      brandColor: '#6366f1',
      ownerEmail: 'admin@quoteflow.demo',
      websiteUrl: 'https://artisanwebstudio.com',
      notifyOnEveryLead: true,
      notifyOnHighUrgency: true,
      digestFrequency: 'instant',
    },
  })
  console.log('✅ Created business:', business.name)

  // Service 1: Landing Page Design
  const landingPageService = await prisma.service.create({
    data: {
      businessConfigId: business.id,
      name: 'Landing Page Design',
      questions: [
        'What is your business name and what do you sell?',
        'Do you have existing branding (logo, colors, fonts)?',
        'What is the primary goal of this landing page?',
        'Do you need copywriting or will you provide the text?',
        'What is your ideal launch timeline?',
      ],
      isActive: true,
      order: 0,
      pricingRules: {
        create: [
          { tierLabel: 'Basic', minPrice: 400, maxPrice: 700, triggerKeyword: 'simple' },
          { tierLabel: 'Standard', minPrice: 800, maxPrice: 1200, triggerKeyword: 'standard' },
          { tierLabel: 'Premium', minPrice: 1400, maxPrice: 2000, triggerKeyword: 'complex' },
        ],
      },
    },
  })
  console.log('✅ Created service:', landingPageService.name)

  // Service 2: Full Website Build
  const websiteService = await prisma.service.create({
    data: {
      businessConfigId: business.id,
      name: 'Full Website Build',
      questions: [
        'How many pages does your site need?',
        'Do you need a blog or content management system?',
        'Will you need e-commerce or payment functionality?',
        'Do you have a brand identity ready to use?',
        'What is your budget range and timeline?',
      ],
      isActive: true,
      order: 1,
      pricingRules: {
        create: [
          { tierLabel: 'Starter', minPrice: 1500, maxPrice: 2500, triggerKeyword: 'small' },
          { tierLabel: 'Business', minPrice: 3000, maxPrice: 5000, triggerKeyword: 'medium' },
          { tierLabel: 'Enterprise', minPrice: 6000, maxPrice: 10000, triggerKeyword: 'large' },
        ],
      },
    },
  })
  console.log('✅ Created service:', websiteService.name)

  // Create leads
  const leads = [
    {
      serviceId: landingPageService.id,
      prospectName: 'Sara Malik',
      prospectEmail: 'sara@malik.dev',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'I run Sara Malik Consulting — I help early-stage startups with go-to-market strategy and fundraising prep.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Yes, I have a full brand kit: logo in SVG, primary color #2563EB, using Inter font.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Lead capture — I want visitors to book a 30-minute discovery call through a Calendly embed.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I\'ll provide all the copy. I\'ve already drafted the hero, about, and services sections.' },
        { question: 'What is your ideal launch timeline?', answer: 'I need this live in 3 weeks for a speaking event where I\'ll be driving traffic to it.' },
      ],
      aiSummary: 'Sara Malik needs a conversion-focused single-page site for her startup consulting practice, centered on booking discovery calls via Calendly, with brand assets and copy fully ready. The scope is standard complexity — one page, clear CTA, existing assets — though the 3-week deadline is tight and leaves little room for revision cycles. Confirm timeline feasibility immediately and schedule a kickoff call within 48 hours to lock design direction before development begins.',
      quoteMin: 800,
      quoteMax: 1200,
      urgencyFlag: 'HIGH' as const,
      status: 'CONTACTED' as const,
      emailSent: true,
    },
    {
      serviceId: websiteService.id,
      prospectName: 'James Obi',
      prospectEmail: 'james@obi.co',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'Around 8 pages: home, about, services (3 sub-pages), portfolio, blog, and contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes, a blog is essential. I want to publish weekly articles and need an easy editor — nothing too technical.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'Not initially, but I may want to sell a course in 6 months, so keeping that option open would be great.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Partially — I have a logo but no full style guide. Colors and typography need to be developed.' },
        { question: 'What is your budget range and timeline?', answer: 'Budget is flexible between $3,000–5,000. Timeline is 6–8 weeks, no hard deadline.' },
      ],
      aiSummary: 'James Obi needs a mid-size 8-page website for his professional services business with a CMS blog and forward-compatible architecture for future e-commerce. Scope is medium complexity — the missing brand style guide adds design work upfront and the future e-commerce requirement means the tech stack must be chosen carefully now. Send a proposal within 5 business days covering CMS options (Sanity or Contentful recommended) and a phased roadmap that includes e-commerce readiness.',
      quoteMin: 3000,
      quoteMax: 5000,
      urgencyFlag: 'LOW' as const,
      status: 'NEW' as const,
      emailSent: true,
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Priya Nair',
      prospectEmail: 'priya@nair.io',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Nair Photography — I do wedding and portrait photography in the Austin area.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'I have a logo but it\'s pretty basic. I\'m open to keeping it or refreshing it slightly.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Showcase my portfolio and let people contact me to inquire about bookings.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I\'ll provide the text — I just need help with layout and making it look professional.' },
        { question: 'What is your ideal launch timeline?', answer: 'Whenever works, no rush. Maybe within the next 2 months?' },
      ],
      aiSummary: 'Priya Nair needs a simple portfolio landing page for her Austin photography business with a contact/inquiry form — straightforward scope with all content provided by the client. Low complexity and no deadline pressure make this a good fit for a templated approach with light customization. Schedule a portfolio review call to select 8–12 hero images and confirm the inquiry form requirements before starting design.',
      quoteMin: 400,
      quoteMax: 700,
      urgencyFlag: 'LOW' as const,
      status: 'CLOSED' as const,
      emailSent: true,
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Tom Walsh',
      prospectEmail: 'tom@walsh.net',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'We\'re thinking 15–20 pages covering our full product line, regional offices, case studies, and a careers section.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes — our marketing team needs full CMS control. We publish 3–4 pieces of content per week and can\'t rely on developers for updates.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'Yes, we take enterprise software license payments online — currently about $50K/month in volume. Security and reliability are critical.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'We have a complete brand guide, approved asset library, and legal sign-off on all materials.' },
        { question: 'What is your budget range and timeline?', answer: 'Budget is approved up to $10,000. We have a board presentation in 10 weeks and the site must be live before then.' },
      ],
      aiSummary: 'Tom Walsh needs a large-scale enterprise website (15–20 pages) with a robust CMS, integrated e-commerce handling $50K+/month in transaction volume, and a hard 10-week deadline tied to a board presentation. This is high-complexity, high-stakes work with significant technical risk if e-commerce security or CMS architecture is underspecified. Prioritize a technical scoping call this week to validate payment provider options (Stripe recommended), CMS selection, and hosting infrastructure before submitting a formal SOW.',
      quoteMin: 6000,
      quoteMax: 10000,
      urgencyFlag: 'HIGH' as const,
      status: 'NEW' as const,
      emailSent: true,
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Lena Choi',
      prospectEmail: 'lena@choi.design',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Choi Design Studio — I\'m a freelance UX/UI designer offering design audits, workshops, and ongoing design partnerships.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Yes — my brand is very refined. I\'ve got a full Figma brand system ready to hand off.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Position myself as a premium design partner for Series A–C startups and book discovery calls.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I\'ll provide the copy — I\'ve already had it reviewed by a copywriter.' },
        { question: 'What is your ideal launch timeline?', answer: 'About 4 weeks. I\'m raising my rates next month and want the new site live first.' },
      ],
      aiSummary: 'Lena Choi needs a polished premium landing page for her UX/UI design studio targeting funded startups, with professional copy and Figma brand assets fully prepared. Scope is standard complexity — single page, clear positioning, strong asset quality — though her design expertise means she\'ll have high expectations for pixel-perfect execution. Assign your most experienced designer to this project and plan for an extra round of design revisions before development handoff.',
      quoteMin: 800,
      quoteMax: 1200,
      urgencyFlag: 'LOW' as const,
      status: 'ARCHIVED' as const,
      emailSent: true,
    },
  ]

  function daysAgo(n: number) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d
  }

  // Assign spread dates to original 5 leads
  const leadDates = [2, 5, 8, 11, 15]
  for (let i = 0; i < leads.length; i++) {
    const leadData = leads[i]
    const lead = await prisma.lead.create({
      data: {
        businessConfigId: business.id,
        ...leadData,
        createdAt: daysAgo(leadDates[i]),
      },
    })
    console.log('✅ Created lead:', lead.prospectName)
  }

  // 15 additional leads spread across last 30 days
  const additionalLeads = [
    {
      serviceId: landingPageService.id,
      prospectName: 'Marcus Chen',
      prospectEmail: 'marcus@chenstudio.io',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Chen Creative Studio — I provide brand identity and visual design services for tech startups.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'I have a full brand system already. Colors, typography, logo variations — all ready to hand off.' },
        { question: 'What is the primary goal of this landing page?', answer: 'To position me as a premium brand partner and book strategy calls with Series A founders.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'Copy is done — reviewed by a professional copywriter last month.' },
        { question: 'What is your ideal launch timeline?', answer: 'Two weeks. I have a conference coming up where I want the site live.' },
      ],
      aiSummary: 'Marcus Chen needs a premium landing page for his design studio, targeting funded startups, with all assets and copy prepared. Scope is standard with a tight 2-week deadline that requires immediate kickoff. Prioritize design review call within 48 hours to lock direction before development.',
      quoteMin: 800,
      quoteMax: 1200,
      urgencyFlag: 'HIGH' as const,
      status: 'CONTACTED' as const,
      emailSent: true,
      createdAt: daysAgo(1),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Rachel Torres',
      prospectEmail: 'rachel@torreslaw.com',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'Around 6 pages: home, about, practice areas (3), and contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'Not initially. Maybe in phase 2 for legal articles.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'No payments — just a contact form and phone number.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Yes, I have a logo and a color palette from my business cards.' },
        { question: 'What is your budget range and timeline?', answer: 'Budget around $2,000–3,000. No hard deadline but prefer within 6 weeks.' },
      ],
      aiSummary: 'Rachel Torres needs a professional 6-page law firm website with a contact form and no CMS requirements. Scope is straightforward with existing brand assets and a flexible timeline. Standard legal industry presentation — prioritize trust signals, professional photography guidance, and clear practice area hierarchy.',
      quoteMin: 1500,
      quoteMax: 2500,
      urgencyFlag: 'LOW' as const,
      status: 'NEW' as const,
      emailSent: true,
      createdAt: daysAgo(3),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Devon Park',
      prospectEmail: 'devon@parkfitness.co',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Park Fitness — online personal training programs and 1-on-1 coaching for busy professionals.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Just a logo. No style guide. I like bold, energetic colors — think black and neon green.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Sell my 12-week transformation program. I want people to buy directly from the page.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I need help with copy. I have bullet points but nothing polished.' },
        { question: 'What is your ideal launch timeline?', answer: 'ASAP. I want to launch an ad campaign next month.' },
      ],
      aiSummary: 'Devon Park needs a conversion-focused fitness landing page with embedded purchase capability, copywriting assistance, and urgent turnaround. Scope is premium — missing brand system plus copywriting adds significant upfront work. Scope out copy and design separately and confirm whether payment is handled via Stripe embed or external platform before starting.',
      quoteMin: 1400,
      quoteMax: 2000,
      urgencyFlag: 'HIGH' as const,
      status: 'NEW' as const,
      emailSent: true,
      createdAt: daysAgo(4),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Isabel Fontaine',
      prospectEmail: 'isabel@fontaineconsulting.fr',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'About 5 pages — home, about, services overview, case studies, and contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes, case studies need to be updatable by my assistant without developer help.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'No, I invoice clients directly.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Yes — full brand book from a Paris agency. Very polished, Helvetica-based.' },
        { question: 'What is your budget range and timeline?', answer: '$3,000–5,000. Timeline is open but ideally within 2 months.' },
      ],
      aiSummary: 'Isabel Fontaine needs a 5-page consulting site with a simple CMS for case studies, backed by a premium Paris agency brand book. Scope is medium — CMS requirement adds architecture decisions but budget is adequate. Recommend Contentful or Sanity for the case studies layer and plan a handoff training session before launch.',
      quoteMin: 3000,
      quoteMax: 5000,
      urgencyFlag: 'LOW' as const,
      status: 'CLOSED' as const,
      emailSent: true,
      createdAt: daysAgo(6),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Aiden Marsh',
      prospectEmail: 'aiden@marshpodcast.com',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'The Marsh Report — a weekly business podcast. I sell sponsorship packages and a paid newsletter.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Yes — cover art and a defined color palette. Dark navy + orange accent.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Convert visitors into newsletter subscribers and show episode archive.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I will write the copy. I just need layout and implementation.' },
        { question: 'What is your ideal launch timeline?', answer: 'Within a month. Nothing urgent.' },
      ],
      aiSummary: 'Aiden Marsh needs a podcast landing page with newsletter signup and episode archive, built on existing brand assets and self-provided copy. Scope is basic — single-purpose conversion page with good content provided. Confirm newsletter platform (Substack, ConvertKit, Beehiiv) to plan embed approach before starting.',
      quoteMin: 400,
      quoteMax: 700,
      urgencyFlag: 'LOW' as const,
      status: 'CONTACTED' as const,
      emailSent: true,
      createdAt: daysAgo(7),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Natasha Ivanova',
      prospectEmail: 'natasha@ivanovaarch.com',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'Portfolio site — home, about, projects (maybe 20 case studies), process, and contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes — I need to add and manage projects myself. I publish 4–6 new projects per year.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'No.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Minimal branding — wordmark only. The work itself is the brand, very clean and architectural.' },
        { question: 'What is your budget range and timeline?', answer: '$4,000–7,000. No rush — quality over speed.' },
      ],
      aiSummary: 'Natasha Ivanova needs a portfolio-forward architecture site with CMS for ~20 project case studies, minimal branding, and high visual standards. Scope is medium-to-large — 20 case studies require a robust content model and image optimization strategy. Use Sanity with custom project schema and plan a photography brief since image quality will make or break the site.',
      quoteMin: 3000,
      quoteMax: 5000,
      urgencyFlag: 'LOW' as const,
      status: 'NEW' as const,
      emailSent: true,
      createdAt: daysAgo(9),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Brendan Osei',
      prospectEmail: 'brendan@oseiconsults.com',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Osei Consulting — HR strategy and talent acquisition for mid-market companies.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'I have a logo but no formal guide. I prefer clean, corporate, trustworthy.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Lead generation — get HR directors to book a discovery call.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I will provide the text but could use light editing.' },
        { question: 'What is your ideal launch timeline?', answer: 'Within 3 weeks — I have a referral network outreach campaign planned.' },
      ],
      aiSummary: 'Brendan Osei needs a B2B lead gen landing page targeting HR directors, with copy provided and a 3-week deadline. Scope is standard with the caveat that "light editing" is often heavier than clients expect — set clear revision scope boundaries upfront. Prioritize mobile responsiveness and a fast-loading hero section since decision-makers often review on mobile.',
      quoteMin: 800,
      quoteMax: 1200,
      urgencyFlag: 'HIGH' as const,
      status: 'ARCHIVED' as const,
      emailSent: true,
      createdAt: daysAgo(10),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Claire Dupont',
      prospectEmail: 'claire@dupontcreative.be',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: '4 pages: home, work, about, contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'No blog. Just static pages.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'No.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Yes — I am a graphic designer so I have everything: brand book, Figma files, all assets.' },
        { question: 'What is your budget range and timeline?', answer: '$1,500–2,500. I want this done in 3 weeks.' },
      ],
      aiSummary: 'Claire Dupont needs a minimal 4-page creative portfolio with full brand assets provided from a Figma-ready designer who will have high pixel-perfect expectations. Scope is small but execution bar is high — expect detailed feedback rounds. Budget is appropriate if scope stays to 4 static pages; any additions should trigger a change order.',
      quoteMin: 1500,
      quoteMax: 2500,
      urgencyFlag: 'HIGH' as const,
      status: 'CLOSED' as const,
      emailSent: true,
      createdAt: daysAgo(12),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Yusuf Al-Rashid',
      prospectEmail: 'yusuf@alrashidventures.ae',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Al-Rashid Ventures — real estate investment and property development in the GCC.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Yes — premium brand with Arabic and English lockups, gold and navy palette.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Attract HNW investors for a new fund launch. Very exclusive positioning.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'We will provide text but it needs translation/adaptation to English business tone.' },
        { question: 'What is your ideal launch timeline?', answer: 'We have an investor event in 6 weeks. Must be live 1 week before.' },
      ],
      aiSummary: 'Yusuf Al-Rashid needs a luxury real estate investment landing page targeting HNW investors with a strict 5-week deadline tied to a fund launch event. Scope is premium — the copy adaptation and exclusive positioning requirements demand a senior copywriter collaboration, not just implementation. Add copywriting coordination fee and confirm legal review timeline for investment-related content.',
      quoteMin: 1400,
      quoteMax: 2000,
      urgencyFlag: 'HIGH' as const,
      status: 'NEW' as const,
      emailSent: true,
      createdAt: daysAgo(13),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Mia Johansson',
      prospectEmail: 'mia@miawellness.se',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: '7 pages: home, about me, services (3), shop, blog, and contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes — weekly wellness articles are core to my content strategy.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'Yes — I sell digital guides ($29–$79) and online courses ($297).' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Yes — warm earth tones, sans-serif, natural photography. Figma brand doc ready.' },
        { question: 'What is your budget range and timeline?', answer: '$3,500–5,500. I want to launch in 8 weeks for spring season.' },
      ],
      aiSummary: 'Mia Johansson needs a 7-page wellness site with CMS blog, e-commerce for digital products and courses, and a spring launch in 8 weeks. Scope is medium-large — the e-commerce requirement needs a platform decision (Shopify section, WooCommerce, or Stripe embedded) that affects the entire architecture. Recommend a scoping call this week to lock tech stack before any design begins.',
      quoteMin: 3000,
      quoteMax: 5000,
      urgencyFlag: 'LOW' as const,
      status: 'CONTACTED' as const,
      emailSent: true,
      createdAt: daysAgo(16),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Finn O\'Sullivan',
      prospectEmail: 'finn@osullivanphotography.ie',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'O\'Sullivan Photography — commercial and editorial photography based in Dublin.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Just a wordmark. Clean and minimal. No colors beyond black and white.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Showcase portfolio and attract commercial clients — ad agencies, brands.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I\'ll provide text. Very minimal — photography speaks for itself.' },
        { question: 'What is your ideal launch timeline?', answer: 'End of next month at the latest.' },
      ],
      aiSummary: 'Finn O\'Sullivan needs a minimal portfolio landing page for commercial photography with sparse copy, black and white aesthetic, and high-resolution image showcase. Scope is basic but image optimization is critical — commercial photography files can be large and performance directly impacts client perception. Plan for WebP conversion and lazy loading from day one.',
      quoteMin: 400,
      quoteMax: 700,
      urgencyFlag: 'LOW' as const,
      status: 'CLOSED' as const,
      emailSent: true,
      createdAt: daysAgo(18),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Amara Diallo',
      prospectEmail: 'amara@diallocpa.com',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'About 8 pages: home, about the firm, services (4), resources, client portal link, contact.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes — quarterly tax updates and guides for small business clients.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'Not for the website but I need a link to my client invoice portal.' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Logo and business card design only. Colors are forest green and gold.' },
        { question: 'What is your budget range and timeline?', answer: '$2,500–4,000. 6–10 week timeline is fine.' },
      ],
      aiSummary: 'Amara Diallo needs an 8-page CPA firm site with a quarterly content CMS, external portal link, and partial brand assets. Scope is medium — the incomplete brand system adds design time, and CPA content requires careful compliance language review before publishing. Plan to include a brand extension deliverable in the proposal and set expectations about content review cycles.',
      quoteMin: 3000,
      quoteMax: 5000,
      urgencyFlag: 'LOW' as const,
      status: 'NEW' as const,
      emailSent: true,
      createdAt: daysAgo(20),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Hiro Tanaka',
      prospectEmail: 'hiro@tanakasaas.jp',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'TanakaSaaS — a B2B productivity tool for remote engineering teams. Monthly SaaS subscription.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Yes — product design system in Figma. Very clean, dark mode primary.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Drive trial signups. We want free trial CTA above the fold.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'We have a content team. Copy is done, just needs implementation.' },
        { question: 'What is your ideal launch timeline?', answer: 'We are mid-fundraise. Need this live in 10 days.' },
      ],
      aiSummary: 'Hiro Tanaka needs a SaaS trial landing page with 10-day turnaround driven by an active fundraise — the hardest deadline type because it is investor-facing. Assets are fully prepared. Scope is standard but the deadline is extreme — confirm team availability for full-time sprint before accepting and add a rush fee of 25–30%.',
      quoteMin: 800,
      quoteMax: 1200,
      urgencyFlag: 'HIGH' as const,
      status: 'CONTACTED' as const,
      emailSent: true,
      createdAt: daysAgo(22),
    },
    {
      serviceId: websiteService.id,
      prospectName: 'Valentina Greco',
      prospectEmail: 'valentina@grecorestaurants.it',
      intakeTranscript: [
        { question: 'How many pages does your site need?', answer: 'Home, menus (lunch/dinner/drinks), about, reservations, and contact. 5 pages.' },
        { question: 'Do you need a blog or content management system?', answer: 'Yes — seasonal menu updates at least 4 times per year.' },
        { question: 'Will you need e-commerce or payment functionality?', answer: 'Not payments — but a reservation widget (OpenTable or Resy embed).' },
        { question: 'Do you have a brand identity ready to use?', answer: 'Yes — Italian design studio did our brand. Very refined, serif type, cream and terracotta.' },
        { question: 'What is your budget range and timeline?', answer: '$2,000–3,500. Launch before summer season — about 8 weeks.' },
      ],
      aiSummary: 'Valentina Greco needs a refined restaurant website with seasonal menu CMS and reservation widget integration for a pre-summer launch. Scope is straightforward with strong brand assets — the main variable is reservation platform integration (OpenTable vs Resy embed differences). Confirm reservation provider and obtain API/embed credentials in the first week to avoid delays.',
      quoteMin: 1500,
      quoteMax: 2500,
      urgencyFlag: 'LOW' as const,
      status: 'ARCHIVED' as const,
      emailSent: true,
      createdAt: daysAgo(25),
    },
    {
      serviceId: landingPageService.id,
      prospectName: 'Kwame Asante',
      prospectEmail: 'kwame@asanteventures.gh',
      intakeTranscript: [
        { question: 'What is your business name and what do you sell?', answer: 'Asante Ventures — Pan-African startup accelerator. We invest in early-stage founders across Africa.' },
        { question: 'Do you have existing branding (logo, colors, fonts)?', answer: 'Yes — vibrant brand: Kente-inspired patterns, bold type, green, gold, and black.' },
        { question: 'What is the primary goal of this landing page?', answer: 'Applications for our next cohort. Drive form submissions from founders.' },
        { question: 'Do you need copywriting or will you provide the text?', answer: 'I will provide the text — mission-driven storytelling is very specific.' },
        { question: 'What is your ideal launch timeline?', answer: 'Applications open in 5 weeks. Site must be live 1 week before that.' },
      ],
      aiSummary: 'Kwame Asante needs a mission-driven accelerator landing page with a cohort application form, strong brand assets, and a 4-week deadline. Scope is standard but the cultural brand expression (Kente-inspired) requires a thoughtful implementation conversation — mishandling it would be worse than ignoring it. Plan a dedicated brand implementation review before development and confirm form backend for application submissions.',
      quoteMin: 800,
      quoteMax: 1200,
      urgencyFlag: 'HIGH' as const,
      status: 'NEW' as const,
      emailSent: true,
      createdAt: daysAgo(28),
    },
  ]

  for (const leadData of additionalLeads) {
    const lead = await prisma.lead.create({
      data: {
        businessConfigId: business.id,
        ...leadData,
      },
    })
    console.log('✅ Created lead:', lead.prospectName)
  }

  // Seed some notifications
  await prisma.notification.createMany({
    data: [
      {
        businessConfigId: business.id,
        message: 'New high-urgency lead from Sara Malik for Landing Page Design.',
        type: 'urgent',
      },
      {
        businessConfigId: business.id,
        message: 'New lead from James Obi for Full Website Build.',
        type: 'lead',
        readAt: new Date(),
      },
      {
        businessConfigId: business.id,
        message: 'Lead "Tom Walsh" status changed to CONTACTED.',
        type: 'status',
        readAt: new Date(),
      },
    ],
  })
  console.log('✅ Created notifications')

  console.log('\n🎉 Seed complete!')
  console.log('   Embed token:', business.embedToken)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
