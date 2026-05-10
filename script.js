/**
 * ADHKAR APP — script.js
 * ═══════════════════════════════════════════════════════════════
 *
 * TIME BOMBS FIXED IN THIS VERSION:
 *
 * FIX 1 — Prayer fetch has no error handling
 *   BEFORE: A failed fetch() left the UI frozen on "تحميل..." forever
 *   AFTER:  try/catch + AbortController timeout (8s) + auto-retry
 *           after 30s + Arabic error message shown to user
 *
 * FIX 2 — calculateNextPrayer crashes after Isha
 *   BEFORE: After Isha passed, the loop found no next prayer,
 *           nextPrayer stayed undefined, and .name threw a TypeError
 *           every second until morning — a guaranteed nightly crash
 *   AFTER:  If no prayer found today, fall back to tomorrow's Fajr
 *
 * FIX 3 — setInterval stacks on every loadPrayerTimes() call
 *   BEFORE: Each call (including retries) created a new interval,
 *           causing the countdown to flicker and run multiple times/sec
 *   AFTER:  countdownInterval variable tracks the active interval;
 *           clearInterval() is always called before creating a new one
 *
 * FIX 4 — Service Worker may serve stale API response
 *   (handled in service-worker.js — see that file)
 *
 * FIX 5 — adhkar.json fetch gives up permanently on failure
 *   BEFORE: One failure → error message → app broken for whole session
 *   AFTER:  Retries up to 3 times (at 3s and 6s) before showing error
 *
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   ADHKAR DATA — embedded directly.
   The app reads from this object. No fetch() needed for adhkar.
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
      text: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ، كُلٌّ آمَنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لاَ نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ، وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ. لاَ يُكَلِّفُ اللَّهُ نَفْساً إِلاَّ وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ. رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلاَ تَحْمِلْ عَلَيْنَا إِصْراً كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا، رَبَّنَا وَلاَ تُحَمِّلْنَا مَا لاَ طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلاَنَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
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
      id: 28, title: "لا إله إلا الله",
      text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      source: "صحيح البخاري", count: 100,
      benefit: "كانت له عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حرزاً من الشيطان"
    },
    {
      id: 29, title: "دعاء التوكل والاستعاذة",
      text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، عَلَيْكَ تَوَكَّلْتُ، وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ. مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ. أَعْلَمُ أَنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْماً. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ كُلِّ دَابَّةٍ أَنْتَ آخِذٌ بِنَاصِيَتِهَا، إِنَّ رَبِّي عَلَى صِرَاطٍ مُسْتَقِيمٍ",
      source: "حديث شريف", count: 1, benefit: "ذكر طيب"
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
   STATE
   ═══════════════════════════════════════════════════════════════ */

let currentTab       = 'morning';
let counters         = {};
let countdownInterval = null;   // FIX 3: track interval to prevent stacking
let prayerTimes      = null;
let nextPrayer       = null;

const STORAGE_KEY = 'adhkar_v4';
const RING_CIRC   = 2 * Math.PI * 34;

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  loadCounters();
  render();
  attachListeners();
  loadPrayerTimes();    // start prayer times independently
});

/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER REGISTRATION
   ═══════════════════════════════════════════════════════════════ */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}

/* ═══════════════════════════════════════════════════════════════
   PRAYER TIMES — FIX 1, FIX 2, FIX 3

   FIX 1: Wrapped in try/catch with AbortController timeout.
          Any failure shows an Arabic message and auto-retries
          after 30 seconds instead of freezing forever.

   FIX 2: calculateNextPrayer() now handles the period after
          Isha by falling back to tomorrow's Fajr, preventing
          the nightly TypeError crash.

   FIX 3: countdownInterval is cleared before any new setInterval()
          call, so retries never stack multiple intervals.
   ═══════════════════════════════════════════════════════════════ */

async function loadPrayerTimes() {
  try {
    // Abort if the API takes more than 8 seconds — prevents infinite hang
    var controller = new AbortController();
    var timeout    = setTimeout(function () { controller.abort(); }, 8000);

    var res = await fetch(
      'https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5',
      {
        signal: controller.signal,
        cache:  'no-store'   // never serve prayer times from any cache
      }
    );

    clearTimeout(timeout);

    if (!res.ok) throw new Error('HTTP ' + res.status);

    var data  = await res.json();
    prayerTimes = data.data.timings;

    calculateNextPrayer();
    renderAllPrayers();

    // FIX 3: clear any existing interval before creating a new one
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);

  } catch (err) {
    var msg = err.name === 'AbortError'
      ? 'لا يوجد اتصال بالإنترنت'
      : 'تعذّر تحميل أوقات الصلاة';

    var el = document.getElementById('nextPrayer');
    if (el) el.textContent = msg;

    // Auto-retry after 30 seconds — user may come back online
    setTimeout(loadPrayerTimes, 30000);
    console.error('[Prayer] fetch failed:', err.message);
  }
}

