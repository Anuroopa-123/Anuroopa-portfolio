"""Writes content.json. Edit this file (or the JSON) to change the portfolio text, then re-run the seed."""
import json

def t(en, ta): return {"en": en, "ta": ta}

services = [
 {"key": "fullstack", "icon": "layers", "title": t("Full-Stack Web Development", "முழுத் தள (Full-Stack) வலை மேம்பாடு"),
  "description": t("Build complete web applications from frontend to backend.", "முன்தளம் முதல் பின்தளம் வரை முழுமையான வலைச் செயலிகளை உருவாக்குகிறேன்.")},
 {"key": "frontend", "icon": "window", "title": t("Angular / React Development", "Angular / React மேம்பாடு"),
  "description": t("Modern, responsive and scalable frontend applications.", "நவீன, எல்லாத் திரைகளுக்கும் ஏற்ற, விரிவாக்கக்கூடிய முன்தளச் செயலிகள்.")},
 {"key": "backend", "icon": "plug", "title": t("Backend & API Development", "பின்தளம் மற்றும் API மேம்பாடு"),
  "description": t("Secure REST APIs using Node.js or FastAPI.", "Node.js அல்லது FastAPI கொண்டு பாதுகாப்பான REST API-கள்.")},
 {"key": "database", "icon": "database", "title": t("Database Development", "தரவுத்தள மேம்பாடு"),
  "description": t("MySQL and PostgreSQL database design and integration.", "MySQL, PostgreSQL தரவுத்தள வடிவமைப்பு மற்றும் ஒருங்கிணைப்பு.")},
 {"key": "ai", "icon": "spark", "title": t("AI-Powered Applications", "AI இயக்கும் செயலிகள்"),
  "description": t("AI/ML integration, media processing, voice and gesture-based solutions.", "AI/ML ஒருங்கிணைப்பு, மீடியா செயலாக்கம், குரல் மற்றும் சைகை அடிப்படையிலான தீர்வுகள்.")},
 {"key": "automation", "icon": "loop", "title": t("Business Automation", "வணிகத் தானியக்கம்"),
  "description": t("Custom digital solutions that reduce repetitive work.", "திரும்பத் திரும்ப செய்யும் வேலையைக் குறைக்கும் தனிப்பயன் டிஜிட்டல் தீர்வுகள்.")},
]

