import { pick, useLang } from '../i18n'
import { ui } from '../ui'

export default function Footer() {
  const { lang } = useLang()
  return (
    <footer className="footer">
      <span>{pick(ui.footer, lang)}</span>
    </footer>
  )
}
