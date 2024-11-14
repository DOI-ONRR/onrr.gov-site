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

// function createLinkEvent(url) {
//   const link = document.createElement('a');
//   link.href = url;
//   link.target = '_blank';
//   link.click();
// }

// If url path doesn't exist lets redirect to the 404 page
// Vue Router navigation guards - https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach(async (to, from, next) => {
  
  await store.dispatch('updatePageLoaded', false);

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

    console.log('redirectToUrl --------> ', redirectToUrl);
    console.log('pageFound ------> ', pageFound);
    console.log('fileExtension -------> ', fileExtension);

    if (!pageFound) {
      if (fileExtension) {
        window.open(`${ baseUrl }${ redirectFound.new_url }`, '_blank', 'noopener noreferrer');
        history.back();
      } else {
        location.href = '/404';
      }
    } else {
      window.location.href = `${ baseUrl }${ redirectFound.new_url }`;
    }
  } else {
    const pageFound = pages.find(page => page.url === path);
    if (pageFound) {
      // check for query params
      if (!hasQueryParams(to) && hasQueryParams(from)) {
        if ('tabs' in from.query) {
          await store.dispatch('updatePageLoaded', true);
        }
        next({ name: to.name, query: from.query })
      } else {
        next()
      }
    } else {
      location.href = '/404';
    }
  }


  // check for query params
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    if ('tabs' in from.query) {
      await store.dispatch('updatePageLoaded', true);
    }
    next({ name: to.name, query: from.query })
  } else {
    next()
  }

})

export default router
