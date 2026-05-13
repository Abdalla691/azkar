/**
 * ADHKAR APP v3 — script.js
 * ═══════════════════════════════════════════════════════════════
 * NEW IN v3:
 *   • Hamburger / Drawer menu (مكتبة الأذكار ↔ التسبيح)
 *   • Tasbeeh counter — circular progress ring + bell sound
 *   • Prayer Times Widget — collapsible card, expanded row list,
 *     Hijri + Gregorian dates, current prayer highlighting
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   ADHKAR DATA
═══════════════════════════════════════════════════════════════ */
const ADHKAR_DATA = {
  morning: [

      {
      id: 1, title: "آية الكرسي",
      text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ : ﴿ اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴾",
      source: "البقرة: ٢٥٥", count: 1,
      benefit: "من قالها حين يصبح أُجير من الجن حتى يمسى"
    },
    {
      id: 2, title: "سورة الإخلاص",
      text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ ﴾",
      source: "سورة الإخلاص", count: 3,
      benefit: "من قالها حين يصبح وحين يمسى كفته من كل شىء"
    },
    {
      id: 3, title: "سورة الفلق",
      text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴾",
      source: "سورة الفلق", count: 3,
      benefit: "من قالها مع الإخلاص والناس حين يصبح كفته من كل شيء"
    },
    {
      id: 4, title: "سورة الناس",
      text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ﴾",
      source: "سورة الناس", count: 3,
      benefit: "من قالها مع الإخلاص والفلق حين يصبح كفته من كل شيء"
    },
    {
      id: 5, title: "دعاء الصباح",
      text: "أَصْبَحْنا وَأَصْبَحَ الْمُلْكُ لله وَالْحَمْدُ لله، لا إِلَهَ إِلاَّ اللّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِير. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَه، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَه، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَر، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْر",
      source: "صحيح مسلم", count: 1,
      benefit: "كان النبيُّ ﷺ يقوله إذا أصبح وإذا أمسى"
    },
    {
      id: 6, title: "سيد الاستغفار",
      text: "اللّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُك، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْت، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْت، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
      source: "صحيح البخاري", count: 1,
      benefit: "من قالها موقناً بها حين يصبح ثم مات من يومه دخل الجنة"
    },
    {
      id: 7, title: "الرضا بالله",
      text: "رَضِيتُ بِاللهِ رَبّاً، وَبِالإِسْلامِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيّاً",
      source: "سنن أبي داود", count: 3,
      benefit: "من قالها حين يصبح كان حقاً على الله أن يرضيه يوم القيامة"
    },
    {
      id: 8, title: "الإشهاد لله",
      text: "اللّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُك، وَأُشْهِدُ حَمَلَةَ عَرْشِك، وَمَلائِكَتَك، وَجَمِيعَ خَلْقِك، أَنَّكَ أَنْتَ اللهُ لا إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لا شَرِيكَ لَك، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُك",
      source: "سنن أبي داود", count: 4,
      benefit: "من قالها أعتقه الله من النار"
    },
    {
      id: 9, title: "شكر النعمة",
      text: "اللهم ما أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِك، فَمِنْكَ وَحْدَكَ لا شَرِيكَ لَك، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْر",
      source: "سنن أبي داود", count: 1,
      benefit: "من قالها حين يصبح أدى شكر يومه"
    },
    {
      id: 10, title: "حسبي الله",
      text: "حَسْبِيَ اللهُ لا إِلَهَ إِلا هُو، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيم",
      source: "سنن أبي داود", count: 7,
      benefit: "من قالها سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة"
    },
    {
      id: 11, title: "البسملة الحافظة",
      text: "بِسْمِ اللهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلا فِي السَّمَاء، وَهُوَ السَّمِيعُ الْعَلِيم",
      source: "سنن أبي داود", count: 3,
      benefit: "لم يضره شيء"
    },
    {
      id: 12, title: "دعاء الصباح والمساء",
      text: "اللهم بِكَ أَصْبَحْنا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوت، وَإِلَيْكَ النُّشُور",
      source: "سنن الترمذي", count: 1, benefit: ""
    },
    {
      id: 13, title: "الفطرة والإسلام",
      text: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلام، وَعَلَى كَلِمَةِ الإِخْلاص، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِين",
      source: "مسند أحمد", count: 1, benefit: ""
    },
    {
      id: 14, title: "التسبيح العظيم",
      text: "سُبْحَانَ اللهِ وَبِحَمْدِه، عَدَدَ خَلْقِه، وَرِضَا نَفْسِه، وَزِنَةَ عَرْشِه، وَمِدَادَ كَلِمَاتِه",
      source: "صحيح مسلم", count: 3,
      benefit: "ذكر عظيم الأجر يعدل ذكر الله طرفي النهار"
    },
    {
      id: 15, title: "طلب العافية",
      text: "اللهم عَافِنِي فِي بَدَنِي، اللهم عَافِنِي فِي سَمْعِي، اللهم عَافِنِي فِي بَصَرِي، لا إِلَهَ إِلا أَنْت",
      source: "سنن أبي داود", count: 3, benefit: ""
    },
    {
      id: 16, title: "الاستعاذة",
      text: "اللهم إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْر، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْر، لا إِلَهَ إِلا أَنْت",
      source: "سنن أبي داود", count: 3, benefit: ""
    },
    {
      id: 17, title: "دعاء الحفظ الشامل",
      text: "اللّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَة. اللّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي. اللّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي. اللّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      source: "سنن أبي داود", count: 1, benefit: ""
    },
    {
      id: 18, title: "يا حي يا قيوم",
      text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيث، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْن",
      source: "المستدرك للحاكم", count: 3, benefit: ""
    },
    {
      id: 19, title: "الكلمات التامات",
      text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَق",
      source: "صحيح مسلم", count: 3,
      benefit: "لم يضره شيء تلك الليلة"
    },
    {
      id: 20, title: "خير اليوم",
      text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّهِ رَبِّ الْعَالَمِين، اللّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْم، فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاه، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَه",
      source: "سنن أبي داود", count: 1, benefit: ""
    },
    {
      id: 21, title: "دعاء الاستعاذة الشاملة",
      text: "اللّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ رَبَّ كُلِّ شَيْءٍ وَمَلِيكَه، أَشْهَدُ أَنْ لا إِلَهَ إِلاَّ أَنْت، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِه، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً أَوْ أَجُرَّهُ إِلَى مُسْلِم",
      source: "سنن الترمذي", count: 1, benefit: ""
    },
    {
      id: 22, title: "الصلاة على النبي ﷺ",
      text: "اللهم صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
      source: "حديث شريف", count: 10,
      benefit: "من صلى عليَّ واحدة صلى الله عليه عشرًا"
    },
    {
      id: 23, title: "لا إله إلا الله",
      text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      source: "صحيح البخاري", count: 100,
      benefit: "كانت له عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حرزاً من الشيطان يومه ذلك حتى يمسي"
    },
    {
      id: 24, title: "سبحان الله وبحمده",
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      source: "صحيح البخاري", count: 100,
      benefit: "حُطَّت خطاياه وإن كانت مثل زبد البحر"
    },
    {
      id: 25, title: "الاستغفار",
      text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
      source: "صحيح البخاري", count: 100,
      benefit: "من استغفر الله غفر الله له"
    }

      ],
  evening: [

{
      id: 1, title: "آية الكرسي",
      text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ : ﴿ اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴾",
      source: "البقرة: ٢٥٥", count: 1,
      benefit: "من قالها حين يمسى أُجير من الجن حتى يصبح"
    },
    {
      id: 2, title: "خاتمة سورة البقرة",
      "text"   : "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ : ﴿ ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيۡهِ مِن رَّبِّهِۦ وَٱلۡمُؤۡمِنُونَۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيۡنَ أَحَدٖ مِّن رُّسُلِهِۦۚ وَقَالُواْ سَمِعۡنَا وَأَطَعۡنَاۖ غُفۡرَانَكَ رَبَّنَا وَإِلَيۡكَ ٱلۡمَصِيرُ ۝ لَا يُكَلِّفُ ٱللَّهُ نَفۡسًا إِلَّا وُسۡعَهَاۚ لَهَا مَا كَسَبَتۡ وَعَلَيۡهَا مَا ٱكۡتَسَبَتۡۗ رَبَّنَا لَا تُؤَاخِذۡنَآ إِن نَّسِينَآ أَوۡ أَخۡطَأۡنَاۚ رَبَّنَا وَلَا تَحۡمِلۡ عَلَيۡنَآ إِصۡرٗا كَمَا حَمَلۡتَهُۥ عَلَى ٱلَّذِينَ مِن قَبۡلِنَاۚ رَبَّنَا وَلَا تُحَمِّلۡنَا مَا لَا طَاقَةَ لَنَا بِهِۦۖ وَٱعۡفُ عَنَّا وَٱغۡفِرۡ لَنَا وَٱرۡحَمۡنَآۚ أَنتَ مَوۡلَىٰنَا فَٱنصُرۡنَا عَلَى ٱلۡقَوۡمِ ٱلۡكَٰفِرِينَ ﴾",
      source: "البقرة: ٢٨٥-٢٨٦", count: 1,
      benefit: "من قرأ آيتين من آخر سورة البقرة في ليلة كفتاه"
    },
    {
      id: 3, title: "سورة الإخلاص",
      text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴾",
      source: "سورة الإخلاص", count: 3,
      benefit: "من قالها حين يصبح وحين يمسى كفته من كل شيء"
    },
    {
      id: 4, title: "سورة الفلق",
      text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴾",
      source: "سورة الفلق", count: 3, benefit: ""
    },
    {
      id: 5, title: "سورة الناس",
      text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ ﴾",
      source: "سورة الناس", count: 3, benefit: ""
    },
    {
      id: 6, title: "دعاء المساء",
      text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا. رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ. رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      source: "صحيح مسلم", count: 1, benefit: ""
    },
    {
      id: 7, title: "سيد الاستغفار",
      text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ. أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
      source: "صحيح البخاري", count: 1,
      benefit: "من قالها موقناً بها حين يمسى ومات من ليلته دخل الجنة"
    },
    {
      id: 8, title: "الرضا بالله",
      text: "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيَّاً",
      source: "سنن أبي داود", count: 3,
      benefit: "من قالها حين يصبح وحين يمسى كان حقاً على الله أن يرضيه يوم القيامة"
    },
    {
      id: 9, title: "الإشهاد لله",
      text: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ",
      source: "سنن أبي داود", count: 4,
      benefit: "من قالها أعتقه الله من النار"
    },
    {
      id: 10, title: "شكر النعمة",
      text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
      source: "سنن أبي داود", count: 1,
      benefit: "من قالها حين يمسى أدى شكر يومه"
    },
    {
      id: 11, title: "حسبي الله",
      text: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      source: "سنن أبي داود", count: 7,
      benefit: "من قالها سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة"
    },
    {
      id: 12, title: "البسملة الحافظة",
      text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ",
      source: "سنن أبي داود", count: 3,
      benefit: "لم يضره من الله شيء"
    },
    {
      id: 13, title: "دعاء المساء والصباح",
      text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
      source: "سنن الترمذي", count: 1, benefit: ""
    },
    {
      id: 14, title: "الفطرة والإسلام",
      text: "أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
      source: "مسند أحمد", count: 1, benefit: ""
    },
    {
      id: 15, title: "التسبيح العظيم",
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
      source: "صحيح مسلم", count: 3, benefit: ""
    },
    {
      id: 16, title: "طلب العافية",
      text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
      source: "سنن أبي داود", count: 3, benefit: ""
    },
    {
      id: 17, title: "الاستعاذة من الكفر والفقر",
      text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
      source: "سنن أبي داود", count: 3, benefit: ""
    },
    {
      id: 18, title: "دعاء الحفظ الشامل",
      text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ. اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي. اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي. اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      source: "سنن أبي داود", count: 1, benefit: ""
    },
    {
      id: 19, title: "يا حي يا قيوم",
      text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
      source: "المستدرك للحاكم", count: 3, benefit: ""
    },
    {
      id: 20, title: "خير الليلة",
      text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا",
      source: "سنن أبي داود", count: 1, benefit: ""
    },
    {
      id: 21, title: "دعاء الاستعاذة الشاملة",
      text: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
      source: "سنن الترمذي", count: 1, benefit: ""
    },
    {
      id: 22, title: "الكلمات التامات",
      text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      source: "صحيح مسلم", count: 3,
      benefit: "لم يضره شيء تلك الليلة"
    },
    {
      id: 23, title: "الصلاة على النبي ﷺ",
      text: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
      source: "حديث شريف", count: 10,
      benefit: "من صلى عليه حين يصبح وحين يمسى أدركته شفاعتي يوم القيامة"
    },
    {
      id: 24, title: "التبرؤ من الشرك",
      text: "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئاً نَعْلَمُهُ، وَنَسْتَغْفِرُكَ لِمَا لاَ نَعْلَمُهُ",
      source: "مسند أحمد", count: 3, benefit: ""
    },
    {
      id: 25, title: "الاستعاذة من الهم والحزن",
      text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
      source: "صحيح البخاري", count: 3, benefit: ""
    },
    {
      id: 26, title: "الاستغفار",
      text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      source: "سنن الترمذي", count: 3, benefit: ""
    },
    {
      id: 27, title: "تعظيم الله",
      text: "يَا رَبِّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلاَلِ وَجْهِكَ وَلِعَظِيمِ سُلْطَانِكَ",
      source: "سنن ابن ماجه", count: 3, benefit: ""
    },
    {
      id: 28, title: "دعاء التوكل والاستعاذة",
      text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، عَلَيْكَ تَوَكَّلْتُ، وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ. مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ. أَعْلَمُ أَنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْماً. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ كُلِّ دَابَّةٍ أَنْتَ آخِذٌ بِنَاصِيَتِهَا، إِنَّ رَبِّي عَلَى صِرَاطٍ مُسْتَقِيمٍ",
      source: "حديث شريف", count: 1, benefit: "ذكر طيب"
    },
    {
      id: 29, title: "لا إله إلا الله",
      text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      source: "صحيح البخاري", count: 100,
      benefit: "كانت له عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حرزاً من الشيطان"
    },
    
    {
      id: 30, title: "سبحان الله وبحمده",
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      source: "صحيح البخاري", count: 100,
      benefit: "حُطَّت خطاياه وإن كانت مثل زبد البحر"
    }

   ]
};

