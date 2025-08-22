import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AppSidebar } from "./components/app-sidebar"
import CategoriesPage from "./components/Pages/Categories"
import { SidebarProvider,SidebarTrigger } from "./components/ui/sidebar"
import { ThemeProvider } from "./components/theme-provider"
import { SettingsPage } from "./components/Pages/Settings"
import { PluginsPage } from "./components/Pages/Plugins"
import { HistoryPage } from "./components/Pages/History"
import { HomePage } from "./components/Pages/Home"
function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <SidebarTrigger />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Routes>
        </main>
      </div>
       </SidebarProvider>
       </ThemeProvider>
    </Router>
  )
}

export default App