import Vue from 'vue'
import VueRouter from 'vue-router'
import { apolloClient } from '@/main.js'
// import Home from '@/views/Home'
// import TwoColumnLeft from '@/views/TwoColumnLeft'

import { 
  // PAGES_QUERY, 
  // REDIRECTS_QUERY,
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
    console.log('scrollBehavior to, from, savedPosition: ', to, from, savedPosition)
    if (to.hash) {
      return {
        selector: to.hash,
        behavior: 'smooth',
        // offset: { x: 0 }
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      // return { x: 0, y: 0 }
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
  console.log('beforeRouteEnter to.path ------------>', to, from, next)

  // getRedirects()

  // Apollo query
  const query = await getApolloQuery();
  const baseUrl = location.origin;
  const path = location.pathname.toString();

  let pages;
  let redirects;

  if (query) {
    pages = query.data.pages;
    redirects = query.data.redirects;
  }

  // see if redirect exists
  const redirectFound = redirects.find(redirect => redirect.old_url === path);

  // console.log('query ------> ', query);
  // console.log('redirectFound --------> ', redirectFound);

  if (redirectFound) {
    // check to see if page exists and if not open new tab for redirect
    const pageFound = pages.find(page => page.url === redirectFound.new_url);
    // console.log('pageFound ------> ', pageFound);
    if (!pageFound) {
      history.back();
      window.open(`${ baseUrl }${ redirectFound.new_url }`, '_blank', 'noopener noreferrer').focus();
    } else {
      window.location.href = `${ baseUrl }${ redirectFound.new_url }`;
    }
  }


  // check for query params
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    next({ name: to.name, query: from.query })
  } else {
    next()
  }

})

export default router