/* ═══════════════════════════════════════════════════════════════
   RANDOM VERSES FOR TASBEEH
═══════════════════════════════════════════════════════════════ */
const TASBEEH_VERSES = [
  { text: "﴿ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا ﴾", ref: "النصر: ٣" },

  { text: "﴿وَاذْكُر رَّبَّكَ كَثِيرًا وَسَبِّحْ بِالْعَشِيِّ وَالْإِبْكَارِ﴾", ref: "آل عمران: ٤١" },

  { text: "﴿وَمَنْ أَعْرَضَ عَن ذِكْرِي فَإِنَّ لَهُ مَعِيشَةً ضَنكًا﴾", ref: "طه: ١٢٤" },
  
  { text: "﴿ ٱلَّذِینَ ءَامَنُوا۟ وَتَطۡمَىِٕنُّ قُلُوبُهُم بِذِكۡرِ ٱللَّهِۗ أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَىِٕنُّ ٱلۡقُلُوبُ﴾", ref: "الرعد: ٢٨" },

  { text: "﴿ وَاذْكُر رَّبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً ﴾", ref: "الأعراف: ٢٠٥" },

  { text: " ﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾ ", ref: "البقرة : ١٥٢"  },

  { text: "﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا﴾", ref: "الأحزاب: ٤١" }
];

