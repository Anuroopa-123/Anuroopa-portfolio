"""Dynamic AI Portfolio Assistant Service.

Integrates with OpenAI API using OPENAI_API_KEY from .env.
Context is dynamically assembled from the portfolio content and Anuroopa's
verified resume so that all experience, education, skills, and projects
are answered accurately.
"""
import json
import logging
from pathlib import Path
from typing import Any

import httpx

from app.core.config import Settings
from app.schemas.chat import ChatMessage, ChatResponse

logger = logging.getLogger(__name__)

RESUME_DOWNLOAD_LINK = "/Anuroopa_PV_Resume.pdf"


def _find_content_file() -> Path | None:
    """Finds content.json dynamically from expected locations."""
    candidates = [
        Path(__file__).resolve().parents[3] / "content" / "content.json",
        Path(__file__).resolve().parents[3] / "frontend" / "public" / "content.json",
        Path("content/content.json"),
        Path("../content/content.json"),
        Path("../frontend/public/content.json"),
        Path("/app/content/content.json"),
    ]
    for c in candidates:
        if c.is_file():
            return c
    return None


class AIService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._content_cache: dict[str, Any] | None = None

    def _get_content(self) -> dict[str, Any]:
        """Dynamically loads and caches the portfolio content."""
        if self._content_cache is not None:
            return self._content_cache

        content_path = _find_content_file()
        if content_path and content_path.exists():
            try:
                with open(content_path, "r", encoding="utf-8") as f:
                    self._content_cache = json.load(f)
                    return self._content_cache
            except Exception as e:
                logger.warning("Could not read content.json: %s", e)

        self._content_cache = {}
        return self._content_cache

    def _build_system_context(self, language: str = "en") -> str:
        """Dynamically creates a structured context string from content.json and verified resume."""
        data = self._get_content()

        # Services
        services_text = []
        for s in data.get("services", []):
            title = s.get("title", {}).get(language, s.get("title", {}).get("en", s.get("key")))
            desc = s.get("description", {}).get(language, s.get("description", {}).get("en", ""))
            services_text.append(f"- {title}: {desc}")

        # Skills grouped by category
        skills_text = []
        for sk in data.get("skills", []):
            cat = sk.get("category", "")
            name = sk.get("name", "")
            lvl = sk.get("level", "")
            note = sk.get("note", {}).get(language, sk.get("note", {}).get("en", ""))
            skills_text.append(f"- {name} [{cat}] (level: {lvl}): {note}")

        # Projects
        projects_text = []
        for p in data.get("projects", []):
            title = p.get("title", {}).get(language, p.get("title", {}).get("en", p.get("slug")))
            summary = p.get("summary", {}).get(language, p.get("summary", {}).get("en", ""))
            prob = p.get("problem", {}).get(language, p.get("problem", {}).get("en", ""))
            sol = p.get("solution", {}).get(language, p.get("solution", {}).get("en", ""))
            stack = ", ".join(p.get("stack", []))
            status = p.get("status", "")
            feats = []
            for f in p.get("features", []):
                feat_text = f.get(language, f.get("en", ""))
                done_marker = " [built]" if f.get("done") is True else (" [planned]" if f.get("done") is False else "")
                feats.append(f"  * {feat_text}{done_marker}")

            p_block = (
                f"### {title}\n"
                f"- Status: {status}\n"
                f"- Tech Stack: {stack}\n"
                f"- Summary: {summary}\n"
                f"- Problem solved: {prob}\n"
                f"- Solution provided: {sol}\n"
                f"- Key features:\n" + "\n".join(feats)
            )
            projects_text.append(p_block)

        # Work Experience
        exp_text = []
        for e in data.get("experience", []):
            role = e.get("role", {}).get(language, e.get("role", {}).get("en", ""))
            company = e.get("company", "")
            period = e.get("period", "")
            desc = e.get("description", {}).get(language, e.get("description", {}).get("en", ""))
            exp_text.append(f"- {role} at {company} ({period}): {desc}")

        system_prompt = f"""You are the official AI Assistant for Anuroopa PV's developer portfolio and resume.
Your role is to represent Anuroopa warmly, intelligently, and accurately to recruiters, clients, and fellow engineers.

## Anuroopa PV's Complete Verified Profile & Resume
- Name: Anuroopa PV
- Role: Full-Stack Developer (React.js | Angular | Node.js | FastAPI)
- Email: anukalpana2003@gmail.com
- Phone: +91-9500683824
- Location: Chennai, Tamil Nadu, India
- LinkedIn: https://www.linkedin.com/in/anuroopa-pv
- Resume Download Link: {RESUME_DOWNLOAD_LINK} (accessible via the 'Download Resume' button in the hero section)

## Professional Summary
Full-Stack Developer with 1 year of professional experience building secure, scalable web applications for Government of Tamil Nadu portals. Proficient in React.js, Angular, and Next.js on the frontend, and Node.js, Django, and FastAPI on the backend, with working knowledge of MySQL, PostgreSQL, and MongoDB. Known for translating complex requirements into clean, maintainable, and localized user interfaces.

## Work Experience (From Resume)
1. **Junior Developer** | TANSAM (Tamil Nadu Skill Development Corporation), TIDEL Park, Chennai (1 Year)
   - **HLC-USR Government Portal** (Angular, TypeScript, HTML, CSS, i18n):
     * Developed frontend features for the HLC-USR government web portal using Angular, improving usability.
     * Implemented English-to-Tamil localization using Angular i18n for Tamil-speaking users.
     * Collaborated with senior developers to integrate frontend components with backend REST APIs.
   - **DPH-LMS Government Learning Management System** (React.js, Node.js, MySQL):
     * Built and maintained a full-stack LMS for doctors and health staff in Government of Tamil Nadu using React.js and Node.js.
     * Designed and implemented RESTful APIs handling authentication, authorization, and core business logic.
     * Secured application access with Bearer Token authentication and role-based access control (RBAC).
     * Designed and optimized MySQL database schemas, queries, and CRUD operations for improved performance.
     * Trained and optimized a CNN model for gesture classification with high accuracy.
     * Managed code using Git/GitHub for collaborative team development.

2. **Front-End Developer Intern** | DLF Photon, Chennai (3 Months)
   - Built a Key Management Report System in Angular 18 to track and assign keys across multiple enterprise locations.
   - Implemented advanced filtering, dynamic dropdowns, sorting, and autocomplete features for a responsive UI.
   - Integrated Java-based backend APIs to dynamically fetch and display real-time data, optimizing data handling.

## Academic & Major Projects
1. **PCVA: Physician-Coded Verbal Autopsy** (Angular, React Native, Node.js, Express, PostgreSQL, SQLite):
   - Web & mobile platform for collecting verbal autopsy interviews in the field, even with zero network connection.
   - Dynamic database-driven questionnaire engine: web admin edits questions, mobile app syncs and stores responses in offline SQLite.
2. **DPH-LMS: Learning Management System** (React.js, Node.js, MySQL):
   - Secure training platform for medical doctors with role-based auth, course progress tracking, and protected token-based SCORM packages and videos.
3. **AI Knowledge & ML Platform** (Angular, FastAPI, PostgreSQL, Python, AI/ML):
   - Multimodal platform where users upload documents, images, and video to ask questions from their content.
   - Built session authentication with secure HTTP-only cookies, user registration/login, and multimodal pipelines.
4. **HLC-USR: Government Portal** (Angular 21, TypeScript, i18n):
   - Dual-language (English and Tamil) government portal with automatic translation key extraction scripts.
5. **Movie Recommendation System** (Python, Machine Learning, Collaborative Filtering):
   - Built a recommendation engine using collaborative and content-based filtering for personalized user suggestions.
6. **Hand Gesture Recognition System** (Python, OpenCV, CNN, TensorFlow):
   - Real-time hand gesture recognition system using OpenCV tracking and CNN classification. Includes gesture-to-voice conversion delivering audio feedback in 3 languages.

## Internships (From Resume)
- **MSME Internship**: Hands-on Python programming, problem-solving, and software development practices.
- **TechnoHacks EduTech**: Completed 3 Python coding tasks with algorithm design and collaborative team practices.

## Education (From Resume)
- **B.Tech in Artificial Intelligence & Data Science** | Panimalar Institute of Technology, Chennai (2024) — **CGPA: 8.56**
- **Higher Secondary (HSC)** | Sri Kalaimagal Vidhya Mandir Higher Secondary School, Chennai (2020) — **86.7%**
- **Matriculation (SSLC)** | St. Britto Matriculation School, Madurai (2018) — **93.6%**

## Certifications (From Resume)
- **Corizo**: Python Programming & Forecasting Analysis Program
- **Internshala**: Python Programming
- **Pantech Solutions**: Data Analytics (One-Week Internship)
- **Great Learning**: Basics of Data Science

## Languages
- **English**: Fluent
- **Tamil**: Native

## What Anuroopa Offers (Services)
{chr(10).join(services_text)}

## Skills & Technologies
{chr(10).join(skills_text)}

## Response Guidelines:
1. When asked about her **experience**, **resume**, **education**, **college**, **certifications**, or **projects**, answer with specific, accurate details from her resume above.
2. Always inform users that they can download her complete official resume by clicking the **'Download Resume'** button in the hero section or using the link: [Download Resume]({RESUME_DOWNLOAD_LINK}).
3. Be warm, professional, clear, and highlight her strengths in Full-Stack development (Angular, React, Node.js, FastAPI) and AI/Data Science.
4. If asked in Tamil, answer in Tamil.
"""
        return system_prompt

    async def chat(self, messages: list[ChatMessage], language: str = "en") -> ChatResponse:
        """Processes chat messages dynamically using OpenAI API or fallback."""
        api_key = self.settings.OPENAI_API_KEY.strip()
        system_context = self._build_system_context(language=language)

        last_query = messages[-1].content if messages else ""

        # Check if OpenAI API key is configured
        if not api_key or api_key == "your-openai-api-key-here":
            return self._dynamic_fallback_response(messages, language)

        # Format messages for OpenAI Chat Completion
        openai_messages = [{"role": "system", "content": system_context}]
        for m in messages:
            openai_messages.append({"role": m.role, "content": m.content})

        model = self.settings.OPENAI_MODEL or "gpt-4o-mini"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": openai_messages,
                        "temperature": 0.6,
                        "max_tokens": 1000,
                    },
                )

                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    suggested = self._generate_suggested_questions(last_query)
                    return ChatResponse(reply=content, suggested_questions=suggested, has_api_key=True)
                else:
                    logger.warning("OpenAI returned status %d: %s", res.status_code, res.text)
                    # Gracefully answer using verified resume and portfolio knowledge
                    return self._generate_intelligent_resume_response(last_query, status_code=res.status_code)
        except Exception as ex:
            logger.exception("Error calling OpenAI: %s", ex)
            return self._generate_intelligent_resume_response(last_query, error=str(ex))

    def _generate_suggested_questions(self, last_user_query: str) -> list[str]:
        q = last_user_query.lower()
        if any(w in q for w in ["exp", "experience", "resume", "work", "job", "career"]):
            return [
                "What projects has Anuroopa built?",
                "What is her educational background & CGPA?",
                "How can I download her resume?",
            ]
        elif any(w in q for w in ["project", "built", "done"]):
            return [
                "Tell me about PCVA and DPH-LMS",
                "What is her experience at TANSAM?",
                "What frontend and backend stack does she use?",
            ]
        elif any(w in q for w in ["education", "college", "degree", "cgpa"]):
            return [
                "What work experience does she have?",
                "What certifications has she completed?",
                "How can I get in touch with her?",
            ]
        else:
            return [
                "What work experience does Anuroopa have?",
                "What projects has she done?",
                "How can I download her resume?",
            ]

    def _dynamic_fallback_response(self, messages: list[ChatMessage], language: str) -> ChatResponse:
        """Dynamic response when OPENAI_API_KEY is awaiting configuration."""
        last_msg = messages[-1].content if messages else ""
        return self._generate_intelligent_resume_response(last_msg, is_missing_key=True)

    def _generate_intelligent_resume_response(
        self,
        query: str,
        status_code: int | None = None,
        error: str | None = None,
        is_missing_key: bool = False,
    ) -> ChatResponse:
        """Generates a rich, factual response from Anuroopa's verified resume and portfolio."""
        answer = self._generate_fallback_answer(query)
        suggested = self._generate_suggested_questions(query)

        # If there's an OpenAI quota issue (Status 429), add a clean helpful note
        note = ""
        if status_code == 429:
            note = (
                "\n\n---\n"
                "💡 *Note on OpenAI Status 429: OpenAI requires prepaid API credits on your account "
                "(at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)). "
                "Once credits are added, real-time generative GPT reasoning will activate automatically! "
                "In the meantime, I am answering all your questions directly from Anuroopa's verified resume and portfolio.*"
            )
        elif is_missing_key:
            note = (
                "\n\n---\n"
                "💡 *Note: To activate OpenAI responses, add `OPENAI_API_KEY=sk-...` to your `.env` file.*"
            )

        return ChatResponse(
            reply=answer + note,
            suggested_questions=suggested,
            has_api_key=not is_missing_key,
        )

    def _generate_fallback_answer(self, query: str) -> str:
        q = query.lower()
        data = self._get_content()
        projects = data.get("projects", [])

        # 1. Experience & Companies (TANSAM, DLF Photon)
        if any(w in q for w in ["experience", "worked", "company", "companies", "tansam", "photon", "career", "role"]):
            return (
                "### Anuroopa PV's Professional Work Experience\n\n"
                "Anuroopa has **1+ year of professional software development experience** building high-impact, secure applications:\n\n"
                "1. **Junior Developer** — **TANSAM** (Tamil Nadu Skill Development Corporation, TIDEL Park, Chennai) | *1 Year*\n"
                "   - **HLC-USR Government of Tamil Nadu Portal:** Developed responsive frontend modules in **Angular** and TypeScript, and implemented English-to-Tamil localization with **Angular i18n** for Tamil-speaking citizens.\n"
                "   - **DPH-LMS Learning Management System:** Built a full-stack LMS for doctors using **React.js, Node.js, and MySQL**. Implemented Bearer Token auth, role-based access control (RBAC), and optimized SQL queries.\n"
                "   - Trained a **CNN model** for gesture classification with high accuracy.\n\n"
                "2. **Front-End Developer Intern** — **DLF Photon**, Chennai | *3 Months*\n"
                "   - Engineered a **Key Management Report System** in **Angular 18** to track and assign physical keys across facilities.\n"
                "   - Implemented dynamic dropdowns, advanced sorting/filtering, and integrated Java-based backend REST APIs.\n\n"
                f"📄 *You can download Anuroopa's complete official resume here: [Download Resume]({RESUME_DOWNLOAD_LINK}) (or via the button in the hero section).*"
            )

        # 2. Resume Download
        if any(w in q for w in ["resume", "cv", "download", "pdf", "profile"]):
            return (
                "### Anuroopa PV's Official Resume\n\n"
                "Anuroopa's verified resume contains her full work experience, education, technical skill sets, and academic projects:\n\n"
                "- **Title:** Full-Stack Developer (React.js | Angular | Node.js | FastAPI)\n"
                "- **Experience:** TANSAM (1 Year, Junior Developer) & DLF Photon (3 Months, Frontend Intern)\n"
                "- **Education:** B.Tech in Artificial Intelligence & Data Science, Panimalar Institute of Technology (CGPA: 8.56)\n"
                "- **Core Stack:** Angular, React, Next.js, Node.js, FastAPI, Python, PostgreSQL, MySQL\n"
                "- **Contact:** anukalpana2003@gmail.com | +91-9500683824 | Chennai, India\n\n"
                f"📥 **Download full resume:** Click [**Download Resume (PDF)**]({RESUME_DOWNLOAD_LINK}) or click the **Download Resume** button in the hero section at the top of the portfolio!"
            )

        # 3. Education & College
        if any(w in q for w in ["education", "college", "degree", "cgpa", "school", "b.tech", "panimalar", "marks", "university"]):
            return (
                "### Anuroopa PV's Educational Background\n\n"
                "- **B.Tech in Artificial Intelligence & Data Science** (Graduated 2024)\n"
                "  * **College:** Panimalar Institute of Technology, Anna University, Chennai\n"
                "  * **CGPA:** **8.56** (Distinction)\n\n"
                "- **Higher Secondary Certificate (HSC - 12th)** (2020)\n"
                "  * **School:** Sri Kalaimagal Vidhya Mandir Higher Secondary School, Chennai\n"
                "  * **Score:** **86.7%**\n\n"
                "- **Secondary School Leaving Certificate (SSLC - 10th)** (2018)\n"
                "  * **School:** St. Britto Matriculation School, Madurai\n"
                "  * **Score:** **93.6%**\n\n"
                f"📄 *Verified on her resume: [Download Resume]({RESUME_DOWNLOAD_LINK})*"
            )

        # 4. Certifications
        if any(w in q for w in ["certification", "certified", "certificate", "course"]):
            return (
                "### Anuroopa's Certifications & Courses\n\n"
                "- **Corizo:** Python Programming & Forecasting Analysis Program\n"
                "- **Internshala:** Python Programming\n"
                "- **Pantech Solutions:** Data Analytics (One-Week Internship & Training)\n"
                "- **Great Learning:** Basics of Data Science\n\n"
                f"📄 *Details are included on her resume: [Download Resume]({RESUME_DOWNLOAD_LINK})*"
            )

        # 5. Internships
        if any(w in q for w in ["internship", "intern", "dlf", "msme", "technohacks"]):
            return (
                "### Anuroopa's Internships\n\n"
                "1. **DLF Photon** (Chennai) — *Front-End Developer Intern (3 Months)*\n"
                "   Built a Key Management Report System in Angular 18 with live Java API integration, sorting, filtering, and responsive UI.\n\n"
                "2. **MSME Internship**\n"
                "   Hands-on training in Python programming, problem-solving, and professional software engineering.\n\n"
                "3. **TechnoHacks EduTech**\n"
                "   Completed Python coding challenges focusing on algorithm design and collaborative development."
            )

        # 6. Specific Projects: PCVA
        if "pcva" in q:
            p = next((x for x in projects if x.get("slug") == "pcva"), None)
            return (
                "### PCVA: Physician-Coded Verbal Autopsy\n\n"
                "**Tech Stack:** Angular, React Native, Node.js, Express, PostgreSQL, SQLite\n\n"
                "- **Overview:** A web and mobile platform for collecting and reviewing verbal autopsy interviews in public health.\n"
                "- **Problem Solved:** Field medical interviews frequently take place in rural or remote areas with no network connectivity.\n"
                "- **Architecture:** Database-driven dynamic questionnaire engine. Admins update forms on the Angular web portal; the React Native (Expo) mobile app syncs updates and saves field responses locally in SQLite.\n"
                "- **Key Features:** Offline storage, branching logic, photo/file uploads, physician verification, and automatic background sync."
            )

        # 7. Specific Projects: DPH-LMS
        if "dph" in q or "lms" in q:
            return (
                "### DPH-LMS: Learning Management System\n\n"
                "**Tech Stack:** React.js, Node.js, MySQL\n\n"
                "- **Overview:** A specialized learning management platform developed for doctors and public health workers in Tamil Nadu.\n"
                "- **Features:**\n"
                "  * Role-based access control (RBAC) with Bearer token authentication.\n"
                "  * Course progress tracking for medical staff.\n"
                "  * Secure content delivery of SCORM packages, PDFs, and training videos.\n"
                "  * Optimized MySQL database queries and schemas."
            )

        # 8. Specific Projects: AI Platform
        if "ai" in q or "knowledge" in q:
            return (
                "### AI Knowledge & ML Platform\n\n"
                "**Tech Stack:** Angular, FastAPI, PostgreSQL, Python, AI/ML\n\n"
                "- **Overview:** A multimodal intelligent platform where users upload documents, images, and video, then ask questions about them.\n"
                "- **Features Built:** User registration, secure session authentication with HTTP-only cookies, FastAPI data layer, and multimodal search.\n"
                "- **Planned Additions:** Gesture recognition, voice synthesis, and YOLO vehicle/object detection."
            )

        # 9. Projects in general
        if any(w in q for w in ["project", "built", "done", "work"]):
            return (
                "### Major Projects Built by Anuroopa PV\n\n"
                "1. **PCVA (Physician-Coded Verbal Autopsy)**\n"
                "   *Stack: Angular, React Native, Node.js, Express, PostgreSQL, SQLite*\n"
                "   Offline-capable mobile and web platform for health field staff with a dynamic questionnaire engine.\n\n"
                "2. **DPH-LMS (Learning Management System)**\n"
                "   *Stack: React.js, Node.js, MySQL*\n"
                "   Secure training platform for doctors with role-based auth, course tracking, and SCORM/video delivery.\n\n"
                "3. **AI Knowledge & ML Platform**\n"
                "   *Stack: Angular, FastAPI, PostgreSQL, Python, AI/ML*\n"
                "   Multimodal question-answering platform for uploaded documents, photos, and recordings.\n\n"
                "4. **HLC-USR Government Portal**\n"
                "   *Stack: Angular 21, TypeScript, i18n*\n"
                "   Dual-language portal (English & Tamil) for Tamil Nadu state administration.\n\n"
                "5. **Movie Recommendation System**\n"
                "   *Stack: Python, Machine Learning, Collaborative & Content Filtering*\n\n"
                "6. **Hand Gesture Recognition System**\n"
                "   *Stack: Python, OpenCV, CNN, TensorFlow*\n"
                "   Gesture-to-voice conversion with audio feedback in 3 languages.\n\n"
                f"📄 *All projects are detailed on her resume: [Download Resume]({RESUME_DOWNLOAD_LINK})*"
            )

        # 10. Skills
        if any(w in q for w in ["skill", "stack", "technology", "frontend", "backend", "database", "language"]):
            return (
                "### Anuroopa's Technical Skills\n\n"
                "- **Frontend:** React.js, Angular, React Native, Next.js, TypeScript, JavaScript, HTML5, CSS3\n"
                "- **Backend:** Node.js, Express.js, FastAPI, Django, Python, Java\n"
                "- **Databases:** MySQL, PostgreSQL, SQLite, MongoDB (Basic)\n"
                "- **AI / ML:** Machine Learning, CNN (Gesture Classification), OpenCV, Media Processing, YOLO\n"
                "- **Tools & Practices:** Git, GitHub, Docker (Basic), REST APIs, Postman, JWT Authentication, i18n\n\n"
                f"📄 *You can view her full skill breakdown on her resume: [Download Resume]({RESUME_DOWNLOAD_LINK})*"
            )

        # 11. Contact & Hiring
        if any(w in q for w in ["contact", "email", "phone", "hire", "reach", "talk", "location"]):
            return (
                "### How to Get in Touch with Anuroopa\n\n"
                "- **Email:** [anukalpana2003@gmail.com](mailto:anukalpana2003@gmail.com)\n"
                "- **Phone:** +91-9500683824\n"
                "- **LinkedIn:** [linkedin.com/in/anuroopa-pv](https://www.linkedin.com/in/anuroopa-pv)\n"
                "- **Location:** Chennai, Tamil Nadu, India\n"
                f"- **Resume:** [Download Resume PDF]({RESUME_DOWNLOAD_LINK})\n"
                "- Or submit a message directly via the contact form on this page!"
            )

        # Default Overview
        return (
            "### Anuroopa PV — Full-Stack Developer\n\n"
            "Anuroopa is a Full-Stack Software Developer with a B.Tech in Artificial Intelligence & Data Science (**CGPA: 8.56**) "
            "and 1 year of professional experience building web and mobile platforms for Government of Tamil Nadu portals at **TANSAM** and **DLF Photon**.\n\n"
            "She specializes in **Angular, React, Node.js, FastAPI, PostgreSQL, and MySQL**.\n\n"
            "Feel free to ask me:\n"
            "- *What work experience does she have?*\n"
            "- *What projects has Anuroopa built?*\n"
            "- *What is her educational background & CGPA?*\n"
            "- *How can I download her resume?*\n\n"
            f"📄 *You can download her complete official resume here: [Download Resume]({RESUME_DOWNLOAD_LINK})*"
        )
