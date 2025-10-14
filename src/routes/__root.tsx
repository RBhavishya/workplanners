// import appCss from '@/styles/app.css?url'
import { authMiddleware } from '@/lib/helpers/middleware'
import '../styles/app.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Work Planners' },
    ],
    links: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap'},
    ],
  }),
  component: RootComponent,
  beforeLoad: authMiddleware
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient} >
        <Outlet />
       <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
        
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