/* ═══════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════ */
let currentTab        = 'morning';
let currentSection    = 'azkar';
let counters          = {};
let countdownInterval = null;
let prayerTimes       = null;
let nextPrayer        = null;
let prayerWidgetOpen  = false;
let prayerWidgetTOpen = false;

// Tasbeeh state
let tasbeehCount  = 0;
let tasbeehTarget = 33;
const RING_CIRC_TASBEEH = 2 * Math.PI * 94; // r=94

const STORAGE_KEY = 'adhkar_v4';
const RING_CIRC   = 2 * Math.PI * 34;

/* ═══════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  loadCounters();
  render();
  attachListeners();
  loadPrayerTimes();
  initTasbeeh();
  setRandomVerse();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}

/* ═══════════════════════════════════════════════════════════════
   SECTION SWITCHING (Azkar ↔ Tasbeeh)
═══════════════════════════════════════════════════════════════ */
function switchSection(section) {
  currentSection = section;
  document.getElementById('sectionAzkar').classList.toggle('active', section === 'azkar');
  document.getElementById('sectionTasbeeh').classList.toggle('active', section === 'tasbeeh');
  document.getElementById('menuAzkar').classList.toggle('active', section === 'azkar');
  document.getElementById('menuTasbeeh').classList.toggle('active', section === 'tasbeeh');
  closeDrawer();

  // Sync prayer widget data to tasbeeh section
  if (section === 'tasbeeh') syncPrayerWidgetT();
}

