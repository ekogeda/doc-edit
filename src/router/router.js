import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import store from "@/store";

const UserAuth = () =>
  import(/* webpackChunkName: "auth-login" */ "@/views/UserAuth.vue");

const TestGround = () =>
  import(/* webpackChunkName: "test" */ "@/components/TestGround.vue");

const WebCam = () =>
  import(/* webpackChunkName: "auth-login" */ "@/views/WebCam.vue");

const LandingPage = () =>
  import(
    /* webpackChunkName: "landing-page" */ "@/views/LandingPage.vue"
  );

const DocumentAuditTrail = () =>
  import(
    /* webpackChunkName: "audit-trail" */ "@/views/documents/DocumentAuditTrail.vue"
  );

const DocumentUserVerify = () =>
  import(
    /* webpackChunkName: "auth-verify" */ "@/components/Auth/UserVerify.vue"
  );

const DocumentIndex = () =>
  import(/* webpackChunkName: "user" */ "@/views/DocumentIndex.vue");

const DocumentDashboard = () =>
  import(
    /* webpackChunkName: "document" */ "@/views/documents/DocumentDashboard.vue"
  );

const DocumentUpload = () =>
  import(
    /* webpackChunkName: "upload-document" */ "@/views/documents/DocumentUpload.vue"
  );

const DocumentEdit = () =>
  import(
    /* webpackChunkName: "edit-document" */ "@/views/documents/DocumentEdit.vue"
  );

const routes = [
  {
    path: "/",
    name: "Login",
    component: UserAuth,
    meta: {
      title: "SkoutWatch",
    },
  },

  {
    path: "/test",
    name: "TestGround",
    component: TestGround,
    meta: {
      title: "SkoutWatch",
    },
  },

  {
    path: "/cam",
    name: "WebCam",
    component: WebCam,
    meta: {
      title: "SkoutWatch",
    },
  },

  {
    path: "/dashboard",
    name: "Dashboard",
    component: LandingPage,
    meta: {
      title: "Documents | SkoutWatch",
      requiresAuth: true,
      metaTags: [
        {
          name: "description",
          content: "The document dashboard page of SkoutWatch.",
        },
        {
          property: "og:description",
          content: "The document dashboard page of SkoutWatch.",
        },
      ],
    },
  },

  {
    path: "/document",
    name: "document-index",
    component: DocumentIndex,
    meta: {
      title: "Documents - SkoutWatch",
    },
    children: [
      {
        path: "",
        name: "document.dashboard",
        component: DocumentDashboard,
        beforeEnter(to, from, next) {
          next({ name: "Dashboard" });
        },
        meta: {
          title: "User | Document - SkoutWatch",
          requiresAuth: true,
        },
      },
      {
        path: "audit/:document_id",
        name: "document.audit",
        component: DocumentAuditTrail,
        meta: {
          title: "Audit Trail | SkoutWatch",
          metaTags: [
            {
              name: "description",
              content: "The audit trail page of SkoutWatch.",
            },
            {
              property: "og:description",
              content: "The audit trail page of SkoutWatch.",
            },
          ],
        },
      },
      {
        path: "verify",
        name: "document.verify",
        component: DocumentUserVerify,
        meta: {
          title: "Verification | SkoutWatch",
          metaTags: [
            {
              name: "description",
              content: "The verification page of SkoutWatch.",
            },
            {
              property: "og:description",
              content: "The verification page of SkoutWatch.",
            },
          ],
        },
      },
      {
        path: "upload",
        name: "document.upload",
        component: DocumentUpload,
        meta: {
          title: "Upload Document | SkoutWatch",
          metaTags: [
            {
              name: "description",
              content: "The document upload's page of SkoutWatch.",
            },
            {
              property: "og:description",
              content: "The document upload's page of SkoutWatch.",
            },
          ],
        },
      },
      {
        path: "edit/:document_id",
        name: "document.edit",
        component: DocumentEdit,
        meta: {
          title: "Edit Document | SkoutWatch",
          requiresAuth: true,
          metaTags: [
            {
              name: "description",
              content: "The document edit page of SkoutWatch.",
            },
            {
              property: "og:description",
              content: "The document edit page of SkoutWatch.",
            },
          ],
        },
      },
    ],
  },

  {
    path: "/notification",
    name: 'Error',
    component: () => import("@/components/DocNotFound.vue"),
    meta: {
      title: "Error 404 | SkoutWatch",
      metaTags: [
        {
          name: "description",
          content: "The document not found page of SkoutWatch.",
        },
        {
          property: "og:description",
          content: "The document not found page of SkoutWatch.",
        },
      ],
    },
  },

  {
    path: "/:catchAll(.*)",
    component: () => import("@/components/NotFound.vue"),
    meta: {
      title: "Error 404 | SkoutWatch",
      metaTags: [
        {
          name: "description",
          content: "The error 404 page of SkoutWatch.",
        },
        {
          property: "og:description",
          content: "The error 404 page of SkoutWatch.",
        },
      ],
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active",
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return {
        savedPosition,
        behavior: "smooth",
      };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  NProgress.start();

  /* ---------------------------------------------//? ROUTE GUARD META -------------------------------------------- */

  if (to.matched.some(record => record.meta.requiresAuth)) {
    const hasToken = store.getters["auth/token"];
    if (!hasToken) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }

  /* ---------------------------------------------//? SEO Friendly META -------------------------------------------- */

  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);
  const previousNearestWithMeta = from.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  // if (nearestWithTitle) document.title = nearestWithTitle.meta.title;
  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title;
  } else {
    document.title = previousNearestWithMeta.meta.title;
  }

  // Remove any stale meta tags from the document using the key attribute we set below.
  Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map(
    (el) => el.parentNode.removeChild(el)
  );

  // Skip rendering meta tags if there are none.
  if (!nearestWithMeta) return next();

  // Turn the meta tag definitions into actual elements in the head.
  nearestWithMeta.meta.metaTags
    .map((tagDef) => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key]);
      });

      // We use this to track which meta tags we create, so we don't interfere with other ones.
      tag.setAttribute("data-vue-router-controlled", "");

      return tag;
    })
    // Add the meta tags to the document head.
    .forEach((tag) => document.head.appendChild(tag));

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