def sk(category, name, level, en, ta): return {"category": category, "name": name, "level": level, "note": t(en, ta)}
skills = [
 sk("frontend", "Angular", "daily", "Web modules for PCVA and HLC-USR at TANSAM, including English and Tamil support.", "TANSAM-இல் PCVA, HLC-USR வலைப் பகுதிகள்; ஆங்கிலம், தமிழ் ஆதரவு உட்பட."),
 sk("frontend", "React", "daily", "Frontend of the DPH-LMS learning platform.", "DPH-LMS கற்றல் தளத்தின் முன்தளம்."),
 sk("frontend", "React Native", "working", "Offline-capable mobile interview workflows in PCVA.", "PCVA-இல் இணையம் இல்லாமலும் இயங்கும் மொபைல் நேர்காணல் செயலி."),
 sk("frontend", "Next.js", "exploring", "Currently exploring.", "தற்போது கற்று வருகிறேன்."),
 sk("frontend", "TypeScript", "daily", "Used across Angular, React and Node.js work.", "Angular, React, Node.js பணிகள் அனைத்திலும் பயன்படுத்துகிறேன்."),
 sk("frontend", "JavaScript", "daily", "Everyday language for web and API work.", "வலை, API பணிகளுக்கான அன்றாட மொழி."),
 sk("frontend", "HTML5", "daily", "Semantic, accessible markup.", "பொருள் தரும், அணுகத்தக்க மார்க்அப்."),
 sk("frontend", "CSS3", "daily", "Responsive layouts and animation.", "எல்லாத் திரைகளுக்கும் ஏற்ற வடிவமைப்பு, அசைவூட்டம்."),
 sk("backend", "Node.js", "daily", "REST APIs for PCVA and DPH-LMS.", "PCVA, DPH-LMS-க்கான REST API-கள்."),
 sk("backend", "Express.js", "daily", "Routing, middleware, authentication and file uploads.", "வழித்தடம், middleware, அங்கீகாரம், கோப்புப் பதிவேற்றம்."),
 sk("backend", "FastAPI", "working", "Backend of my AI Knowledge & ML Platform, and of this portfolio.", "என் AI Knowledge & ML Platform மற்றும் இந்த போர்ட்ஃபோலியோவின் பின்தளம்."),
 sk("backend", "Django", "exploring", "Currently exploring.", "தற்போது கற்று வருகிறேன்."),
 sk("database", "MySQL", "daily", "Schema design and queries for DPH-LMS.", "DPH-LMS-க்கான அட்டவணை வடிவமைப்பு, வினவல்கள்."),
 sk("database", "PostgreSQL", "daily", "Data layer for PCVA and my AI platform.", "PCVA மற்றும் என் AI தளத்தின் தரவு அடுக்கு."),
 sk("database", "SQLite", "working", "Offline questionnaire storage in the PCVA mobile app.", "PCVA மொபைல் செயலியில் இணையமின்றி வினாத்தாள் சேமிப்பு."),
 sk("database", "MongoDB", "exploring", "Currently exploring.", "தற்போது கற்று வருகிறேன்."),
 sk("programming", "Python", "working", "FastAPI services, data work and ML coursework.", "FastAPI சேவைகள், தரவுப் பணி, ML பாடப்பணிகள்."),
 sk("programming", "JavaScript", "daily", "Browser and Node.js.", "உலாவி மற்றும் Node.js."),
 sk("programming", "TypeScript", "daily", "Typed code for larger apps.", "பெரிய செயலிகளுக்கான வகைப்படுத்திய குறியீடு."),
 sk("programming", "Java", "exploring", "Integrated Java-based APIs during an internship.", "பயிற்சிக் காலத்தில் Java அடிப்படையிலான API-களுடன் இணைத்தேன்."),
 sk("ai_ml", "Machine Learning", "working", "B.Tech in Artificial Intelligence & Data Science.", "செயற்கை நுண்ணறிவு மற்றும் தரவு அறிவியலில் B.Tech."),
 sk("ai_ml", "Gesture Recognition", "working", "Trained a CNN model for gesture classification.", "சைகை வகைப்பாட்டிற்கான CNN மாதிரியைப் பயிற்றுவித்தேன்."),
 sk("ai_ml", "YOLO", "exploring", "Explored vehicle detection from video for a traffic-monitoring task.", "போக்குவரத்துக் கண்காணிப்புப் பணிக்காக வீடியோவில் வாகனக் கண்டறிதலை ஆராய்ந்தேன்."),
 sk("ai_ml", "Media Processing", "exploring", "Image and video preprocessing basics.", "படம், வீடியோ முன்செயலாக்க அடிப்படைகள்."),
 sk("ai_ml", "Voice Recognition", "exploring", "Planned for my AI platform.", "என் AI தளத்தில் சேர்க்கத் திட்டமிட்டுள்ளேன்."),
 sk("tools", "Git", "daily", "Daily version control.", "அன்றாட பதிப்புக் கட்டுப்பாடு."),
 sk("tools", "GitHub", "daily", "Code hosting and collaboration.", "குறியீடு சேமிப்பு, கூட்டுப் பணி."),
 sk("tools", "REST APIs", "daily", "Designing, building and testing APIs with Postman.", "Postman கொண்டு API-களை வடிவமைத்து, உருவாக்கி, சோதிக்கிறேன்."),
 sk("tools", "JWT", "working", "Bearer-token authentication and role-based access in DPH-LMS.", "DPH-LMS-இல் bearer token அங்கீகாரம், பங்கு அடிப்படையிலான அணுகல்."),
 sk("tools", "Session Authentication", "working", "HTTP-only cookie sessions in my AI platform.", "என் AI தளத்தில் HTTP-only cookie அமர்வுகள்."),
 sk("tools", "Docker", "exploring", "Currently exploring.", "தற்போது கற்று வருகிறேன்."),
]

def f(en, ta, done=None):
    d = {"en": en, "ta": ta}
    if done is not None: d["done"] = done
    return d