/* ═══════════════════════════════════════════════════════════════
   DRAWER
═══════════════════════════════════════════════════════════════ */
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════════════════════════════
   TASBEEH VERSE
═══════════════════════════════════════════════════════════════ */
function setRandomVerse() {
  var v = TASBEEH_VERSES[Math.floor(Math.random() * TASBEEH_VERSES.length)];
  var el = document.getElementById('tasbeehVerse');
  if (el) el.innerHTML = v.text + '<br><span style="font-size:0.8em;color:var(--text-muted);font-family:var(--font-ui);">' + v.ref + '</span>';
}

/* ═══════════════════════════════════════════════════════════════
   PRAYER TIMES
═══════════════════════════════════════════════════════════════ */
async function loadPrayerTimes() {
  try {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);

    var res = await fetch(
      'https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5',
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeout);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    var data = await res.json();
    prayerTimes = data.data.timings;

    // Hijri date
    var hijri = data.data.date.hijri;
    var greg  = data.data.date.gregorian;
    var hijriStr = hijri.day + ' ' + hijri.month.ar + ' ' + hijri.year + ' هـ';
    var gregStr  = greg.day + ' / ' + greg.month.number + ' / ' + greg.year;

    ['hijriDate','hijriDateT','hijriDateExp','hijriDateExpT'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = hijriStr;
    });
    ['gregDate','gregDateT','gregDateExp','gregDateExpT'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = gregStr;
    });

    calculateNextPrayer();
    renderPrayerWidget();
    syncPrayerWidgetT();

    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);

  } catch (err) {
    var msg = err.name === 'AbortError' ? 'لا يوجد اتصال' : 'تعذّر تحميل الصلاة';
    ['prayerNextName','prayerNextNameT'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = msg;
    });
    setTimeout(loadPrayerTimes, 30000);
  }
}

