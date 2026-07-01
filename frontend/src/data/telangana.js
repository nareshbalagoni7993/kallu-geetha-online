// Telangana – All 33 Districts → Mandals → Villages with correct Pincodes
// Keys in TELANGANA_DATA MUST exactly match values in DISTRICTS array.

export const DISTRICTS = [
  "Adilabad","Bhadradri Kothagudem","Hanamkonda","Hyderabad",
  "Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal",
  "Kamareddy","Karimnagar","Khammam","Kumuram Bheem Asifabad",
  "Mahabubabad","Mahabubnagar","Mancherial","Medak",
  "Medchal-Malkajgiri","Mulugu","Nagarkurnool","Nalgonda",
  "Narayanpet","Nirmal","Nizamabad","Peddapalli",
  "Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet",
  "Suryapet","Vikarabad","Wanaparthy","Warangal","Yadadri Bhuvanagiri",
];

const v = (village, pincode) => ({ village, pincode });

export const TELANGANA_DATA = {

  // ── 1. ADILABAD ──────────────────────────────────────────────
  "Adilabad": {
    "Adilabad":        [v("Adilabad","504001"),v("Rajghat Colony","504001"),v("Sivaji Nagar","504001"),v("Gandhi Nagar","504001")],
    "Bela":            [v("Bela","504201"),v("Jainath","504201"),v("Laxmapur","504201")],
    "Bhainsa":         [v("Bhainsa","504103"),v("Kuntala","504103"),v("Khanapur","504103")],
    "Boath":           [v("Boath","504206"),v("Narnoor","504209"),v("Sirikonda","504206")],
    "Gudihatnoor":     [v("Gudihatnoor","504218"),v("Mavala","504218"),v("Sahyadri Colony","504218")],
    "Ichoda":          [v("Ichoda","504302"),v("Kotapalli","504302"),v("Rajpur","504302")],
    "Jainath":         [v("Jainath","504201"),v("Pembi","504201"),v("Kanapur","504201")],
    "Mavala":          [v("Mavala","504218"),v("Narlapur","504218")],
    "Narnoor":         [v("Narnoor","504209"),v("Ginnedhari","504209"),v("Lakshmipur","504209")],
    "Talamadugu":      [v("Talamadugu","504105"),v("Bhupatipur","504105")],
    "Tamsi":           [v("Tamsi","504293"),v("Rebbena","504293")],
    "Utnoor":          [v("Utnoor","504107"),v("Dasturabad","504107"),v("Indervelli","504107")],
    "Neradigonda":     [v("Neradigonda","504218"),v("Ankoli","504218")],
  },

  // ── 2. BHADRADRI KOTHAGUDEM ──────────────────────────────────
  "Bhadradri Kothagudem": {
    "Aswaraopeta":     [v("Aswaraopeta","507301"),v("Tallapudi","507301"),v("Mothugudem","507301")],
    "Burgampadu":      [v("Burgampadu","507208"),v("Paloncha","507115"),v("Gundala","507137")],
    "Chandrugonda":    [v("Chandrugonda","507124"),v("Palair","507116")],
    "Cherla":          [v("Cherla","507133"),v("Chintapalli","507133")],
    "Dammapeta":       [v("Dammapeta","507303"),v("Mulkalapalli","507209")],
    "Gundala":         [v("Gundala","507137"),v("Yellandu","507123"),v("Garla","507133")],
    "Julurpad":        [v("Julurpad","507154"),v("Pinapaka","507160")],
    "Kothagudem":      [v("Kothagudem","507101"),v("Palvancha","507115"),v("Sujathanagar","507116"),v("Paloncha","507115")],
    "Manuguru":        [v("Manuguru","507116"),v("Tekulapalli","507118"),v("Laxmidevipalli","507117")],
    "Mulkalapalli":    [v("Mulkalapalli","507209"),v("Dammapeta","507303")],
    "Paloncha":        [v("Paloncha","507115"),v("NTPC Township","507115")],
    "Pinapaka":        [v("Pinapaka","507160"),v("Bhadrachalam","507111"),v("Godavari Khani","507117")],
    "Sujathanagar":    [v("Sujathanagar","507116"),v("Yellandu","507123")],
    "Tekulapalli":     [v("Tekulapalli","507118"),v("Thirumalayapalem","507119")],
    "Yellandu":        [v("Yellandu","507123"),v("Bayyaram","507128"),v("Garla","507128")],
  },

  // ── 3. HANAMKONDA ────────────────────────────────────────────
  "Hanamkonda": {
    "Hanamkonda":      [v("Hanamkonda","506001"),v("Subhedari","506001"),v("Saripally","506001"),v("Kazipet","506003")],
    "Hasanparthy":     [v("Hasanparthy","506015"),v("Dharmasagar","506007"),v("Shayampet","506253")],
    "Khanapur":        [v("Khanapur","506169"),v("Station Ghanpur","506002"),v("Mulugu","506343")],
    "Nallabelli":      [v("Nallabelli","506252"),v("Atmakur","506301")],
    "Parkal":          [v("Parkal","506164"),v("Sangem","506168"),v("Chityal","506301")],
    "Sangem":          [v("Sangem","506168"),v("Geesugonda","506201"),v("Peddapally","506001")],
    "Shayampet":       [v("Shayampet","506253"),v("Regonda","506368"),v("Narsampet","506132")],
    "Station Ghanpur": [v("Station Ghanpur","506002"),v("Jangaon","506167")],
    "Thorrur":         [v("Thorrur","506104"),v("Mahabubabad","506101")],
    "Wardhannapet":    [v("Wardhannapet","506153"),v("Cherial","506003"),v("Palakurthi","506172")],
    "Dharmasagar":     [v("Dharmasagar","506007"),v("Nekkonda","506122")],
    "Geesugonda":      [v("Geesugonda","506201"),v("Atmakur W","506201")],
  },

  // ── 4. HYDERABAD ─────────────────────────────────────────────
  "Hyderabad": {
    "Charminar":       [v("Charminar","500002"),v("Shalibanda","500001"),v("Falaknuma","500053"),v("Santoshnagar","500059")],
    "Secunderabad":    [v("Secunderabad","500003"),v("Trimulgherry","500015"),v("Bowenpally","500011")],
    "Khairatabad":     [v("Khairatabad","500004"),v("Banjara Hills","500034"),v("Jubilee Hills","500033"),v("Raj Bhavan","500022")],
    "Musheerabad":     [v("Musheerabad","500020"),v("Nampally","500001"),v("Kachiguda","500027"),v("Abids","500001")],
    "Amberpet":        [v("Amberpet","500013"),v("Uppal","500039"),v("Nacharam","500076"),v("LB Nagar","500074")],
    "Golconda":        [v("Golconda","500008"),v("Tolichowki","500008"),v("Karwan","500006"),v("Mehdipatnam","500028")],
    "Nampally":        [v("Nampally","500001"),v("Himayatnagar","500029"),v("Narayanguda","500029")],
    "Shaikpet":        [v("Shaikpet","500008"),v("Gachibowli","500032"),v("Madhapur","500081")],
    "Bandlaguda Jagir":[v("Bandlaguda","500086"),v("Meerpet","500097"),v("Saroornagar","500035")],
    "Kapra":           [v("Kapra","500062"),v("Kushaiguda","500062"),v("ECIL","500062")],
  },

  // ── 5. JAGTIAL ───────────────────────────────────────────────
  "Jagtial": {
    "Jagtial":         [v("Jagtial","505327"),v("Metpalli","505325"),v("Gollapalli","505327")],
    "Korutla":         [v("Korutla","505326"),v("Sarangapur","505326"),v("Kodimial","505302")],
    "Dharmapuri":      [v("Dharmapuri","505311"),v("Raikal","505302"),v("Medipalli","505311")],
    "Mallial":         [v("Mallial","505306"),v("Pegadapally","505306")],
    "Metpalli":        [v("Metpalli","505325"),v("Bheemdevarapalli","505325")],
    "Raikal":          [v("Raikal","505302"),v("Jagtial Rural","505327")],
    "Gollapalli":      [v("Gollapalli","505327"),v("Thimmapur","505327")],
    "Kodimial":        [v("Kodimial","505302"),v("Chityal","505302")],
    "Kathalapur":      [v("Kathalapur","505327"),v("Varni","505327")],
    "Jagityal Rural":  [v("Jammikunta","505122"),v("Karimnagar Rural","505001")],
  },

  // ── 6. JANGAON ───────────────────────────────────────────────
  "Jangaon": {
    "Jangaon":         [v("Jangaon","506167"),v("Raghunathpally","506167"),v("Nallabelli","506167")],
    "Bachannapet":     [v("Bachannapet","506001"),v("Zaffergadh","506101")],
    "Chilpur":         [v("Chilpur","506167"),v("Kodakandla","506172")],
    "Devaruppula":     [v("Devaruppula","506166"),v("Palakurthi","506172")],
    "Ghanpur Station": [v("Ghanpur Station","506169"),v("Lingalaghanpur","506169")],
    "Kodakandla":      [v("Kodakandla","506172"),v("Palakurthi","506172")],
    "Lingalaghanpur":  [v("Lingalaghanpur","506169"),v("Station Ghanpur","506002")],
    "Tadvai":          [v("Tadvai","506305"),v("Narmetta","506305")],
    "Palakurthi":      [v("Palakurthi","506172"),v("Rayaparthi","506132")],
    "Zaffergadh":      [v("Zaffergadh","506101"),v("Bachannapeta","506001")],
  },

  // ── 7. JAYASHANKAR BHUPALPALLY ───────────────────────────────
  "Jayashankar Bhupalpally": {
    "Bhupalpally":     [v("Bhupalpally","506169"),v("Regonda","506368"),v("Ghanpur","506169")],
    "Eturnagaram":     [v("Eturnagaram","506132"),v("Medaram","506132")],
    "Kataram":         [v("Kataram","506345"),v("Mangapet","506343")],
    "Mahadevpur":      [v("Mahadevpur","506169"),v("Govindaraopet","506347")],
    "Mulugu":          [v("Mulugu","506343"),v("Wazeedu","506344"),v("Venkatapur","506343")],
    "Palimela":        [v("Palimela","506365"),v("Narsimhulapet","506102")],
    "Regonda":         [v("Regonda","506368"),v("Shayampet","506368")],
    "Ghanpur Rural":   [v("Ghanpur Rural","506169"),v("Gurrevula","506169")],
    "Chityal":         [v("Chityal","506301"),v("Atmakur","506301")],
  },

  // ── 8. JOGULAMBA GADWAL ──────────────────────────────────────
  "Jogulamba Gadwal": {
    "Gadwal":          [v("Gadwal","509125"),v("Dharur","509126"),v("Rajapet","509125")],
    "Alampur":         [v("Alampur","509152"),v("Waddepalli","509153"),v("Sanganabanda","509152")],
    "Attapalli":       [v("Attapalli","509133"),v("Kosgi","509339")],
    "Gattu":           [v("Gattu","509128"),v("Ieeja","509128")],
    "Ghattu":          [v("Ghattu","509131"),v("Maldakal","509130")],
    "Ieeja":           [v("Ieeja","509128"),v("Gattu","509128")],
    "Maldakal":        [v("Maldakal","509130"),v("Peddakothapally","509130")],
    "Waddepalli":      [v("Waddepalli","509153"),v("Sanganabanda","509152")],
    "Dharur":          [v("Dharur","509126"),v("Atmakur G","509126")],
    "Kalwakurthy":     [v("Kalwakurthy","509324"),v("Tadoor","509324")],
  },

  // ── 9. KAMAREDDY ─────────────────────────────────────────────
  "Kamareddy": {
    "Kamareddy":       [v("Kamareddy","503111"),v("Nizamsagar","503112"),v("Ramareddy","503111")],
    "Banswada":        [v("Banswada","503187"),v("Kotgiri","503187"),v("Bichkunda","503188")],
    "Bhiknur":         [v("Bhiknur","503213"),v("Sadashivanagar","503213")],
    "Bichkunda":       [v("Bichkunda","503188"),v("Soan","503188")],
    "Domakonda":       [v("Domakonda","503123"),v("Jukkal","503122"),v("Kammarpally","503123")],
    "Gandhari":        [v("Gandhari","503212"),v("Bhiknur","503213")],
    "Jukkal":          [v("Jukkal","503122"),v("Domakonda","503123")],
    "Lingampet":       [v("Lingampet","503111"),v("Machareddy","503111")],
    "Machareddy":      [v("Machareddy","503111"),v("Ramareddy","503111")],
    "Madnur":          [v("Madnur","503306"),v("Tadwai","503305")],
    "Nizamsagar":      [v("Nizamsagar","503112"),v("Kamareddy Rural","503111")],
    "Pitlam":          [v("Pitlam","503186"),v("Dichpally","503186")],
    "Ranjal":          [v("Ranjal","503145"),v("Yellareddy","503145")],
    "Tadwai":          [v("Tadwai","503305"),v("Madnur","503306")],
    "Yellareddy":      [v("Yellareddy","503145"),v("Banswada Rural","503187")],
  },

  // ── 10. KARIMNAGAR ───────────────────────────────────────────
  "Karimnagar": {
    "Karimnagar":      [v("Karimnagar","505001"),v("Jaganathpur","505001"),v("Kothirampur","505001"),v("Karimnagar Bus Stand","505001")],
    "Choppadandi":     [v("Choppadandi","505415"),v("Saidapur","505415"),v("Mutharam","505501")],
    "Dharmaram":       [v("Dharmaram","505001"),v("Julapally","505530")],
    "Ellanthakunta":   [v("Ellanthakunta","505454"),v("Manakondur","505454"),v("Kothapally","505480")],
    "Gangadhara":      [v("Gangadhara","505455"),v("Kamalapur","505455")],
    "Huzurabad":       [v("Huzurabad","505468"),v("Jammikunta","505122"),v("Chilapur","505468")],
    "Husnabad":        [v("Husnabad","505467"),v("Koheda","505467")],
    "Kothapally":      [v("Kothapally","505480"),v("Veenavanka","505502")],
    "Manakondur":      [v("Manakondur","505454"),v("Mudhol","505471")],
    "Mudhol":          [v("Mudhol","505471"),v("Shankarapatnam","505472")],
    "Mutharam":        [v("Mutharam","505501"),v("Sulthanabad","505462")],
    "Ramadugu":        [v("Ramadugu","505212"),v("Ramagundam","505208")],
    "Saidapur":        [v("Saidapur","505415"),v("Choppadandi","505415")],
    "Shankarapatnam":  [v("Shankarapatnam","505472"),v("Bheemadevarapally","505472")],
    "Sulthanabad":     [v("Sulthanabad","505462"),v("Manthani","505184")],
    "Veenavanka":      [v("Veenavanka","505502"),v("Kothapally","505480")],
  },

  // ── 11. KHAMMAM ──────────────────────────────────────────────
  "Khammam": {
    "Khammam":         [v("Khammam","507001"),v("Wyra","507165"),v("Khammam Rural","507002"),v("Enkoor","507001")],
    "Bonakal":         [v("Bonakal","507208"),v("Tirumalayapalem","507166")],
    "Chintakani":      [v("Chintakani","507114"),v("Garla","507128")],
    "Kallur":          [v("Kallur","507204"),v("Pindiprolu","507204")],
    "Kusumanchi":      [v("Kusumanchi","507180"),v("Vemsoor","507180")],
    "Madhira":         [v("Madhira","507203"),v("Nelakondapalli","507154"),v("Sathupalli","507303")],
    "Mudigonda":       [v("Mudigonda","507208"),v("Ootla","507208")],
    "Nelakondapalli":  [v("Nelakondapalli","507154"),v("Julurpad","507154")],
    "Sathupalli":      [v("Sathupalli","507303"),v("Penuballi","507303"),v("Tallada","507154")],
    "Thallada":        [v("Thallada","507154"),v("Nelakondapalli","507154")],
    "Tirumalayapalem": [v("Tirumalayapalem","507166"),v("Yerrupalem","507203")],
    "Wyra":            [v("Wyra","507165"),v("Chintakani","507114")],
    "Yerrupalem":      [v("Yerrupalem","507203"),v("Madhira Rural","507203")],
  },

  // ── 12. KUMURAM BHEEM ASIFABAD ───────────────────────────────
  "Kumuram Bheem Asifabad": {
    "Asifabad":        [v("Asifabad","504293"),v("Kagaznagar","504296"),v("Sirpur","504296")],
    "Kerameri":        [v("Kerameri","504293"),v("Dahegaon","504293")],
    "Sirpur":          [v("Sirpur","504296"),v("Kagaznagar","504296")],
    "Tiryani":         [v("Tiryani","504293"),v("Rebbena","504294")],
    "Wankdi":          [v("Wankdi","504295"),v("Narnoor Rural","504209")],
    "Dahegaon":        [v("Dahegaon","504293"),v("Asifabad Rural","504293")],
    "Jainath Rural":   [v("Ankoli","504218"),v("Mavala Rural","504218")],
  },

  // ── 13. MAHABUBABAD ──────────────────────────────────────────
  "Mahabubabad": {
    "Mahabubabad":     [v("Mahabubabad","506101"),v("Thorrur","506104"),v("Kesamudram","506102")],
    "Bayyaram":        [v("Bayyaram","507128"),v("Nellipaka","507128")],
    "Chinnaguduru":    [v("Chinnaguduru","506102"),v("Kuravi","506103")],
    "Kesamudram":      [v("Kesamudram","506102"),v("Kuravi","506103")],
    "Kuravi":          [v("Kuravi","506103"),v("Thorrur Rural","506104")],
    "Narsimhulapet":   [v("Narsimhulapet","506102"),v("Mahabubabad Rural","506101")],
    "Nellipaka":       [v("Nellipaka","507128"),v("Bayyaram Rural","507128")],
    "Thorrur":         [v("Thorrur","506104"),v("Mahabubabad Rural","506101")],
  },

  // ── 14. MAHABUBNAGAR ─────────────────────────────────────────
  "Mahabubnagar": {
    "Mahabubnagar":    [v("Mahabubnagar","509001"),v("Farooqnagar","509216"),v("Jadcherla","509301"),v("Kothur","509211")],
    "Achampet":        [v("Achampet","509375"),v("Kollapur","509102"),v("Nagarkurnool Rural","509209")],
    "Addakal":         [v("Addakal","509376"),v("Bijnapally","509375")],
    "Bhoothpur":       [v("Bhoothpur","509103"),v("Wanaparthy Rural","509103")],
    "Chinnambavi":     [v("Chinnambavi","509001"),v("Shadnagar Rural","509216")],
    "Devarkadra":      [v("Devarkadra","509110"),v("Jadcherla Rural","509301")],
    "Farooqnagar":     [v("Farooqnagar","509216"),v("Shadnagar","509216"),v("Kothur","509211")],
    "Jadcherla":       [v("Jadcherla","509301"),v("Kothakota","509338"),v("Makthal","509130")],
    "Kothakota":       [v("Kothakota","509338"),v("Raikal","509302")],
    "Makthal":         [v("Makthal","509130"),v("Pebbair","509103")],
  },

  // ── 15. MANCHERIAL ───────────────────────────────────────────
  "Mancherial": {
    "Mancherial":      [v("Mancherial","504208"),v("Bellampalli","504251"),v("Mandamarri","504231"),v("Chennur","504201")],
    "Bellampalli":     [v("Bellampalli","504251"),v("Ramagundam Industrial","504231")],
    "Chennur":         [v("Chennur","504201"),v("Naspur","504204")],
    "Hajipur":         [v("Hajipur","504201"),v("Vemanpally","504299")],
    "Jannaram":        [v("Jannaram","504206"),v("Luxettipet","504206"),v("Bheempur","504206")],
    "Luxettipet":      [v("Luxettipet","504206"),v("Kannepally","504206")],
    "Naspur":          [v("Naspur","504204"),v("Mancherial Rural","504208")],
    "Vemanpally":      [v("Vemanpally","504299"),v("Kotapally Rural","504299")],
    "Mandamarri":      [v("Mandamarri","504231"),v("Bheempur","504206")],
    "Kannepally":      [v("Kannepally","504206"),v("Jannaram Rural","504206")],
  },

  // ── 16. MEDAK ────────────────────────────────────────────────
  "Medak": {
    "Medak":           [v("Medak","502110"),v("Narsapur","502313"),v("Toopran","502334"),v("Medak Fort","502110")],
    "Alladurg":        [v("Alladurg","502270"),v("Narayankhed Rural","502286")],
    "Andole":          [v("Andole","502313"),v("Chegunta","502110")],
    "Chegunta":        [v("Chegunta","502110"),v("Medak Rural","502110")],
    "Gajwel":          [v("Gajwel","502278"),v("Thoguta","502279"),v("Siddipet Rural","502103")],
    "Narayankhed":     [v("Narayankhed","502286"),v("Kohir","502270")],
    "Narsapur":        [v("Narsapur","502313"),v("Andole Rural","502313")],
    "Ramayampet":      [v("Ramayampet","502113"),v("Toopran Rural","502334")],
    "Shankarampet":    [v("Shankarampet","502284"),v("Narayankhed Rural","502286")],
    "Tekmal":          [v("Tekmal","502110"),v("Medak Rural","502110")],
    "Toopran":         [v("Toopran","502334"),v("Ramayampet Rural","502113")],
  },

  // ── 17. MEDCHAL-MALKAJGIRI ───────────────────────────────────
  "Medchal-Malkajgiri": {
    "Medchal":         [v("Medchal","501401"),v("Kompally","500014"),v("Shamirpet","500078"),v("Dundigal","500043")],
    "Ghatkesar":       [v("Ghatkesar","501301"),v("Keesara","501301"),v("Mallapur","500076")],
    "Quthbullapur":    [v("Quthbullapur","500055"),v("Alwal","500010"),v("Jeedimetla","500055")],
    "Malkajgiri":      [v("Malkajgiri","500047"),v("Uppal","500039"),v("Habsiguda","500007")],
    "Balanagar":       [v("Balanagar","500037"),v("Moosapet","500018"),v("Kukatpally","500072")],
    "Alwal":           [v("Alwal","500010"),v("Secunderabad Rural","500011"),v("Bowenpally","500011")],
    "Kompally":        [v("Kompally","500014"),v("Medchal Rural","501401")],
    "Shamirpet":       [v("Shamirpet","500078"),v("Medchal Rural","501401")],
    "Keesara":         [v("Keesara","501301"),v("Ghatkesar Rural","501301")],
    "Uppal":           [v("Uppal","500039"),v("Nacharam","500076"),v("LB Nagar","500074")],
  },

  // ── 18. MULUGU ───────────────────────────────────────────────
  "Mulugu": {
    "Mulugu":          [v("Mulugu","506343"),v("Eturnagaram","506132"),v("Wazeedu","506344")],
    "Eturnagaram":     [v("Eturnagaram","506132"),v("Medaram","506132"),v("Tadvai","506305")],
    "Mangapet":        [v("Mangapet","506343"),v("Venkatapur","506343")],
    "Venkatapur":      [v("Venkatapur","506343"),v("Govindaraopet","506347")],
    "Wazeedu":         [v("Wazeedu","506344"),v("Gurrevula","506344")],
    "Govindaraopet":   [v("Govindaraopet","506347"),v("Venkatapuram","506347")],
  },

  // ── 19. NAGARKURNOOL ─────────────────────────────────────────
  "Nagarkurnool": {
    "Nagarkurnool":    [v("Nagarkurnool","509209"),v("Kollapur","509102"),v("Kalwakurthy","509324"),v("Bijinapally","509375")],
    "Bijinapally":     [v("Bijinapally","509375"),v("Achampet","509375")],
    "Kalwakurthy":     [v("Kalwakurthy","509324"),v("Tadoor","509209")],
    "Kollapur":        [v("Kollapur","509102"),v("Veldanda","509102")],
    "Lingal":          [v("Lingal","509102"),v("Telkapally","509105")],
    "Tadoor":          [v("Tadoor","509209"),v("Nagarkurnool Rural","509209")],
    "Telkapally":      [v("Telkapally","509105"),v("Uppununthala","509103")],
    "Uppununthala":    [v("Uppununthala","509103"),v("Peddakothapally","509103")],
    "Amrabad":         [v("Amrabad","509103"),v("Srisailam Rural","509001")],
    "Veldanda":        [v("Veldanda","509102"),v("Kollapur Rural","509102")],
  },

  // ── 20. NALGONDA ─────────────────────────────────────────────
  "Nalgonda": {
    "Nalgonda":        [v("Nalgonda","508001"),v("Miryalaguda","508207"),v("Bhongir","508116"),v("Nakrekal","508238")],
    "Alair":           [v("Alair","508101"),v("Ramannapeta","508254"),v("Bibinagar","508126")],
    "Bhongir":         [v("Bhongir","508116"),v("Bhuvanagiri","508116"),v("Pochampally","508115")],
    "Chandur":         [v("Chandur","508355"),v("Tungaturthy","508355")],
    "Chityal":         [v("Chityal","508301"),v("Nereducharla","508301")],
    "Devarakonda":     [v("Devarakonda","508248"),v("Tripuraram","508373")],
    "Huzurnagar":      [v("Huzurnagar","508204"),v("Kodad","508206"),v("Mothkur","508207")],
    "Mellachervu":     [v("Mellachervu","508355"),v("Tungaturthy Rural","508355")],
    "Miryalaguda":     [v("Miryalaguda","508207"),v("Huzurnagar Rural","508204"),v("Nidamanur","508207")],
    "Munugode":        [v("Munugode","508204"),v("Devarakonda Rural","508248")],
    "Nakrekal":        [v("Nakrekal","508238"),v("Narayanpur","508112")],
    "Narayanpur":      [v("Narayanpur","508112"),v("Alair Rural","508101")],
    "Nereducharla":    [v("Nereducharla","508301"),v("Chityal Rural","508301")],
    "Ramannapeta":     [v("Ramannapeta","508254"),v("Yadagirigutta Rural","508115")],
    "Tripuraram":      [v("Tripuraram","508373"),v("Devarakonda Rural","508248")],
    "Tungaturthy":     [v("Tungaturthy","508355"),v("Atmakur N","508355")],
  },

  // ── 21. NARAYANPET ───────────────────────────────────────────
  "Narayanpet": {
    "Narayanpet":      [v("Narayanpet","509210"),v("Utkoor","509210"),v("Kosgi","509339")],
    "Kosgi":           [v("Kosgi","509339"),v("Makthal Rural","509130")],
    "Maganoor":        [v("Maganoor","509210"),v("Peddakothapally","509210")],
    "Utkoor":          [v("Utkoor","509210"),v("Narayanpet Rural","509210")],
    "Damaragidda":     [v("Damaragidda","509210"),v("Makthal","509130")],
  },

  // ── 22. NIRMAL ───────────────────────────────────────────────
  "Nirmal": {
    "Nirmal":          [v("Nirmal","504106"),v("Bhainsa","504103"),v("Mudhole","504104"),v("Dilawarpur","504105")],
    "Bhainsa":         [v("Bhainsa","504103"),v("Kuntala","504103")],
    "Dilawarpur":      [v("Dilawarpur","504105"),v("Kubeer","504105")],
    "Khanapur N":      [v("Khanapur","504312"),v("Sarangapur N","504312")],
    "Kubeer":          [v("Kubeer","504105"),v("Dilawarpur Rural","504105")],
    "Lingapur":        [v("Lingapur","504104"),v("Mudhole Rural","504104")],
    "Mamada":          [v("Mamada","504106"),v("Nirmal Rural","504106")],
    "Mudhole":         [v("Mudhole","504104"),v("Lingapur Rural","504104")],
    "Narsapur N":      [v("Narsapur","504106"),v("Nirmal Rural","504106")],
    "Sarangapur":      [v("Sarangapur","504312"),v("Khanapur Rural","504312")],
  },

  // ── 23. NIZAMABAD ────────────────────────────────────────────
  "Nizamabad": {
    "Nizamabad":       [v("Nizamabad","503001"),v("Bodhan","503185"),v("Armoor","503224"),v("Dichpally","503186")],
    "Armoor":          [v("Armoor","503224"),v("Nandipet","503212"),v("Renjal","503224")],
    "Balkonda":        [v("Balkonda","503225"),v("Bheemgal","503245")],
    "Banswada":        [v("Banswada","503187"),v("Pitlam","503186")],
    "Bodhan":          [v("Bodhan","503185"),v("Dichpally","503186")],
    "Dichpally":       [v("Dichpally","503186"),v("Rudrur","503003")],
    "Indalwai":        [v("Indalwai","503175"),v("Mupkal","503175")],
    "Nandipet":        [v("Nandipet","503212"),v("Armoor Rural","503224")],
    "Nizamabad Rural": [v("Nizamabad Rural","503003"),v("Rudrur","503003")],
    "Rudrur":          [v("Rudrur","503003"),v("Varni","503001")],
    "Varni":           [v("Varni","503001"),v("Nizamabad Rural","503003")],
    "Yellareddy":      [v("Yellareddy","503145"),v("Ranjal","503145")],
    "Bheemgal":        [v("Bheemgal","503245"),v("Balkonda Rural","503225")],
  },

  // ── 24. PEDDAPALLI ───────────────────────────────────────────
  "Peddapalli": {
    "Peddapalli":      [v("Peddapalli","505172"),v("Ramagundam","505208"),v("Godavarikhani","505209"),v("Manthani","505184")],
    "Dharmaram":       [v("Dharmaram","505001"),v("Karimnagar Rural","505001")],
    "Julapally":       [v("Julapally","505530"),v("Ramadugu Rural","505212")],
    "Manthani":        [v("Manthani","505184"),v("Peddapalli Rural","505172")],
    "Ramagundam":      [v("Ramagundam","505208"),v("Godavarikhani","505209"),v("JNTPP Colony","505208")],
    "Sultanabad":      [v("Sultanabad","505462"),v("Veenavanka Rural","505502")],
    "Gambhiraopet":    [v("Gambhiraopet","505102"),v("Manthani Rural","505184")],
    "Korutla Rural":   [v("Korutla Rural","505326"),v("Jagtial Rural","505327")],
  },

  // ── 25. RAJANNA SIRCILLA ─────────────────────────────────────
  "Rajanna Sircilla": {
    "Sircilla":        [v("Sircilla","505301"),v("Vemulawada","505302"),v("Boinpally","505303")],
    "Vemulawada":      [v("Vemulawada","505302"),v("Rajanna Temple","505302")],
    "Boinpally":       [v("Boinpally","505303"),v("Sircilla Rural","505301")],
    "Chinnakodur":     [v("Chinnakodur","505306"),v("Konaraopet","505306")],
    "Ellanthakunta S": [v("Ellanthakunta","505454"),v("Manakondur Rural","505454")],
    "Konaraopet":      [v("Konaraopet","505306"),v("Gollapalli Rural","505327")],
    "Thangallapally":  [v("Thangallapally","505301"),v("Sircilla Rural","505301")],
  },

  // ── 26. RANGAREDDY ───────────────────────────────────────────
  "Rangareddy": {
    "Shamshabad":      [v("Shamshabad","501218"),v("Rajendranagar","500030"),v("Kothur","509211"),v("Kandukur","501359")],
    "Chevella":        [v("Chevella","501503"),v("Moinabad","501462"),v("Shankarpally","501203")],
    "Ibrahimpatnam":   [v("Ibrahimpatnam","501506"),v("Abdullapurmet","501505"),v("Hayathnagar","501505")],
    "Shadnagar":       [v("Shadnagar","509216"),v("Farooqnagar Rural","509216"),v("Kothur Rural","509211")],
    "Maheshwaram":     [v("Maheshwaram","500005"),v("Pedda Amberpet","501218")],
    "Hayathnagar":     [v("Hayathnagar","501505"),v("Pocharam","501218")],
    "Kandukur":        [v("Kandukur","501359"),v("Yacharam","501218")],
    "Moinabad":        [v("Moinabad","501462"),v("Chevella Rural","501503")],
    "Rajendranagar":   [v("Rajendranagar","500030"),v("Attapur","500048"),v("Narsingi","500075")],
    "Abdullapurmet":   [v("Abdullapurmet","501505"),v("Ibrahimpatnam Rural","501506")],
    "Yacharam":        [v("Yacharam","501218"),v("Shamshabad Rural","501218")],
    "Shankarpally":    [v("Shankarpally","501203"),v("Chevella Rural","501503")],
  },

  // ── 27. SANGAREDDY ───────────────────────────────────────────
  "Sangareddy": {
    "Sangareddy":      [v("Sangareddy","502001"),v("Patancheru","502319"),v("Sadasivpet","502291"),v("Zaheerabad","502220")],
    "Andole S":        [v("Andole","502313"),v("Narayankhed","502286")],
    "Jharasangam":     [v("Jharasangam","502220"),v("Zaheerabad Rural","502220")],
    "Kandi":           [v("Kandi","502285"),v("Patancheru Rural","502319")],
    "Kohir":           [v("Kohir","502270"),v("Alladurg Rural","502270")],
    "Narayankhed S":   [v("Narayankhed","502286"),v("Kohir Rural","502270")],
    "Patancheru":      [v("Patancheru","502319"),v("Bollaram","502325"),v("Isnapur","502319")],
    "Pulkal":          [v("Pulkal","502296"),v("Doulthabad","502296")],
    "Sadasivpet":      [v("Sadasivpet","502291"),v("Ramachandrapuram","502291")],
    "Zaheerabad":      [v("Zaheerabad","502220"),v("Jharasangam Rural","502220"),v("Nyalkal","502220")],
    "Hatnoora":        [v("Hatnoora","502220"),v("Nyalkal","502220")],
  },

  // ── 28. SIDDIPET ─────────────────────────────────────────────
  "Siddipet": {
    "Siddipet":        [v("Siddipet","502103"),v("Gajwel","502278"),v("Dubbak","502102"),v("Thoguta","502279")],
    "Chinnakodur S":   [v("Chinnakodur","502114"),v("Marriguda","508284")],
    "Doultabad":       [v("Doultabad","502278"),v("Kondapak","502278")],
    "Dubbak":          [v("Dubbak","502102"),v("Husnabad Rural","505467")],
    "Gajwel S":        [v("Gajwel","502278"),v("Thoguta","502279")],
    "Husnabad S":      [v("Husnabad","505467"),v("Koheda","505467")],
    "Koheda":          [v("Koheda","505467"),v("Husnabad Rural","505467")],
    "Kondapak":        [v("Kondapak","502278"),v("Doultabad Rural","502278")],
    "Marriguda":       [v("Marriguda","508284"),v("Nalgonda Rural","508001")],
    "Thoguta":         [v("Thoguta","502279"),v("Gajwel Rural","502278")],
    "Wargal":          [v("Wargal","502281"),v("Siddipet Rural","502103")],
  },

  // ── 29. SURYAPET ─────────────────────────────────────────────
  "Suryapet": {
    "Suryapet":        [v("Suryapet","508213"),v("Kodad","508206"),v("Huzurnagar","508204"),v("Nalgonda Rural","508001")],
    "Atmakur S":       [v("Atmakur","508355"),v("Chilukur","508355")],
    "Chilukur":        [v("Chilukur","508355"),v("Mellachervu Rural","508355")],
    "Huzurnagar":      [v("Huzurnagar","508204"),v("Mothkur","508207")],
    "Kodad":           [v("Kodad","508206"),v("Penpahad","508206")],
    "Mellachervu S":   [v("Mellachervu","508355"),v("Tungaturthy Rural","508355")],
    "Mothkur":         [v("Mothkur","508207"),v("Nampally","508207")],
    "Nampally S":      [v("Nampally","508207"),v("Suryapet Rural","508213")],
    "Tungaturthy S":   [v("Tungaturthy","508355"),v("Chandur","508355")],
    "Penpahad":        [v("Penpahad","508206"),v("Kodad Rural","508206")],
  },

  // ── 30. VIKARABAD ────────────────────────────────────────────
  "Vikarabad": {
    "Vikarabad":       [v("Vikarabad","501101"),v("Tandur","501141"),v("Pargi","501110"),v("Doma","501111")],
    "Basheerabad":     [v("Basheerabad","501142"),v("Tandur Rural","501141")],
    "Doma":            [v("Doma","501111"),v("Pargi Rural","501110")],
    "Kodangal":        [v("Kodangal","501101"),v("Marpalli","501111")],
    "Marpalli":        [v("Marpalli","501111"),v("Doma Rural","501111")],
    "Pargi":           [v("Pargi","501110"),v("Pudur","501504")],
    "Pudur":           [v("Pudur","501504"),v("Chevella Rural","501503")],
    "Tandur":          [v("Tandur","501141"),v("Basheerabad","501142"),v("Nawabpet","501506")],
    "Nawabpet":        [v("Nawabpet","501506"),v("Yacharam Rural","501218")],
  },

  // ── 31. WANAPARTHY ───────────────────────────────────────────
  "Wanaparthy": {
    "Wanaparthy":      [v("Wanaparthy","509103"),v("Gopalpet","509102"),v("Peddamandadi","509103"),v("Pangal","509103")],
    "Gopalpet":        [v("Gopalpet","509102"),v("Veldanda Rural","509102")],
    "Kothakota W":     [v("Kothakota","509338"),v("Raikal","509302")],
    "Makthal W":       [v("Makthal","509130"),v("Pebbair","509103")],
    "Peddamandadi":    [v("Peddamandadi","509103"),v("Wanaparthy Rural","509103")],
    "Pangal":          [v("Pangal","509103"),v("Wanaparthy Rural","509103")],
    "Atmakur W":       [v("Atmakur","509102"),v("Gopalpet Rural","509102")],
    "Pebbair":         [v("Pebbair","509103"),v("Wanaparthy Rural","509103")],
  },

  // ── 32. WARANGAL ─────────────────────────────────────────────
  "Warangal": {
    "Warangal":        [v("Warangal","506002"),v("Hanamkonda","506001"),v("Kazipet","506003"),v("Subhedari","506001"),v("Lashkar Bazar","506004")],
    "Atmakur W":       [v("Atmakur","506301"),v("Chityal W","506301")],
    "Cherial":         [v("Cherial","506003"),v("Wardhannapet Rural","506153")],
    "Chityal W":       [v("Chityal","506301"),v("Rayaparthi","506132")],
    "Dharmasagar W":   [v("Dharmasagar","506007"),v("Nekkonda","506122")],
    "Khanapur W":      [v("Khanapur","506169"),v("Ghanpur","506169")],
    "Maripeda":        [v("Maripeda","506101"),v("Mahabubabad Rural","506101")],
    "Narsampet":       [v("Narsampet","506132"),v("Rayaparthi","506132"),v("Geesugonda","506201")],
    "Palakurthi W":    [v("Palakurthi","506172"),v("Jangaon Rural","506167")],
    "Parkal W":        [v("Parkal","506164"),v("Sangem","506168")],
    "Rayaparthi":      [v("Rayaparthi","506132"),v("Narsampet Rural","506132")],
    "Regonda W":       [v("Regonda","506368"),v("Shayampet Rural","506253")],
    "Station Ghanpur W":[v("Station Ghanpur","506002"),v("Hanamkonda Rural","506001")],
    "Thorrur W":       [v("Thorrur","506104"),v("Mahabubabad Rural","506101")],
    "Wardhannapet W":  [v("Wardhannapet","506153"),v("Cherial Rural","506003")],
    "Geesugonda":      [v("Geesugonda","506201"),v("Narsampet Rural","506132")],
    "Shayampet":       [v("Shayampet","506253"),v("Nallabelli Rural","506252")],
    "Nekkonda":        [v("Nekkonda","506122"),v("Dharmasagar Rural","506007")],
  },

  // ── 33. YADADRI BHUVANAGIRI ──────────────────────────────────
  "Yadadri Bhuvanagiri": {
    "Bhuvanagiri":     [v("Bhuvanagiri","508116"),v("Bhongir","508116"),v("Choutuppal","508252"),v("Narayanpur","508112")],
    "Alair Y":         [v("Alair","508101"),v("Ramannapeta Rural","508254")],
    "Bhongir Y":       [v("Bhongir","508116"),v("Pochampally","508115"),v("Nalgonda Rural","508001")],
    "Choutuppal":      [v("Choutuppal","508252"),v("Bibinagar","508126")],
    "Mothkur Y":       [v("Mothkur","508207"),v("Suryapet Rural","508213")],
    "Pochampally":     [v("Pochampally","508115"),v("Yadagirigutta Rural","508115")],
    "Ramannapeta":     [v("Ramannapeta","508254"),v("Alair Rural","508101")],
    "Yadagirigutta":   [v("Yadagirigutta","508115"),v("Pochampally Rural","508115"),v("Bhongir Rural","508116")],
    "Bibinagar":       [v("Bibinagar","508126"),v("Choutuppal Rural","508252")],
    "Turkapally":      [v("Turkapally","508115"),v("Bhongir Rural","508116")],
  },

};

export const getMandals  = (district) => Object.keys(TELANGANA_DATA[district] || {});
export const getVillages = (district, mandal) => TELANGANA_DATA[district]?.[mandal] || [];