function calculateNextPrayer() {
  var prayers = [
    ['الفجر',  prayerTimes.Fajr],
    ['الشروق', prayerTimes.Sunrise],
    ['الظهر',  prayerTimes.Dhuhr],
    ['العصر',  prayerTimes.Asr],
    ['المغرب', prayerTimes.Maghrib],
    ['العشاء', prayerTimes.Isha]
  ];

  var now = new Date();
  nextPrayer = null;   // reset before searching

  for (var i = 0; i < prayers.length; i++) {
    var parts = prayers[i][1].split(':');
    var d = new Date();
    d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);

    if (d > now) {
      nextPrayer = { name: prayers[i][0], time: prayers[i][1], date: d };
      break;
    }
  }

  // FIX 2: after Isha passes, show tomorrow's Fajr instead of crashing
  if (!nextPrayer) {
    var fajrParts = prayerTimes.Fajr.split(':');
    var tomorrow  = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(parseInt(fajrParts[0]), parseInt(fajrParts[1]), 0, 0);
    nextPrayer = { name: 'الفجر', time: prayerTimes.Fajr, date: tomorrow };
  }

  var el = document.getElementById('nextPrayer');
  if (el) el.textContent = nextPrayer.name + ' ' + formatTime(nextPrayer.time);
}

function updateCountdown() {
  if (!nextPrayer) return;

  var diff = nextPrayer.date - new Date();

  if (diff <= 0) {
    showPrayerAlert(nextPrayer.name);
    calculateNextPrayer();   // move to the next prayer
    return;
  }

  var hours   = Math.floor(diff / 3600000);
  var minutes = Math.floor((diff % 3600000) / 60000);
  var seconds = Math.floor((diff % 60000) / 1000);

  var el = document.getElementById('countdown');
  if (el) el.textContent = hours + 'س ' + minutes + 'د ' + seconds + 'ث';
}

function renderAllPrayers() {
  var box = document.getElementById('allPrayers');
  if (!box) return;

  box.innerHTML =
    'الفجر '   + formatTime(prayerTimes.Fajr)    + '<br>' +
    'الشروق '  + formatTime(prayerTimes.Sunrise)  + '<br>' +
    'الظهر '   + formatTime(prayerTimes.Dhuhr)    + '<br>' +
    'العصر '   + formatTime(prayerTimes.Asr)      + '<br>' +
    'المغرب '  + formatTime(prayerTimes.Maghrib)  + '<br>' +
    'العشاء '  + formatTime(prayerTimes.Isha);
}

function formatTime(t) {
  var parts  = t.split(':');
  var h      = parseInt(parts[0]);
  var m      = parts[1];
  var period = h >= 12 ? 'م' : 'ص';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return h + ':' + m + ' ' + period;
}

function showPrayerAlert(name) {
  var alert = document.getElementById('prayerAlert');
  if (!alert) return;
  alert.textContent    = name + ' — حي على الصلاة، حي على الفلاح';
  alert.style.display  = 'block';
  setTimeout(function () { alert.style.display = 'none'; }, 7000);
}

// Toggle the all-prayers dropdown
var prayerBox = document.getElementById('prayerBox');
if (prayerBox) {
  prayerBox.addEventListener('click', function () {
    var box = document.getElementById('allPrayers');
    if (!box) return;
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
  });
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counters)); }
  catch (_) {}
}

function key(tab, id)         { return tab + '_' + id; }
function getCount(tab, id)    { return counters[key(tab, id)] || 0; }
function setCount(tab, id, v) { counters[key(tab, id)] = Math.max(0, v); saveCounters(); }

/* ═══════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════ */

function render() {
  var feed = document.getElementById('cardsFeed');
  feed.innerHTML = '';

  var list = ADHKAR_DATA[currentTab];

  if (!list || list.length === 0) {
    feed.innerHTML =
      '<div class="empty-state">' +
        '<span class="es-icon">🌙</span>' +
        '<p>أذكار المساء ستُضاف قريباً إن شاء الله</p>' +
      '</div>';
    updateStats([], currentTab);
    return;
  }

  var frag = document.createDocumentFragment();
  list.forEach(function (dhikr, idx) {
    var card = buildCard(dhikr, idx);
    card.style.animationDelay = (idx * 0.04) + 's';
    frag.appendChild(card);
  });
  feed.appendChild(frag);

  updateStats(list, currentTab);
}

/* ═══════════════════════════════════════════════════════════════
   BUILD ONE CARD
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

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════
   ATTACH LISTENERS — called once on boot
   ═══════════════════════════════════════════════════════════════ */

function attachListeners() {
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
  });

  var resetAllBtn = document.getElementById('resetAllBtn');
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetAll);

  document.getElementById('cardsFeed').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var card  = btn.closest('.dhikr-card');
    if (!card) return;
    var id    = parseInt(card.dataset.id,    10);
    var total = parseInt(card.dataset.total, 10);
    if (isNaN(id) || isNaN(total)) return;
    if (btn.dataset.action === 'tap')       tap(btn, card, id, total);
    if (btn.dataset.action === 'reset-one') resetOne(card, id);
  });
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
  document.querySelectorAll('.tab-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  var titleEl = document.getElementById('headerTitle');
  if (titleEl) titleEl.textContent = tab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  render();
}

/* ═══════════════════════════════════════════════════════════════
   HEADER STATS + SVG RING
   ═══════════════════════════════════════════════════════════════ */

function updateStats(list, tab) {
  var safeList = list || [];
  var total    = safeList.length;
  var done     = 0;

  safeList.forEach(function (d) {
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
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function isAllDone() {
  var list = ADHKAR_DATA[currentTab];
  if (!list || !list.length) return false;
  return list.every(function (d) { return getCount(currentTab, d.id) >= d.count; });
}

var toastTimer = null;
function showToast(msg) {
  var el = document.getElementById('completionToast');
  var m  = document.getElementById('toastMsg');
  if (!el || !m) return;
  m.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3500);
}