function calculateNextPrayer() {
  var prayers = [
    { name: 'الفجر',  key: 'Fajr'    },
    { name: 'الشروق', key: 'Sunrise'  },
    { name: 'الظهر',  key: 'Dhuhr'   },
    { name: 'العصر',  key: 'Asr'     },
    { name: 'المغرب', key: 'Maghrib' },
    { name: 'العشاء', key: 'Isha'    }
  ];

  var now = new Date();
  nextPrayer = null;

  for (var i = 0; i < prayers.length; i++) {
    var t = prayerTimes[prayers[i].key];
    var parts = t.split(':');
    var d = new Date();
    d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    if (d > now) {
      nextPrayer = { name: prayers[i].name, key: prayers[i].key, time: t, date: d, index: i };
      break;
    }
  }

  if (!nextPrayer) {
    var fajrParts = prayerTimes.Fajr.split(':');
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(parseInt(fajrParts[0]), parseInt(fajrParts[1]), 0, 0);
    nextPrayer = { name: 'الفجر', key: 'Fajr', time: prayerTimes.Fajr, date: tomorrow, index: 0 };
  }
}

function renderPrayerWidget() {
  if (!prayerTimes || !nextPrayer) return;

  // Collapsed
  var nameEl = document.getElementById('prayerNextName');
  var timeEl = document.getElementById('prayerNextTime');
  if (nameEl) nameEl.textContent = nextPrayer.name;
  if (timeEl) timeEl.textContent = formatTime(nextPrayer.time);

  // Expanded list
  renderExpandedList('prayerExpandedList');
}

function syncPrayerWidgetT() {
  if (!prayerTimes || !nextPrayer) return;
  var nameEl = document.getElementById('prayerNextNameT');
  var timeEl = document.getElementById('prayerNextTimeT');
  if (nameEl) nameEl.textContent = nextPrayer.name;
  if (timeEl) timeEl.textContent = formatTime(nextPrayer.time);
  renderExpandedList('prayerExpandedListT');
}

function renderExpandedList(containerId) {
  var container = document.getElementById(containerId);
  if (!container || !prayerTimes) return;

  var prayers = [
    { name: 'الفجر',  key: 'Fajr'    },
    { name: 'الظهر',  key: 'Dhuhr'   },
    { name: 'العصر',  key: 'Asr'     },
    { name: 'المغرب', key: 'Maghrib' },
    { name: 'العشاء', key: 'Isha'    }
  ];

  var html = '';
  prayers.forEach(function(p) {
    var isCurrent = nextPrayer && nextPrayer.key === p.key;
    var tag = isCurrent ? '<span class="prayer-current-tag">القادمة</span>' : '';
    html +=
      '<div class="prayer-row' + (isCurrent ? ' current' : '') + '">' +
        '<span class="prayer-row-name">' + p.name + '</span>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          tag +
          '<span class="prayer-row-time">' + formatTime(prayerTimes[p.key]) + '</span>' +
        '</div>' +
      '</div>';
  });
  container.innerHTML = html;
}

function updateCountdown() {
  if (!nextPrayer) return;
  var diff = nextPrayer.date - new Date();

  if (diff <= 0) {
    showPrayerAlert(nextPrayer.name);
    calculateNextPrayer();
    renderPrayerWidget();
    syncPrayerWidgetT();
    return;
  }

  var hours   = Math.floor(diff / 3600000);
  var minutes = Math.floor((diff % 3600000) / 60000);
  var seconds = Math.floor((diff % 60000) / 1000);

  var txt = '';
  if (hours > 0) txt += hours + 'س و';
  txt += minutes + 'د';

  var fullTxt = 'بعد ' + txt;

  ['countdownText','countdownTextT'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = fullTxt;
  });
}

function formatTime(t) {
  var parts = t.split(':');
  var h = parseInt(parts[0]);
  var m = parts[1];
  var period = h >= 12 ? 'م' : 'ص';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return h + ':' + m + ' ' + period;
}

function showPrayerAlert(name) {
  var alert = document.getElementById('prayerAlert');
  if (!alert) return;
  alert.textContent   = '🕌 ' + name + ' — حي على الصلاة، حي على الفلاح';
  alert.style.display = 'block';
  setTimeout(function () { alert.style.display = 'none'; }, 7000);
}

/* ═══════════════════════════════════════════════════════════════
   PRAYER WIDGET TOGGLE (expand / collapse)
═══════════════════════════════════════════════════════════════ */
function togglePrayerWidget(widgetId) {
  var widget = document.getElementById(widgetId);
  if (!widget) return;
  widget.classList.toggle('expanded');
}