projects = [
 {"slug": "ai-knowledge-platform", "categories": ["fullstack", "ai"], "status": "in_progress", "visual": "ai",
  "title": t("AI Knowledge & ML Platform", "AI அறிவு மற்றும் ML தளம்"),
  "summary": t("A multimodal platform where people upload documents, images and video, then ask questions about them.",
               "ஆவணங்கள், படங்கள், வீடியோக்களைப் பதிவேற்றி, அவற்றைப் பற்றி கேள்வி கேட்கும் multimodal தளம்."),
  "problem": t("Knowledge sits in PDFs, images and recordings, and searching across all of them is slow.",
               "அறிவு PDF-கள், படங்கள், பதிவுகளில் சிதறிக் கிடக்கிறது; அனைத்திலும் தேடுவது மெதுவானது."),
  "solution": t("One place that turns uploads into searchable knowledge, with an assistant that answers from the user's own content.",
                "பதிவேற்றங்களைத் தேடக்கூடிய அறிவாக மாற்றி, பயனரின் சொந்த உள்ளடக்கத்திலிருந்து பதிலளிக்கும் உதவியாளருடன் ஒரே இடம்."),
  "features": [
    f("User registration and login", "பயனர் பதிவு மற்றும் உள்நுழைவு", True),
    f("Session authentication with secure cookies", "பாதுகாப்பான cookie-களுடன் அமர்வு அங்கீகாரம்", True),
    f("AI-powered chat and question answering", "AI இயக்கும் உரையாடல், கேள்வி-பதில்", False),
    f("Voice recognition", "குரல் அறிதல்", False),
    f("Multi-language support", "பல மொழி ஆதரவு", False),
    f("Media processing", "மீடியா செயலாக்கம்", False),
    f("Gesture recognition", "சைகை அறிதல்", False),
    f("YOLO-based image and video processing", "YOLO அடிப்படையிலான படம், வீடியோ செயலாக்கம்", False),
  ],
  "stack": ["Angular", "FastAPI", "PostgreSQL", "Python", "AI/ML"], "github_url": "", "live_url": ""},
 {"slug": "pcva", "categories": ["fullstack", "frontend", "backend"], "status": "client_private", "visual": "sync",
  "title": t("PCVA: Physician-Coded Verbal Autopsy", "PCVA: வாய்மொழி மரணக் காரண ஆய்வு (Verbal Autopsy)"),
  "summary": t("A web and mobile platform for collecting and reviewing verbal autopsy interviews.",
               "வாய்மொழி மரணக் காரண ஆய்வு நேர்காணல்களைச் சேகரித்து மதிப்பாய்வு செய்யும் வலை, மொபைல் தளம்."),
  "problem": t("Interviews happen in the field, often without a connection, and the questionnaire has to stay identical on web and mobile.",
               "நேர்காணல்கள் களத்தில், பெரும்பாலும் இணைப்பு இன்றி நடக்கின்றன; வலையிலும் மொபைலிலும் வினாத்தாள் ஒரே மாதிரி இருக்க வேண்டும்."),
  "solution": t("A database-driven questionnaire. Admins edit it once on the web, and the mobile app syncs it and keeps a local copy for offline use.",
                "தரவுத்தளத்தால் இயங்கும் வினாத்தாள். நிர்வாகி வலையில் ஒருமுறை மாற்றினால், மொபைல் செயலி அதை ஒத்திசைத்து, இணையமின்றிப் பயன்படுத்த உள்ளூர் நகலை வைத்திருக்கும்."),
  "features": [
    f("Angular modules for questionnaire management, case processing, physician review, verification and reporting", "வினாத்தாள் மேலாண்மை, வழக்குச் செயலாக்கம், மருத்துவர் மதிப்பாய்வு, சரிபார்ப்பு, அறிக்கைகளுக்கான Angular பகுதிகள்"),
    f("Node.js and Express APIs for authentication, responses, file uploads and mobile sync", "அங்கீகாரம், பதில்கள், கோப்புப் பதிவேற்றம், மொபைல் ஒத்திசைவுக்கான Node.js, Express API-கள்"),
    f("React Native (Expo) interviews with offline SQLite storage", "இணையமின்றி SQLite சேமிப்புடன் React Native (Expo) நேர்காணல் செயலி"),
    f("Questionnaire updates reach the mobile app without any mobile code change", "மொபைல் குறியீட்டை மாற்றாமலே வினாத்தாள் மாற்றங்கள் மொபைலைச் சென்றடையும்"),
    f("Validation, branching logic and image/file uploads", "சரிபார்ப்பு, கிளைப் பாய்வு தர்க்கம், படம்/கோப்புப் பதிவேற்றம்"),
  ],
  "stack": ["Angular", "React Native", "Node.js", "Express", "PostgreSQL", "SQLite"], "github_url": "", "live_url": ""},
 {"slug": "dph-lms", "categories": ["fullstack"], "status": "client_private", "visual": "learn",
  "title": t("DPH-LMS: Learning Management System", "DPH-LMS: கற்றல் மேலாண்மை அமைப்பு"),
  "summary": t("A learning management system built for doctors.", "மருத்துவர்களுக்காக உருவாக்கிய கற்றல் மேலாண்மை அமைப்பு."),
  "problem": t("Training content has to reach the right people securely, and their progress has to be tracked.",
               "பயிற்சி உள்ளடக்கம் சரியான நபர்களுக்குப் பாதுகாப்பாகச் செல்ல வேண்டும்; அவர்களின் முன்னேற்றமும் கண்காணிக்கப்பட வேண்டும்."),
  "solution": t("Role-based access, course progress tracking, and videos, PDFs and SCORM packages delivered through token-based access.",
                "பங்கு அடிப்படையிலான அணுகல், பாட முன்னேற்றக் கண்காணிப்பு, token அடிப்படையிலான அணுகல் மூலம் வீடியோ, PDF, SCORM தொகுப்புகள் வழங்கல்."),
  "features": [
    f("Authentication, authorization and role-based access control", "அங்கீகாரம், அனுமதி, பங்கு அடிப்படையிலான அணுகல் கட்டுப்பாடு"),
    f("Course progress tracking", "பாட முன்னேற்றக் கண்காணிப்பு"),
    f("Secure content management", "பாதுகாப்பான உள்ளடக்க மேலாண்மை"),
    f("SCORM packages, videos and PDFs uploaded, processed and delivered securely", "SCORM தொகுப்புகள், வீடியோக்கள், PDF-கள் பாதுகாப்பாகப் பதிவேற்றம், செயலாக்கம், வழங்கல்"),
  ],
  "stack": ["React", "Node.js", "MySQL"], "github_url": "", "live_url": ""},
 {"slug": "hlc-usr", "categories": ["frontend"], "status": "client_private", "visual": "portal",
  "title": t("HLC-USR: Government Portal", "HLC-USR: அரசு இணையதளம்"),
  "summary": t("A government portal that works in English and Tamil.", "ஆங்கிலம், தமிழ் இரண்டிலும் இயங்கும் அரசு இணையதளம்."),
  "problem": t("Users need the portal in Tamil as well as English, and translation files are tedious to keep complete by hand.",
               "பயனர்களுக்கு ஆங்கிலத்துடன் தமிழிலும் இணையதளம் தேவை; மொழிபெயர்ப்புக் கோப்புகளைக் கையால் முழுமையாக வைத்திருப்பது சலிப்பானது."),
  "solution": t("Angular i18n for both languages, plus scripts that extract translation keys automatically.",
                "இரு மொழிகளுக்கும் Angular i18n, மொழிபெயர்ப்பு விசைகளைத் தானாக எடுக்கும் ஸ்கிரிப்ட்கள்."),
  "features": [
    f("Angular 21 frontend development", "Angular 21 முன்தள மேம்பாடு"),
    f("English-to-Tamil translation with Angular i18n", "Angular i18n மூலம் ஆங்கிலம்-தமிழ் மொழிபெயர்ப்பு"),
    f("Custom scripts for translation key extraction", "மொழிபெயர்ப்பு விசைகளை எடுக்கும் தனிப்பயன் ஸ்கிரிப்ட்கள்"),
  ],
  "stack": ["Angular 21", "TypeScript", "i18n"], "github_url": "", "live_url": ""},
 {"slug": "key-management-report", "categories": ["frontend"], "status": "internship", "visual": "report",
  "title": t("Key Management Report System", "Key Management அறிக்கை அமைப்பு"),
  "summary": t("An internship project: a reporting screen with live data.", "பயிற்சிக் காலத் திட்டம்: நேரடித் தரவுடன் கூடிய அறிக்கைத் திரை."),
  "problem": t("Teams needed to find specific records quickly in a long report.", "நீண்ட அறிக்கையில் குறிப்பிட்ட பதிவுகளை விரைவாகக் கண்டறிய வேண்டியிருந்தது."),
  "solution": t("Filtering, sorting, autocomplete and dynamic dropdowns on top of Java-based backend APIs.",
                "Java அடிப்படையிலான பின்தள API-களின் மேல் வடிகட்டல், வரிசைப்படுத்தல், தானியங்கி பரிந்துரை, மாறும் dropdown-கள்."),
  "features": [
    f("Built in Angular 18", "Angular 18-இல் உருவாக்கப்பட்டது"),
    f("Filtering, sorting and autocomplete", "வடிகட்டல், வரிசைப்படுத்தல், தானியங்கி பரிந்துரை"),
    f("Integrated with Java-based backend APIs", "Java அடிப்படையிலான பின்தள API-களுடன் இணைக்கப்பட்டது"),
  ],
  "stack": ["Angular 18", "TypeScript", "REST APIs"], "github_url": "", "live_url": ""},
]

