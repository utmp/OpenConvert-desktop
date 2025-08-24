import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppSidebar } from './components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { ThemeProvider } from './components/theme-provider'
import { SettingsPage } from './components/Pages/Settings'
import { PluginsPage } from './components/Pages/Plugins'
import { HistoryPage } from './components/Pages/History'
import { HomePage } from './components/Pages/Home'
import CategoriesPage from './components/Pages/Categories'

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="fixed inset-0 flex bg-background overflow-hidden">
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col relative">
              <div className="sticky top-0 z-50 px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger />
              </div>
              <div className="flex-1 min-h-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/plugins" element={<PluginsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                </Routes>
              </div>
            </main>
          </SidebarProvider>
        </div>
      </ThemeProvider>
    </Router>
  )
}

export default App
