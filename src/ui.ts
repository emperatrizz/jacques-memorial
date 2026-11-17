import type { L10n } from './i18n'

/** All interface text, in Thai / English / French. */
export const ui = {
  inLovingMemory: {
    th: 'ด้วยรักและอาลัย',
    en: 'In loving memory',
    fr: 'À sa mémoire, avec amour',
  },
  latestUpdates: {
    th: 'ประกาศล่าสุด',
    en: 'Latest updates',
    fr: 'Dernières annonces',
  },
  allUpdates: {
    th: 'ประกาศทั้งหมด',
    en: 'All updates',
    fr: 'Toutes les annonces',
  },
  updatesPageTitle: {
    th: 'ประกาศและความเคลื่อนไหว',
    en: 'Updates & announcements',
    fr: 'Annonces et mises à jour',
  },
  noUpdates: {
    th: 'ยังไม่มีประกาศ',
    en: 'No announcements yet.',
    fr: 'Aucune annonce pour le moment.',
  },
  back: {
    th: 'กลับ',
    en: 'Back',
    fr: 'Retour',
  },
  home: {
    th: 'หน้าหลัก',
    en: 'Home',
    fr: 'Accueil',
  },
  toBeConfirmed: {
    th: 'รอการยืนยัน',
    en: 'To be confirmed',
    fr: 'À confirmer',
  },
  comingSoonTitle: {
    th: 'เร็ว ๆ นี้',
    en: 'Opening soon',
    fr: 'Bientôt disponible',
  },
  comingSoonBody: {
    th: 'ส่วนนี้ของเว็บไซต์กำลังจัดเตรียม และจะเปิดให้ใช้งานเร็ว ๆ นี้ เมื่อเปิดแล้วจะแจ้งให้ทราบในประกาศที่หน้าหลัก',
    en: 'This part of the site is being prepared and will open soon. When it does, it will be announced on the home page.',
    fr: 'Cette partie du site est en préparation et ouvrira bientôt. Son ouverture sera annoncée sur la page d’accueil.',
  },
  // Sections
  ceremonyTitle: {
    th: 'พิธีและกำหนดการ',
    en: 'Ceremony & Schedule',
    fr: 'Cérémonie et programme',
  },
  ceremonyDesc: {
    th: 'วัน เวลา สถานที่ และการเดินทาง',
    en: 'Dates, times, venue and directions',
    fr: 'Dates, horaires, lieu et itinéraire',
  },
  flowersTitle: {
    th: 'ดอกไม้และพวงหรีด',
    en: 'Flowers & Wreaths',
    fr: 'Fleurs et couronnes',
  },
  flowersDesc: {
    th: 'ที่อยู่และวิธีการจัดส่ง',
    en: 'Where and how to send them',
    fr: 'Où et comment les envoyer',
  },
  photosTitle: {
    th: 'ภาพถ่ายและวิดีโอ',
    en: 'Photographs & Videos',
    fr: 'Photos et vidéos',
  },
  photosDesc: {
    th: 'ร่วมแบ่งปันภาพถ่ายและวิดีโอของคุณแจ็ค',
    en: 'Share your photographs and videos of Jacques',
    fr: 'Partagez vos photos et vidéos de Jacques',
  },
  memoriesTitle: {
    th: 'ความทรงจำและเรื่องราว',
    en: 'Memories & Anecdotes',
    fr: 'Souvenirs et anecdotes',
  },
  memoriesDesc: {
    th: 'ร่วมเขียนความทรงจำถึงคุณแจ็ค',
    en: 'Write a memory of Jacques',
    fr: 'Écrivez un souvenir de Jacques',
  },
  eulogyTitle: {
    th: 'คำไว้อาลัย',
    en: 'Eulogy',
    fr: 'Éloge funèbre',
  },
  eulogyDesc: {
    th: 'อ่านคำไว้อาลัยในสามภาษา',
    en: 'Read the eulogy in three languages',
    fr: 'Lire l’éloge en trois langues',
  },
  // Ceremony page
  venue: {
    th: 'สถานที่',
    en: 'Venue',
    fr: 'Lieu',
  },
  address: {
    th: 'ที่อยู่',
    en: 'Address',
    fr: 'Adresse',
  },
  schedule: {
    th: 'กำหนดการ',
    en: 'Schedule',
    fr: 'Programme',
  },
  openMaps: {
    th: 'เปิดใน Google Maps',
    en: 'Open in Google Maps',
    fr: 'Ouvrir dans Google Maps',
  },
  // Flowers page
  deliveryAddress: {
    th: 'ที่อยู่สำหรับจัดส่ง',
    en: 'Delivery address',
    fr: 'Adresse de livraison',
  },
  recipient: {
    th: 'ผู้รับ',
    en: 'Recipient',
    fr: 'Destinataire',
  },
  instructions: {
    th: 'รายละเอียดการจัดส่ง',
    en: 'Delivery details',
    fr: 'Détails de livraison',
  },
  fromAbroad: {
    th: 'การส่งดอกไม้จากต่างประเทศ',
    en: 'Sending flowers from abroad',
    fr: 'Envoyer des fleurs depuis l’étranger',
  },
  footer: {
    th: 'จัดทำด้วยความรักโดยครอบครัว',
    en: 'Made with love by his family',
    fr: 'Réalisé avec amour par sa famille',
  },
  loadError: {
    th: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
    en: 'Could not load the information. Please try again.',
    fr: 'Impossible de charger les informations. Veuillez réessayer.',
  },
} satisfies Record<string, L10n>
