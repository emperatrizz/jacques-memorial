import { useState } from 'react'
import { Link } from 'react-router-dom'
import LangSwitcher from '../components/LangSwitcher'
import UpdatesBar from '../components/UpdatesBar'
import Footer from '../components/Footer'
import { CandleIcon, WreathIcon, CameraIcon, QuillIcon, BookIcon, GemIcon, Ornament } from '../components/icons'
import { pick, useLang } from '../i18n'
import { ui } from '../ui'

const TILES = [
  { to: '/ceremony', title: ui.ceremonyTitle, desc: ui.ceremonyDesc, Icon: CandleIcon },
  { to: '/flowers', title: ui.flowersTitle, desc: ui.flowersDesc, Icon: WreathIcon },
  { to: '/photos', title: ui.photosTitle, desc: ui.photosDesc, Icon: CameraIcon },
  { to: '/memories', title: ui.memoriesTitle, desc: ui.memoriesDesc, Icon: QuillIcon },
  { to: '/eulogy', title: ui.eulogyTitle, desc: ui.eulogyDesc, Icon: BookIcon },
  { to: '/life', title: ui.lifeTitle, desc: ui.lifeDesc, Icon: GemIcon },
]

export default function Home() {
  const { lang } = useLang()
  const [coverMissing, setCoverMissing] = useState(false)

  // In Thai, คุณแจ็ค is the familiar name shown large; in EN/FR the Latin name leads.
  const mainName = lang === 'th' ? 'คุณแจ็ค' : 'Jacques Prades'
  const subName = lang === 'th' ? 'Jacques Leon Joseph Prades' : 'คุณแจ็ค · Jacques Leon Joseph Prades'

  return (
    <div className="app">
      <div className="lang-bar">
        <LangSwitcher />
      </div>

      <div className="cover">
        {coverMissing ? (
          <div className="cover-placeholder" aria-hidden="true">
            <span className="cover-monogram">J</span>
          </div>
        ) : (
          <img
            src="/cover.jpg"
            alt={mainName}
            className="cover-img"
            onError={() => setCoverMissing(true)}
          />
        )}
      </div>

      <section className="name-block">
        <img src="/logo.png" alt="" className="crest" />
        <p className="memory-line">{pick(ui.inLovingMemory, lang)}</p>
        <h1 className={`main-name ${lang === 'th' ? '' : 'script'}`}>{mainName}</h1>
        <p className="sub-name">{subName}</p>
        <p className="life-dates">1937 – 2026</p>
        <Ornament />
      </section>

      <UpdatesBar />

      <nav className="tiles" aria-label="Sections">
        {TILES.map((tile) => (
          <Link key={tile.to} to={tile.to} className="tile">
            <span className="tile-icon">
              <tile.Icon />
            </span>
            <span className="tile-text">
              <span className="tile-title">{pick(tile.title, lang)}</span>
              <span className="tile-desc">{pick(tile.desc, lang)}</span>
            </span>
            <svg className="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="M1.5 1.5L7 7l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </nav>

      <Footer />
    </div>
  )
}
