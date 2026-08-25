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
    section: 'Onshore & Offshore',
    header: 'Companies starting with: A–E',
    letter: 'A, B, C, D, E',
    company_yn: true,
    company_name: null,
    operator_number: null,
    agency: null,
    people: [
      { id: 'p1', name: 'Maria Foster', role: 'Primary Contact Federal', role_type: 'federal', email: 'maria.foster@onrr.gov', phone: '214-640-9048', is_primary: true, fax: null },
      { id: 'p2', name: 'Michael Anspach', role: 'Supervisor Federal', role_type: 'supervisor', email: 'michael.anspach@onrr.gov', phone: '303-231-3618', is_primary: false, fax: null },
      // role_type intentionally null: exercises ContactDirectory's string fallback.
      { id: 'p3', name: 'Katie Connor', role: 'Primary Contact Indian', role_type: null, email: 'kathryn.connor@onrr.gov', phone: '303-231-3937', is_primary: false, fax: null },
    ],
  },
  {
    id: 102,
    status: 'published',
    section: null,
    header: 'Companies starting with: F–K',
    letter: 'F, G, H, I, J, K',
    company_yn: true,
    company_name: null,
    operator_number: null,
    agency: null,
    people: [
      { id: 'p4', name: 'Dana Reyes', role: 'Primary Contact Federal', role_type: 'federal', email: 'dana.reyes@onrr.gov', phone: '303-231-3100', is_primary: true, fax: null },
    ],
  },
]

// All-contacts index for the hub finder. Maria Foster spans two letter-groups (A,B and
// C) to exercise collapse-to-unique-person + contiguous coverage ("A–C").
export const searchContacts = [
  {
    id: 201,
    letter: 'A, B',
    company_name: null,
    operator_number: null,
    agency: null,
    topics: [{ contact_topics_id: { slug: 'oil-gas-reporting', title: 'Oil & Gas Reporting' } }],
    people: [
      { id: 'sp1', name: 'Maria Foster', role: 'Primary Contact Federal', role_type: 'federal', email: 'maria.foster@onrr.gov', phone: '214-640-9048' },
      { id: 'sp2', name: 'Katie Connor', role: 'Primary Contact Indian', role_type: 'indian', email: 'kathryn.connor@onrr.gov', phone: '303-231-3937' },
    ],
  },
  {
    id: 202,
    letter: 'C',
    company_name: null,
    operator_number: null,
    agency: null,
    topics: [{ contact_topics_id: { slug: 'oil-gas-reporting', title: 'Oil & Gas Reporting' } }],
    people: [
      // Same person, different email casing — must still collapse to one result.
      { id: 'sp1b', name: 'Maria Foster', role: 'Primary Contact Federal', role_type: 'federal', email: 'Maria.Foster@onrr.gov', phone: '214-640-9048' },
    ],
  },
]

// A topic-template CMS page whose contacts section is a collection_block scoped to a
// contact_topic → CollectionBlock renders <ContactDirectory :topic>.
export const contactTopicPage = {
  __typename: 'pages',
  id: 'ct-page',
  title: 'Oil & Gas Reporting',
  slug: 'oil-gas-reporting-topic',
  url: '/about/contact/oil-gas-reporting-topic',
  template: 'topic',
  topic_variant: null,
  content_columns: null,
  hero_image: null,
  hero_title: null,
  parent: { title: 'Contact', url: '/about/contact', parent: null },
  meta_title: null,
  meta_description: null,
  page_bands: [],
  sidebar_blocks: [],
  page_blocks: [
    {
      id: 'ctpb1',
      item: {
        __typename: 'collection_blocks',
        id: 'ctcb1',
        collection: 'contacts',
        contact_topic: { slug: 'oil-gas-reporting', title: 'Oil & Gas Reporting' },
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
