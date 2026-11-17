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
  // Submissions
  photosIntro: {
    th: 'ร่วมแบ่งปันภาพถ่ายและวิดีโอของคุณแจ็ค ทุกสิ่งที่ส่งเข้ามาจะได้รับการตรวจสอบจากครอบครัวก่อนเผยแพร่',
    en: 'Share your photographs and videos of Jacques. The family reviews every contribution before it is shown publicly.',
    fr: 'Partagez vos photos et vidéos de Jacques. La famille examine chaque contribution avant sa publication.',
  },
  memoriesIntro: {
    th: 'ร่วมเขียนความทรงจำ เรื่องราว หรือข้อความถึงคุณแจ็คและครอบครัว',
    en: 'Write a memory, a story, or a message for Jacques and his family.',
    fr: 'Écrivez un souvenir, une histoire ou un message pour Jacques et sa famille.',
  },
  yourName: {
    th: 'ชื่อของคุณ (ไม่บังคับ)',
    en: 'Your name (optional)',
    fr: 'Votre nom (facultatif)',
  },
  messageLabel: {
    th: 'ข้อความหรือเรื่องราว (ไม่บังคับ)',
    en: 'Message or story (optional)',
    fr: 'Message ou anecdote (facultatif)',
  },
  memoryLabel: {
    th: 'ความทรงจำหรือเรื่องราวของคุณ',
    en: 'Your memory or story',
    fr: 'Votre souvenir ou votre histoire',
  },
  chooseFiles: {
    th: 'เลือกภาพถ่ายหรือวิดีโอ',
    en: 'Choose photos or videos',
    fr: 'Choisir des photos ou des vidéos',
  },
  visibilityLabel: {
    th: 'ใครสามารถเห็นสิ่งนี้ได้บ้าง',
    en: 'Who should see this?',
    fr: 'Qui pourra voir cette contribution ?',
  },
  visPublicTitle: {
    th: 'ทุกคน',
    en: 'Everyone',
    fr: 'Tout le monde',
  },
  visPublicDesc: {
    th: 'แสดงบนเว็บไซต์นี้หลังจากครอบครัวอนุมัติ',
    en: 'Shown on this website after the family approves it',
    fr: 'Affiché sur ce site après validation par la famille',
  },
  visFamilyTitle: {
    th: 'ครอบครัวเท่านั้น',
    en: 'The family only',
    fr: 'La famille uniquement',
  },
  visFamilyDesc: {
    th: 'ส่งถึงครอบครัวโดยตรง จะไม่แสดงต่อสาธารณะ',
    en: 'Sent privately to the family; never shown publicly',
    fr: 'Transmis en privé à la famille ; jamais publié',
  },
  send: {
    th: 'ส่ง',
    en: 'Send',
    fr: 'Envoyer',
  },
  uploadingLabel: {
    th: 'กำลังอัปโหลด…',
    en: 'Uploading…',
    fr: 'Envoi en cours…',
  },
  thanksTitle: {
    th: 'ขอบคุณจากใจ',
    en: 'Thank you',
    fr: 'Merci infiniment',
  },
  thanksBody: {
    th: 'ขอบคุณที่ร่วมแบ่งปันความทรงจำถึงคุณแจ็ค ครอบครัวจะได้รับสิ่งที่คุณส่งมาด้วยความซาบซึ้งใจ',
    en: 'Thank you for sharing your memories of Jacques. The family receives every contribution with deep gratitude.',
    fr: 'Merci d’avoir partagé vos souvenirs de Jacques. La famille reçoit chaque contribution avec une profonde gratitude.',
  },
  shareMore: {
    th: 'ส่งเพิ่มอีก',
    en: 'Share more',
    fr: 'Partager autre chose',
  },
  galleryTitle: {
    th: 'ความทรงจำที่แบ่งปัน',
    en: 'Shared memories',
    fr: 'Souvenirs partagés',
  },
  noPublicYet: {
    th: 'สิ่งที่ได้รับการอนุมัติแล้วจะแสดงที่นี่เร็ว ๆ นี้',
    en: 'Approved contributions will appear here soon.',
    fr: 'Les contributions approuvées apparaîtront ici bientôt.',
  },
  submitError: {
    th: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    en: 'Something went wrong. Please try again.',
    fr: 'Une erreur s’est produite. Veuillez réessayer.',
  },
  fileTooLarge: {
    th: 'ไฟล์ใหญ่เกินไป (ภาพไม่เกิน 50MB วิดีโอไม่เกิน 1GB)',
    en: 'A file is too large (photos up to 50 MB, videos up to 1 GB).',
    fr: 'Un fichier est trop volumineux (photos jusqu’à 50 Mo, vidéos jusqu’à 1 Go).',
  },
  unsupportedType: {
    th: 'รองรับเฉพาะไฟล์ภาพถ่ายและวิดีโอ',
    en: 'Only photo and video files are supported.',
    fr: 'Seuls les fichiers photo et vidéo sont acceptés.',
  },
  tooManyFiles: {
    th: 'ส่งได้สูงสุดครั้งละ 10 ไฟล์',
    en: 'Up to 10 files per submission.',
    fr: '10 fichiers maximum par envoi.',
  },
  tooManySubmissions: {
    th: 'ส่งบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
    en: 'Too many submissions for now. Please wait a while and try again.',
    fr: 'Trop d’envois pour le moment. Veuillez patienter puis réessayer.',
  },
  saveFile: {
    th: 'บันทึก',
    en: 'Save',
    fr: 'Enregistrer',
  },
  needSomething: {
    th: 'กรุณาเขียนข้อความหรือเลือกไฟล์อย่างน้อยหนึ่งรายการ',
    en: 'Please write a message or choose at least one file.',
    fr: 'Veuillez écrire un message ou choisir au moins un fichier.',
  },
} satisfies Record<string, L10n>
