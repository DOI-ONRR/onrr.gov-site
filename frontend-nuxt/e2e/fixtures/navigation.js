// Primary site navigation fixture for the GetMenus query (NavigationMenu.vue).
//
// Two top-level items with children so the megamenu renders real dropdowns — enough
// to exercise opening a menu, switching between top-level items, and the close
// affordances (outside-click / Escape). Shape matches getMenus.gql: id, custom_url,
// link_to_page {id, slug, url}, menu, menu_children[{ pages_id {id, title, url} }],
// menu_icon, menu_label.
export const mainMenu = {
  menus: [
    {
      __typename: 'menus',
      id: 'nav-revenue',
      custom_url: null,
      link_to_page: { id: 'p-revenue', slug: 'revenue-data', url: '/revenue-data' },
      menu: 'main',
      menu_children: [
        { pages_id: { id: 'p-explore', title: 'Explore Data', url: '/explore-data' } },
        { pages_id: { id: 'p-how', title: 'How Revenue Works', url: '/how-revenue-works' } },
      ],
      menu_icon: null,
      menu_label: 'Revenue Data',
    },
    {
      __typename: 'menus',
      id: 'nav-about',
      custom_url: null,
      link_to_page: { id: 'p-about', slug: 'about', url: '/about' },
      menu: 'main',
      menu_children: [
        { pages_id: { id: 'p-mission', title: 'Our Mission', url: '/about/mission' } },
      ],
      menu_icon: null,
      menu_label: 'About',
    },
  ],
}
