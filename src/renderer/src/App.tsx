import { AppSidebar } from "@renderer/components/app-sidebar"
import { Button } from "./components/ui/button"
import { SidebarProvider,SidebarTrigger } from "./components/ui/sidebar"
function App(): React.JSX.Element {
  return (
    <>
    <div className="bg-black">
      <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger /> 
      </main>
      <Button variant="outline">Button</Button>
      </SidebarProvider>
    </div>
   
    </>
  )
}

export default App