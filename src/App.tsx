import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Ceremony from './pages/Ceremony'
import Flowers from './pages/Flowers'
import Photos from './pages/Photos'
import Memories from './pages/Memories'
import Eulogy from './pages/Eulogy'
import Updates from './pages/Updates'
import AdminApp from './admin/AdminApp'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ceremony" element={<Ceremony />} />
        <Route path="/flowers" element={<Flowers />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/eulogy" element={<Eulogy />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
