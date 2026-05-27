import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Lists from './pages/Lists'
import Rules from './pages/Rules'
import Schedule from './pages/Schedule'
import Bins from './pages/Bins'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Lists />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/bins" element={<Bins />} />
        </Routes>
      </main>
    </div>
  )
}
