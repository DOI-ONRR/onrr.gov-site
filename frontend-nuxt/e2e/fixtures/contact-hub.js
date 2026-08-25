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
