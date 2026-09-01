// Fixtures for the handbook detail page (template: 'handbook' → HandbookDetailView).
// GetPageBySlug returns a page whose `handbook` M2O carries the metadata; the view
// then fetches TOC rows via GetHandbookToc.

export const handbookToc = [
  // Group heading — no section, no page link.
  { id: 't1', chapter: null, section: null, title: 'Chapters', actual_page: null, toc_page: null, url: null },
  // Chapter heading — no section (bold) but IS linked to its page.
  { id: 't2', chapter: 'Chapter 1', section: null, title: 'Chapter 1: About This Handbook', actual_page: '23', toc_page: '1-1', url: '/document/RRM.pdf' },
  // Regular linked entry.
  { id: 't3', chapter: null, section: '1.1', title: 'Naming Conventions', actual_page: '23', toc_page: '1-1', url: '/document/RRM.pdf' },
]

export const handbookPage = {
  __typename: 'pages',
  id: 'hb-detail-page',
  title: 'Minerals Revenue Reporter Handbook',
  slug: 'minerals-revenue-reporter-handbook',
  url: '/references/handbooks/minerals-revenue-reporter-handbook',
  hero_image: null,
  hero_title: null,
  template: 'handbook',
  parent: null,
  meta_title: null,
  meta_description: null,
  sidebar_blocks: [],
  page_blocks: [],
  handbook: {
    id: 'hb-uuid-1',
    title: 'Minerals Revenue Reporter Handbook',
    release: 'Release 4.5, dated 3/18/2026',
    download_url: '/document/RRM-Printable.Minerals.Revenue.Handbook.docx',
    format: 'Word document',
    intro: '<p>This interactive handbook breaks down the complete handbook PDF so specific topics are easier to find.</p>',
    note: 'Deactivate the Adobe extension in your browser when using the table of contents links.',
    contact_group: 'Reporting Handbooks',
    contact_name: 'Aaron Lindquist',
    contact_email: 'aaron.lindquist@onrr.gov',
    contact_phone: '303-231-3020',
    chapters: [
      { label: 'Chapter 1 - About This Handbook', href: '/document/RRM-Chapter.1.pdf', format: 'PDF' },
      { label: 'Chapter 2 - Basic Reporting Principles', href: '/document/RRM-Chapter.2.docx', format: 'Word' },
    ],
    appendices: [
      { label: 'Appendix A - Contact Information', href: '/document/RRM-Appendix.A.pdf' },
    ],
    guidance: [
      { label: 'Glossary', href: '/document/Glossary.pdf' },
    ],
    related: [
      { label: 'Paying', href: '/paying' },
    ],
  },
}
