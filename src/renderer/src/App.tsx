import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AppSidebar } from "./components/app-sidebar"
import CategoriesPage from "./components/Pages/Categories"
import { SidebarProvider,SidebarTrigger } from "./components/ui/sidebar"
const HomePage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Home Page</h1>
    <p>Welcome to the home page!</p>
  </div>
)

const InboxPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Inbox</h1>
    <p>Your inbox content goes here.</p>
  </div>
)

const HistoryPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">History</h1>
    <p>Your history content goes here.</p>
  </div>
)

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Settings</h1>
    <p>Your settings content goes here.</p>
  </div>
)

function App() {
  return (
    <Router>
      <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <SidebarTrigger />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plugins" element={<InboxPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Routes>
        </main>
      </div>
       </SidebarProvider>
    </Router>
  )
}

export default App