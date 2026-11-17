import { pick, useLang } from '../i18n'
import { ui } from '../ui'

export default function Footer() {
  const { lang } = useLang()
  return (
    <footer className="footer">
      <img src="/logo.png" alt="" className="site-logo" />
      <span>{pick(ui.footer, lang)}</span>
    </footer>
  )
}
