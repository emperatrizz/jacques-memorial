import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Ceremony from './pages/Ceremony'
import Flowers from './pages/Flowers'
import ComingSoon from './pages/ComingSoon'
import Updates from './pages/Updates'
import AdminApp from './admin/AdminApp'
import { ui } from './ui'

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
        <Route path="/photos" element={<ComingSoon title={ui.photosTitle} />} />
        <Route path="/memories" element={<ComingSoon title={ui.memoriesTitle} />} />
        <Route path="/eulogy" element={<ComingSoon title={ui.eulogyTitle} />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