/* ═══════════════════════════════════════════════════════════════
   TASBEEH
═══════════════════════════════════════════════════════════════ */
function initTasbeeh() {
  tasbeehCount  = 0;
  tasbeehTarget = 33;
  updateTasbeehUI();
}

function tapTasbeeh() {
  if (tasbeehCount >= tasbeehTarget) return;

  tasbeehCount++;
  updateTasbeehUI();

  // Bump animation
  var numEl = document.getElementById('tasbeehCount');
  if (numEl) {
    numEl.classList.remove('bump');
    void numEl.offsetWidth;
    numEl.classList.add('bump');
  }

  if (tasbeehCount >= tasbeehTarget) {
    playBellSound();
    document.querySelector('.tasbeeh-ring-wrap').classList.add('completed');
    showToast('ما شاء الله! أتممت التسبيح 🌿');
  }
}

function updateTasbeehUI() {
  var count  = tasbeehCount;
  var target = tasbeehTarget;
  var pct    = target > 0 ? count / target : 0;

  // Arabic numerals
  var numEl = document.getElementById('tasbeehCount');
  if (numEl) numEl.textContent = toArabicNum(count);

  // Fraction
  var fracEl = document.getElementById('tasbeehFraction');
  if (fracEl) fracEl.textContent = count + ' / ' + target;

  // Percent badge
  var pctEl = document.getElementById('tasbeehPct');
  if (pctEl) pctEl.textContent = Math.round(pct * 100) + '%';

  // SVG ring
  var ring = document.getElementById('tasbeehRingFill');
  if (ring) {
    var offset = RING_CIRC_TASBEEH * (1 - pct);
    ring.setAttribute('stroke-dasharray', RING_CIRC_TASBEEH);
    ring.setAttribute('stroke-dashoffset', Math.max(0, offset));
  }

  // Sub-label update
  var subEl = document.querySelector('.tasbeeh-count-sub');
  if (subEl) {
    if (count >= target) {
      subEl.textContent = 'مكتمل ✓';
    } else {
      subEl.textContent = 'اضغط للعدّ';
    }
  }
}

function resetTasbeeh() {
  tasbeehCount = 0;
  document.querySelector('.tasbeeh-ring-wrap').classList.remove('completed');
  updateTasbeehUI();
}

function setTasbeehTarget(val) {
  tasbeehTarget = parseInt(val);
  tasbeehCount  = 0;
  document.querySelector('.tasbeeh-ring-wrap').classList.remove('completed');
  document.querySelectorAll('.target-pill').forEach(function(p) {
    p.classList.toggle('active', parseInt(p.dataset.val) === tasbeehTarget);
  });
  updateTasbeehUI();
}

function toArabicNum(n) {
  return n.toString().replace(/\d/g, function(d) {
    return '٠١٢٣٤٥٦٧٨٩'[d];
  });
}

/* ── Bell sound via Web Audio API ── */
function playBellSound() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();

    function tone(freq, start, dur, vol) {
      var osc  = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    }

    // Three-note chime
    tone(880,  0,    1.4, 0.5);
    tone(1100, 0.15, 1.2, 0.35);
    tone(1320, 0.30, 1.0, 0.25);
  } catch (e) {
    // Audio not available — silent
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE
═══════════════════════════════════════════════════════════════ */
function loadCounters() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    counters = raw ? JSON.parse(raw) : {};
  } catch (_) { counters = {}; }
}
function saveCounters() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counters)); } catch (_) {}
}
function key(tab, id)         { return tab + '_' + id; }
function getCount(tab, id)    { return counters[key(tab, id)] || 0; }
function setCount(tab, id, v) { counters[key(tab, id)] = Math.max(0, v); saveCounters(); }

