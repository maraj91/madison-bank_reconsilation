import { ReactNode, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function AppLayout({ title, children }: { title?: string; children: ReactNode }) {
  useEffect(() => {
    if (title) document.title = `${title} • Magic Ledger`
  }, [title])

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-lg font-semibold">{title}</h1>
          </header>
          <main className="flex-1 p-4 container mx-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
