// Fixture for a `journey-landing` template page (JourneyLandingView), exercising all
// pieces: steps (process-list), path cards, the related band, and the aside
// (callout box + Key references list). Served by the GetPageBySlug mock for the
// `getting-started` slug.

export const journeyPage = {
  __typename: 'pages',
  id: 'journey-1',
  title: 'Getting Started',
  slug: 'getting-started',
  template: 'journey-landing',
  hero_title: null,
  parent: { title: 'Home', url: '/', parent: null },
  hero_image: null,
  page_blocks: [],
  sidebar_blocks: [],
  dataset_metadata: null,
  related_content: null,
  meta_title: null,
  meta_description: null,

  journey_paths_heading: 'What are you reporting?',
  journey_related_heading: "Once you're set up",
  journey_references_heading: 'Key references',

  journey_steps: [
    { id: 'st1', label: 'Learn how leasing works', url: '#', body: 'See the big picture first.', meta: 'About 10 minutes of reading' },
    { id: 'st2', label: 'Set up system access', url: '#', body: 'Request accounts for the systems you use.', meta: 'The most common first task' },
  ],

  journey_links: [
    // path cards (primary parallel-path content). One 'highlight' variant = the blue
    // info accent contact card (paying page's "Questions about a payment?").
    { id: 'p1', section: 'path', title: 'Oil & gas production', description: 'Report production volumes.', link_label: 'Oil & Gas Production', link_url: '#' },
    { id: 'p2', section: 'path', variant: 'highlight', title: 'Questions about a payment?', description: 'Payment analysts can help.', link_label: 'Contacts for paying', link_url: '#' },
    // related band (closing "next steps")
    { id: 'r1', section: 'related', title: 'Report', description: 'Submit your production and royalty reports.', link_label: 'Reporting', link_url: '/reporting' },
    { id: 'r2', section: 'related', title: 'Pay', description: 'Make payments and manage what you owe.', link_label: 'Paying', link_url: '/paying' },
    { id: 'r3', section: 'related', title: 'See where the money goes', description: 'Explore disbursements and revenue data.', link_label: 'Revenue Data', link_url: '/revenue-data' },
    // aside callout box (single)
    { id: 'c1', section: 'callout', title: 'Stuck, or not sure this applies to you?', description: 'ONRR staff can help you get set up.', link_label: 'Contact ONRR', link_url: '/contact' },
    // aside references list
    { id: 'ref1', section: 'reference', title: 'Reporter handbooks', description: 'production, revenue, and solid minerals', link_label: null, link_url: '#' },
    { id: 'ref2', section: 'reference', title: 'Forms', description: 'every reporting and payment form in one place', link_label: null, link_url: '#' },
  ],
}
