import { Route } from 'next'
import { Suspense } from 'react'
import { Allowed } from '@/components/auth/allowed'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <Allowed allow="authenticated" redirectTo={'/auth/signin' as Route} />
      </Suspense>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