experience = [
 {"key": "tansam", "kind": "job", "company": "TANSAM", "location": "Chennai",
  "role": t("Junior Full-Stack Software Developer", "இளநிலை Full-Stack மென்பொருள் உருவாக்குநர்"),
  "period": t("Current role · 1 year 7 months", "தற்போதைய பணி · 1 ஆண்டு 7 மாதங்கள்"),
  "highlights": [
    t("Building frontend applications in Angular and React", "Angular, React-இல் முன்தளச் செயலிகளை உருவாக்குதல்"),
    t("Developing backend APIs in Node.js and Express", "Node.js, Express-இல் பின்தள API-களை உருவாக்குதல்"),
    t("Database integration with MySQL and PostgreSQL", "MySQL, PostgreSQL தரவுத்தள ஒருங்கிணைப்பு"),
    t("Authentication and role-based access", "அங்கீகாரம், பங்கு அடிப்படையிலான அணுகல்"),
    t("Debugging and optimization across web and mobile", "வலை, மொபைல் முழுவதும் பிழை கண்டறிதல், மேம்படுத்தல்"),
    t("Full-stack application development", "Full-Stack செயலி மேம்பாடு"),
  ]},
 {"key": "photon", "kind": "internship", "company": "DLF Photon", "location": "Chennai",
  "role": t("Front-End Developer Intern", "முன்தள உருவாக்குநர் பயிற்சியாளர்"),
  "period": t("3 months", "3 மாதங்கள்"),
  "highlights": [
    t("Built the Key Management Report System in Angular 18", "Angular 18-இல் Key Management அறிக்கை அமைப்பை உருவாக்கினேன்"),
    t("Integrated Java-based backend APIs", "Java அடிப்படையிலான பின்தள API-களுடன் இணைத்தேன்"),
  ]},
 {"key": "hifour", "kind": "internship", "company": "HiFour Technologies", "location": "Remote",
  "role": t("Python and AI Intern", "Python மற்றும் AI பயிற்சியாளர்"),
  "period": t("2 months", "2 மாதங்கள்"),
  "highlights": [
    t("Python and SQL training", "Python, SQL பயிற்சி"),
    t("Developed a chatbot with Python", "Python கொண்டு chatbot உருவாக்கினேன்"),
  ]},
]

with open("content.json", "w", encoding="utf-8") as fh:
    json.dump({"services": services, "skills": skills, "projects": projects, "experience": experience}, fh, ensure_ascii=False, indent=2)
print(len(services), len(skills), len(projects), len(experience))
