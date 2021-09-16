import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home"

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
    path: "/indian-resources",
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
    path: "/about-onrr",
    name: "TwoColumnLeft",
    props: true,
    component: () => import(/* webpackChunkName: "TwoColumnLeft" */ "../views/TwoColumnLeft"),
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "Page" */ "../views/Page") 
      },
      {
        path: 'contact-us',
        component: () => import(/* webpackChunkName: "Contact" */ "../views/Contact"),
        props: true,
        meta: {
          breadcrumb: 'Contact Us'
        },
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

const router = new VueRouter({
  mode: "history",
  linkExactActiveClass: "nav-active-class",
  routes
})

export default router
