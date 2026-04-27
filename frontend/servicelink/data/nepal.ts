export const provinces = [
  { id: 1, name: "Koshi Province" },
  { id: 2, name: "Madhesh Province" },
  { id: 3, name: "Bagmati Province" },
  { id: 4, name: "Gandaki Province" },
  { id: 5, name: "Lumbini Province" },
  { id: 6, name: "Karnali Province" },
  { id: 7, name: "Sudurpashchim Province" },
] as const;

export type ProvinceId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const districts: Record<ProvinceId, string[]> = {
  1: [
    "Bhojpur",
    "Dhankuta",
    "Ilam",
    "Jhapa",
    "Khotang",
    "Morang",
    "Okhaldhunga",
    "Panchthar",
    "Sankhuwasabha",
    "Solukhumbu",
    "Sunsari",
    "Taplejung",
    "Terhathum",
    "Udayapur",
  ],
  2: [
    "Bara",
    "Dhanusha",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  3: [
    "Bhaktapur",
    "Chitwan",
    "Dhading",
    "Dolakha",
    "Kathmandu",
    "Kavrepalanchok",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasuwa",
    "Sindhuli",
    "Sindhupalchok",
  ],
  4: [
    "Baglung",
    "Gorkha",
    "Kaski",
    "Lamjung",
    "Manang",
    "Mustang",
    "Myagdi",
    "Nawalpur",
    "Parbat",
    "Syangja",
    "Tanahun",
  ],
  5: [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Dang",
    "Eastern Rukum",
    "Gulmi",
    "Kapilvastu",
    "Nawalparasi East",
    "Palpa",
    "Pyuthan",
    "Rolpa",
    "Rupandehi",
  ],
  6: [
    "Dailekh",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Jumla",
    "Kalikot",
    "Mugu",
    "Salyan",
    "Surkhet",
    "Western Rukum",
  ],
  7: [
    "Achham",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Dadeldhura",
    "Darchula",
    "Doti",
    "Kailali",
    "Kanchanpur",
  ],
};

// ─── Municipality types ────────────────────────────────────────────────────

export type MunicipalityType =
  | "Metropolitan City"
  | "Sub-Metropolitan City"
  | "Municipality"
  | "Rural Municipality";

export interface Municipality {
  name: string;
  type: MunicipalityType;
  wards: number; // total number of wards
}

// ─── Municipalities keyed by district name ─────────────────────────────────

export const municipalities: Record<string, Municipality[]> = {
  // ── Province 1 · Koshi ──────────────────────────────────────────────────

  Bhojpur: [
    { name: "Bhojpur Municipality", type: "Municipality", wards: 9 },
    { name: "Shadananda Municipality", type: "Municipality", wards: 9 },
    { name: "Arun Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Aamchowk Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Hatuwagadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Pauwadungma Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Ramprasad Rai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Salpasilichho Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tyamke Yuwa Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Dhankuta: [
    { name: "Dhankuta Municipality", type: "Municipality", wards: 9 },
    { name: "Pakhribas Municipality", type: "Municipality", wards: 9 },
    {
      name: "Chhathar Jorpati Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Khalsa Devi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Mahalaxmi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Sangurigadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sahidbhumi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Ilam: [
    { name: "Ilam Municipality", type: "Municipality", wards: 9 },
    { name: "Deumai Municipality", type: "Municipality", wards: 9 },
    { name: "Mai Municipality", type: "Municipality", wards: 9 },
    { name: "Suryodaya Municipality", type: "Municipality", wards: 9 },
    {
      name: "Chulachuli Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Fakphokthum Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mai Jogmai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mangsebung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Rong Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Sandakpur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Jhapa: [
    { name: "Bhadrapur Municipality", type: "Municipality", wards: 9 },
    { name: "Birtamod Municipality", type: "Municipality", wards: 9 },
    { name: "Damak Municipality", type: "Municipality", wards: 9 },
    { name: "Kankai Municipality", type: "Municipality", wards: 9 },
    { name: "Mechinagar Municipality", type: "Municipality", wards: 9 },
    { name: "Shivasatakshi Municipality", type: "Municipality", wards: 9 },
    { name: "Arjundhara Municipality", type: "Municipality", wards: 9 },
    { name: "Gauriganj Municipality", type: "Municipality", wards: 9 },
    {
      name: "Haldibari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Jhapa Rural Municipality", type: "Rural Municipality", wards: 7 },
    {
      name: "Kachankawal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Kamal Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Buddhashanti Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Barhadashi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Khotang: [
    {
      name: "Diktel Rupakot Majhuwagadhi Municipality",
      type: "Municipality",
      wards: 9,
    },
    { name: "Halesi Tuwachung Municipality", type: "Municipality", wards: 9 },
    {
      name: "Khotehang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Ainselukhark Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Barahpokhari Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Diprung Chuichumma Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Jantedhunga Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kepilasgadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Rawabesi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Sakela Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Morang: [
    {
      name: "Biratnagar Metropolitan City",
      type: "Metropolitan City",
      wards: 19,
    },
    { name: "Urlabari Municipality", type: "Municipality", wards: 9 },
    { name: "Sunwarshi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Pathari Shanischare Municipality",
      type: "Municipality",
      wards: 9,
    },
    { name: "Rangeli Municipality", type: "Municipality", wards: 9 },
    { name: "Letang Municipality", type: "Municipality", wards: 9 },
    { name: "Ratuwamai Municipality", type: "Municipality", wards: 9 },
    { name: "Belbari Municipality", type: "Municipality", wards: 9 },
    { name: "Budhiganga Municipality", type: "Municipality", wards: 9 },
    {
      name: "Gramthan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Jahada Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Kanepokhari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kerabari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Miklajung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Sundarharaicha Municipality", type: "Municipality", wards: 9 },
  ],
  Okhaldhunga: [
    { name: "Siddhicharan Municipality", type: "Municipality", wards: 9 },
    { name: "Molung Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Champadevi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Chisankhugadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Khijidemba Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Likhu Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Manebhanjyang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sunkoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Panchthar: [
    { name: "Phidim Municipality", type: "Municipality", wards: 9 },
    {
      name: "Falgunanda Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Hilihang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kummayak Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Miklajung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Phalelung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tumbewa Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Yangwarak Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Sankhuwasabha: [
    { name: "Khandbari Municipality", type: "Municipality", wards: 9 },
    { name: "Dharmadevi Municipality", type: "Municipality", wards: 9 },
    { name: "Panchkhapan Municipality", type: "Municipality", wards: 9 },
    { name: "Chainpur Municipality", type: "Municipality", wards: 9 },
    { name: "Madi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Makalu Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Sabhapokhari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Silichong Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Solukhumbu: [
    { name: "Solududhkunda Municipality", type: "Municipality", wards: 9 },
    {
      name: "Dudh Koshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Khumbu Pasanglhamu Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Likhu Pike Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mahakulung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Nechasalyan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Sotang Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Thulung Dudhkoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Sunsari: [
    { name: "Inaruwa Municipality", type: "Municipality", wards: 9 },
    {
      name: "Dharan Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 19,
    },
    {
      name: "Itahari Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 15,
    },
    { name: "Barahakshetra Municipality", type: "Municipality", wards: 9 },
    { name: "Duhabi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Harinagara Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Koshi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Ramdhuni Municipality", type: "Municipality", wards: 9 },
    { name: "Gadhi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Barju Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Taplejung: [
    { name: "Phungling Municipality", type: "Municipality", wards: 9 },
    {
      name: "Aathrai Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Maiwakhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Meringden Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mikwakhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Pathibhara Yangwarak Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Phaktanglung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sidingwa Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sirijangha Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Terhathum: [
    { name: "Myanglung Municipality", type: "Municipality", wards: 9 },
    { name: "Laligurans Municipality", type: "Municipality", wards: 9 },
    {
      name: "Aathrai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Chhathar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Menchayam Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Phedap Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Udayapur: [
    { name: "Katari Municipality", type: "Municipality", wards: 9 },
    { name: "Triyuga Municipality", type: "Municipality", wards: 11 },
    { name: "Belaka Municipality", type: "Municipality", wards: 9 },
    {
      name: "Udayapurgadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Chaudandigadhi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Rautamai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sunkoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Tapli Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],

  // ── Province 2 · Madhesh ────────────────────────────────────────────────

  Bara: [
    {
      name: "Kalaiya Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 14,
    },
    {
      name: "Jitpur Simara Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 14,
    },
    { name: "Kolhabi Municipality", type: "Municipality", wards: 9 },
    { name: "Nijgadh Municipality", type: "Municipality", wards: 9 },
    { name: "Prasauni Municipality", type: "Municipality", wards: 9 },
    { name: "Pheta Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Adarsha Kotwal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Baragadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bawanipurwa Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bishrampur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Devtal Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Karakatta Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Mahagadhimai Municipality", type: "Municipality", wards: 9 },
    { name: "Paroha Municipality", type: "Municipality", wards: 9 },
    { name: "Simraungadh Municipality", type: "Municipality", wards: 9 },
    { name: "Suwarna Municipality", type: "Municipality", wards: 9 },
  ],
  Dhanusha: [
    {
      name: "Janakpur Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 22,
    },
    { name: "Chhireshwornath Municipality", type: "Municipality", wards: 9 },
    { name: "Dhanusadham Municipality", type: "Municipality", wards: 9 },
    { name: "Ganeshman Charnath Municipality", type: "Municipality", wards: 9 },
    { name: "Hans Pur Municipality", type: "Municipality", wards: 9 },
    { name: "Kamala Municipality", type: "Municipality", wards: 9 },
    { name: "Mithila Municipality", type: "Municipality", wards: 9 },
    { name: "Mithila Bihari Municipality", type: "Municipality", wards: 9 },
    { name: "Nagarain Municipality", type: "Municipality", wards: 9 },
    { name: "Sahidnagar Municipality", type: "Municipality", wards: 9 },
    { name: "Sabaila Municipality", type: "Municipality", wards: 9 },
    { name: "Aurahi Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Bateshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Bideha Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Dhanauji Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Janaknandini Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Lakshminiya Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mukhiyapatti Musarmiya Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Shahidnagar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Shreeram Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Mahottari: [
    { name: "Jaleshwar Municipality", type: "Municipality", wards: 9 },
    { name: "Bardibas Municipality", type: "Municipality", wards: 9 },
    { name: "Gaushala Municipality", type: "Municipality", wards: 9 },
    { name: "Manara Shiswa Municipality", type: "Municipality", wards: 9 },
    { name: "Matihani Municipality", type: "Municipality", wards: 9 },
    { name: "Ramgopalpur Municipality", type: "Municipality", wards: 9 },
    { name: "Samsi Municipality", type: "Municipality", wards: 9 },
    { name: "Sonama Municipality", type: "Municipality", wards: 9 },
    { name: "Aurahi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Balawa Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Bhangaha Municipality", type: "Municipality", wards: 9 },
    { name: "Ekdara Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Loharpatti Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mahottari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Pipra Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Parsa: [
    { name: "Birgunj Metropolitan City", type: "Metropolitan City", wards: 19 },
    { name: "Bahudarmai Municipality", type: "Municipality", wards: 9 },
    { name: "Parsagadhi Municipality", type: "Municipality", wards: 9 },
    { name: "Pokhariya Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bindabasini Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Chhipaharmai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Dhobini Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Jagarnathpur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Jirabhawani Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kalikamai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Paterwa Sugauli Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sakhuwa Parsauni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Thori Rural Municipality", type: "Rural Municipality", wards: 5 },
  ],
  Rautahat: [
    { name: "Gaur Municipality", type: "Municipality", wards: 9 },
    { name: "Baudhimai Municipality", type: "Municipality", wards: 9 },
    { name: "Brindaban Municipality", type: "Municipality", wards: 9 },
    { name: "Chandrapur Municipality", type: "Municipality", wards: 9 },
    { name: "Dewahi Gonahi Municipality", type: "Municipality", wards: 9 },
    { name: "Garuda Municipality", type: "Municipality", wards: 9 },
    { name: "Gadhimai Municipality", type: "Municipality", wards: 9 },
    { name: "Gujara Municipality", type: "Municipality", wards: 9 },
    { name: "Ishanath Municipality", type: "Municipality", wards: 9 },
    { name: "Katahariya Municipality", type: "Municipality", wards: 9 },
    { name: "Maulapur Municipality", type: "Municipality", wards: 9 },
    { name: "Paroha Municipality", type: "Municipality", wards: 9 },
    { name: "Phatuwa Bijayapur Municipality", type: "Municipality", wards: 9 },
    { name: "Rajdevi Municipality", type: "Municipality", wards: 9 },
    { name: "Rajpur Municipality", type: "Municipality", wards: 9 },
    {
      name: "Durga Bhagwati Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Madhav Narayan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Yamunamai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Saptari: [
    { name: "Rajbiraj Municipality", type: "Municipality", wards: 9 },
    { name: "Bodebarsain Municipality", type: "Municipality", wards: 9 },
    { name: "Dakneshwori Municipality", type: "Municipality", wards: 9 },
    {
      name: "Hanumannagar Kankalini Municipality",
      type: "Municipality",
      wards: 9,
    },
    { name: "Kanchanrup Municipality", type: "Municipality", wards: 9 },
    { name: "Khalte Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Mahadeva Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Saptakoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Shambhunath Municipality", type: "Municipality", wards: 9 },
    { name: "Surunga Municipality", type: "Municipality", wards: 9 },
    { name: "Tirhut Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Tilathi Koiladi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Balan Bihul Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Agnisair Krishna Savaran Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Rupani Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Chhinnamasta Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Sarlahi: [
    { name: "Malangwa Municipality", type: "Municipality", wards: 9 },
    { name: "Barahathawa Municipality", type: "Municipality", wards: 9 },
    { name: "Bagmati Municipality", type: "Municipality", wards: 9 },
    { name: "Balara Municipality", type: "Municipality", wards: 9 },
    { name: "Basbariya Municipality", type: "Municipality", wards: 9 },
    { name: "Chakraghatta Municipality", type: "Municipality", wards: 9 },
    { name: "Chandranagar Municipality", type: "Municipality", wards: 9 },
    { name: "Godaita Municipality", type: "Municipality", wards: 9 },
    { name: "Haripurwa Municipality", type: "Municipality", wards: 9 },
    { name: "Hariwan Municipality", type: "Municipality", wards: 9 },
    { name: "Ishworpur Municipality", type: "Municipality", wards: 9 },
    { name: "Kabilasi Municipality", type: "Municipality", wards: 9 },
    { name: "Lalbandi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Dhankaul Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bramhapuri Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Ramnagar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Bishnu Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Parsuni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Siraha: [
    { name: "Siraha Municipality", type: "Municipality", wards: 9 },
    { name: "Golbazar Municipality", type: "Municipality", wards: 9 },
    { name: "Lahan Municipality", type: "Municipality", wards: 9 },
    { name: "Mirchaiya Municipality", type: "Municipality", wards: 9 },
    { name: "Karjanha Municipality", type: "Municipality", wards: 9 },
    { name: "Sukhipur Municipality", type: "Municipality", wards: 9 },
    { name: "Kalyanpur Municipality", type: "Municipality", wards: 9 },
    { name: "Dhangadhimai Municipality", type: "Municipality", wards: 9 },
    { name: "Arnama Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Aurahi Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Bariyarpatti Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bhagwanpur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bishnupur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Lakshmipur Patari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Nawarajpur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sakhuwanankarkatti Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tetariya Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],

  // ── Province 3 · Bagmati ────────────────────────────────────────────────

  Bhaktapur: [
    { name: "Bhaktapur Municipality", type: "Municipality", wards: 10 },
    { name: "Changunarayan Municipality", type: "Municipality", wards: 9 },
    { name: "Madhyapur Thimi Municipality", type: "Municipality", wards: 9 },
    { name: "Suryabinayak Municipality", type: "Municipality", wards: 9 },
  ],
  Chitwan: [
    {
      name: "Bharatpur Metropolitan City",
      type: "Metropolitan City",
      wards: 29,
    },
    { name: "Ratnanagar Municipality", type: "Municipality", wards: 9 },
    { name: "Khairhani Municipality", type: "Municipality", wards: 9 },
    { name: "Rapti Municipality", type: "Municipality", wards: 9 },
    { name: "Madi Municipality", type: "Municipality", wards: 9 },
    { name: "Kalika Municipality", type: "Municipality", wards: 9 },
    {
      name: "Ichchhakamana Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Dhading: [
    { name: "Nilkantha Municipality", type: "Municipality", wards: 9 },
    { name: "Dhunibeshi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Benighat Rorang Rural Municipality",
      type: "Rural Municipality",
      wards: 8,
    },
    { name: "Gajuri Rural Municipality", type: "Rural Municipality", wards: 7 },
    {
      name: "Galchhi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Gangajamuna Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Jwalamukhi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Khaniyabas Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Netrawati Dabjong Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Rubi Valley Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Siddhalek Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Tripura Sundari Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Thakre Rural Municipality", type: "Rural Municipality", wards: 7 },
  ],
  Dolakha: [
    { name: "Charikot Municipality", type: "Municipality", wards: 9 },
    { name: "Bhimeshwar Municipality", type: "Municipality", wards: 9 },
    { name: "Jiri Municipality", type: "Municipality", wards: 9 },
    {
      name: "Baiteshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Bigu Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Gaurishankar Rural Municipality",
      type: "Rural Municipality",
      wards: 9,
    },
    {
      name: "Kalinchok Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Melung Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Sailung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Shailung Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tamakoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Vedpu Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Kathmandu: [
    {
      name: "Kathmandu Metropolitan City",
      type: "Metropolitan City",
      wards: 32,
    },
    { name: "Kirtipur Municipality", type: "Municipality", wards: 9 },
    { name: "Shankharapur Municipality", type: "Municipality", wards: 9 },
    { name: "Gokarneshwar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Kageshwori Manohara Municipality",
      type: "Municipality",
      wards: 9,
    },
    { name: "Nagarjun Municipality", type: "Municipality", wards: 9 },
    { name: "Tokha Municipality", type: "Municipality", wards: 9 },
    { name: "Tarakeshwar Municipality", type: "Municipality", wards: 11 },
    { name: "Chandragiri Municipality", type: "Municipality", wards: 15 },
    { name: "Budhanilkantha Municipality", type: "Municipality", wards: 13 },
  ],
  Kavrepalanchok: [
    { name: "Banepa Municipality", type: "Municipality", wards: 9 },
    { name: "Dhulikhel Municipality", type: "Municipality", wards: 9 },
    { name: "Panauti Municipality", type: "Municipality", wards: 9 },
    { name: "Namobuddha Municipality", type: "Municipality", wards: 9 },
    { name: "Panchkhal Municipality", type: "Municipality", wards: 9 },
    { name: "Mandan Deupur Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bethanchok Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Bhumlu Rural Municipality", type: "Rural Municipality", wards: 7 },
    {
      name: "Chaurideurali Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Khanikhola Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Mahabharat Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Roshi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Temal Rural Municipality", type: "Rural Municipality", wards: 7 },
  ],
  Lalitpur: [
    {
      name: "Lalitpur Metropolitan City",
      type: "Metropolitan City",
      wards: 29,
    },
    { name: "Godawari Municipality", type: "Municipality", wards: 14 },
    { name: "Mahalaxmi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bagmati Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Konjyosom Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mahankal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Makwanpur: [
    {
      name: "Hetauda Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 17,
    },
    {
      name: "Bhimphedi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Bakaiya Rural Municipality",
      type: "Rural Municipality",
      wards: 8,
    },
    {
      name: "Bagmati Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Indrasarowar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kailash Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Makwanpurgadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Manahari Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Raksirang Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Thaha Municipality", type: "Municipality", wards: 9 },
  ],
  Nuwakot: [
    { name: "Bidur Municipality", type: "Municipality", wards: 9 },
    { name: "Belkotgadhi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Dupcheshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Kakani Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Kispang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Likhu Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Meghang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Myagang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Panchakanya Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Shivapuri Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Suryagadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Tadi Rural Municipality", type: "Rural Municipality", wards: 7 },
    {
      name: "Tarkeshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Ramechhap: [
    { name: "Manthali Municipality", type: "Municipality", wards: 9 },
    { name: "Ramechhap Municipality", type: "Municipality", wards: 9 },
    {
      name: "Doramba Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Gokulganga Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Khandadevi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Likhu Tamakoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Sunapati Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Umakunda Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Rasuwa: [
    {
      name: "Uttargaya Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Amachodingmo Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Gosaikunda Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Kalika Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Naukunda Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Sindhuli: [
    { name: "Kamalamai Municipality", type: "Municipality", wards: 9 },
    { name: "Dudhauli Municipality", type: "Municipality", wards: 9 },
    {
      name: "Golanjor Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Hariharpurgadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Marin Rural Municipality", type: "Rural Municipality", wards: 7 },
    {
      name: "Phikkal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sunkoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tinpatan Rural Municipality",
      type: "Rural Municipality",
      wards: 8,
    },
  ],
  Sindhupalchok: [
    {
      name: "Chautara Sangachokgadhi Municipality",
      type: "Municipality",
      wards: 9,
    },
    { name: "Bahrabise Municipality", type: "Municipality", wards: 9 },
    { name: "Barhabise Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bhotekoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Helambu Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Indrawati Rural Municipality",
      type: "Rural Municipality",
      wards: 8,
    },
    { name: "Jugal Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Lisankhu Pakhar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Melamchi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Panchpokhari Thangpal Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Sunkoshi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tripurasundari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],

  // ── Province 4 · Gandaki ────────────────────────────────────────────────

  Baglung: [
    { name: "Baglung Municipality", type: "Municipality", wards: 9 },
    { name: "Dhorpatan Municipality", type: "Municipality", wards: 9 },
    { name: "Galkot Municipality", type: "Municipality", wards: 9 },
    { name: "Jaimuni Municipality", type: "Municipality", wards: 9 },
    {
      name: "Badigad Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Bareng Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Kanthekhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Nisikhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Taman Khola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tarakhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Gorkha: [
    { name: "Gorkha Municipality", type: "Municipality", wards: 9 },
    { name: "Palungtar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Arughat Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Arpak Dudhpokhari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bhimsen Thapa Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Barpak Sulikot Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Chum Nubri Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Dharche Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Gandaki Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Sahid Lakhan Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Si Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Tsum Nubri Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Kaski: [
    { name: "Pokhara Metropolitan City", type: "Metropolitan City", wards: 33 },
    {
      name: "Annapurna Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Machhapuchchhre Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Madi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Rupa Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Lamjung: [
    { name: "Besishahar Municipality", type: "Municipality", wards: 9 },
    { name: "Madhya Nepal Municipality", type: "Municipality", wards: 9 },
    { name: "Sundarbazar Municipality", type: "Municipality", wards: 9 },
    { name: "Dordi Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Dudhpokhari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kwholasothar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Marsyangdi Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Rainas Municipality", type: "Municipality", wards: 9 },
  ],
  Manang: [
    { name: "Chame Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Manang Disyang Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Narphu Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Nashong Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Mustang: [
    {
      name: "Gharapjhong Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Lomanthang Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Lo-Ghekar Damodarkunda Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Thasang Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Waragung Muktikhsetra Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Myagdi: [
    { name: "Beni Municipality", type: "Municipality", wards: 9 },
    {
      name: "Annapurna Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Dhaulagiri Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Mangala Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Malika Rural Municipality", type: "Rural Municipality", wards: 7 },
    {
      name: "Raghuganga Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
  ],
  Nawalpur: [
    { name: "Kawasoti Municipality", type: "Municipality", wards: 9 },
    { name: "Devchuli Municipality", type: "Municipality", wards: 9 },
    { name: "Gaidakot Municipality", type: "Municipality", wards: 9 },
    { name: "Madhyabindu Municipality", type: "Municipality", wards: 9 },
    {
      name: "Baudikali Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Binayi Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bulingtar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Hupsekot Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Parbat: [
    { name: "Kushma Municipality", type: "Municipality", wards: 9 },
    { name: "Phalewas Municipality", type: "Municipality", wards: 9 },
    { name: "Bihadi Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Jaljala Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mahashila Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Modi Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Painyu Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Syangja: [
    { name: "Putalibazar Municipality", type: "Municipality", wards: 9 },
    { name: "Waling Municipality", type: "Municipality", wards: 9 },
    { name: "Bhirkot Municipality", type: "Municipality", wards: 9 },
    { name: "Chapakot Municipality", type: "Municipality", wards: 9 },
    { name: "Galyang Municipality", type: "Municipality", wards: 9 },
    {
      name: "Aandhikhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Arjunchaupari Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Biruwa Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Harinas Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kaligandaki Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Phedikhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Tanahun: [
    { name: "Damauli Municipality", type: "Municipality", wards: 9 },
    { name: "Byas Municipality", type: "Municipality", wards: 9 },
    { name: "Shuklagandaki Municipality", type: "Municipality", wards: 9 },
    { name: "Bhanu Municipality", type: "Municipality", wards: 9 },
    {
      name: "Aanbukhaireni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bandipur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Devghat Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Ghiring Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Myagde Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Rhishing Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Tanahu Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],

  // ── Province 5 · Lumbini ────────────────────────────────────────────────

  Arghakhanchi: [
    { name: "Sandhikharka Municipality", type: "Municipality", wards: 9 },
    { name: "Bhumikasthan Municipality", type: "Municipality", wards: 9 },
    {
      name: "Chhatradev Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Malarani Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Panini Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Shitaganga Municipality", type: "Municipality", wards: 9 },
  ],
  Banke: [
    {
      name: "Nepalgunj Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 17,
    },
    { name: "Kohalpur Municipality", type: "Municipality", wards: 9 },
    {
      name: "Baijanath Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Duduwa Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Janki Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Khajura Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Narainapur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Rapti Sonari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Bardiya: [
    { name: "Gulariya Municipality", type: "Municipality", wards: 9 },
    { name: "Rajapur Municipality", type: "Municipality", wards: 9 },
    { name: "Madhuwan Municipality", type: "Municipality", wards: 9 },
    { name: "Thakurbaba Municipality", type: "Municipality", wards: 9 },
    {
      name: "Badhaiyatal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Bansgadhi Municipality", type: "Municipality", wards: 9 },
    { name: "Barbardiya Municipality", type: "Municipality", wards: 9 },
    { name: "Geruwa Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Dang: [
    {
      name: "Tulsipur Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 19,
    },
    {
      name: "Ghorahi Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 19,
    },
    { name: "Lamahi Municipality", type: "Municipality", wards: 9 },
    { name: "Babai Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Banglachuli Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Dangisharan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Gadhawa Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Rajpur Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Rapti Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Shantinagar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  "Eastern Rukum": [
    { name: "Bhume Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Putha Uttarganga Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Sisne Rural Municipality", type: "Rural Municipality", wards: 5 },
  ],
  Gulmi: [
    { name: "Resunga Municipality", type: "Municipality", wards: 9 },
    { name: "Musikot Municipality", type: "Municipality", wards: 9 },
    {
      name: "Chandrakot Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Chatrakot Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Dhurkot Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Gulmi Darbar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Isma Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Kaligandaki Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    { name: "Madane Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Malika Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Ruru Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Satyawati Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
  ],
  Kapilvastu: [
    { name: "Kapilvastu Municipality", type: "Municipality", wards: 9 },
    { name: "Buddhabhumi Municipality", type: "Municipality", wards: 9 },
    { name: "Shivaraj Municipality", type: "Municipality", wards: 9 },
    { name: "Banganga Municipality", type: "Municipality", wards: 9 },
    { name: "Maharajgunj Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bijaynagar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Krishnanagar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Mayadevi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Suddhodhan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Yashodhara Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  "Nawalparasi East": [
    { name: "Kawasoti Municipality", type: "Municipality", wards: 9 },
    { name: "Devchuli Municipality", type: "Municipality", wards: 9 },
    { name: "Gaidakot Municipality", type: "Municipality", wards: 9 },
    { name: "Madhyabindu Municipality", type: "Municipality", wards: 9 },
    {
      name: "Baudikali Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Binayi Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Bulingtar Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Hupsekot Rural Municipality",
      type: "Rural Municipality",
      wards: 7,
    },
    {
      name: "Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Palpa: [
    { name: "Tansen Municipality", type: "Municipality", wards: 9 },
    { name: "Rampur Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bagnaskali Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mathagadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Nisdi Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Purbakhola Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Rainadevi Chhahara Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Ribdikot Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Rishing Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Tinau Rural Municipality", type: "Rural Municipality", wards: 6 },
  ],
  Pyuthan: [
    { name: "Pyuthan Municipality", type: "Municipality", wards: 9 },
    { name: "Swargadwari Municipality", type: "Municipality", wards: 9 },
    {
      name: "Airawati Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Gaumukhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Jhimruk Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mandavi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mallarani Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Naubahini Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sarumarani Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Rolpa: [
    { name: "Rolpa Municipality", type: "Municipality", wards: 9 },
    {
      name: "Runtigadhi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Duikholi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Gangadeva Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Madi Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Pariwartan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sunchhahari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sunil Smriti Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Thabang Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Tribeni Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Rupandehi: [
    {
      name: "Butwal Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 19,
    },
    {
      name: "Bhairahawa (Siddharthanagar) Municipality",
      type: "Municipality",
      wards: 9,
    },
    { name: "Devdaha Municipality", type: "Municipality", wards: 9 },
    { name: "Tilottama Municipality", type: "Municipality", wards: 9 },
    { name: "Lumbini Sanskritik Municipality", type: "Municipality", wards: 9 },
    { name: "Sainamaina Municipality", type: "Municipality", wards: 9 },
    { name: "Siyari Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Gaidahawa Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kanchan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kotahimai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mayadevi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Marchawari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Omsatiya Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Rohini Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Sammarimai Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Sudhdhodhan Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Saljhandi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],

  // ── Province 6 · Karnali ────────────────────────────────────────────────

  Dailekh: [
    { name: "Narayan Municipality", type: "Municipality", wards: 9 },
    { name: "Dullu Municipality", type: "Municipality", wards: 9 },
    { name: "Aathabis Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bhagawatimai Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Bhairabi Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Chamunda Bindrasaini Municipality",
      type: "Municipality",
      wards: 9,
    },
    {
      name: "Dungeshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Gurans Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Mahabu Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Naumule Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Pokhara Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Thantikandh Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Dolpa: [
    { name: "Tripurasundari Municipality", type: "Municipality", wards: 9 },
    {
      name: "Dolpo Buddha Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Jagadulla Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Kaike Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Mudkechula Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "She Phoksundo Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Thuli Bheri Municipality", type: "Municipality", wards: 9 },
    {
      name: "Chharka Tangsong Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Humla: [
    { name: "Simkot Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Adanchuli Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Chankheli Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Kharpunath Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Namkha Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Sarmadag Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Sarkegad Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Tanjakot Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Jajarkot: [
    { name: "Bheri Municipality", type: "Municipality", wards: 9 },
    { name: "Chhedagad Municipality", type: "Municipality", wards: 9 },
    {
      name: "Barekot Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Junichande Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Kuse Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Nalgad Municipality", type: "Municipality", wards: 9 },
    {
      name: "Shiwalaya Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Tribeni Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Jumla: [
    { name: "Chandannath Municipality", type: "Municipality", wards: 9 },
    {
      name: "Tatopani Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Guthichaur Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Hima Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Kanakasundari Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Khatyad Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Patarasi Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Sinja Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Tila Rural Municipality", type: "Rural Municipality", wards: 5 },
  ],
  Kalikot: [
    { name: "Khandachakra Municipality", type: "Municipality", wards: 9 },
    { name: "Raskot Municipality", type: "Municipality", wards: 9 },
    { name: "Tilagufa Municipality", type: "Municipality", wards: 9 },
    {
      name: "Mahawai Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Naraharinath Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Pachal Jhara Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Palata Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Sanni Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Shubha Kalika Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Mugu: [
    { name: "Chhayanath Rara Municipality", type: "Municipality", wards: 9 },
    {
      name: "Khatyad Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Mugum Karmarong Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Soru Rural Municipality", type: "Rural Municipality", wards: 5 },
  ],
  Salyan: [
    { name: "Sharada Municipality", type: "Municipality", wards: 9 },
    { name: "Bangad Kupinde Municipality", type: "Municipality", wards: 9 },
    { name: "Bagchaur Municipality", type: "Municipality", wards: 9 },
    { name: "Darma Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Dhorchaur Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Kalimati Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Kapurkot Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Kumakh Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Siddha Kumakh Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Tribeni Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Surkhet: [
    { name: "Birendranagar Municipality", type: "Municipality", wards: 9 },
    { name: "Bheriganga Municipality", type: "Municipality", wards: 9 },
    { name: "Gurbhakot Municipality", type: "Municipality", wards: 9 },
    { name: "Panchpuri Municipality", type: "Municipality", wards: 9 },
    {
      name: "Barahtal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Chaukune Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Chingad Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Kapurkot Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Lekbeshi Municipality", type: "Municipality", wards: 9 },
    { name: "Simta Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Uttarganga Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  "Western Rukum": [
    { name: "Musikot Municipality", type: "Municipality", wards: 9 },
    { name: "Aathbiskot Municipality", type: "Municipality", wards: 9 },
    {
      name: "Banfikot Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Chamunda Bindrasaini Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Chaurjahari Municipality", type: "Municipality", wards: 9 },
    {
      name: "Sanibheri Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],

  // ── Province 7 · Sudurpashchim ──────────────────────────────────────────

  Achham: [
    { name: "Mangalsen Municipality", type: "Municipality", wards: 9 },
    { name: "Kamalbazar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bannigadhi Jayagadh Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Chaurpati Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Dhakari Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Mellekh Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Panchadeval Binayak Municipality",
      type: "Municipality",
      wards: 9,
    },
    {
      name: "Ramaroshan Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Sanphebagar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Turmakhand Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Baitadi: [
    { name: "Dasharathchand Municipality", type: "Municipality", wards: 9 },
    { name: "Patan Municipality", type: "Municipality", wards: 9 },
    {
      name: "Dilasaini Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Dogdakedar Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Melauli Municipality", type: "Municipality", wards: 9 },
    {
      name: "Pancheshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Purchaudi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Shivanath Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Sigas Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Surnaya Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Bajhang: [
    { name: "Bungal Municipality", type: "Municipality", wards: 9 },
    { name: "Badimalika Municipality", type: "Municipality", wards: 9 },
    {
      name: "Chhabis Pathibhera Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Durgathali Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Jayaprithvi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Kedarsyu Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Khaptad Chhanna Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Khandeshwari Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Masta Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Surma Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Thalara Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Bithadchir Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Bajura: [
    { name: "Badimalika Municipality", type: "Municipality", wards: 9 },
    { name: "Budhiganga Municipality", type: "Municipality", wards: 9 },
    { name: "Gaumul Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Himali Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Jagannath Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Khaptad Chhanna Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Pandav Gupha Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Swar Rural Municipality", type: "Rural Municipality", wards: 5 },
    {
      name: "Triveni Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Dadeldhura: [
    { name: "Amargadhi Municipality", type: "Municipality", wards: 9 },
    { name: "Parashuram Municipality", type: "Municipality", wards: 9 },
    {
      name: "Aalital Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Bhageshwar Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Ganyapdhura Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Nawadurga Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Ajayameru Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
  ],
  Darchula: [
    { name: "Darchula Municipality", type: "Municipality", wards: 9 },
    { name: "Shailyashikhar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Apihimal Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Byans Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Lekam Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Mahakali Municipality", type: "Municipality", wards: 9 },
    { name: "Marma Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Naugad Rural Municipality", type: "Rural Municipality", wards: 5 },
    { name: "Vyans Rural Municipality", type: "Rural Municipality", wards: 5 },
  ],
  Doti: [
    { name: "Dipayal Silgadhi Municipality", type: "Municipality", wards: 9 },
    { name: "Shikhar Municipality", type: "Municipality", wards: 9 },
    {
      name: "Adharsha Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Badikedar Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Bogtan Fudsil Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Jorayal Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "K.I.Singh Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    {
      name: "Purbichauki Rural Municipality",
      type: "Rural Municipality",
      wards: 5,
    },
    { name: "Sayal Rural Municipality", type: "Rural Municipality", wards: 5 },
  ],
  Kailali: [
    {
      name: "Dhangadhi Sub-Metropolitan City",
      type: "Sub-Metropolitan City",
      wards: 19,
    },
    { name: "Tikapur Municipality", type: "Municipality", wards: 9 },
    { name: "Lamkichuha Municipality", type: "Municipality", wards: 9 },
    { name: "Bhajani Municipality", type: "Municipality", wards: 9 },
    { name: "Ghodaghodi Municipality", type: "Municipality", wards: 9 },
    {
      name: "Bardagoriya Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Chure Rural Municipality", type: "Rural Municipality", wards: 6 },
    { name: "Gauriganga Municipality", type: "Municipality", wards: 9 },
    { name: "Janaki Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Joshipur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Kailari Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Mohanyal Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Munuwa Rural Municipality", type: "Rural Municipality", wards: 6 },
    {
      name: "Sahajpur Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
  ],
  Kanchanpur: [
    { name: "Bheemdatta Municipality", type: "Municipality", wards: 9 },
    { name: "Bedkot Municipality", type: "Municipality", wards: 9 },
    { name: "Krishnapur Municipality", type: "Municipality", wards: 9 },
    { name: "Punarbas Municipality", type: "Municipality", wards: 9 },
    { name: "Belauri Municipality", type: "Municipality", wards: 9 },
    {
      name: "Beldandi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    {
      name: "Laljhadi Rural Municipality",
      type: "Rural Municipality",
      wards: 6,
    },
    { name: "Mahakali Municipality", type: "Municipality", wards: 9 },
    { name: "Shuklaphanta Municipality", type: "Municipality", wards: 9 },
  ],
};

// ─── Helper to generate ward options for a given municipality ──────────────

export function getWardOptions(
  totalWards: number,
): { value: string; label: string }[] {
  return Array.from({ length: totalWards }, (_, i) => ({
    value: String(i + 1),
    label: `Ward ${i + 1}`,
  }));
}
