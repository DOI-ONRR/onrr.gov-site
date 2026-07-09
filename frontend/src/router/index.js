import Vue from 'vue'
import VueRouter from 'vue-router'
import { apolloClient } from '@/main.js'
import store from '../store/index'

import {
  PAGES_REDIRECTS_QUERY
} from '@/graphql/queries'



Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "Home" */ "@/views/Home"),
    meta: {
      breadcrumb: "Home"
    },
    props: true,
  },
  {
    path: '/404',
    name: 'PageNotFound',
    component: () => import(/* webpackChunkName: "PageNotFound" */ "../views/PageNotFound"),
    meta: {
      breadcrumb: "Page Not Found"
    }
  },
  {
    path: '/:slug',
    name: 'TwoColumnLeft',
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "@/views/TwoColumnLeft"),
    props: true,
    meta: {
      breadcrumb: ''
    },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "@/views/Page"),
      },
      {
        path: ':slug1',
        component: () => import(/* webpackChunkName: "Page" */ "@/views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
        children: [
          {
            path: ':slug2',
            component: () => import(/* webpackChunkName: "Page" */ "@/views/Page"),
            props: true,
            meta: {
              breadcrumb: ''
            },
            children: [
              {
                path: ':slug3',
                component: () => import(/* webpackChunkName: "Page" */ "@/views/Page"),
                props: true,
                meta: {
                  breadcrumb: ''
                },
                children: [
                  {
                    path: ':slug4',
                    component: () => import(/* webpackChunkName: "Page" */ "@/views/Page"),
                    props: true,
                    meta: {
                      breadcrumb: ''
                    },
                    children: [
                      {
                        path: ':slug5',
                        component: () => import(/* webpackChunkName: "Page" */ "@/views/Page"),
                        props: true,
                        meta: {
                          breadcrumb: ''
                        },

                      },
                    ]
                  },
                ]
              },
            ]
          },
        ]
      },
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/404'
  }
]


const router = new VueRouter({
  mode: "history",
  linkExactActiveClass: "nav-active-class",
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash,
        behavior: 'smooth',
      }
    } else if (savedPosition) {
      return savedPosition
    }
  }
})


function hasQueryParams(route) {
  return !!Object.keys(route.query).length;
}

function getApolloQuery() {
  return apolloClient.query({ query: PAGES_REDIRECTS_QUERY});
}

function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url);
}

function toAbsoluteUrl(baseUrl, url) {
  if (!url) return baseUrl;
  if (isAbsoluteUrl(url)) return url;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

const EXTERNAL_REDIRECTS = new Map([
  ['/revenue-data', 'https://revenuedata.onrr.gov'],
  ['/explore-data', 'https://revenuedata.onrr.gov/explore'],
  ['/query-data', 'https://revenuedata.onrr.gov/query-data'],
  ['/download-data', 'https://revenuedata.onrr.gov/downloads'],
  ['/revenue-data-glossary', 'https://revenuedata.onrr.gov/glossary'],
  ['/how-revenue-works', 'https://revenuedata.onrr.gov/how-revenue-works'],
]);

// If url path doesn't exist lets redirect to the 404 page
// Vue Router navigation guards - https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
const PREVIEW_TOKEN_KEY = 'previewToken';

router.beforeEach(async (to, from, next) => {

  // Remember a preview token (Directus Live Preview) for the session so it can be
  // re-attached as the editor navigates. Auth only — NOT `version`, which is per-page.
  if (to.query.token) {
    sessionStorage.setItem(PREVIEW_TOKEN_KEY, to.query.token);
  }

  if (to.path === '/404') {
    next();
    return;
  }

  const target = EXTERNAL_REDIRECTS.get(to.path);
  if (target) {
    const qs = Object.keys(to.query || {}).length
      ? `?${new URLSearchParams(to.query).toString()}`
      : '';
    const hash = to.hash || '';

    // Use replace so Back doesn't land on the intermediary route
    window.location.assign(`${target}${qs}${hash}`);
    return; // IMPORTANT: do not call next()
  }

  if (from.path !== to.path) {
    await store.dispatch('updatePageLoaded', false);
  }

  // Apollo query
  const query = await getApolloQuery();
  const baseUrl = location.origin;
  const path = location.pathname.toString();
  const decodedPath = decodeURI(path);

  let pages;
  let redirects;
  let redirectFound

  if (query) {
    pages = query.data.pages;
    redirects = query.data.redirects;
    // see if redirect exists
    redirectFound = redirects.find(redirect => redirect.old_url === decodedPath);
  }

  if (redirectFound) {
    // check to see if page exists and if not open new tab for redirect
    //TODO: better way to find hashes and query params
    const redirectToUrl = redirectFound.new_url.includes('?') ? redirectFound.new_url.split('?')[0] : redirectFound.new_url.split('#')[0];
    const pageFound = pages.find(page => page.url === redirectToUrl);

    // check if url has extension
    const fileExtension = redirectToUrl.includes('.') ? redirectToUrl.split('.').pop() : undefined;

    if (!pageFound) {
      if (fileExtension) {
        window.location.replace(`${ baseUrl }${ redirectFound.new_url }`);
        return;
      } else {
        next('/404');
        return;
      }
    } else {
      window.location.replace(toAbsoluteUrl(baseUrl, redirectFound.new_url));
      return;
    }
  } else {
    const pageFound = pages.find(page => page.url === path);

    if (!pageFound) {
      next('/404');
      return;
    }

    // Re-attach the preview token so preview mode survives internal navigation
    // (links carry only the path, so the token would otherwise be dropped).
    const previewToken = sessionStorage.getItem(PREVIEW_TOKEN_KEY);
    if (previewToken && to.query.token !== previewToken) {
      next({ path: to.path, query: { ...to.query, token: previewToken }, hash: to.hash });
      return;
    }

    // check for query params (only once)
    if (!hasQueryParams(to) && hasQueryParams(from)) {
      next({ name: to.name, query: from.query });
      return;
    }

    next();
    return;
  }

})

export default router