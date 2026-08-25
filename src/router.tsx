import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from './App'
import { HomePage } from './pages/HomePage'
import { ComparePage } from './pages/ComparePage'
import { FeComparePage } from './pages/FeComparePage'

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aem-fe-compare',
  component: ComparePage,
})

const feCompareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fe-compare',
  component: FeComparePage,
})

const routeTree = rootRoute.addChildren([indexRoute, compareRoute, feCompareRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
