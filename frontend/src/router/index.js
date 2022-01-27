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
    path: ':catchAll(.*)',
    redirect: '/404'
  }
]


const router = new VueRouter({
  mode: "history",
  linkExactActiveClass: "nav-active-class",
  routes
})


function addRedirectsToRoutes (data) {
  setTimeout(() => {
    data.forEach(item => { 
      let nObj = {}
      nObj.path = item.from 
      nObj.redirect = item.to
      nObj.children = [
        { 
          path: ':slug',
          redirect: item.to
        }
      ]
      router.addRoute(nObj)
    })
  }, 1000);
}

function hasQueryParams(route) {
  return !!Object.keys(route.query).length
}

// If url path doesn't exist lets redirect to the 404 page
// Vue Router navigation guards - https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach((to, from, next) => {
  console.log('beforeRouteEnter to.path ------------>', to, from, next)

  // getRedirects()

  // Pages query
  apolloClient.query({
    query: PAGES_REDIRECTS_QUERY
  })
  .then((res) => {
    // console.log(res.data)
    if (res?.data) {
      // console.log('res.data--------->', res.data)
      const pages = res.data.pages

      // redirects
      const redirects = res.data.redirects
      // add redirects to routes
      addRedirectsToRoutes(redirects)

      const path = location.pathname.toString()
      // console.log('path: ', path)
      const fullPath = to.fullPath.includes('?') ? to.fullPath.split('?')[0] : to.fullPath
      // console.log('fullPath: ', fullPath)
      const pageFound = pages.find(page => page.url === fullPath)
      const redirectFound = redirects.find(redirect => redirect.from === path)

      // console.log('redirectFound------------->', redirectFound)
      // console.log('pageFound-------------->', pageFound)

      // if no page found lets redirect to 404 page
      if (pageFound === undefined) {
        next({ path: '/404' })
      }


      if (redirectFound) {
        next({ path: redirectFound.to, replace: true })
      }
      else {
        if (pageFound) next()
      }

    }

  })
  .catch((err) => console.error(err))

  // check for query params
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    next({ name: to.name, query: from.query })
  } else {
    next()
  }

})

export default router
