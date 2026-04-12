export type SupportedLanguage = "english" | "tagalog" | "bisaya";

export const LANGUAGE_STORAGE_KEY = "alagamind.profile-settings";
const LANGUAGE_CHANGE_EVENT = "alagamind:language-change";

const LANGUAGE_CODE: Record<SupportedLanguage, string> = {
  english: "en",
  tagalog: "tl",
  bisaya: "ceb",
};

const LANGUAGE_DICTIONARY: Record<
  Exclude<SupportedLanguage, "english">,
  Record<string, string>
> = {
  tagalog: {
    Dashboard: "Dashboard",
    "AI Companion": "AI Kasama",
    "Journal & Reflections": "Journal at Pagninilay",
    "Reframing & Insights": "Reframing at Insights",
    "Exercises & Protocols": "Ehersisyo at Mga Protocol",
    "Insights & Sessions": "Insights at Mga Session",
    "Insights & Reports": "Insights at Mga Ulat",
    System: "Sistema",
    Settings: "Mga Setting",
    "Help & Support": "Tulong at Suporta",
    "Active Session": "Aktibong Session",
    Session: "Session",
    "Authenticated user": "Napatunayang user",
    "Loading profile...": "Ikinakarga ang profile...",
    "Checking session": "Sinusuri ang session",
    "Sign Out": "Mag-sign out",
    "Signing out": "Nagsa-sign out",
    "Sign out": "Mag-sign out",
    "Sign out now": "Mag-sign out ngayon",
    "Profile Settings": "Mga Setting ng Profile",
    "Account & Preferences": "Account at Mga Kagustuhan",
    "Keep your profile details current, choose your preferred language, and manage privacy controls from one calm settings surface.":
      "Panatilihing updated ang detalye ng profile mo, piliin ang gusto mong wika, at pamahalaan ang privacy controls sa iisang maayos na settings page.",
    "View account": "Tingnan ang account",
    Ready: "Handa",
    "Live profile connected": "Nakakonekta ang live profile",
    "Language preference": "Kagustuhan sa wika",
    "English, Tagalog, or Bisaya": "English, Tagalog, o Bisaya",
    "Privacy & consent": "Privacy at pahintulot",
    Custom: "Custom",
    Standard: "Karaniwan",
    "Local preference controls": "Lokal na controls ng kagustuhan",
    "Account Snapshot": "Buod ng Account",
    "Your profile": "Iyong profile",
    "No email loaded": "Walang na-load na email",
    "Preferred language": "Piniling wika",
    Email: "Email",
    Roles: "Mga role",
    "Update account": "I-update ang account",
    "Profile details": "Detalye ng profile",
    "Update your first name, last name, and password with the live profile endpoint. Email stays read-only because the current backend update flow still uses it as the account lookup key.":
      "I-update ang iyong first name, last name, at password gamit ang live profile endpoint. Read-only ang email dahil ginagamit pa rin ito ng kasalukuyang backend update flow bilang account lookup key.",
    "First name": "Pangalan",
    "Last name": "Apelyido",
    "Email address": "Email address",
    "New password": "Bagong password",
    "Confirm password": "Kumpirmahin ang password",
    "Read-only until the backend supports safe email updates.":
      "Read-only ito hanggang suportahan ng backend ang ligtas na pag-update ng email.",
    "Required by the current update endpoint.":
      "Kinakailangan ito ng kasalukuyang update endpoint.",
    "Saving applies your profile update immediately and replaces your password with the new value above.":
      "Kapag nagsave, agad na ia-apply ang update sa profile at papalitan ang password mo ng bagong value sa itaas.",
    Saving: "Nagsa-save",
    "Save account changes": "I-save ang mga pagbabago sa account",
    "Language preferences": "Mga kagustuhan sa wika",
    "Choose your interface language": "Piliin ang wika ng interface",
    "Select the language you want AlagaMind to prioritize on this device.":
      "Piliin ang wikang gusto mong unahing gamitin ng AlagaMind sa device na ito.",
    English: "English",
    Tagalog: "Tagalog",
    Bisaya: "Bisaya",
    "Default product language": "Default na wika ng produkto",
    "Filipino interface copy": "Filipinong interface copy",
    "Cebuano-friendly interface": "Cebuano-friendly na interface",
    "How are you feeling today?": "Kumusta ang pakiramdam mo ngayon?",
    "Kumusta ang pakiramdam mo ngayon?":
      "Kumusta ang pakiramdam mo ngayon?",
    "Kumusta imong gibati karon?": "Kumusta ang pakiramdam mo ngayon?",
    "Preview: How are you feeling today?":
      "Preview: Kumusta ang pakiramdam mo ngayon?",
    "Preview: Kumusta ang pakiramdam mo ngayon?":
      "Preview: Kumusta ang pakiramdam mo ngayon?",
    "Preview: Kumusta imong gibati karon?":
      "Preview: Kumusta ang pakiramdam mo ngayon?",
    "Preview copy": "Preview copy",
    "Save language preference": "I-save ang kagustuhan sa wika",
    "Language and consent preferences saved.":
      "Na-save ang mga kagustuhan sa wika at pahintulot.",
    "Danger zone": "Danger zone",
    "Session and account actions": "Mga aksyon sa session at account",
    "End the current session and return to the login screen.":
      "Tapusin ang kasalukuyang session at bumalik sa login screen.",
    "Delete account": "Burahin ang account",
    "The current backend still has no delete-account endpoint, so this action stays locked rather than faking a destructive flow in the client.":
      "Wala pang delete-account endpoint ang kasalukuyang backend, kaya naka-lock ang aksyong ito sa halip na magpanggap ng destructive flow sa client.",
    "Wire this area only after the backend exposes a real account deletion endpoint.":
      "Ikabit lamang ang bahaging ito kapag may tunay nang account deletion endpoint ang backend.",
    "Delete account unavailable": "Hindi available ang pagbura ng account",
    "Load your profile first before saving changes.":
      "I-load muna ang profile mo bago magsave ng mga pagbabago.",
    "Enter a password with at least 3 characters.":
      "Maglagay ng password na may hindi bababa sa 3 character.",
    "Password confirmation does not match.":
      "Hindi tugma ang kumpirmasyon ng password.",
    "Profile updated successfully.": "Matagumpay na na-update ang profile.",
    "Failed to update profile right now.":
      "Hindi ma-update ang profile sa ngayon.",
    "Failed to load your account.": "Hindi ma-load ang iyong account.",
    "Good morning": "Magandang umaga",
    "Good afternoon": "Magandang hapon",
    "Good evening": "Magandang gabi",
    "Here's your current wellbeing snapshot across check-ins, resilience, and focus momentum.":
      "Narito ang kasalukuyan mong wellbeing snapshot mula sa mga check-in, resilience, at focus momentum.",
    "Quick Check-In": "Mabilisang Check-In",
    "Last Logged: 2H Ago": "Huling naitala: 2 oras ang nakalipas",
    "Current Emotional State": "Kasalukuyang Emosyonal na Kalagayan",
    Intensity: "Tindi",
    "Resilience Quotient": "Resilience Quotient",
    Score: "Iskor",
    "Needs reinforcement": "Kailangang palakasin",
    "Adaptive Capacity": "Adaptive Capacity",
    "Updated recently": "Na-update kamakailan",
    "Exercises coming soon": "Paparating na ang exercises",
    Success: "Tagumpay",
    "Mood log saved successfully. Your dashboard metrics are refreshing.":
      "Matagumpay na na-save ang mood log. Nire-refresh ang metrics ng iyong dashboard.",
    "Close notification": "Isara ang abiso",
    "Integrated Wellness Suite": "Pinagsamang Wellness Suite",
    "Core clinical pathways for personalized mental optimization.":
      "Mga pangunahing clinical pathway para sa personalized na mental optimization.",
    STATUS: "STATUS",
    TYPE: "URI",
    LATENCY: "LATENCY",
    "CHAT NOW": "MAKIPAG-CHAT NGAYON",
    "WRITE NOW": "SUMULAT NGAYON",
    "EXPLORE LIBRARY": "BUKSAN ANG LIBRARY",
    "Last entry": "Huling entry",
    "Protocols": "Mga protocol",
    Updates: "Mga update",
    "New Added": "Bagong dagdag",
    "12 Available": "12 available",
    "Multi-modal": "Multi-modal",
    "Journal-reflections": "Journal-reflections",
    "Journal & Reflections": "Journal at Pagninilay",
    "Archived insights from your personal health intelligence journey.":
      "Mga naka-archive na insight mula sa iyong personal na health intelligence journey.",
    "New Journal Entry": "Bagong Journal Entry",
    "Card view": "Card view",
    "List view": "List view",
    "Last 7 Days": "Huling 7 araw",
    "Last 30 Days": "Huling 30 araw",
    "Last 90 Days": "Huling 90 araw",
    "All Time": "Lahat ng oras",
    "Search entries, keywords, or sentiments...":
      "Maghanap ng mga entry, keyword, o damdamin...",
    "Filters:": "Mga filter:",
    Mood: "Mood",
    Date: "Petsa",
    Tags: "Mga tag",
    "Clear All": "I-clear lahat",
    "New Reflection": "Bagong repleksyon",
    "Mood": "Mood",
    "Date & Time": "Petsa at Oras",
    "Entry Details": "Detalye ng Entry",
    "Word Count": "Bilang ng Salita",
    "Session Type": "Uri ng Session",
    Status: "Status",
    Active: "Aktibo",
    "No entries matched your current filters.":
      "Walang entry na tumugma sa kasalukuyan mong mga filter.",
    "Loading journals...": "Ikinakarga ang mga journal...",
    "Reframing Lab": "Reframing Lab",
    "Neural engine active": "Aktibo ang neural engine",
    "Reframe a thought and watch your patterns update.":
      "I-reframe ang isang thought at panoorin ang pag-update ng iyong mga pattern.",
    "View Pattern Insights": "Tingnan ang Pattern Insights",
    "Reframes Completed": "Nakumpletong Reframe",
    "No saved reframes yet": "Wala pang naka-save na reframe",
    "+0 today": "+0 ngayon",
    "Dominant Distortion": "Pinakamaraming Distortion",
    "No data yet": "Wala pang data",
    "Waiting for distortion data": "Naghihintay ng distortion data",
    "Pattern Insights Fired": "Na-trigger na Pattern Insights",
    Live: "Live",
    "No time, topic, or distortion signals yet":
      "Wala pang time, topic, o distortion signal",
    "Across 0 unique thoughts": "Sa 0 natatanging thought",
    "Present in 0% of entries": "Makikita sa 0% ng mga entry",
    "Step 1 - Select a thought": "Hakbang 1 - Pumili ng thought",
    "Pick the thought you want to rework":
      "Piliin ang thought na gusto mong ayusin",
    "Keep the selection and generation flow on the left rail.":
      "Panatilihin ang selection at generation flow sa kaliwang panel.",
    "Thoughts unavailable": "Hindi available ang thoughts",
    "We could not load thoughts for reframing.":
      "Hindi namin ma-load ang thoughts para sa reframing.",
    "No thoughts available yet.": "Wala pang available na thought.",
    "Step 2 - Generate reframes": "Hakbang 2 - Bumuo ng mga reframe",
    "Generate three tones": "Bumuo ng tatlong tono",
    "Logical, compassionate, and direct versions appear in the right workspace.":
      "Lilitaw ang logical, compassionate, at direct na bersyon sa kanang workspace.",
    "Choose a thought to unlock generation":
      "Pumili ng thought para ma-unlock ang generation",
    "Showing all available thoughts returned by the backend.":
      "Ipinapakita ang lahat ng available na thought na ibinalik ng backend.",
    "Thoughts will appear here after journals are analyzed.":
      "Lilitaw dito ang mga thought pagkatapos ma-analyze ang mga journal.",
    "Generating reframes": "Bumubuo ng mga reframe",
    "Reframe this thought": "I-reframe ang thought na ito",
    "Reframes unavailable": "Hindi available ang mga reframe",
    "We could not generate reframes for this thought right now.":
      "Hindi kami makabuo ng mga reframe para sa thought na ito ngayon.",
    "Step 3 - Choose a reframe to save":
      "Hakbang 3 - Pumili ng reframe na ise-save",
    "Save the reframe you want to keep":
      "I-save ang reframe na gusto mong panatilihin",
    "This workspace stays focused on the chosen thought and the three saved options.":
      "Nananatiling nakatuon ang workspace na ito sa napiling thought at sa tatlong naka-save na option.",
    'Pick a thought on the left and press "Reframe this thought" to begin.':
      'Pumili ng thought sa kaliwa at pindutin ang "I-reframe ang thought na ito" para magsimula.',
    "Selected original thought": "Napiling orihinal na thought",
    Ready: "Handa",
    Saved: "Na-save",
    "Save reframe": "I-save ang reframe",
    "Pattern Insights": "Pattern Insights",
    "Updates live as you save reframes":
      "Live na nag-a-update habang nagsa-save ka ng mga reframe",
    "This drawer comes from the right and hovers over the workspace.":
      "Lumilitaw ang drawer na ito mula sa kanan at naka-hover sa ibabaw ng workspace.",
    Close: "Isara",
    "Live feed": "Live feed",
    "Detected patterns": "Mga natukoy na pattern",
    "Distortion breakdown": "Breakdown ng distortion",
    "Exercises & Protocols": "Ehersisyo at Mga Protocol",
    "Evidence-Based Care": "Evidence-Based Care",
    "Personalized Recommendations": "Personalized na Rekomendasyon",
    "Strategic interventions optimized for your current state of regulation.":
      "Mga strategic intervention na inangkop sa kasalukuyan mong estado ng regulasyon.",
    "98% Match": "98% tugma",
    "92% Match": "92% tugma",
    "Acute Relief": "Agarang ginhawa",
    "Box Breathing": "Box Breathing",
    "Vagal tone optimization and autonomic nervous system regulation.":
      "Pag-optimize ng vagal tone at regulasyon ng autonomic nervous system.",
    "Cognitive Reframing": "Cognitive Reframing",
    "Identify and challenge cognitive distortions to reduce distress.":
      "Kilalanin at hamunin ang cognitive distortions para mabawasan ang distress.",
    "Grounding: 5-4-3-2-1": "Grounding: 5-4-3-2-1",
    "Immediate sensory-based anxiety relief for acute regulation.":
      "Agarang sensory-based anxiety relief para sa acute regulation.",
    "Search therapeutic protocols...":
      "Maghanap ng therapeutic protocols...",
    "All Durations": "Lahat ng tagal",
    "All Focus": "Lahat ng pokus",
    Mindfulness: "Mindfulness",
    "1 protocols available": "1 available na protocol",
    "1 PROTOCOLS AVAILABLE": "1 AVAILABLE NA PROTOCOL",
    "Behavioral Activation": "Behavioral Activation",
    "Structured action planning to improve mood and restore forward momentum through measurable daily wins.":
      "Structured action planning para mapabuti ang mood at maibalik ang forward momentum sa pamamagitan ng masusukat na pang-araw-araw na panalo.",
    FOCUS: "POKUS",
    "Mood & Energy": "Mood at Enerhiya",
    "Browse Library": "Buksan ang Library",
    "View 40+ additional protocols": "Tingnan ang 40+ dagdag na protocol",
    Exercises: "Ehersisyo",
    CBT: "CBT",
    "6 Min": "6 Min",
    Step: "Hakbang",
    "Cognitive Reframing Session": "Session ng Cognitive Reframing",
    "Step-by-step worksheet with optional AI copilot chat on the right. Your input leads each step before moving forward.":
      "Step-by-step na worksheet na may optional AI copilot chat sa kanan. Nangunguna ang input mo sa bawat hakbang bago magpatuloy.",
    "Workflow Progress": "Progress ng Workflow",
    "Current focus": "Kasalukuyang pokus",
    "Complete this step first, then continue to the next one.":
      "Tapusin muna ang hakbang na ito bago magpatuloy sa susunod.",
    ReframeAI: "ReframeAI",
    "Hide ReframeAI": "Itago ang ReframeAI",
    "Current Step": "Kasalukuyang Hakbang",
    "Input Required": "Kailangan ng Input",
    "Ready to continue.": "Handa nang magpatuloy.",
    Back: "Bumalik",
    Next: "Susunod",
    Complete: "Kumpletuhin",
    "Saving...": "Nagse-save...",
    "Save CBT Output": "I-save ang CBT Output",
    "Unsaved changes": "May hindi pa nase-save na pagbabago",
    "All changes saved": "Na-save na ang lahat ng pagbabago",
    Exercises: "Ehersisyo",
    "Acute Relief": "Agarang ginhawa",
    "5-4-3-2-1 Sensory Grounding": "5-4-3-2-1 Sensory Grounding",
    "Redirect attention from anxious thoughts to the present moment by engaging each of your five senses, one step at a time.":
      "Ibalik ang atensyon mula sa mga anxious na thought patungo sa kasalukuyang sandali sa pamamagitan ng paggamit ng iyong limang pandama, paisa-isang hakbang.",
    "Session Progress": "Progress ng Session",
    "Current sense": "Kasalukuyang pandama",
    See: "Tingin",
    Touch: "Hipo",
    Hear: "Dinig",
    Smell: "Amoy",
    Taste: "Lasa",
    "Things You See": "Mga Bagay na Nakikita Mo",
    "Name 5 things you can see right now.":
      "Magbanggit ng 5 bagay na nakikita mo ngayon.",
    "Look around your immediate environment. Notice colors, shapes, textures, or movement.":
      "Tumingin sa iyong paligid. Pansinin ang kulay, hugis, texture, o galaw.",
    "All fields completed. Continue when ready.":
      "Nakumpleto na ang lahat ng field. Magpatuloy kapag handa ka na.",
    "Grounding Complete": "Kumpleto na ang Grounding",
    "You have successfully anchored yourself in the present moment through all five senses.":
      "Matagumpay mong naangkla ang iyong sarili sa kasalukuyang sandali sa pamamagitan ng limang pandama.",
    "You Are Here": "Narito Ka",
    "Your attention has moved from threat-based thinking to present-state awareness. This is the foundation of emotional regulation.":
      "Lumipat na ang iyong atensyon mula sa threat-based thinking tungo sa present-state awareness. Ito ang pundasyon ng emotional regulation.",
    "Start Over": "Magsimula Muli",
    "Return to Exercises": "Bumalik sa Ehersisyo",
    "Insights & Reports": "Insights at Mga Ulat",
    "Track resilience movement, emotional distribution, usage patterns, and recommendation signals across your selected reporting window.":
      "Subaybayan ang galaw ng resilience, emotional distribution, usage patterns, at recommendation signals sa napili mong reporting window.",
    Overview: "Overview",
    Refresh: "I-refresh",
    "The API returned no usable insights data for the selected range.":
      "Walang nagamit na insights data ang ibinalik ng API para sa napiling range.",
    "Emotional State Distribution": "Distribusyon ng Emosyonal na Kalagayan",
    "Check-in mood frequency": "Dalas ng mood sa check-in",
    "No dominant state yet": "Wala pang dominanteng state",
    "No emotional state distribution is available for this range.":
      "Walang available na emotional state distribution para sa range na ito.",
    "Weekly Activity": "Lingguhang Aktibidad",
    "Module usage by day": "Paggamit ng module kada araw",
    "No weekly activity window available.":
      "Walang available na weekly activity window.",
    "No weekly activity data is available for this range.":
      "Walang available na weekly activity data para sa range na ito.",
    "Cognitive Distortion Analysis": "Pagsusuri ng Cognitive Distortion",
    "Distortion breakdown": "Breakdown ng distortion",
    "Detected across journal entries and reframing sessions.":
      "Natukoy sa mga journal entry at reframing session.",
    Dominant: "Dominant",
    "No cognitive distortion breakdown is available for this range.":
      "Walang available na cognitive distortion breakdown para sa range na ito.",
    "RQ Score": "RQ Score",
    "Current resilience score for the selected range.":
      "Kasalukuyang resilience score para sa napiling range.",
    "Raw score progress across active RQ modules.":
      "Pag-usad ng raw score sa mga aktibong RQ module.",
    "Focus Streak": "Focus Streak",
    "Current daily consistency streak.":
      "Kasalukuyang araw-araw na consistency streak.",
    "Day Streak": "Sunod-sunod na Araw",
    "Week Avg": "Lingguhang Avg",
    "Week of": "Linggo ng",
    "Start with a check-in, journal, chat, or reframe to build momentum this week.":
      "Magsimula sa check-in, journal, chat, o reframe para makabuo ng momentum ngayong linggo.",
    "Couldn't refresh live data. Showing the last successful snapshot.":
      "Hindi na-refresh ang live data. Ipinapakita ang huling matagumpay na snapshot.",
    "No focus momentum data available yet.":
      "Wala pang available na focus momentum data.",
    "check-ins": "mga check-in",
    "chat turns": "mga chat turn",
    journals: "mga journal",
    reframes: "mga reframe",
    "Total Activity": "Kabuuang Aktibidad",
    "Combined activity count in the selected period.":
      "Pinagsamang bilang ng aktibidad sa napiling panahon.",
    "Help & Support": "Tulong at Suporta",
    "Clear support routes, safety boundaries, and self-serve help":
      "Malinaw na support routes, safety boundaries, at self-serve help",
    "This page gives users a fast path to the right product area, explains what support can help with, and keeps crisis guidance explicit so the app does not over-promise beyond its role.":
      "Binibigyan ng page na ito ang mga user ng mabilis na daan sa tamang bahagi ng produkto, ipinapaliwanag kung saan makakatulong ang support, at ginagawang malinaw ang crisis guidance para hindi mag-over-promise ang app lampas sa papel nito.",
    "Support-ready": "Handa para sa support",
    "Crisis-safe copy": "Crisis-safe na copy",
    "Quick paths": "Mabilisang daan",
    "Direct entry points into the main product areas users usually need.":
      "Direktang entry points sa pangunahing bahagi ng produkto na karaniwang kailangan ng mga user.",
    "Support channels": "Mga support channel",
    "Product, privacy, and safety boundary guidance.":
      "Gabay sa produkto, privacy, at safety boundary.",
    "FAQ answers": "Mga sagot sa FAQ",
    "Short answers for the questions users are likely to ask first.":
      "Maiikling sagot sa mga tanong na malamang unang itanong ng mga user.",
    "Safety posture": "Safety posture",
    Explicit: "Malinaw",
    "The app is supportive, not emergency care.":
      "Suportado ang app, pero hindi ito emergency care.",
    "Take users to the right surface fast":
      "Dalhin agad ang mga user sa tamang bahagi",
    "Support gets lighter when the app itself routes people to the correct place instead of forcing them to guess.":
      "Gumagaan ang support kapag ang app mismo ang nagdadala sa mga tao sa tamang lugar sa halip na hulaan nila ito.",
    "Account and preferences": "Account at mga kagustuhan",
    "Update profile details, language, consent choices, and session settings.":
      "I-update ang detalye ng profile, wika, consent choices, at settings ng session.",
    "AI companion": "AI kasama",
    "Continue a conversation, review tone and language behavior, or inspect session flow.":
      "Ipagpatuloy ang pag-uusap, suriin ang tono at behavior ng wika, o tingnan ang daloy ng session.",
    "Journals and reflections": "Mga journal at pagninilay",
    "Review entries, archives, and sentiment-related journaling surfaces.":
      "Suriin ang mga entry, archive, at journaling surfaces na may kaugnayan sa sentiment.",
    "Exercises and protocols": "Mga ehersisyo at protocol",
    "Open grounding, breathing, reframing, and behavioral activation tools.":
      "Buksan ang grounding, breathing, reframing, at behavioral activation tools.",
    "What help can cover": "Ano ang saklaw ng tulong",
    "Separate ordinary product support from privacy handling and urgent safety guidance.":
      "Ihiwalay ang karaniwang product support mula sa privacy handling at agarang safety guidance.",
    "Product support": "Product support",
    "Best for broken UI, route issues, failed saves, and confusing workflow behavior.":
      "Pinakamainam para sa sirang UI, route issues, failed saves, at nakalilitong workflow behavior.",
    "Target response window: within 1 business day.":
      "Target na panahon ng tugon: sa loob ng 1 business day.",
    "Privacy requests": "Mga kahilingan sa privacy",
    "Use when the concern involves account access, data boundaries, or deletion/export handling.":
      "Gamitin ito kapag ang concern ay tungkol sa access sa account, data boundaries, o deletion/export handling.",
    "Route through the privacy workflow before making irreversible changes.":
      "Idaan muna sa privacy workflow bago gumawa ng mga pagbabagong hindi na mababawi.",
    "Clinical safety boundary": "Clinical safety boundary",
    "The app can support reflection, but it should not present itself as emergency or crisis care.":
      "Maaaring suportahan ng app ang pagninilay, pero hindi nito dapat ipakita ang sarili bilang emergency o crisis care.",
    "Escalate to real human services for urgent risk or immediate danger.":
      "I-escalate sa tunay na human services kapag may agarang panganib o immediate danger.",
    FAQ: "FAQ",
    "Common questions": "Karaniwang mga tanong",
    "Use native disclosure patterns so the page stays readable without pushing everything into a client-side accordion.":
      "Gamitin ang native disclosure patterns para manatiling madaling basahin ang page nang hindi isinisiksik ang lahat sa client-side accordion.",
    "Reporting template": "Template sa pagre-report",
    "What a useful support message includes":
      "Ano ang laman ng isang kapaki-pakinabang na support message",
    "Good support UI teaches users what information helps fix the issue instead of just giving them a blank inbox.":
      "Ang mahusay na support UI ay nagtuturo sa mga user kung anong impormasyon ang makakatulong sa pag-ayos ng issue sa halip na bigyan lang sila ng blangkong inbox.",
    "Reusable rule of thumb": "Magagamit na tuntunin",
    "Help pages work best when they reduce support demand in two ways at once: route users to the right place immediately, and teach them the minimum context needed for a useful request.":
      "Pinakamahusay ang help pages kapag pinapababa nila ang support demand sa dalawang paraan nang sabay: dinadala agad ang mga user sa tamang lugar, at itinuturo ang minimum na context na kailangan para sa kapaki-pakinabang na request.",
  },
  bisaya: {
    Dashboard: "Dashboard",
    "AI Companion": "AI Kauban",
    "Journal & Reflections": "Journal ug Pamalandong",
    "Reframing & Insights": "Reframing ug Insights",
    "Exercises & Protocols": "Mga Ehersisyo ug Protocol",
    "Insights & Sessions": "Insights ug Mga Session",
    "Insights & Reports": "Insights ug Mga Report",
    System: "Sistema",
    Settings: "Settings",
    "Help & Support": "Tabang ug Suporta",
    "Active Session": "Aktibong Session",
    Session: "Session",
    "Authenticated user": "Na-authenticate nga user",
    "Loading profile...": "Gikarga ang profile...",
    "Checking session": "Gisusi ang session",
    "Sign Out": "Pag-sign out",
    "Signing out": "Nag-sign out",
    "Sign out": "Pag-sign out",
    "Sign out now": "Pag-sign out karon",
    "Profile Settings": "Mga Setting sa Profile",
    "Account & Preferences": "Account ug mga Preference",
    "Keep your profile details current, choose your preferred language, and manage privacy controls from one calm settings surface.":
      "Padayonang updated ang detalye sa imong profile, pili-a ang gusto nimong pinulongan, ug dumala ang privacy controls sa usa ka limpyo nga settings surface.",
    "View account": "Tan-awa ang account",
    Ready: "Andam",
    "Live profile connected": "Nakakonek ang live profile",
    "Language preference": "Preference sa pinulongan",
    "English, Tagalog, or Bisaya": "English, Tagalog, o Bisaya",
    "Privacy & consent": "Privacy ug pagtugot",
    Custom: "Custom",
    Standard: "Standard",
    "Local preference controls": "Lokal nga preference controls",
    "Account Snapshot": "Snapshot sa Account",
    "Your profile": "Imong profile",
    "No email loaded": "Walay na-load nga email",
    "Preferred language": "Piniling pinulongan",
    Email: "Email",
    Roles: "Mga role",
    "Update account": "I-update ang account",
    "Profile details": "Detalye sa profile",
    "Update your first name, last name, and password with the live profile endpoint. Email stays read-only because the current backend update flow still uses it as the account lookup key.":
      "I-update ang imong first name, last name, ug password gamit ang live profile endpoint. Read-only ang email kay gigamit pa kini sa kasamtangang backend update flow isip account lookup key.",
    "First name": "Ngalan",
    "Last name": "Apelyido",
    "Email address": "Email address",
    "New password": "Bag-ong password",
    "Confirm password": "Kumpirmaha ang password",
    "Read-only until the backend supports safe email updates.":
      "Read-only kini hangtod masuportahan sa backend ang luwas nga email updates.",
    "Required by the current update endpoint.":
      "Gikinahanglan kini sa kasamtangang update endpoint.",
    "Saving applies your profile update immediately and replaces your password with the new value above.":
      "Ang save mo-apply dayon sa update sa profile ug pulihan ang imong password sa bag-ong value sa taas.",
    Saving: "Nagse-save",
    "Save account changes": "I-save ang kausaban sa account",
    "Language preferences": "Mga preference sa pinulongan",
    "Choose your interface language": "Pilia ang pinulongan sa interface",
    "Select the language you want AlagaMind to prioritize on this device.":
      "Pilia ang pinulongan nga gusto nimong unahon sa AlagaMind sa kini nga device.",
    English: "English",
    Tagalog: "Tagalog",
    Bisaya: "Bisaya",
    "Default product language": "Default nga pinulongan sa produkto",
    "Filipino interface copy": "Filipino nga interface copy",
    "Cebuano-friendly interface": "Cebuano-friendly nga interface",
    "How are you feeling today?": "Kumusta imong gibati karon?",
    "Kumusta ang pakiramdam mo ngayon?": "Kumusta imong gibati karon?",
    "Kumusta imong gibati karon?": "Kumusta imong gibati karon?",
    "Preview: How are you feeling today?":
      "Preview: Kumusta imong gibati karon?",
    "Preview: Kumusta ang pakiramdam mo ngayon?":
      "Preview: Kumusta imong gibati karon?",
    "Preview: Kumusta imong gibati karon?":
      "Preview: Kumusta imong gibati karon?",
    "Preview copy": "Preview copy",
    "Save language preference": "I-save ang preference sa pinulongan",
    "Language and consent preferences saved.":
      "Na-save ang preferences sa pinulongan ug pagtugot.",
    "Danger zone": "Danger zone",
    "Session and account actions": "Mga aksyon sa session ug account",
    "End the current session and return to the login screen.":
      "Tapusa ang kasamtangang session ug mobalik sa login screen.",
    "Delete account": "Tangtanga ang account",
    "The current backend still has no delete-account endpoint, so this action stays locked rather than faking a destructive flow in the client.":
      "Wala pay delete-account endpoint ang kasamtangang backend, busa naka-lock kini imbes nga magpanggap og destructive flow sa client.",
    "Wire this area only after the backend exposes a real account deletion endpoint.":
      "I-wire lang kini nga area kung naa nay tinuod nga account deletion endpoint ang backend.",
    "Delete account unavailable": "Dili available ang pagtangtang sa account",
    "Load your profile first before saving changes.":
      "I-load una ang imong profile sa dili pa mag-save og kausaban.",
    "Enter a password with at least 3 characters.":
      "Pagsulod og password nga adunay labing menos 3 ka character.",
    "Password confirmation does not match.":
      "Dili magkapareho ang pagkumpirma sa password.",
    "Profile updated successfully.":
      "Malampusong na-update ang profile.",
    "Failed to update profile right now.":
      "Napakyas ang pag-update sa profile karon.",
    "Failed to load your account.":
      "Napakyas ang pag-load sa imong account.",
    "Good morning": "Maayong buntag",
    "Good afternoon": "Maayong hapon",
    "Good evening": "Maayong gabii",
    "Here's your current wellbeing snapshot across check-ins, resilience, and focus momentum.":
      "Ania ang imong kasamtangang wellbeing snapshot gikan sa mga check-in, resilience, ug focus momentum.",
    "Quick Check-In": "Paspas nga Check-In",
    "Last Logged: 2H Ago": "Kataposang log: 2 ka oras ang milabay",
    "Current Emotional State": "Kasamtangang Emosyonal nga Kahimtang",
    Intensity: "Intensity",
    "Resilience Quotient": "Resilience Quotient",
    Score: "Iskor",
    "Needs reinforcement": "Kinahanglan og pagpalig-on",
    "Adaptive Capacity": "Adaptive Capacity",
    "Updated recently": "Bag-o lang na-update",
    "Exercises coming soon": "Padulong na ang exercises",
    Success: "Malampuson",
    "Mood log saved successfully. Your dashboard metrics are refreshing.":
      "Malampusong na-save ang mood log. Gi-refresh ang metrics sa imong dashboard.",
    "Close notification": "Isira ang pahibalo",
    "Integrated Wellness Suite": "Integrated Wellness Suite",
    "Core clinical pathways for personalized mental optimization.":
      "Mga nag-unang clinical pathway para sa personalized nga mental optimization.",
    STATUS: "STATUS",
    TYPE: "URI",
    LATENCY: "LATENCY",
    "CHAT NOW": "CHAT KARON",
    "WRITE NOW": "SULAT KARON",
    "EXPLORE LIBRARY": "SUSIHA ANG LIBRARY",
    "Last entry": "Kataposang entry",
    Protocols: "Mga protocol",
    Updates: "Mga update",
    "New Added": "Bag-ong nadugang",
    "12 Available": "12 ka available",
    "Multi-modal": "Multi-modal",
    "Journal-reflections": "Journal-reflections",
    "Journal & Reflections": "Journal ug Pamalandong",
    "Archived insights from your personal health intelligence journey.":
      "Mga gi-archive nga insight gikan sa imong personal nga health intelligence journey.",
    "New Journal Entry": "Bag-ong Journal Entry",
    "Card view": "Card view",
    "List view": "List view",
    "Last 7 Days": "Niaging 7 ka adlaw",
    "Last 30 Days": "Niaging 30 ka adlaw",
    "Last 90 Days": "Niaging 90 ka adlaw",
    "All Time": "Tanang oras",
    "Search entries, keywords, or sentiments...":
      "Pangitaa ang mga entry, keyword, o sentiment...",
    "Filters:": "Mga filter:",
    Mood: "Mood",
    Date: "Petsa",
    Tags: "Mga tag",
    "Clear All": "I-clear tanan",
    "New Reflection": "Bag-ong Pamalandong",
    "Date & Time": "Petsa ug Oras",
    "Entry Details": "Detalye sa Entry",
    "Word Count": "Gidaghanon sa Pulong",
    "Session Type": "Uri sa Session",
    Status: "Status",
    Active: "Aktibo",
    "No entries matched your current filters.":
      "Walay entry nga nitugma sa imong kasamtangang mga filter.",
    "Loading journals...": "Gikarga ang mga journal...",
    "Reframing Lab": "Reframing Lab",
    "Neural engine active": "Aktibo ang neural engine",
    "Reframe a thought and watch your patterns update.":
      "I-reframe ang usa ka thought ug tan-awa ang pag-update sa imong mga pattern.",
    "View Pattern Insights": "Tan-awa ang Pattern Insights",
    "Reframes Completed": "Nahuman nga Reframe",
    "No saved reframes yet": "Wala pay na-save nga reframe",
    "+0 today": "+0 karon",
    "Dominant Distortion": "Dominanteng Distortion",
    "No data yet": "Wala pay data",
    "Waiting for distortion data": "Naghulat sa distortion data",
    "Pattern Insights Fired": "Na-trigger nga Pattern Insights",
    Live: "Live",
    "No time, topic, or distortion signals yet":
      "Wala pay time, topic, o distortion signal",
    "Across 0 unique thoughts": "Sa 0 ka talagsaong thought",
    "Present in 0% of entries": "Makita sa 0% sa mga entry",
    "Step 1 - Select a thought": "Lakang 1 - Pili ug thought",
    "Pick the thought you want to rework":
      "Pilia ang thought nga gusto nimong usbon",
    "Keep the selection and generation flow on the left rail.":
      "Ipadayon ang selection ug generation flow sa wala nga panel.",
    "Thoughts unavailable": "Dili available ang thoughts",
    "We could not load thoughts for reframing.":
      "Dili namo ma-load ang thoughts para sa reframing.",
    "No thoughts available yet.": "Wala pay available nga thought.",
    "Step 2 - Generate reframes": "Lakang 2 - Himoa ang mga reframe",
    "Generate three tones": "Paghimo ug tulo ka tono",
    "Logical, compassionate, and direct versions appear in the right workspace.":
      "Ang logical, compassionate, ug direct nga bersyon makita sa tuo nga workspace.",
    "Choose a thought to unlock generation":
      "Pilia ang thought aron ma-unlock ang generation",
    "Showing all available thoughts returned by the backend.":
      "Gipakita ang tanang available nga thought nga gibalik sa backend.",
    "Thoughts will appear here after journals are analyzed.":
      "Mogawas dinhi ang mga thought human ma-analyze ang mga journal.",
    "Generating reframes": "Naghimo og mga reframe",
    "Reframe this thought": "I-reframe kining thought",
    "Reframes unavailable": "Dili available ang mga reframe",
    "We could not generate reframes for this thought right now.":
      "Dili kami makahimo og mga reframe para niining thought karon.",
    "Step 3 - Choose a reframe to save":
      "Lakang 3 - Pili ug reframe nga ise-save",
    "Save the reframe you want to keep":
      "I-save ang reframe nga gusto nimong tipigan",
    "This workspace stays focused on the chosen thought and the three saved options.":
      "Kini nga workspace nagpabiling nakapokus sa napiling thought ug sa tulo ka na-save nga opsyon.",
    'Pick a thought on the left and press "Reframe this thought" to begin.':
      'Pilia ang thought sa wala ug pindota ang "I-reframe kining thought" aron magsugod.',
    "Selected original thought": "Napiling orihinal nga thought",
    Ready: "Andam",
    Saved: "Na-save",
    "Save reframe": "I-save ang reframe",
    "Pattern Insights": "Pattern Insights",
    "Updates live as you save reframes":
      "Live nga nag-update samtang nag-save ka og mga reframe",
    "This drawer comes from the right and hovers over the workspace.":
      "Kini nga drawer mogula gikan sa tuo ug molutaw ibabaw sa workspace.",
    Close: "Isira",
    "Live feed": "Live feed",
    "Detected patterns": "Nadetek nga mga pattern",
    "Distortion breakdown": "Breakdown sa distortion",
    "Exercises & Protocols": "Ehersisyo ug Mga Protocol",
    "Evidence-Based Care": "Evidence-Based Care",
    "Personalized Recommendations": "Personalized nga Rekomendasyon",
    "Strategic interventions optimized for your current state of regulation.":
      "Mga strategic intervention nga gi-optimize para sa imong kasamtangang kahimtang sa regulation.",
    "98% Match": "98% tugma",
    "92% Match": "92% tugma",
    "Acute Relief": "Agarang paghupay",
    "Search therapeutic protocols...":
      "Pangitaa ang therapeutic protocols...",
    "All Durations": "Tanang gidugayon",
    "All Focus": "Tanang focus",
    "1 protocols available": "1 ka available nga protocol",
    "1 PROTOCOLS AVAILABLE": "1 KA AVAILABLE NGA PROTOCOL",
    FOCUS: "FOCUS",
    "Mood & Energy": "Mood ug Enerhiya",
    "Browse Library": "Susihon ang Library",
    "View 40+ additional protocols": "Tan-awa ang 40+ ka dugang nga protocol",
    Exercises: "Ehersisyo",
    "6 Min": "6 Min",
    Step: "Lakang",
    "Cognitive Reframing Session": "Session sa Cognitive Reframing",
    "Step-by-step worksheet with optional AI copilot chat on the right. Your input leads each step before moving forward.":
      "Step-by-step nga worksheet nga naay optional AI copilot chat sa tuo. Ang imong input maoy mag-una sa matag lakang sa dili pa mopadayon.",
    "Workflow Progress": "Pag-uswag sa Workflow",
    "Current focus": "Kasamtangang focus",
    "Complete this step first, then continue to the next one.":
      "Kompletoha una kining lakanga, unya padayon sa sunod.",
    ReframeAI: "ReframeAI",
    "Hide ReframeAI": "Tagoa ang ReframeAI",
    "Current Step": "Kasamtangang Lakang",
    "Input Required": "Kinahanglan og Input",
    "Ready to continue.": "Andam nang mopadayon.",
    Back: "Balik",
    Next: "Sunod",
    Complete: "Kumpletoha",
    "Saving...": "Nag-save...",
    "Save CBT Output": "I-save ang CBT Output",
    "Unsaved changes": "Adunay wala pa na-save nga kausaban",
    "All changes saved": "Na-save na ang tanang kausaban",
    "5-4-3-2-1 Sensory Grounding": "5-4-3-2-1 Sensory Grounding",
    "Redirect attention from anxious thoughts to the present moment by engaging each of your five senses, one step at a time.":
      "Ibalhin ang atensyon gikan sa anxious nga thoughts ngadto sa kasamtangang higayon pinaagi sa paggamit sa imong lima ka senses, usa ka lakang matag higayon.",
    "Session Progress": "Pag-uswag sa Session",
    "Current sense": "Kasamtangang sense",
    See: "Tan-awa",
    Touch: "Hikapa",
    Hear: "Paminawa",
    Smell: "Simhota",
    Taste: "Tilawi",
    "Things You See": "Mga Butang nga Imong Makita",
    "Name 5 things you can see right now.":
      "Isulti ang 5 ka butang nga imong makita karon.",
    "Look around your immediate environment. Notice colors, shapes, textures, or movement.":
      "Tan-awa ang imong duol nga palibot. Bantayi ang mga kolor, porma, texture, o lihok.",
    "All fields completed. Continue when ready.":
      "Nahuman na ang tanang field. Padayon kung andam na ka.",
    "Grounding Complete": "Nahuman ang Grounding",
    "You have successfully anchored yourself in the present moment through all five senses.":
      "Malampuson nimong naangkla ang imong kaugalingon sa karon nga higayon pinaagi sa lima ka senses.",
    "You Are Here": "Ani-a Ka Dinhi",
    "Your attention has moved from threat-based thinking to present-state awareness. This is the foundation of emotional regulation.":
      "Nibalhin ang imong atensyon gikan sa threat-based thinking ngadto sa present-state awareness. Mao kini ang pundasyon sa emotional regulation.",
    "Start Over": "Sugod Pag-usab",
    "Return to Exercises": "Balik sa Ehersisyo",
    "Insights & Reports": "Insights ug Mga Report",
    "Track resilience movement, emotional distribution, usage patterns, and recommendation signals across your selected reporting window.":
      "Subaya ang lihok sa resilience, emotional distribution, usage patterns, ug recommendation signals sulod sa imong napiling reporting window.",
    Overview: "Overview",
    Refresh: "I-refresh",
    "The API returned no usable insights data for the selected range.":
      "Walay magamit nga insights data nga gibalik sa API para sa napiling range.",
    "Emotional State Distribution": "Distribusyon sa Emosyonal nga Kahimtang",
    "Check-in mood frequency": "Kasubsob sa mood sa check-in",
    "No dominant state yet": "Wala pay dominanteng state",
    "No emotional state distribution is available for this range.":
      "Walay available nga emotional state distribution para niining range.",
    "Weekly Activity": "Sinemanang Aktibidad",
    "Module usage by day": "Paggamit sa module kada adlaw",
    "No weekly activity window available.":
      "Walay available nga weekly activity window.",
    "No weekly activity data is available for this range.":
      "Walay available nga weekly activity data para niining range.",
    "Cognitive Distortion Analysis": "Pagsusi sa Cognitive Distortion",
    "Distortion breakdown": "Breakdown sa distortion",
    "Detected across journal entries and reframing sessions.":
      "Nadetek sa mga journal entry ug reframing session.",
    Dominant: "Dominante",
    "No cognitive distortion breakdown is available for this range.":
      "Walay available nga cognitive distortion breakdown para niining range.",
    "RQ Score": "RQ Score",
    "Current resilience score for the selected range.":
      "Kasamtangang resilience score para sa napiling range.",
    "Raw score progress across active RQ modules.":
      "Pag-uswag sa raw score sa mga aktibong RQ module.",
    "Focus Streak": "Focus Streak",
    "Current daily consistency streak.":
      "Kasamtangang adlaw-adlaw nga consistency streak.",
    "Day Streak": "Sunod-sunod nga Adlaw",
    "Week Avg": "Semanang Avg",
    "Week of": "Semana sa",
    "Start with a check-in, journal, chat, or reframe to build momentum this week.":
      "Sugdi sa check-in, journal, chat, o reframe aron makabuo og momentum karong semanaha.",
    "Couldn't refresh live data. Showing the last successful snapshot.":
      "Dili ma-refresh ang live data. Gipakita ang kataposang malampusong snapshot.",
    "No focus momentum data available yet.":
      "Wala pay available nga focus momentum data.",
    "check-ins": "mga check-in",
    "chat turns": "mga chat turn",
    journals: "mga journal",
    reframes: "mga reframe",
    "Total Activity": "Kinatibuk-ang Aktibidad",
    "Combined activity count in the selected period.":
      "Pinagsamang ihap sa aktibidad sa napiling panahon.",
    "Help & Support": "Tabang ug Suporta",
    "Clear support routes, safety boundaries, and self-serve help":
      "Klaro nga support routes, safety boundaries, ug self-serve nga tabang",
    "This page gives users a fast path to the right product area, explains what support can help with, and keeps crisis guidance explicit so the app does not over-promise beyond its role.":
      "Kini nga page naghatag sa mga user og paspas nga dalan ngadto sa hustong product area, nagpasabot kung unsay matabang sa support, ug nagpabiling klaro ang crisis guidance aron dili mag-over-promise ang app lapas sa papel niini.",
    "Support-ready": "Andam para sa support",
    "Crisis-safe copy": "Crisis-safe nga copy",
    "Quick paths": "Paspas nga mga dalan",
    "Direct entry points into the main product areas users usually need.":
      "Direktang entry points ngadto sa nag-unang bahin sa produkto nga kasagarang gikinahanglan sa mga user.",
    "Support channels": "Mga support channel",
    "Product, privacy, and safety boundary guidance.":
      "Gabay sa produkto, privacy, ug safety boundary.",
    "FAQ answers": "Mga tubag sa FAQ",
    "Short answers for the questions users are likely to ask first.":
      "Mubo nga mga tubag para sa mga pangutana nga kasagarang una nilang ipangutana.",
    "Safety posture": "Safety posture",
    Explicit: "Klaro",
    "The app is supportive, not emergency care.":
      "Supportive ang app, dili emergency care.",
    "Take users to the right surface fast":
      "Dad-a dayon ang mga user sa hustong surface",
    "Support gets lighter when the app itself routes people to the correct place instead of forcing them to guess.":
      "Mas mogaan ang support kung ang app mismo maoy mohatod sa mga tawo sa hustong lugar imbes nga papahulaan sila.",
    "Account and preferences": "Account ug mga preference",
    "Update profile details, language, consent choices, and session settings.":
      "I-update ang detalye sa profile, pinulongan, consent choices, ug session settings.",
    "AI companion": "AI kauban",
    "Continue a conversation, review tone and language behavior, or inspect session flow.":
      "Padayona ang panag-istorya, susiha ang tono ug language behavior, o tan-awa ang session flow.",
    "Journals and reflections": "Mga journal ug pamalandong",
    "Review entries, archives, and sentiment-related journaling surfaces.":
      "Susiha ang mga entry, archive, ug sentiment-related nga journaling surfaces.",
    "Exercises and protocols": "Mga ehersisyo ug protocol",
    "Open grounding, breathing, reframing, and behavioral activation tools.":
      "Ablihi ang grounding, breathing, reframing, ug behavioral activation tools.",
    "What help can cover": "Unsa ang masakop sa tabang",
    "Separate ordinary product support from privacy handling and urgent safety guidance.":
      "Ibulag ang ordinaryong product support gikan sa privacy handling ug agarang safety guidance.",
    "Product support": "Product support",
    "Best for broken UI, route issues, failed saves, and confusing workflow behavior.":
      "Pinakamaayo para sa guba nga UI, route issues, failed saves, ug makalibog nga workflow behavior.",
    "Target response window: within 1 business day.":
      "Target nga tubag: sulod sa 1 ka business day.",
    "Privacy requests": "Mga hangyo sa privacy",
    "Use when the concern involves account access, data boundaries, or deletion/export handling.":
      "Gamita kung ang concern naglakip sa account access, data boundaries, o deletion/export handling.",
    "Route through the privacy workflow before making irreversible changes.":
      "I-agi una sa privacy workflow sa dili pa mohimo og dili na mabawi nga kausaban.",
    "Clinical safety boundary": "Clinical safety boundary",
    "The app can support reflection, but it should not present itself as emergency or crisis care.":
      "Makatabang ang app sa reflection, apan dili kini angay ipakita isip emergency o crisis care.",
    "Escalate to real human services for urgent risk or immediate danger.":
      "I-escalate sa tinuod nga human services kung adunay agarang risgo o dayong peligro.",
    FAQ: "FAQ",
    "Common questions": "Komon nga mga pangutana",
    "Use native disclosure patterns so the page stays readable without pushing everything into a client-side accordion.":
      "Gamita ang native disclosure patterns aron mapadayon nga sayon basahon ang page nga dili isulod ang tanan sa client-side accordion.",
    "Reporting template": "Template sa pag-report",
    "What a useful support message includes":
      "Unsa ang sulod sa usa ka kapuslanan nga support message",
    "Good support UI teaches users what information helps fix the issue instead of just giving them a blank inbox.":
      "Ang maayong support UI nagtudlo sa mga user unsang impormasyon ang makatabang sa pag-ayo sa issue imbes nga mohatag lang og blangkong inbox.",
    "Reusable rule of thumb": "Magamit nga rule of thumb",
    "Help pages work best when they reduce support demand in two ways at once: route users to the right place immediately, and teach them the minimum context needed for a useful request.":
      "Pinakamaayo ang help pages kung mapakubos nila ang support demand sa duha ka paagi dungan: ihatod dayon ang mga user sa hustong lugar, ug tudluan sila sa minimum nga context nga gikinahanglan para sa kapuslanan nga request.",
  },
};

