import type {
  EventItem,
  NewsArticle,
  Programme,
  School,
  SiteStat,
  Testimonial,
} from "@/types";

export const schools: School[] = [
  {
    id: "sch-computing",
    name: "School of Computing & IT",
    slug: "computing-it",
    description:
      "Career-ready computing programmes spanning software, networks, data and digital systems.",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "sch-business",
    name: "School of Business & Management",
    slug: "business-management",
    description:
      "Practical business education focused on leadership, entrepreneurship and workplace readiness.",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "sch-language",
    name: "School of Language & Communication",
    slug: "language-communication",
    description:
      "English and communication pathways that strengthen academic and professional confidence.",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "sch-hospitality",
    name: "School of Hospitality & Tourism",
    slug: "hospitality-tourism",
    description:
      "Industry-aligned hospitality learning for service excellence and tourism careers.",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 4,
    isActive: true,
  },
  // TODO(content): the college has not formally confirmed this 7-school
  // academic structure. Law, Education and Social Sciences were split out
  // from the previously-undifferentiated programme list; the college should
  // review and confirm these groupings (and their descriptions/images below)
  // before this is treated as official.
  {
    id: "sch-law",
    name: "School of Law",
    slug: "law",
    description:
      "Legal studies pathways from entrance preparation through to undergraduate law.",
    imageUrl:
      "https://images.unsplash.com/photo-1589391887882-d48ac6a50f04?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "sch-education",
    name: "School of Education",
    slug: "education",
    description:
      "Teaching and early-childhood education programmes for classroom-ready graduates.",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 6,
    isActive: true,
  },
  {
    id: "sch-social-sciences",
    name: "School of Social Sciences",
    slug: "social-sciences",
    description:
      "Special degree pathways examining society, governance and the physical world.",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 7,
    isActive: true,
  },
];