/* ═══════════════════════════════════════════════════════════════
   ATTACH LISTENERS
═══════════════════════════════════════════════════════════════ */
function attachListeners() {
  // Hamburger buttons
  document.getElementById('hamburgerBtn').addEventListener('click', openDrawer);
  document.getElementById('hamburgerBtnT').addEventListener('click', openDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

  // Drawer menu items
  document.querySelectorAll('.drawer-item').forEach(function(btn) {
    btn.addEventListener('click', function() { switchSection(btn.dataset.section); });
  });

  // Tab buttons (azkar)
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
  });

  // Reset all
  var resetAllBtn = document.getElementById('resetAllBtn');
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetAll);

  // Cards feed
  document.getElementById('cardsFeed').addEventListener('click', function(e) {
    var btn  = e.target.closest('[data-action]');
    if (!btn) return;
    var card = btn.closest('.dhikr-card');
    if (!card) return;
    var id    = parseInt(card.dataset.id, 10);
    var total = parseInt(card.dataset.total, 10);
    if (isNaN(id) || isNaN(total)) return;
    if (btn.dataset.action === 'tap')       tap(btn, card, id, total);
    if (btn.dataset.action === 'reset-one') resetOne(card, id);
  });

  // Prayer widgets
  document.getElementById('prayerWidget').addEventListener('click', function() {
    togglePrayerWidget('prayerWidget');
  });
  document.getElementById('prayerWidgetT').addEventListener('click', function() {
    togglePrayerWidget('prayerWidgetT');
  });

  // Tasbeeh tap
  document.getElementById('tasbeehTapBtn').addEventListener('click', tapTasbeeh);
  document.getElementById('tasbeehResetBtn').addEventListener('click', resetTasbeeh);

  // Target pills
  document.querySelectorAll('.target-pill').forEach(function(pill) {
    pill.addEventListener('click', function() { setTasbeehTarget(pill.dataset.val); });
  });

  // 1. الجزء الأصلي للأرقام الجاهزة (33, 99...)
  document.querySelectorAll('.target-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      setTasbeehTarget(pill.dataset.val);
    });
  });

  // 2. الكود الجديد للرقم المخصص (أضفه هنا)
  const applyBtn = document.getElementById('applyCustomBtn');
  const customInput = document.getElementById('customTargetInput');

  if (applyBtn && customInput) {
    applyBtn.addEventListener('click', function() {
      const val = parseInt(customInput.value);
      
      if (!isNaN(val) && val > 0) {
        // استدعاء دالة التغيير الأصلية الموجودة في ملفك
        setTasbeehTarget(val); 
        
        // مسح خانة الإدخال
        customInput.value = '';
        
        // إظهار رسالة تأكيد (الدالة showToast موجودة في ملفك أصلاً)
        if (typeof showToast === 'function') {
          showToast('تم تغيير الهدف إلى: ' + val);
        }
      } else {
        alert('برجاء إدخال رقم صحيح أكبر من الصفر');
      }
    });
    
    // لجعل الزر يعمل أيضاً عند الضغط على Enter داخل الخانة
    customInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        applyBtn.click();
      }
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   TAP
═══════════════════════════════════════════════════════════════ */
function tap(btn, card, id, total) {
  if (card.dataset.busy === '1') return;
  if (btn.disabled || btn.classList.contains('completed-btn')) return;

  var current = getCount(currentTab, id);
  if (current >= total) return;

  card.dataset.busy = '1';
  setTimeout(function () { card.dataset.busy = '0'; }, 80);

  var next   = current + 1;
  setCount(currentTab, id, next);
  var isDone = next >= total;

  var fractionEl = card.querySelector('.progress-fraction');
  if (fractionEl) fractionEl.textContent = next + ' / ' + total;

  var fillEl = card.querySelector('.progress-fill');
  if (fillEl) fillEl.style.width = Math.min(Math.round(next / total * 100), 100) + '%';

  var labelEl = card.querySelector('.progress-label-text');
  if (labelEl && isDone) labelEl.textContent = 'مكتمل ✓';

  btn.classList.remove('pulsing');
  void btn.offsetWidth;
  btn.classList.add('pulsing');

  if (isDone) {
    card.classList.add('done');
    btn.classList.add('completed-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="tap-btn-icon">✓</span><span class="tap-btn-label">تم</span>';
  }

  updateStats(ADHKAR_DATA[currentTab], currentTab);

  if (isAllDone()) {
    setTimeout(function () { showToast('ما شاء الله! أتممت جميع الأذكار 🌟'); }, 400);
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESET ONE
═══════════════════════════════════════════════════════════════ */
function resetOne(card, id) {
  setCount(currentTab, id, 0);
  var total = parseInt(card.dataset.total, 10);

  var fractionEl = card.querySelector('.progress-fraction');
  if (fractionEl) fractionEl.textContent = '0 / ' + total;

  var fillEl = card.querySelector('.progress-fill');
  if (fillEl) fillEl.style.width = '0%';

  var labelEl = card.querySelector('.progress-label-text');
  if (labelEl) labelEl.textContent = 'تكرار';

  card.classList.remove('done');
  card.dataset.busy = '0';

  var tapBtn = card.querySelector('.tap-btn');
  if (tapBtn) {
    tapBtn.classList.remove('completed-btn', 'pulsing');
    tapBtn.disabled = false;
    tapBtn.innerHTML = '<span class="tap-btn-icon">☝</span><span class="tap-btn-label">عدّ</span>';
  }

  updateStats(ADHKAR_DATA[currentTab], currentTab);
}

/* ═══════════════════════════════════════════════════════════════
   RESET ALL
═══════════════════════════════════════════════════════════════ */
function resetAll() {
  var label = currentTab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  if (!confirm('هل تريد إعادة تعيين جميع ' + label + '؟')) return;
  var list = ADHKAR_DATA[currentTab] || [];
  list.forEach(function (d) { setCount(currentTab, d.id, 0); });
  render();
}

/* ═══════════════════════════════════════════════════════════════
   TAB SWITCH
═══════════════════════════════════════════════════════════════ */
function switchTab(tab) {
  if (tab === currentTab) return;
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  var titleEl = document.getElementById('headerTitle');
  if (titleEl) titleEl.textContent = tab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  render();
}

/* ═══════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════ */
function updateStats(list, tab) {
  var safeList = list || [];
  var total    = safeList.length;
  var done     = 0;

  safeList.forEach(function(d) {
    if (getCount(tab, d.id) >= d.count) done++;
  });

  var remain = total - done;
  var pct    = total > 0 ? Math.round(done / total * 100) : 0;

  var elDone   = document.getElementById('statDone');
  var elRemain = document.getElementById('statRemain');
  var elPct    = document.getElementById('masterPct');
  var elRing   = document.getElementById('masterRingFill');

  if (elDone)   elDone.textContent   = done;
  if (elRemain) elRemain.textContent = remain;
  if (elPct)    elPct.textContent    = pct + '%';

  if (elRing) {
    var offset = RING_CIRC * (1 - pct / 100);
    elRing.setAttribute('stroke-dasharray',  RING_CIRC);
    elRing.setAttribute('stroke-dashoffset', offset);
  }
}

/* ═══════════════════════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════════════════════ */
function render() {
  var feed = document.getElementById('cardsFeed');
  feed.innerHTML = '';

  var list = ADHKAR_DATA[currentTab];
  if (!list || list.length === 0) {
    feed.innerHTML =
      '<div class="empty-state"><span class="es-icon">🌙</span><p>لا توجد أذكار حالياً</p></div>';
    updateStats([], currentTab);
    return;
  }

  var frag = document.createDocumentFragment();
  list.forEach(function(dhikr, idx) {
    var card = buildCard(dhikr, idx);
    card.style.animationDelay = (idx * 0.035) + 's';
    frag.appendChild(card);
  });
  feed.appendChild(frag);
  updateStats(list, currentTab);
}

/* ═══════════════════════════════════════════════════════════════
   BUILD CARD
═══════════════════════════════════════════════════════════════ */
function buildCard(dhikr, idx) {
  var current = getCount(currentTab, dhikr.id);
  var total   = dhikr.count;
  var done    = current >= total;
  var pct     = total > 0 ? Math.min(Math.round(current / total * 100), 100) : 0;

  var card = document.createElement('article');
  card.className     = 'dhikr-card' + (done ? ' done' : '');
  card.dataset.id    = dhikr.id;
  card.dataset.total = total;
  card.dataset.busy  = '0';

  card.innerHTML =
    '<div class="card-header">' +
      '<span class="card-index">' + (idx + 1) + '</span>' +
      '<span class="card-title-tag">' + esc(dhikr.title) + '</span>' +
      '<span class="card-done-badge">✓ مكتمل</span>' +
    '</div>' +
    '<div class="card-body">' +
      '<p class="card-arabic">' + esc(dhikr.text) + '</p>' +
      (dhikr.source ? '<span class="card-source">📖 ' + esc(dhikr.source) + '</span>' : '') +
    '</div>' +
    (dhikr.benefit ? '<div class="card-benefit">💡 ' + esc(dhikr.benefit) + '</div>' : '') +
    '<div class="card-progress-wrap">' +
      '<div class="card-progress-header">' +
        '<span class="progress-fraction">' + current + ' / ' + total + '</span>' +
        '<span class="progress-label-text">' + (done ? 'مكتمل ✓' : 'تكرار') + '</span>' +
      '</div>' +
      '<div class="progress-track">' +
        '<div class="progress-fill" style="width:' + pct + '%"></div>' +
      '</div>' +
    '</div>' +
    '<div class="card-footer">' +
      '<button class="tap-btn' + (done ? ' completed-btn' : '') + '" ' +
              'data-action="tap"' + (done ? ' disabled' : '') + '>' +
        '<span class="tap-btn-icon">' + (done ? '✓' : '☝') + '</span>' +
        '<span class="tap-btn-label">' + (done ? 'تم' : 'عدّ') + '</span>' +
      '</button>' +
      '<button class="reset-one-btn" data-action="reset-one">' +
        '<span>↺</span>' +
        '<span class="reset-one-label">إعادة</span>' +
      '</button>' +
    '</div>';

  return card;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function isAllDone() {
  var list = ADHKAR_DATA[currentTab];
  if (!list || !list.length) return false;
  return list.every(function(d) { return getCount(currentTab, d.id) >= d.count; });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var toastTimer = null;
function showToast(msg) {
  var el = document.getElementById('completionToast');
  var m  = document.getElementById('toastMsg');
  if (!el || !m) return;
  m.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { el.classList.remove('show'); }, 3500);
}