export function getLanguageCode(language: SupportedLanguage) {
  return LANGUAGE_CODE[language];
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return value === "english" || value === "tagalog" || value === "bisaya";
}

export function getStoredLanguagePreference() {
  if (typeof window === "undefined") {
    return "english" as SupportedLanguage;
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!stored) {
    return "english" as SupportedLanguage;
  }

  try {
    const parsed = JSON.parse(stored) as { language?: unknown };
    return isSupportedLanguage(parsed.language) ? parsed.language : "english";
  } catch {
    return "english" as SupportedLanguage;
  }
}

export function persistLanguagePreference(language: SupportedLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Record<string, unknown>) : {};

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({
        ...parsed,
        language,
      }),
    );
  } catch {
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({ language }),
    );
  }

  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
}

export function translateText(
  text: string,
  language: SupportedLanguage,
): string {
  if (language === "english") {
    return text;
  }

  const dictionary = LANGUAGE_DICTIONARY[language];
  const exactMatch = dictionary[text];

  if (exactMatch) {
    return exactMatch;
  }

  let translated = text;
  const replacementEntries = Object.entries(dictionary)
    .filter(([source]) => source.length > 6 && /[\s&:,.!?-]/.test(source))
    .sort((left, right) => right[0].length - left[0].length);

  for (const [source, target] of replacementEntries) {
    if (!translated.includes(source)) {
      continue;
    }

    translated = translated.replaceAll(source, target);
  }

  return translated;
}

export function subscribeToLanguagePreference(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => {
    onChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleChange);
  };
}
