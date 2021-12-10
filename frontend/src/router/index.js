import Vue from 'vue'
import VueRouter from 'vue-router'
import { apolloClient } from '@/main.js'
import { 
  // PAGES_QUERY, 
  // REDIRECTS_QUERY,
  PAGES_REDIRECTS_QUERY
} from '@/graphql/queries'

import Home from '../views/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Home",
    components: {
      default:  Home,
    },
    meta: {
      breadcrumb: "Home"
    },
    props: true,
  },
  {
    path: "/getting-started",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnleft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
      },
    ],
    meta: {
      breadcrumb: "Getting Started"
    },
  },
  {
    path: "/reporting",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        name: 'TwoColumnLeft',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") ,
        props: true,
        meta: {
          breadcrumb: ''
        },
      },
    ],
    meta: {
      breadcrumb: "Reporting"
    },
  },
  {
    path: "/references",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        name: 'TwoColumnLeft',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
      },
    ],
    meta: {
      breadcrumb: "References"
    },
  },
  {
    path: "/paying",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        name: 'TwoColumnLeft',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
      },
    ],
    meta: {
      breadcrumb: "Paying"
    },
  },
  {
    path: "/compliance-enforcement",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        name: 'TwoColumnLeft',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
      },
    ],
    meta: {
      breadcrumb: "Compliance Enforcement"
    },
  },
  {
    path: "/indian",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        name: 'TwoColumnLeft',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
      },
    ],
    meta: {
      breadcrumb: "Indian Resources"
    },
  },
  {
    path: "/about",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: ':slug',
        name: 'TwoColumnLeft',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page"),
        props: true,
        meta: {
          breadcrumb: ''
        },
      }
    ],
    meta: {
      breadcrumb: "About ONRR"
    },
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
    path: '*',
    redirect: '/404'
  }
]

// console.log('routes---------->', routes)

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

// If url path doesn't exist lets redirect to the 404 page
// Vue Router navigation guards - https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach((to, from, next) => {
  // console.log('beforeRouteEnter to.path ------------>', to, from, next)

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
      const pageFound = pages.find(page => page.url === to.fullPath)
      const redirectFound = redirects.find(redirect => redirect.from === path)

      // console.log('redirectFound------------->', redirectFound)

      // if not page found lets redirect to 404 page
      if (redirectFound) {
        next()
      }
      else {
        if (pageFound === undefined) {
          next({ name: 'PageNotFound' })
        }
          
        
        if (pageFound) next()
      }
      

    }

  })
  .catch((err) => console.err(err))

})

export default router