export const programmes: Programme[] = [
  {
    id: "prog-bsc-it",
    schoolId: "sch-computing",
    schoolSlug: "computing-it",
    schoolName: "School of Computing & IT",
    title: "BSc in Information Technology",
    slug: "bsc-information-technology",
    level: "Degree",
    duration: "3 years",
    credits: "As per programme structure",
    mode: "Full-time",
    medium: "English",
    intake: "2026 Intake",
    location: "Kandy Campus",
    shortPitch:
      "A flagship degree pathway building practical IT skills for software, systems and digital careers.",
    overview:
      "The BSc in Information Technology at Nextway College International is designed for students who want a modern, career-focused computing education grounded in real project work, problem-solving and professional practice. Learners progress from foundational computing principles to applied software development, networking, databases and emerging technology themes.",
    whyThisProgramme:
      "This programme is the academic flagship of Nextway College International. It combines structured undergraduate learning with practical labs, guided projects and progression-minded career support so students can move confidently from classroom learning into technology roles.",
    learningOutcomes: [
      "Apply computing fundamentals to design and implement practical IT solutions",
      "Develop software using contemporary tools, languages and collaborative workflows",
      "Analyse systems, data and networks to support organisational needs",
      "Communicate technical ideas clearly to academic and workplace audiences",
      "Demonstrate professional, ethical and lifelong learning habits in technology practice",
    ],
    entryRequirements: [
      "GCE A/L or equivalent qualification as approved by the College",
      "Satisfactory English language proficiency for undergraduate study",
      "Interview or counselling session may be required",
      "Final entry criteria are confirmed by Admissions for each intake",
    ],
    assessment:
      "Assessment combines coursework, practical labs, projects, presentations and examinations as specified in each module outline.",
    careerOpportunities: [
      "Software / application support roles",
      "Junior developer or web technology roles",
      "IT support and systems administration pathways",
      "Data and digital operations support",
      "Further postgraduate or professional IT study",
    ],
    progression:
      "Graduates may progress into employment, professional certifications, or further higher-education pathways subject to partner and university requirements.",
    faqs: [
      {
        question: "Is this a new programme?",
        answer:
          "Yes. The BSc in Information Technology is a flagship programme introduction for Nextway College International. Intake details and verified partnerships are confirmed by Admissions.",
      },
      {
        question: "What study mode is available?",
        answer:
          "The core pathway is designed as a full-time campus-based undergraduate programme in Kandy. Flexible options, if offered for a given intake, will be published by Admissions.",
      },
      {
        question: "How do I apply?",
        answer:
          "Submit an enquiry or application through the Admissions page. Our team will guide you through documents, eligibility and next steps.",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    flagship: true,
    status: "published",
    seoTitle: "BSc Information Technology in Kandy | Nextway College International",
    seoDescription:
      "Study the BSc in Information Technology at Nextway College International in Kandy. Explore curriculum, entry requirements, careers and apply for the 2026 intake.",
    modules: [
      {
        id: "m1",
        yearOrStage: "Year 1",
        code: "IT101",
        title: "Computing Fundamentals",
        credits: 15,
        sortOrder: 1,
      },
      {
        id: "m2",
        yearOrStage: "Year 1",
        code: "IT102",
        title: "Programming Principles",
        credits: 15,
        sortOrder: 2,
      },
      {
        id: "m3",
        yearOrStage: "Year 1",
        code: "IT103",
        title: "Mathematics for Computing",
        credits: 15,
        sortOrder: 3,
      },
      {
        id: "m4",
        yearOrStage: "Year 1",
        code: "IT104",
        title: "Digital Systems & Hardware",
        credits: 15,
        sortOrder: 4,
      },
      {
        id: "m5",
        yearOrStage: "Year 2",
        code: "IT201",
        title: "Database Systems",
        credits: 15,
        sortOrder: 5,
      },
      {
        id: "m6",
        yearOrStage: "Year 2",
        code: "IT202",
        title: "Web Technologies",
        credits: 15,
        sortOrder: 6,
      },
      {
        id: "m7",
        yearOrStage: "Year 2",
        code: "IT203",
        title: "Networking Essentials",
        credits: 15,
        sortOrder: 7,
      },
      {
        id: "m8",
        yearOrStage: "Year 2",
        code: "IT204",
        title: "Object-Oriented Development",
        credits: 15,
        sortOrder: 8,
      },
      {
        id: "m9",
        yearOrStage: "Year 3",
        code: "IT301",
        title: "Software Engineering Practice",
        credits: 15,
        sortOrder: 9,
      },
      {
        id: "m10",
        yearOrStage: "Year 3",
        code: "IT302",
        title: "Information Security Fundamentals",
        credits: 15,
        sortOrder: 10,
      },
      {
        id: "m11",
        yearOrStage: "Year 3",
        code: "IT303",
        title: "Cloud & Emerging Technologies",
        credits: 15,
        sortOrder: 11,
      },
      {
        id: "m12",
        yearOrStage: "Year 3",
        code: "IT304",
        title: "Capstone Project",
        credits: 15,
        sortOrder: 12,
      },
    ],
    fees: {
      intake: "2026",
      registrationFee: "Confirmed on enquiry",
      courseFee: "Confirmed on enquiry",
      instalmentNote: "Flexible payment guidance available through Admissions.",
      currency: "LKR",
      isCurrent: true,
    },
    partners: [
      {
        partnerName: "Awarding / progression partners",
        partnerType: "Academic",
        description:
          "Partner and awarding-body relationships are published only after institutional verification.",
        verified: false,
      },
    ],
  },
  {
    id: "prog-dip-software",
    schoolId: "sch-computing",
    schoolSlug: "computing-it",
    schoolName: "School of Computing & IT",
    title: "Diploma in Software Development",
    slug: "diploma-software-development",
    level: "Diploma",
    duration: "12–18 months",
    mode: "Full-time",
    medium: "English",
    intake: "Rolling intakes",
    location: "Kandy Campus",
    shortPitch: "Hands-on software foundations for web and application development careers.",
    overview:
      "A practical diploma pathway covering programming, web development, databases and project delivery for learners seeking applied IT skills.",
    whyThisProgramme:
      "Ideal for students who want a shorter, skills-focused route into software and digital roles.",
    learningOutcomes: [
      "Write and debug applications using modern programming approaches",
      "Build responsive web interfaces and basic backend services",
      "Work with relational databases and version control",
    ],
    entryRequirements: [
      "GCE O/L or A/L or equivalent",
      "Basic computer literacy",
      "English proficiency suitable for diploma study",
    ],
    assessment: "Coursework, practicals and project assessment.",
    careerOpportunities: [
      "Junior web developer",
      "Software support technician",
      "Further IT diploma/degree progression",
    ],
    progression: "Progression into advanced computing pathways including degree study where eligible.",
    faqs: [
      {
        question: "Can I study part-time?",
        answer: "Part-time availability depends on intake scheduling. Contact Admissions for current options.",
      },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
    modules: [
      {
        id: "ds1",
        yearOrStage: "Stage 1",
        code: "SD101",
        title: "Programming Basics",
        sortOrder: 1,
      },
      {
        id: "ds2",
        yearOrStage: "Stage 1",
        code: "SD102",
        title: "Web Development",
        sortOrder: 2,
      },
      {
        id: "ds3",
        yearOrStage: "Stage 2",
        code: "SD201",
        title: "Databases",
        sortOrder: 3,
      },
      {
        id: "ds4",
        yearOrStage: "Stage 2",
        code: "SD202",
        title: "Project Workshop",
        sortOrder: 4,
      },
    ],
  },
  {
    id: "prog-hd-business",
    schoolId: "sch-business",
    schoolSlug: "business-management",
    schoolName: "School of Business & Management",
    title: "Higher Diploma in Business Management",
    slug: "higher-diploma-business-management",
    level: "Higher Diploma",
    duration: "18–24 months",
    mode: "Flexible",
    medium: "English",
    intake: "2026 Intake",
    location: "Kandy Campus",
    shortPitch: "Develop managerial judgment, communication and business decision-making skills.",
    overview:
      "This higher diploma builds core business capability across management, marketing, finance foundations and workplace communication.",
    whyThisProgramme:
      "Designed for school leavers and working learners seeking a structured pathway into business roles or further study.",
    learningOutcomes: [
      "Apply management concepts to real organisational scenarios",
      "Interpret basic financial and marketing information",
      "Communicate professionally in business contexts",
    ],
    entryRequirements: ["GCE A/L or equivalent", "Admissions counselling may apply"],
    assessment: "Assignments, presentations and examinations.",
    careerOpportunities: [
      "Junior management / admin roles",
      "Sales and customer operations",
      "Entrepreneurship foundation",
    ],
    progression: "Potential progression to undergraduate business pathways subject to eligibility.",
    faqs: [],
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
    modules: [
      {
        id: "bm1",
        yearOrStage: "Year 1",
        code: "BM101",
        title: "Principles of Management",
        sortOrder: 1,
      },
      {
        id: "bm2",
        yearOrStage: "Year 1",
        code: "BM102",
        title: "Marketing Essentials",
        sortOrder: 2,
      },
      {
        id: "bm3",
        yearOrStage: "Year 2",
        code: "BM201",
        title: "Business Communication",
        sortOrder: 3,
      },
    ],
  },
  {
    id: "prog-eng-diploma",
    schoolId: "sch-language",
    schoolSlug: "language-communication",
    schoolName: "School of Language & Communication",
    title: "Diploma in English",
    slug: "diploma-english",
    level: "Diploma",
    duration: "6–12 months",
    mode: "Part-time",
    medium: "English",
    intake: "Multiple intakes",
    location: "Kandy Campus",
    shortPitch: "Strengthen academic and professional English for study and workplace success.",
    overview:
      "A structured English diploma focusing on reading, writing, listening, speaking and communication confidence.",
    whyThisProgramme:
      "Supports students preparing for higher education or professional environments where English fluency matters.",
    learningOutcomes: [
      "Communicate clearly in academic and workplace English",
      "Improve writing accuracy and spoken fluency",
    ],
    entryRequirements: ["Placement assessment may be required"],
    assessment: "Continuous assessment and skills tests.",
    careerOpportunities: ["Academic progression support", "Front-office / service communication roles"],
    progression: "Supports entry into further diploma and degree pathways.",
    faqs: [],
    imageUrl:
      "https://images.unsplash.com/photo-1456513080800-b6bbe9059811?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
    modules: [
      {
        id: "en1",
        yearOrStage: "Stage 1",
        code: "EN101",
        title: "General English",
        sortOrder: 1,
      },
      {
        id: "en2",
        yearOrStage: "Stage 2",
        code: "EN201",
        title: "Academic Communication",
        sortOrder: 2,
      },
    ],
  },
  {
    id: "prog-hosp-cert",
    schoolId: "sch-hospitality",
    schoolSlug: "hospitality-tourism",
    schoolName: "School of Hospitality & Tourism",
    title: "Certificate in Hospitality Operations",
    slug: "certificate-hospitality-operations",
    level: "Certificate",
    duration: "3–6 months",
    mode: "Full-time",
    medium: "English",
    intake: "Seasonal intakes",
    location: "Kandy Campus",
    shortPitch: "Service skills and guest-experience foundations for hospitality careers.",
    overview:
      "An entry pathway covering guest service, hygiene awareness, teamwork and hospitality workplace basics.",
    whyThisProgramme:
      "Built for learners seeking a fast start into hospitality and tourism environments.",
    learningOutcomes: [
      "Deliver professional guest service",
      "Apply workplace standards in hospitality settings",
    ],
    entryRequirements: ["School leavers welcome", "Basic English preferred"],
    assessment: "Practical and continuous assessment.",
    careerOpportunities: ["Hotel / restaurant trainee roles", "Tourism support roles"],
    progression: "Progress into diploma-level hospitality study.",
    faqs: [],
    imageUrl:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
    modules: [
      {
        id: "ho1",
        yearOrStage: "Stage 1",
        code: "HO101",
        title: "Guest Service Essentials",
        sortOrder: 1,
      },
    ],
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "news-1",
    title: "Applications open for the 2026 intake",
    slug: "applications-open-2026-intake",
    excerpt:
      "Prospective students can now enquire for upcoming diploma and degree pathways, including the BSc in Information Technology.",
    content:
      "Nextway College International is welcoming enquiries for the 2026 intake. Students and parents can explore programmes, speak with Admissions and begin the application conversation through our website or WhatsApp.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-07-15",
    category: "Admissions",
    status: "published",
  },
  {
    id: "news-2",
    title: "Introducing the BSc in Information Technology",
    slug: "introducing-bsc-information-technology",
    excerpt:
      "A flagship undergraduate computing pathway designed for career-focused learners in Kandy.",
    content:
      "The BSc in Information Technology brings structured undergraduate learning, practical labs and project experience to Nextway College International. Explore the programme page for curriculum highlights and how to apply.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-06-20",
    category: "Programmes",
    status: "published",
  },
  {
    id: "news-3",
    title: "Campus orientation and student support briefing",
    slug: "campus-orientation-student-support",
    excerpt:
      "New students are invited to learn about facilities, academic expectations and support services.",
    content:
      "Orientation helps students settle quickly into academic life. Details of upcoming sessions will be shared with registered applicants by the Student Support team.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-05-28",
    category: "Campus",
    status: "published",
  },
];

export const events: EventItem[] = [
  {
    id: "evt-1",
    title: "Open Day: Explore Programmes & Campus Life",
    slug: "open-day-explore-programmes",
    summary: "Meet faculty, tour facilities and get personalised programme guidance.",
    description:
      "Join our Open Day to discover academic pathways, speak with Admissions and experience campus life at Nextway College International.",
    startAt: "2026-09-12T09:00:00+05:30",
    endAt: "2026-09-12T15:00:00+05:30",
    location: "Kandy Campus",
    imageUrl:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
  {
    id: "evt-2",
    title: "BSc IT Information Session",
    slug: "bsc-it-information-session",
    summary: "A focused briefing on curriculum, labs, careers and entry requirements.",
    description:
      "Learn how the BSc in Information Technology is structured and what support is available for new applicants.",
    startAt: "2026-08-28T17:00:00+05:30",
    location: "Online / Campus hybrid",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    studentName: "A. Fernando",
    programme: "Diploma in Software Development",
    quote:
      "The lecturers explained concepts clearly and the practical sessions helped me build confidence for real projects.",
    status: "published",
    consentConfirmed: true,
  },
  {
    id: "t2",
    studentName: "S. Nitharsan",
    programme: "Higher Diploma in Business Management",
    quote:
      "I appreciated how approachable the academic team was. The guidance around careers made the journey feel purposeful.",
    status: "published",
    consentConfirmed: true,
  },
  {
    id: "t3",
    studentName: "M. Ruksana",
    programme: "Diploma in English",
    quote:
      "My communication improved quickly. Classes were supportive and focused on both academic and workplace English.",
    status: "published",
    consentConfirmed: true,
  },
];

/** Qualitative trust points until verified statistics are supplied by the College. */
export const trustPoints: SiteStat[] = [
  { value: "80/20", label: "Hybrid online & direct learning" },
  { value: "22", label: "Branches island-wide" },
  { value: "2", label: "English & Tamil medium classes" },
  { value: "10+", label: "Degree, diploma & training pathways" },
];

export const whyNextWay = [
  {
    title: "Hybrid learning model",
    description: "80% online classes with 20% direct sessions for practical engagement and community.",
  },
  {
    title: "Island-wide access",
    description: "Study from 22 branches including Kandy, Colombo, Galle, Batticaloa and more.",
  },
  {
    title: "English & Tamil medium",
    description: "Programmes delivered in the language that best supports your learning journey.",
  },
  {
    title: "Career-focused pathways",
    description: "From BSc IT and LLB to HND and diploma programmes aligned with employability.",
  },
  {
    title: "Accredited partnerships",
    description: "Affiliations and recognitions that strengthen trust in our academic standards.",
  },
  {
    title: "Guided admissions support",
    description: "Student counsellors help you from enquiry through enrolment and orientation.",
  },
];

export const studentJourney = [
  { step: "01", title: "Discover", text: "Explore schools and programmes that match your goals." },
  { step: "02", title: "Choose", text: "Compare duration, mode, entry requirements and outcomes." },
  { step: "03", title: "Apply", text: "Submit an enquiry or application with Admissions support." },
  { step: "04", title: "Learn", text: "Build knowledge through guided teaching and practical work." },
  { step: "05", title: "Grow", text: "Progress into careers, further study or professional pathways." },
];
