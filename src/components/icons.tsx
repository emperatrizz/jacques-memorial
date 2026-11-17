// Hand-drawn thin-line icons for the section tiles. Stroke inherits currentColor.
type IconProps = { size?: number }

function Svg({ children, size = 26 }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** Candle with flame — ceremony & schedule */
export function CandleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2.6c1.3 1.7 2.1 2.9 2.1 4.1a2.1 2.1 0 1 1-4.2 0c0-1.2.8-2.4 2.1-4.1z" />
      <path d="M9.6 11.2h4.8v9.6a0.9 0.9 0 0 1-0.9 0.9h-3a0.9 0.9 0 0 1-0.9-0.9v-9.6z" />
      <path d="M7 21.7h10" />
    </Svg>
  )
}

/** Laurel wreath — flowers & wreaths */
export function WreathIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="11.4" r="6.6" strokeDasharray="2.8 2.3" />
      <path d="M10.2 19.6c.9 1 2.7 1 3.6 0M12 18.2v2.6" />
    </Svg>
  )
}

/** Camera — photographs & videos */
export function CameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2.2" />
      <path d="M8.6 7l1.1-2.2h4.6L15.4 7" />
      <circle cx="12" cy="13.3" r="3.4" />
    </Svg>
  )
}

/** Quill — memories & anecdotes */
export function QuillIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.2 3.8c-6 .4-10.8 3.6-12.9 9.5l-2.1 6.2 6.2-2.1c5.9-2.1 8.4-7.6 8.8-13.6z" />
      <path d="M5.8 18.9 14.6 9.6" />
    </Svg>
  )
}

/** Open book — eulogy */
export function BookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 6.4C10.1 5 7.6 4.5 4.2 4.5v12.9c3.4 0 5.9.6 7.8 2 1.9-1.4 4.4-2 7.8-2V4.5c-3.4 0-5.9.5-7.8 1.9z" />
      <path d="M12 6.4v13" />
    </Svg>
  )
}

/** Ornamental divider under the name */
export function Ornament({ width = 180 }: { width?: number }) {
  return (
    <svg
      className="name-ornament"
      width={width}
      height="14"
      viewBox="0 0 180 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M4 7h66M110 7h66" strokeLinecap="round" />
      <path d="M90 2.2 94.8 7 90 11.8 85.2 7z" />
      <circle cx="76" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="104" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
