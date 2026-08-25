// Fixtures for the contact hub topic router (/about/contact). GetPageBySlug returns
// a page whose page_blocks carry a `contact_topics` collection_block, which
// CollectionBlock dispatches to <ContactHub>, which fetches GetContactTopics and
// renders one card per topic linking to /about/contact/<slug>.

export const contactTopics = [
  {
    id: 3,
    slug: 'oil-gas-reporting',
    title: 'Oil & Gas Reporting',
    description: 'Get help reporting and correcting oil and gas royalties and production.',
  },
  {
    id: 8,
    slug: 'payments-debt',
    title: 'Payments & Debt Collection',
    description: 'Get help making and correcting payments. Includes Accounts Receivable contacts.',
  },
  {
    id: 9,
    slug: 'indian-services',
    title: 'Indian Services',
    description: 'Reach the Federal Indian Minerals Office, Indian Energy Service Center, and regional offices.',
  },
]

// Contacts for the oil-gas-reporting topic page: two header groups, people spanning
// federal / supervisor / indian roles (exercises the role-colour derivation).
export const oilGasContacts = [
  {
    id: 101,
    status: 'published',
    header: 'Companies starting with: A–E',
    letter: 'A, B, C, D, E',
    company_yn: true,
    company_name: null,
    operator_number: null,
    agency: null,
    people: [
      { id: 'p1', name: 'Maria Foster', role: 'Primary Contact Federal', email: 'maria.foster@onrr.gov', phone: '214-640-9048', is_primary: true, fax: null },
      { id: 'p2', name: 'Michael Anspach', role: 'Supervisor Federal', email: 'michael.anspach@onrr.gov', phone: '303-231-3618', is_primary: false, fax: null },
      { id: 'p3', name: 'Katie Connor', role: 'Primary Contact Indian', email: 'kathryn.connor@onrr.gov', phone: '303-231-3937', is_primary: false, fax: null },
    ],
  },
  {
    id: 102,
    status: 'published',
    header: 'Companies starting with: F–K',
    letter: 'F, G, H, I, J, K',
    company_yn: true,
    company_name: null,
    operator_number: null,
    agency: null,
    people: [
      { id: 'p4', name: 'Dana Reyes', role: 'Primary Contact Federal', email: 'dana.reyes@onrr.gov', phone: '303-231-3100', is_primary: true, fax: null },
    ],
  },
]

export const contactHubPage = {
  __typename: 'pages',
  id: 'contact-hub-page',
  title: 'Contact Us',
  slug: 'contact',
  url: '/about/contact',
  hero_image: null,
  hero_title: null,
  template: 'full-width',
  parent: null,
  meta_title: null,
  meta_description: null,
  sidebar_blocks: [],
  page_blocks: [
    {
      id: 'pb1',
      item: {
        __typename: 'collection_blocks',
        id: 'cb1',
        collection: 'contact_topics',
        header: null,
        description: null,
        accordion: null,
        page: null,
        tab: null,
        items_per_page: null,
        status: 'published',
        layout: null,
        item_status: null,
        category_header_level: null,
        topics: null,
      },
    },
  ],
}
