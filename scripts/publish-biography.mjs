// One-time publisher: uploads the real trilingual biography to the live site.
// Run: node scripts/publish-biography.mjs  (needs ADMIN_API_TOKEN in env)
const BASE = process.env.BIO_TARGET || 'https://jacquesprades.com'
const TOKEN = process.env.ADMIN_API_TOKEN
if (!TOKEN) throw new Error('ADMIN_API_TOKEN missing')

const bio = {
  photos: [],
  articles: [],
  sections: [
    {
      id: 'early-years',
      title: {
        en: 'Early Years: From Auvergne to Paris',
        fr: 'Les premières années : de l’Auvergne à Paris',
        th: 'วัยเยาว์: จากโอแวร์ญสู่ปารีส',
      },
      body: {
        en: `Born in Clermont-Ferrand in 1937, Jacques Prades spent his childhood among the volcanic hills of Auvergne, in a France marked by the upheavals of the Second World War. His father, Roger, a skilled jeweller, was taken prisoner during the conflict, leaving Jacques to spend much of his early childhood without him. When Roger finally returned, the young boy barely recognised the man standing before him.

The family's home was in Le Puy-en-Velay, a town whose narrow streets and surrounding mountains would remain vivid in Jacques's memory long after he had settled on the other side of the world. Yet from an early age, he seemed destined to venture beyond those familiar horizons.

At fifteen, following in his father's footsteps, he left for Paris to study at the Haute École de Joaillerie. The capital offered an entirely different world to the provincial town he had known. Between his studies, an apprenticeship in a jewellery workshop on Place Vendôme, and his journeys through Paris on a yellow Lambretta scooter, Jacques discovered both the discipline of his craft and the pleasures of independence.

He obtained qualifications in jewellery-making and fine jewellery, acquiring the technical foundations of a profession that would accompany him throughout his life. But the prospect of remaining in the family workshop in Auvergne held little appeal for a young man increasingly drawn towards distant places.

His compulsory military service took him to Algeria during the war of independence. The twenty-eight months he spent there exposed him to violence, hardship, and the contradictions of a conflict in which people who had once fought alongside one another could suddenly find themselves on opposing sides. The experience left a lasting impression on him, particularly in his attitudes towards injustice and the treatment of others.`,
        fr: `Né à Clermont-Ferrand en 1937, Jacques Prades passe son enfance parmi les collines volcaniques d'Auvergne, dans une France marquée par les bouleversements de la Seconde Guerre mondiale. Son père, Roger, joaillier de métier, est fait prisonnier pendant le conflit, et Jacques passe une grande partie de sa petite enfance sans lui. Lorsque Roger revient enfin, le jeune garçon reconnaît à peine l'homme qui se tient devant lui.

La maison familiale se trouvait au Puy-en-Velay, une ville dont les ruelles étroites et les montagnes environnantes resteraient vivantes dans la mémoire de Jacques bien après qu'il se soit installé à l'autre bout du monde. Mais dès son plus jeune âge, il semblait destiné à s'aventurer au-delà de ces horizons familiers.

À quinze ans, suivant les traces de son père, il part pour Paris étudier à la Haute École de Joaillerie. La capitale lui offre un monde entièrement différent de la ville de province qu'il avait connue. Entre ses études, un apprentissage dans un atelier de joaillerie de la place Vendôme et ses trajets à travers Paris sur une Lambretta jaune, Jacques découvre à la fois la discipline de son métier et les plaisirs de l'indépendance.

Il obtient ses diplômes de bijouterie et de haute joaillerie, acquérant les fondements techniques d'un métier qui l'accompagnera toute sa vie. Mais la perspective de rester dans l'atelier familial en Auvergne n'attire guère un jeune homme de plus en plus porté vers les terres lointaines.

Son service militaire l'emmène en Algérie pendant la guerre d'indépendance. Les vingt-huit mois qu'il y passe l'exposent à la violence, aux épreuves et aux contradictions d'un conflit où des hommes qui avaient autrefois combattu côte à côte pouvaient soudain se retrouver dans des camps opposés. Cette expérience le marque durablement, en particulier dans son rapport à l'injustice et à la manière de traiter autrui.`,
        th: `คุณแจ็คเกิดที่เมืองแกลร์มง-แฟร็อง ประเทศฝรั่งเศส ในปี ค.ศ. 1937 และเติบโตท่ามกลางเนินเขาภูเขาไฟแห่งแคว้นโอแวร์ญ ในช่วงเวลาที่ฝรั่งเศสเต็มไปด้วยความผันผวนจากสงครามโลกครั้งที่สอง บิดาของเขา โรเจอร์ เป็นช่างเครื่องประดับฝีมือดี ถูกจับเป็นเชลยศึกระหว่างสงคราม ทำให้คุณแจ็คต้องใช้ชีวิตวัยเด็กส่วนใหญ่โดยไม่มีพ่ออยู่เคียงข้าง เมื่อโรเจอร์กลับมาในที่สุด เด็กชายแทบจำชายที่ยืนอยู่ตรงหน้าไม่ได้

บ้านของครอบครัวอยู่ที่เมืองเลอปุย-อ็อง-เวอแล เมืองที่ตรอกซอกซอยแคบ ๆ และขุนเขาที่รายล้อม ยังคงแจ่มชัดในความทรงจำของคุณแจ็ค แม้ในวันที่เขาไปตั้งรกรากอยู่อีกซีกโลกหนึ่ง ทว่าตั้งแต่ยังเยาว์วัย เขาก็ดูเหมือนถูกลิขิตให้ออกเดินทางไกลเกินขอบฟ้าที่คุ้นเคยเหล่านั้น

เมื่ออายุสิบห้าปี เขาเดินตามรอยเท้าของบิดา มุ่งสู่กรุงปารีสเพื่อศึกษาที่สถาบัน Haute École de Joaillerie เมืองหลวงเปิดโลกใบใหม่ที่ต่างจากเมืองต่างจังหวัดที่เขาเคยรู้จักโดยสิ้นเชิง ระหว่างการเรียน การฝึกงานในห้องเครื่องประดับย่านปลาซ ว็องโดม และการขี่สกู๊ตเตอร์แลมเบรตตาสีเหลืองไปทั่วปารีส คุณแจ็คได้ค้นพบทั้งวินัยแห่งวิชาชีพและความสุขของอิสรภาพ

เขาสำเร็จการศึกษาด้านการทำเครื่องประดับและอัญมณีชั้นสูง ได้รากฐานทางเทคนิคของวิชาชีพที่จะอยู่กับเขาไปตลอดชีวิต แต่การอยู่ประจำห้องเครื่องประดับของครอบครัวที่โอแวร์ญ ไม่อาจดึงดูดใจชายหนุ่มผู้ใฝ่ฝันถึงดินแดนไกลโพ้นได้

การเกณฑ์ทหารพาเขาไปยังแอลจีเรียในช่วงสงครามประกาศเอกราช ยี่สิบแปดเดือนที่นั่นทำให้เขาได้เผชิญความรุนแรง ความยากลำบาก และความย้อนแย้งของสงคราม ที่ซึ่งผู้คนที่เคยร่วมรบเคียงบ่าเคียงไหล่กัน อาจพบว่าตนยืนอยู่คนละฝั่งในชั่วข้ามคืน ประสบการณ์ครั้งนั้นฝังลึกอยู่ในตัวเขา โดยเฉพาะทัศนคติต่อความอยุติธรรมและการปฏิบัติต่อเพื่อนมนุษย์`,
      },
    },
    {
      id: 'adventure',
      title: {
        en: 'The Years of Adventure',
        fr: 'Les années d’aventure',
        th: 'ปีแห่งการผจญภัย',
      },
      body: {
        en: `Returning to civilian life, Jacques resumed his work as a jeweller, but his appetite for travel soon took him abroad again. In 1968, he moved to Abidjan, in Côte d'Ivoire, where he helped establish a jewellery workshop and train its employees. The experience was professionally valuable, though the venture ended abruptly following financial difficulties involving his employer.

Back in Paris, he continued working in jewellery design and manufacturing, gradually finding arrangements that allowed him to alternate periods of work with extended journeys abroad.

In 1974, he embarked on one of the great adventures of his life. Together with his friend Constantin, he shipped a specially equipped Land Rover to Mexico and set off across Central America. The vehicle, fitted with sleeping space, cooking equipment, and supplies, became a travelling home.

Their route carried them through Mexico, Guatemala, Belize, Honduras, Nicaragua, Costa Rica, Panama, Colombia, and Venezuela. Along the way, the travellers encountered mechanical failures, difficult border crossings, unexpected friendships, and landscapes that were then far removed from established tourist routes.

Later joined by Michel, who would become one of his closest friends and future business partners, Jacques continued through South America, crossing the Andes, exploring Peru and Bolivia, travelling through Argentina and Brazil, and eventually reaching French Guiana.

The journey lasted many months and left behind a remarkable collection of letters, postcards, and journals. Written to his parents in France, they captured not only the places he visited but also the changing outlook of a man discovering the world through the people he met.

After returning to Europe, Jacques continued to travel, visiting countries across Africa and the Middle East. By the end of 1978, he and Michel had set their sights on Asia.

Their journey began in Bangkok, a city then vastly different from the sprawling metropolis it would become. From there, they travelled through Thailand and onwards to Hong Kong, the Philippines, Malaysia, Indonesia, Sri Lanka, Nepal, and India.

Their adventures were rarely conventional. They crossed remote seas between islands, stayed with local families, explored regions seldom visited by foreigners, and undertook a demanding month-long trek towards Kangchenjunga in the Himalayas, without guides or porters.

Thailand, however, would gradually assume a particular importance in Jacques's life.`,
        fr: `De retour à la vie civile, Jacques reprend son métier de joaillier, mais son goût du voyage l'entraîne bientôt de nouveau à l'étranger. En 1968, il s'installe à Abidjan, en Côte d'Ivoire, où il participe à la création d'un atelier de joaillerie et à la formation de ses employés. L'expérience est précieuse sur le plan professionnel, même si l'aventure s'achève brutalement à la suite de difficultés financières impliquant son employeur.

De retour à Paris, il poursuit son travail dans la création et la fabrication de bijoux, trouvant peu à peu des arrangements qui lui permettent d'alterner périodes de travail et longs voyages à l'étranger.

En 1974, il se lance dans l'une des grandes aventures de sa vie. Avec son ami Constantin, il expédie au Mexique un Land Rover spécialement aménagé et part traverser l'Amérique centrale. Le véhicule, équipé d'un couchage, de quoi cuisiner et de provisions, devient une maison roulante.

Leur itinéraire les mène à travers le Mexique, le Guatemala, le Belize, le Honduras, le Nicaragua, le Costa Rica, le Panama, la Colombie et le Venezuela. En chemin, les voyageurs connaissent pannes mécaniques, passages de frontières difficiles, amitiés inattendues et paysages alors bien éloignés des routes touristiques.

Rejoint plus tard par Michel, qui deviendra l'un de ses amis les plus proches et son futur associé, Jacques poursuit à travers l'Amérique du Sud : la traversée des Andes, le Pérou et la Bolivie, l'Argentine et le Brésil, jusqu'à la Guyane française.

Le voyage dure de longs mois et laisse derrière lui une remarquable collection de lettres, de cartes postales et de carnets. Écrits à ses parents restés en France, ils saisissent non seulement les lieux traversés, mais aussi le regard changeant d'un homme qui découvre le monde à travers les personnes qu'il rencontre.

De retour en Europe, Jacques continue de voyager, visitant de nombreux pays d'Afrique et du Moyen-Orient. Fin 1978, Michel et lui tournent leurs regards vers l'Asie.

Leur périple commence à Bangkok, ville alors bien différente de l'immense métropole qu'elle allait devenir. De là, ils traversent la Thaïlande, puis poursuivent vers Hong Kong, les Philippines, la Malaisie, l'Indonésie, le Sri Lanka, le Népal et l'Inde.

Leurs aventures n'avaient rien de conventionnel. Ils traversèrent des mers isolées entre les îles, logèrent chez l'habitant, explorèrent des régions rarement visitées par les étrangers et entreprirent une éprouvante marche d'un mois vers le Kangchenjunga, dans l'Himalaya, sans guides ni porteurs.

La Thaïlande, cependant, allait peu à peu prendre une place singulière dans la vie de Jacques.`,
        th: `เมื่อกลับคืนสู่ชีวิตพลเรือน คุณแจ็คกลับมาทำงานช่างเครื่องประดับอีกครั้ง แต่ไม่นานความหลงใหลในการเดินทางก็พาเขาออกนอกประเทศอีก ในปี ค.ศ. 1968 เขาย้ายไปอาบีจาน ประเทศโกตดิวัวร์ เพื่อร่วมก่อตั้งห้องเครื่องประดับและฝึกฝนพนักงาน ประสบการณ์ครั้งนั้นมีคุณค่าทางวิชาชีพอย่างยิ่ง แม้กิจการจะจบลงอย่างกะทันหันจากปัญหาทางการเงินของนายจ้าง

เมื่อกลับมาปารีส เขายังคงทำงานออกแบบและผลิตเครื่องประดับ และค่อย ๆ หาวิธีจัดสรรชีวิต ให้สลับระหว่างช่วงเวลาทำงานกับการเดินทางไกลในต่างแดน

ปี ค.ศ. 1974 เขาเริ่มต้นหนึ่งในการผจญภัยครั้งยิ่งใหญ่ของชีวิต เขากับกงสต็องแต็ง เพื่อนรัก ส่งรถแลนด์โรเวอร์ที่ดัดแปลงเป็นพิเศษไปยังเม็กซิโก แล้วออกเดินทางข้ามอเมริกากลาง รถคันนั้นซึ่งติดตั้งที่นอน อุปกรณ์ทำครัว และเสบียง กลายเป็นบ้านเคลื่อนที่ของพวกเขา

เส้นทางพาพวกเขาผ่านเม็กซิโก กัวเตมาลา เบลีซ ฮอนดูรัส นิการากัว คอสตาริกา ปานามา โคลอมเบีย และเวเนซุเอลา ตลอดทางนักเดินทางทั้งสองพบทั้งเครื่องยนต์ขัดข้อง ด่านพรมแดนที่ยากลำบาก มิตรภาพที่ไม่คาดฝัน และภูมิทัศน์ที่ยังห่างไกลจากเส้นทางท่องเที่ยวในยุคนั้น

ต่อมามีเชล ผู้ซึ่งจะกลายเป็นเพื่อนสนิทและหุ้นส่วนธุรกิจในอนาคต มาร่วมเดินทางด้วย คุณแจ็คเดินทางต่อผ่านอเมริกาใต้ ข้ามเทือกเขาแอนดีส สำรวจเปรูและโบลิเวีย ผ่านอาร์เจนตินาและบราซิล จนไปถึงเฟรนช์เกียนาในที่สุด

การเดินทางกินเวลาหลายเดือน และทิ้งไว้ซึ่งจดหมาย โปสการ์ด และสมุดบันทึกจำนวนมาก ที่เขียนถึงพ่อแม่ในฝรั่งเศส บันทึกเหล่านั้นไม่เพียงเล่าถึงสถานที่ที่เขาไปเยือน หากยังสะท้อนมุมมองที่เปลี่ยนไปของชายผู้ค้นพบโลกผ่านผู้คนที่ได้พบเจอ

หลังกลับมายุโรป คุณแจ็คยังคงเดินทางต่อ เยือนหลายประเทศทั่วแอฟริกาและตะวันออกกลาง ปลายปี ค.ศ. 1978 เขากับมีเชลหันเข็มทิศมุ่งสู่เอเชีย

การเดินทางเริ่มต้นที่กรุงเทพฯ เมืองที่ในเวลานั้นต่างจากมหานครอันกว้างใหญ่ในปัจจุบันอย่างสิ้นเชิง จากที่นั่นพวกเขาเดินทางทั่วประเทศไทย ต่อไปยังฮ่องกง ฟิลิปปินส์ มาเลเซีย อินโดนีเซีย ศรีลังกา เนปาล และอินเดีย

การผจญภัยของพวกเขาไม่ธรรมดาเลย ทั้งข้ามทะเลห่างไกลระหว่างเกาะ พักกับครอบครัวท้องถิ่น สำรวจดินแดนที่ชาวต่างชาติแทบไม่เคยไปถึง และเดินเท้าอันแสนทรหดนานหนึ่งเดือนสู่ยอดเขาคันเชนจุงกาในเทือกเขาหิมาลัย โดยไม่มีไกด์หรือลูกหาบ

ทว่าประเทศไทยนั้นเอง ที่ค่อย ๆ ก้าวเข้ามามีความหมายพิเศษในชีวิตของคุณแจ็ค`,
      },
    },
    {
      id: 'thailand',
      title: {
        en: 'A New Chapter in Thailand',
        fr: 'Un nouveau chapitre en Thaïlande',
        th: 'บทใหม่ในประเทศไทย',
      },
      body: {
        en: `Bangkok was already an important centre for the trade in precious stones, and Jacques's professional background gave him a keen interest in the city's jewellery workshops and gemstone merchants. Having trained in the traditions of French fine jewellery, he recognised opportunities to combine his technical knowledge with the skills of Thai artisans.

In 1980, he returned to Bangkok to establish JP Designers with several partners. The early enterprise began in a modest shophouse in Silom, with a small workforce and ambitions that considerably exceeded its resources.

Among the first employees was Chotip, a fourteen-year-old girl who initially joined the workshop for what she expected would be a single year. Jacques encouraged her to learn every aspect of jewellery production, as well as French and English. She would remain closely involved in the business for decades and eventually become his adopted daughter.

The first venture faced numerous challenges, including disagreements between its partners. In 1984, Jacques established Gamma Creations, beginning again with a small team and limited financial resources.`,
        fr: `Bangkok était déjà un centre important du commerce des pierres précieuses, et le parcours professionnel de Jacques nourrissait son vif intérêt pour les ateliers de joaillerie et les négociants en gemmes de la ville. Formé aux traditions de la haute joaillerie française, il sut reconnaître les possibilités qu'offrait l'alliance de son savoir technique et du talent des artisans thaïlandais.

En 1980, il revient à Bangkok pour fonder JP Designers avec plusieurs associés. L'entreprise débute dans une modeste maison-boutique de Silom, avec une petite équipe et des ambitions qui dépassaient largement ses moyens.

Parmi les premiers employés se trouvait Chotip, une jeune fille de quatorze ans qui pensait ne rester qu'une année à l'atelier. Jacques l'encouragea à apprendre toutes les facettes de la production joaillière, ainsi que le français et l'anglais. Elle resterait étroitement liée à l'entreprise pendant des décennies, et deviendrait sa fille adoptive.

Cette première aventure connut de nombreuses difficultés, dont des désaccords entre associés. En 1984, Jacques fonde Gamma Creations, repartant de zéro avec une petite équipe et des ressources financières limitées.`,
        th: `กรุงเทพฯ ในเวลานั้นเป็นศูนย์กลางการค้าอัญมณีที่สำคัญอยู่แล้ว และพื้นฐานวิชาชีพของคุณแจ็คทำให้เขาสนใจห้องเครื่องประดับและพ่อค้าพลอยของเมืองนี้เป็นพิเศษ ด้วยการฝึกฝนตามขนบอัญมณีชั้นสูงแบบฝรั่งเศส เขามองเห็นโอกาสในการผสานความรู้ทางเทคนิคของตน เข้ากับฝีมือของช่างไทย

ในปี ค.ศ. 1980 เขากลับมากรุงเทพฯ เพื่อก่อตั้ง JP Designers ร่วมกับหุ้นส่วนหลายคน กิจการเริ่มต้นในตึกแถวเล็ก ๆ ย่านสีลม ด้วยพนักงานไม่กี่คน และความฝันที่ใหญ่เกินกว่าทรัพยากรที่มีอยู่มาก

ในบรรดาพนักงานรุ่นแรกมีเด็กหญิงวัยสิบสี่ปีชื่อโชติ๊บ ผู้ตั้งใจแรกว่าจะทำงานที่ห้องเครื่องประดับเพียงปีเดียว คุณแจ็คสนับสนุนให้เธอเรียนรู้ทุกขั้นตอนของการผลิตเครื่องประดับ รวมถึงภาษาฝรั่งเศสและอังกฤษ เธอผูกพันใกล้ชิดกับกิจการต่อเนื่องหลายสิบปี และในที่สุดได้กลายเป็นบุตรบุญธรรมของเขา

กิจการแรกเผชิญอุปสรรคมากมาย รวมถึงความขัดแย้งระหว่างหุ้นส่วน ในปี ค.ศ. 1984 คุณแจ็คจึงก่อตั้ง Gamma Creations เริ่มต้นใหม่อีกครั้งด้วยทีมเล็ก ๆ และทุนทรัพย์อันจำกัด`,
      },
    },
    {
      id: 'gamma',
      title: {
        en: 'Building Gamma Creations',
        fr: 'La construction de Gamma Creations',
        th: 'การก่อร่างสร้าง Gamma Creations',
      },
      body: {
        en: `From these modest beginnings, the company gradually developed into one of Bangkok's respected fine jewellery manufacturers. Drawing on the techniques he had learned in France and the expertise of Thai craftspeople, Jacques built an integrated workshop capable of handling the many stages of jewellery production, from design and model-making to stone setting, finishing, and assembly.

His particular interest lay in technical challenges and the creation of intricate pieces requiring exceptional precision. Over time, Gamma Creations became known internationally for its craftsmanship and its ability to undertake demanding projects.

Jacques also played an influential role in the development of Thailand's fine jewellery industry. He shared techniques, trained craftspeople, advised fellow jewellers, and assisted other businesses during their early years. Some of those he helped would go on to establish successful workshops of their own.

As Bangkok expanded, Gamma Creations moved through several premises before eventually occupying a purpose-built building. The small workshop of the early 1980s had grown into a company employing more than a hundred people, many of whom had worked alongside Jacques for decades.

His professional life remained closely connected to his personal relationships. Friends became colleagues, colleagues became lifelong friends, and the company formed a central part of the community he had established in Thailand.`,
        fr: `De ces débuts modestes, l'entreprise devint peu à peu l'une des manufactures de haute joaillerie respectées de Bangkok. S'appuyant sur les techniques apprises en France et sur le savoir-faire des artisans thaïlandais, Jacques bâtit un atelier intégré capable de maîtriser les nombreuses étapes de la production joaillière, de la conception et du maquettage au sertissage, à la finition et à l'assemblage.

Il se passionnait particulièrement pour les défis techniques et la création de pièces complexes exigeant une précision exceptionnelle. Au fil du temps, Gamma Creations acquit une renommée internationale pour la qualité de son artisanat et sa capacité à mener des projets exigeants.

Jacques joua également un rôle influent dans le développement de la haute joaillerie thaïlandaise. Il partagea ses techniques, forma des artisans, conseilla ses confrères joailliers et aida d'autres entreprises à leurs débuts. Certains de ceux qu'il accompagna fonderaient à leur tour des ateliers prospères.

À mesure que Bangkok s'étendait, Gamma Creations occupa plusieurs locaux successifs avant de s'installer dans un bâtiment construit à sa mesure. Le petit atelier du début des années 1980 était devenu une entreprise de plus d'une centaine de personnes, dont beaucoup travaillaient aux côtés de Jacques depuis des décennies.

Sa vie professionnelle resta étroitement liée à ses relations personnelles. Les amis devinrent des collègues, les collègues des amis pour la vie, et l'entreprise occupa une place centrale dans la communauté qu'il s'était créée en Thaïlande.`,
        th: `จากจุดเริ่มต้นอันเรียบง่าย บริษัทค่อย ๆ เติบโตเป็นหนึ่งในผู้ผลิตอัญมณีชั้นสูงที่ได้รับความนับถือของกรุงเทพฯ ด้วยเทคนิคที่ร่ำเรียนมาจากฝรั่งเศสผสานกับความเชี่ยวชาญของช่างฝีมือไทย คุณแจ็คสร้างห้องเครื่องประดับครบวงจร ที่ดูแลการผลิตได้ทุกขั้นตอน ตั้งแต่การออกแบบและขึ้นแบบ ไปจนถึงการฝังอัญมณี การเก็บรายละเอียด และการประกอบชิ้นงาน

สิ่งที่เขาหลงใหลเป็นพิเศษคือโจทย์ทางเทคนิค และการสร้างสรรค์ชิ้นงานอันประณีตที่ต้องการความแม่นยำเป็นเลิศ เมื่อเวลาผ่านไป Gamma Creations เป็นที่รู้จักในระดับนานาชาติ ทั้งด้านฝีมือช่างและความสามารถในการรับงานที่ท้าทาย

คุณแจ็คยังมีบทบาทสำคัญต่อการพัฒนาอุตสาหกรรมอัญมณีชั้นสูงของประเทศไทย เขาถ่ายทอดเทคนิค ฝึกฝนช่างฝีมือ ให้คำปรึกษาแก่เพื่อนร่วมวิชาชีพ และช่วยเหลือกิจการอื่น ๆ ในช่วงเริ่มต้น หลายคนที่เขาเคยช่วยเหลือ ได้ก่อตั้งห้องเครื่องประดับที่ประสบความสำเร็จของตนเองในเวลาต่อมา

เมื่อกรุงเทพฯ ขยายตัว Gamma Creations ย้ายที่ทำการหลายครั้ง ก่อนจะลงหลักปักฐานในอาคารที่สร้างขึ้นเพื่อกิจการโดยเฉพาะ ห้องเครื่องประดับเล็ก ๆ ของต้นทศวรรษ 1980 เติบโตเป็นบริษัทที่มีพนักงานกว่าหนึ่งร้อยคน ซึ่งหลายคนทำงานเคียงข้างคุณแจ็คมานานหลายสิบปี

ชีวิตการงานของเขาผูกพันแน่นแฟ้นกับสายสัมพันธ์ส่วนตัวเสมอมา เพื่อนกลายเป็นเพื่อนร่วมงาน เพื่อนร่วมงานกลายเป็นมิตรแท้ตลอดชีวิต และบริษัทคือหัวใจของชุมชนที่เขาสร้างขึ้นในประเทศไทย`,
      },
    },
    {
      id: 'family',
      title: {
        en: 'Family, Friendship and Life in Bangkok',
        fr: 'Famille, amitiés et vie à Bangkok',
        th: 'ครอบครัว มิตรภาพ และชีวิตในกรุงเทพฯ',
      },
      body: {
        en: `During these years, Jacques met Toy, a young Thai woman studying classical dance. They married and raised their daughters, Tara and Laura, in Bangkok.

Their home became a gathering place for an unusually international circle of friends, relatives, fellow jewellers, and travellers. Visitors from France and elsewhere frequently found themselves around the family dinner table, where conversations could continue late into the evening.

Jacques retained his enthusiasm for travel, introducing his family to places that had fascinated him during his earlier journeys. He also remained close to his mother, Lucie, who regularly visited Thailand and accompanied him on trips across Asia.

Alongside his business and family life, Jacques supported various charitable initiatives, particularly those involving children and education. Following the Indian Ocean tsunami in 2004, he travelled to affected areas in southern Thailand to assist people who had been caught in the disaster.

Even in his later years, he remained closely involved with Gamma Creations and continued to take an interest in its people, projects, and future.`,
        fr: `C'est au cours de ces années que Jacques rencontre Toy, une jeune Thaïlandaise qui étudiait la danse classique. Ils se marièrent et élevèrent leurs filles, Tara et Laura, à Bangkok.

Leur maison devint un lieu de rencontre pour un cercle singulièrement international d'amis, de parents, de confrères joailliers et de voyageurs. Les visiteurs venus de France et d'ailleurs se retrouvaient souvent autour de la table familiale, où les conversations se prolongeaient tard dans la soirée.

Jacques garda intact son enthousiasme pour les voyages, faisant découvrir à sa famille les lieux qui l'avaient fasciné lors de ses périples de jeunesse. Il resta également proche de sa mère, Lucie, qui venait régulièrement en Thaïlande et l'accompagnait dans ses voyages à travers l'Asie.

Parallèlement à sa vie professionnelle et familiale, Jacques soutint diverses initiatives caritatives, en particulier celles consacrées aux enfants et à l'éducation. Après le tsunami de l'océan Indien en 2004, il se rendit dans les zones sinistrées du sud de la Thaïlande pour venir en aide aux personnes frappées par la catastrophe.

Même dans ses dernières années, il resta étroitement lié à Gamma Creations et continua de s'intéresser à ses équipes, à ses projets et à son avenir.`,
        th: `ในช่วงปีเหล่านั้นเอง คุณแจ็คได้พบกับต้อย หญิงสาวไทยผู้ศึกษานาฏศิลป์ ทั้งสองแต่งงานกันและเลี้ยงดูลูกสาวสองคน คือทาร่าและลอร่า ในกรุงเทพฯ

บ้านของพวกเขากลายเป็นที่พบปะของมิตรสหายนานาชาติ ทั้งญาติพี่น้อง เพื่อนร่วมวิชาชีพอัญมณี และนักเดินทาง ผู้มาเยือนจากฝรั่งเศสและทั่วทุกมุมโลก มักได้ร่วมโต๊ะอาหารของครอบครัว ที่ซึ่งบทสนทนามักยืดยาวไปจนดึกดื่น

คุณแจ็คยังคงรักการเดินทางไม่เสื่อมคลาย พาครอบครัวไปรู้จักสถานที่ต่าง ๆ ที่เคยตราตรึงใจเขาในการเดินทางครั้งวัยหนุ่ม เขายังคงใกล้ชิดกับมารดา คุณลูซี ผู้มาเยือนประเทศไทยเป็นประจำและร่วมเดินทางกับเขาไปทั่วเอเชีย

ควบคู่กับธุรกิจและชีวิตครอบครัว คุณแจ็คสนับสนุนกิจกรรมการกุศลหลากหลาย โดยเฉพาะที่เกี่ยวกับเด็กและการศึกษา หลังเหตุการณ์สึนามิในมหาสมุทรอินเดียปี ค.ศ. 2004 เขาเดินทางลงพื้นที่ประสบภัยในภาคใต้ของไทย เพื่อช่วยเหลือผู้ที่ได้รับผลกระทบจากภัยพิบัติ

แม้ในบั้นปลายชีวิต เขายังคงผูกพันใกล้ชิดกับ Gamma Creations และใส่ใจในผู้คน โครงการ และอนาคตของบริษัทเสมอมา`,
      },
    },
    {
      id: 'story',
      title: {
        en: 'Preserving His Story',
        fr: 'Préserver son histoire',
        th: 'บันทึกเรื่องราวของเขา',
      },
      body: {
        en: `In 2019, as Alzheimer's disease began to affect his memory, biographer Anaïd undertook the task of documenting his life. Drawing on interviews with Jacques, his family, friends, and colleagues, as well as the extensive correspondence he had preserved from his travels, she assembled a detailed account of his remarkable journey.

The resulting manuscript traces a life that crossed continents and generations, from the workshops of post-war Paris to the remote landscapes of South America and Asia, and finally to the jewellery industry of modern Bangkok.

Jacques Prades passed away in 2026, leaving behind his family, the company he founded, and a lifetime of friendships and professional relationships spanning much of the world.

His story is inseparable from the history of Gamma Creations, but it also belongs to a much wider world: one of distant journeys, unexpected encounters, enduring friendships, and a curiosity that carried him far beyond the hills of his childhood.`,
        fr: `En 2019, alors que la maladie d'Alzheimer commençait à atteindre sa mémoire, la biographe Anaïd entreprit de documenter sa vie. S'appuyant sur des entretiens avec Jacques, sa famille, ses amis et ses collègues, ainsi que sur l'abondante correspondance qu'il avait conservée de ses voyages, elle composa le récit détaillé de son remarquable parcours.

Le manuscrit qui en résulte retrace une vie qui traversa les continents et les générations, des ateliers du Paris d'après-guerre aux paysages lointains d'Amérique du Sud et d'Asie, jusqu'à la joaillerie du Bangkok moderne.

Jacques Prades s'est éteint en 2026, laissant derrière lui sa famille, l'entreprise qu'il avait fondée, et toute une vie d'amitiés et de liens professionnels tissés à travers le monde.

Son histoire est inséparable de celle de Gamma Creations, mais elle appartient aussi à un monde bien plus vaste : celui des voyages lointains, des rencontres inattendues, des amitiés durables, et d'une curiosité qui le porta bien au-delà des collines de son enfance.`,
        th: `ในปี ค.ศ. 2019 เมื่อโรคอัลไซเมอร์เริ่มส่งผลต่อความทรงจำของเขา อะนาอีด นักเขียนชีวประวัติ ได้รับหน้าที่บันทึกเรื่องราวชีวิตของคุณแจ็ค เธอเรียบเรียงจากบทสัมภาษณ์คุณแจ็ค ครอบครัว เพื่อน และเพื่อนร่วมงาน รวมทั้งจดหมายจำนวนมากที่เขาเก็บรักษาไว้จากการเดินทาง จนได้เรื่องราวอันละเอียดลออของเส้นทางชีวิตที่น่าทึ่งนี้

ต้นฉบับที่ได้บอกเล่าชีวิตที่ข้ามผ่านทวีปและยุคสมัย จากห้องเครื่องประดับแห่งปารีสหลังสงคราม สู่ดินแดนห่างไกลของอเมริกาใต้และเอเชีย จนถึงอุตสาหกรรมอัญมณีของกรุงเทพฯ ยุคใหม่

คุณแจ็คจากไปในปี ค.ศ. 2026 ทิ้งไว้ซึ่งครอบครัว บริษัทที่เขาก่อตั้ง และมิตรภาพกับสายสัมพันธ์ทางวิชาชีพตลอดชีวิตที่แผ่กว้างไปทั่วโลก

เรื่องราวของเขาแยกไม่ออกจากประวัติศาสตร์ของ Gamma Creations แต่ก็เป็นเรื่องราวของโลกที่กว้างใหญ่กว่านั้นมาก โลกแห่งการเดินทางไกล การพบพานที่ไม่คาดฝัน มิตรภาพอันยั่งยืน และความใฝ่รู้ใฝ่เห็นที่พาเขาไปไกลเกินเนินเขาแห่งวัยเยาว์ของตน`,
      },
    },
  ],
}

const res = await fetch(`${BASE}/api/admin/biography`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify(bio),
})
console.log('publish:', res.status, await res.text())
