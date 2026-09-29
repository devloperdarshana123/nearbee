import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import AuthTokenSync from '../components/AuthTokenSync'
import SocketSync from '../components/SocketSync'
import ChatWidget from '../components/ChatWidget'
import ReferralCapture from '../components/ReferralCapture'

import ClerkProvider from '../integrations/clerk/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import favicon from '../favicon.png?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'NearBee — Local Services, Nearby',
      },
      {
        name: 'description',
        content:
          'Find trusted local plumbers, electricians, tutors, and more on NearBee. Compare verified providers and book in minutes.',
      },
      {
        property: 'og:title',
        content: 'NearBee — Local Services, Nearby',
      },
      {
        property: 'og:description',
        content:
          'Find trusted local plumbers, electricians, tutors, and more on NearBee. Compare verified providers and book in minutes.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: favicon,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <ClerkProvider>
          <AuthTokenSync />
          <SocketSync />
          <ReferralCapture />
          <Header />
          {children}
          <Footer />
          <ChatWidget />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
