import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './ThemeContext'
import { AdminProvider } from './AdminContext'
import { LanguageProvider } from './LanguageContext'
import Nav from './components/Nav'
import Home from './pages/Home'
import Lists from './pages/Lists'
import Rules from './pages/Rules'
import Schedule from './pages/Schedule'
import Bins from './pages/Bins'
import Instructions from './pages/Instructions'
import Induction from './pages/Induction'

export default function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <AdminProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Nav />
        <main className="max-w-2xl mx-auto px-4 py-5 pb-24 md:pb-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/bins" element={<Bins />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/induction" element={<Induction />} />
          </Routes>
        </main>
      </div>
    </AdminProvider>
    </ThemeProvider>
    </LanguageProvider>
  )
}
