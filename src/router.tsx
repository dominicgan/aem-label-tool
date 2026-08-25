import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from './App'
import { HomePage } from './pages/HomePage'
import { ComparePage } from './pages/ComparePage'

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

const routeTree = rootRoute.addChildren([indexRoute, compareRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
