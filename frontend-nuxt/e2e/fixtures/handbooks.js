// Fixtures for the handbooks index (References › Handbooks). The page renders in
// the default template: GetPageBySlug returns a page whose page_blocks carry a
// `handbooks` collection_block, which CollectionBlock dispatches to <Handbooks>,
// which fetches GetHandbooks. Rows cover: interactive button shown/hidden and
// release badge shown/hidden.

export const handbooks = [
  {
    id: 1,
    title: 'Minerals Revenue Reporter Handbook',
    release: 'Release 4.5',
    download_url: '/document/RRM-Printable.Minerals.Revenue.Handbook.docx',
    format: 'Word document',
    interactive_page: { url: '/references/handbooks/minerals-revenue-reporter-handbook', title: 'Minerals Revenue Reporter Handbook' },
  },
  {
    id: 2,
    title: 'Minerals Production Reporter Handbook',
    release: 'Release 3.0',
    download_url: '/document/MPRH-AllDocs-Combined.pdf',
    format: 'PDF',
    interactive_page: null,
  },
  {
    id: 3,
    title: 'Geothermal Payor Handbook — Class 2 & 3 Leases',
    release: null,
    download_url: '/document/Class-2-3-Handbook.pdf',
    format: 'PDF',
    interactive_page: null,
  },
]

// A default-template page whose only block is the handbooks collection block.
export const handbooksPage = {
  __typename: 'pages',
  id: 'hb-page',
  title: 'Handbooks',
  slug: 'handbooks',
  url: '/references/handbooks',
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
        collection: 'handbooks',
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
