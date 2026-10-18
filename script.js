// USER ROLE SYSTEM
let currentUser = null;

function setUserRole(role) {
  currentUser = {
    role: role,
    name: role
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUIForRole();
}

function updateUIForRole() {
  const teacherControls = document.querySelectorAll(".teacher-only");

  teacherControls.forEach(el => {
    if (currentUser && currentUser.role === "Teacher") {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });
}
const STORAGE_KEY = "student-homework-tasks";
const STATS_KEY = "student-homework-stats";
const POINTS_PER_COMPLETION = 10;
const LEVEL_POINTS = 100;
const STREAK_BONUSES = {
  3: 15,
  7: 40,
  14: 80,
};
const QUICK_TASK_TEXT_MAP = {
  Homework: "Complete homework practice",
  Exam: "Revise for upcoming exam",
  Project: "Work on project milestone",
};
const BADGE_TIERS = [
  { threshold: 30, label: "Master" },
  { threshold: 15, label: "Scholar" },
  { threshold: 5, label: "Learner" },
  { threshold: 0, label: "Novice" },
];
const LOGIN_KEY = "student-homework-current-user";
const USERS_KEY = "student-homework-users";
const USERS_SEED_KEY = "student-homework-users-seed";
const USERS_SEED_VERSION = "demo-creds-v7-class-normalize";
const SESSIONS_KEY = "student-homework-sessions";
const FEES_KEY = "vibgyor_student_fees_hierarchical_v3";
const ACADEMIC_REPORTS_KEY = "student-homework-academic-reports";

const DEFAULT_USERS = [
  {
    id: "admin-001",
    username: "admin.vgs",
    password: "password123",
    role: "Principal",
    displayName: "Principal Admin",
    email: "admin@vgs.edu.in",
    phone: "",
    status: "Active",
    classSection: "All",
    assignedClasses: ["8A", "8B", "9A"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-001",
    username: "preetam.p",
    password: "password123",
    role: "Staff",
    displayName: "Mr. Preetham P",
    email: "preetham@vgs.edu.in",
    phone: "+91 88997 66554",
    status: "Active",
    classSection: "All",
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-legacy",
    username: "admin.schoolapp@org",
    password: "password123",
    role: "Principal",
    displayName: "Principal Admin",
    email: "admin.schoolapp@gmail.com",
    phone: "+91 98765 43210",
    status: "Active",
    classSection: "All",
    assignedClasses: ["8A", "8B", "9A"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "teacher-001",
    username: "sunil.kumar",
    password: "password123",
    role: "Teacher",
    displayName: "Mr. Sunil Kumar",
    email: "sunil.kumar@vgs.edu.in",
    phone: "+91 98112 33445",
    status: "Active",
    classSection: "8A",
    grade: "Grade 8",
    section: "Section A",
    assignedClasses: ["8A", "8B"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "student-001",
    username: "aarav.sharma",
    password: "password123",
    role: "Student",
    displayName: "Aarav Sharma",
    email: "aarav.s@vgs.edu.in",
    phone: "+91 98765 11111",
    status: "Active",
    classSection: "8A",
    grade: "Grade 8",
    section: "Section A",
    createdAt: new Date().toISOString(),
  },
  {
    id: "student-002",
    username: "ananya.sharma",
    password: "password123",
    role: "Student",
    displayName: "Ananya Sharma",
    email: "ananya.s@vgs.edu.in",
    phone: "+91 98765 22222",
    status: "Active",
    classSection: "8A",
    grade: "Grade 8",
    section: "Section A",
    createdAt: new Date().toISOString(),
  },
  {
    id: "student-003",
    username: "rohan.gupta",
    password: "password123",
    role: "Student",
    displayName: "Rohan Gupta",
    email: "rohan.g@vgs.edu.in",
    phone: "+91 98765 33333",
    status: "Active",
    classSection: "8B",
    grade: "Grade 8",
    section: "Section B",
    createdAt: new Date().toISOString(),
  },
  {
    id: "parent-001",
    username: "rajesh.sharma",
    password: "password123",
    role: "Parent",
    displayName: "Mr. Rajesh Sharma",
    email: "rajesh.sharma@gmail.com",
    phone: "+91 98123 45678",
    status: "Active",
    classSection: "8A",
    grade: "Grade 8",
    section: "Section A",
    linkedStudentId: "student-001",
    linkedStudentIds: ["student-001", "student-002"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "parent-002",
    username: "sunita.gupta",
    password: "password123",
    role: "Parent",
    displayName: "Mrs. Sunita Gupta",
    email: "sunita.gupta@gmail.com",
    phone: "+91 98234 56789",
    status: "Active",
    classSection: "8B",
    grade: "Grade 8",
    section: "Section B",
    linkedStudentId: "student-003",
    linkedStudentIds: ["student-003"],
    createdAt: new Date().toISOString(),
  }
];

const USER_ACCOUNTS = DEFAULT_USERS;

/** Normalize "8A", "Grade 8 - Section A", etc. into { short, grade, section }. */
function parseClassSection(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (s === "All") {
    return { short: "All", grade: "All", section: "All" };
  }

  let match = s.match(/^(\d{1,2})\s*[-]?\s*([A-Da-d])$/);
  if (match) {
    const gradeNum = match[1];
    const sectionLetter = match[2].toUpperCase();
    return {
      short: `${gradeNum}${sectionLetter}`,
      grade: `Grade ${gradeNum}`,
      section: `Section ${sectionLetter}`,
    };
  }

  match = s.match(/Grade\s*(\d{1,2}).*?Section\s*([A-Da-d])/i);
  if (match) {
    const gradeNum = match[1];
    const sectionLetter = match[2].toUpperCase();
    return {
      short: `${gradeNum}${sectionLetter}`,
      grade: `Grade ${gradeNum}`,
      section: `Section ${sectionLetter}`,
    };
  }

  match = s.match(/Grade\s*(\d{1,2})/i);
  if (match) {
    return {
      short: match[1],
      grade: `Grade ${match[1]}`,
      section: "",
    };
  }

  return null;
}

function toShortClassSection(grade, section) {
  const gradeNum = String(grade || "").replace(/Grade\s*/i, "").trim();
  const sectionLetter = String(section || "").replace(/Section\s*/i, "").trim().toUpperCase();
  if (!gradeNum || !sectionLetter) return "";
  return `${gradeNum}${sectionLetter}`;
}

function normalizeClassKey(value) {
  const parsed = parseClassSection(value);
  return parsed ? parsed.short : String(value || "").trim();
}

function classesEqual(a, b) {
  if (!a || !b) return false;
  if (a === "All" || b === "All") return true;
  return normalizeClassKey(a) === normalizeClassKey(b);
}

// Helper functions for class-based access control
function canAccessClassData(user, classSection) {
  if (!user || !classSection) return false;
  const userClass = getUserClass(user);
  if (userClass === "All") return true;
  if (Array.isArray(userClass)) {
    return userClass.some((uc) => classesEqual(uc, classSection));
  }
  return classesEqual(userClass, classSection);
}

function filterDataByClass(data, user) {
  if (!data || !Array.isArray(data)) return [];
  if (!user) return data;
  const userClass = getUserClass(user);
  if (userClass === "All") return data;
  return data.filter(item => {
    const itemClass = item.classSection || item.class;
    if (!itemClass) {
      // retain legacy items without a class section for all current users
      return true;
    }
    if (Array.isArray(userClass)) {
      return userClass.some((uc) => classesEqual(uc, itemClass));
    }
    return classesEqual(itemClass, userClass);
  });
}

function getUserAccessibleClasses(user) {
  if (!user) return [];
  const userClass = getUserClass(user);
  if (userClass === "All") return ["8A", "8B", "9A"]; // Assuming these classes
  if (Array.isArray(userClass)) return userClass.map(normalizeClassKey);
  return [normalizeClassKey(userClass)].filter(Boolean);
}

const NOTIFICATIONS_KEY = "student-homework-notifications";

const LAUNCHPAD_ADMIN_ROLES = ["Principal", "Staff"];

const LAUNCHPAD_SECTION_LETTERS = ["A", "B", "C", "D"];
const LAUNCHPAD_GRADES = Array.from({ length: 12 }, (_, index) => ({
  key: `grade-${index + 1}`,
  name: `Grade ${index + 1}`,
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  desc: `Grades 1–12 academic content and curriculum`,
  type: "grade",
  grade: index + 1,
  roles: LAUNCHPAD_ADMIN_ROLES,
}));

const LAUNCHPAD_SECTIONS = LAUNCHPAD_SECTION_LETTERS.map((letter) => ({
  key: `sec-${letter.toLowerCase()}`,
  name: `Section ${letter}`,
  section: letter,
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  desc: `Section ${letter} — classes, subjects & curriculum`,
  type: "section",
  roles: LAUNCHPAD_ADMIN_ROLES,
}));

const LAUNCHPAD_SECTION_MODULES = [
  {
    key: "subjects",
    name: "Subjects",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    desc: "All subjects taught in this section",
    type: "leaf", action: "none", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "lesson-plans",
    name: "Lesson Plans",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><path d="M13 8h4M13 12h4M13 16h4"/></svg>`,
    desc: "Structured lesson plans for each subject",
    type: "leaf", action: "overlay", overlayId: "lessonPlansOverlay", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "teaching-aids",
    name: "Teaching Aids",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    desc: "Visual aids, charts and teaching materials",
    type: "leaf", action: "overlay", overlayId: "teachingAidsOverlay", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "worksheets",
    name: "Worksheets",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
    desc: "Practice worksheets",
    type: "leaf", action: "none", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "learning-outcomes",
    name: "Learning Outcomes",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    desc: "Expected skills and knowledge goals",
    type: "leaf", action: "none", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "learning-resources",
    name: "Learning Resources",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    desc: "Digital and physical learning materials",
    type: "leaf", action: "tab", tab: "resources", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "projects",
    name: "Projects",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    desc: "Group and individual school projects",
    type: "leaf", action: "none", roles: LAUNCHPAD_ADMIN_ROLES
  },
  {
    key: "section-settings",
    name: "Settings",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/></svg>`,
    desc: "Section configuration and preferences",
    type: "leaf", action: "tab", tab: "admin", roles: LAUNCHPAD_ADMIN_ROLES
  },
];

const LAUNCHPAD_CATEGORIES = [
  {
    category: "OPERATIONS",
    modules: [
      {
        key: "administration",
        name: "Administration",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/></svg>`,
        desc: "System administration",
        type: "leaf",
        action: "tab",
        tab: "admin",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "attendance",
        name: "Attendance",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
        desc: "Attendance tracking",
        type: "leaf",
        action: "tab",
        tab: "attendance",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "reports",
        name: "Reports",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
        desc: "Reports and analytics",
        type: "leaf",
        action: "tab",
        tab: "reports",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "fees",
        name: "Fees & Finance",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="6.01" y2="15"/><line x1="10" y1="15" x2="14" y2="15"/></svg>`,
        desc: "Academic fee session, dues & payment receipts",
        type: "leaf",
        action: "tab",
        tab: "fees",
        roles: ["Principal", "Staff", "Admin", "Parent"]
      },
      {
        key: "live-clock-module",
        name: "Local Time",
        icon: `<div style="font-family: monospace; font-size: 14px; font-weight: 600;" id="liveClockTextLaunchpad">--:--</div>`,
        desc: "Current time",
        type: "leaf",
        action: "none",
        roles: LAUNCHPAD_ADMIN_ROLES
      }
    ]
  },
  {
    category: "ACADEMICS",
    modules: [
      {
        key: "academics",
        name: "Academics",
        fullName: "Academics",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
        desc: "Grades 1–12 → Sections → Lesson Plans, Teaching Aids & more",
        type: "folder",
        action: "none",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "homework",
        name: "Homework",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        desc: "Homework and assignments",
        type: "leaf",
        action: "tab",
        tab: "home",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "timetable",
        name: "Timetable",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/></svg>`,
        desc: "School timetable",
        type: "leaf",
        action: "tab",
        tab: "timetable",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "examinations",
        name: "Examinations",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M10 9H8"/></svg>`,
        desc: "Exams and tests",
        type: "leaf",
        action: "tab",
        tab: "exam",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "notes",
        name: "Notes",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
        desc: "Notes and documents",
        type: "leaf",
        action: "tab",
        tab: "notes",
        roles: LAUNCHPAD_ADMIN_ROLES
      }
    ]
  },
  {
    category: "COMMUNICATION",
    modules: [
      {
        key: "announcements",
        name: "Announce...",
        fullName: "Announcements",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
        desc: "School announcements",
        type: "leaf",
        action: "tab",
        tab: "announcements",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "groups",
        name: "Groups",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        desc: "Student and staff groups",
        type: "leaf",
        action: "tab",
        tab: "groups",
        roles: LAUNCHPAD_ADMIN_ROLES
      }
    ]
  },
  {
    category: "SCHOOL SERVICES",
    modules: [
      {
        key: "care",
        name: "Health Care",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        desc: "Health & wellness services",
        type: "leaf",
        action: "tab",
        tab: "care",
        roles: LAUNCHPAD_ADMIN_ROLES
      },
      {
        key: "resources",
        name: "Library",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        desc: "Library & learning resources",
        type: "leaf",
        action: "tab",
        tab: "resources",
        roles: LAUNCHPAD_ADMIN_ROLES
      }
    ]
  }
];

const LAUNCHPAD_MODULES = [...LAUNCHPAD_CATEGORIES.flatMap((cat) => cat.modules), {
  key: "recent-completions",
  name: "Recent Completions",
  icon: "🔔",
  desc: "View recent activity completions",
  type: "leaf",
  action: "tab",
  tab: "recent-completions",
  roles: LAUNCHPAD_ADMIN_ROLES
}];

// Keep folder list empty — hierarchy is driven by launchpadNavState.
const LAUNCHPAD_FOLDERS = [];

let launchpadNavState = { view: "root" };


// Navigation history
let navigationHistory = [];
let currentTab = "launchpad";
const GROUPS_KEY = "student-homework-groups";
const EXAMS_KEY = "student-homework-exams";
const PARENTS_KEY = "student-homework-parents";
const PARENT_TEACHER_MESSAGES_KEY = "student-homework-parent-teacher-messages";
const TIMETABLE_KEY = "student-homework-timetable";
const ANNOUNCEMENTS_KEY = "student-homework-announcements";
const NOTES_KEY = "student-homework-notes";
const { parseTaskInput, parseISODate, formatDateLabel, toISODate } =
  window.TaskParser;

const MIN_GROUP_MEMBERS = 5;
const MAX_GROUP_MEMBERS = 500;

const homeworkInput = document.getElementById("homeworkInput");
const dueDateInput = document.getElementById("dueDateInput");
const taskGroupInput = document.getElementById("taskGroupInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskFileInput = document.getElementById("taskFileInput");
const quickAddBtns = document.querySelectorAll(".quick-add-btn");
const todayTaskList = document.getElementById("todayTaskList");
const upcomingTaskList = document.getElementById("upcomingTaskList");
const completedTaskList = document.getElementById("completedTaskList");
const todayEmpty = document.getElementById("todayEmpty");
const upcomingEmpty = document.getElementById("upcomingEmpty");
const completedEmpty = document.getElementById("completedEmpty");
const todayTaskSection = todayTaskList?.closest(".task-section");
const upcomingTaskSection = upcomingTaskList?.closest(".task-section");
const completedTaskSection = document.getElementById("completedSection");
const totalPointsEl = document.getElementById("totalPoints");
const streakCountEl = document.getElementById("streakCount");
const levelValueEl = document.getElementById("levelValue");
const badgeLabelEl = document.getElementById("badgeLabel");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const rewardBanner = document.getElementById("rewardBanner");
const dashboardTotalTasksEl = document.getElementById("dashboardTotalTasks");
const dashboardCompletedTasksEl = document.getElementById("dashboardCompletedTasks");
const dashboardPendingTasksEl = document.getElementById("dashboardPendingTasks");
const dashboardExamCountEl = document.getElementById("dashboardExamCount");
const dashboardUpcomingExamsEl = document.getElementById("dashboardUpcomingExams");
const dashboardProgressEl = document.getElementById("dashboardProgress");
const dashboardOverviewEl = document.getElementById("dashboardOverview");
const reminderBanner = document.getElementById("reminderBanner");
const tabButtons = document.querySelectorAll(".tab-btn");

// Add event listeners for tab buttons
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    switchTab(tab);
  });
});

const tasksSection = document.getElementById("homeSection");
const groupsSection = document.getElementById("groupsSection");
const examSection = document.getElementById("examSection");
const groupNameInput = document.getElementById("groupNameInput");
const groupDescriptionInput = document.getElementById("groupDescriptionInput");
const addGroupBtn = document.getElementById("addGroupBtn");
const groupsList = document.getElementById("groupsList");
const groupFilterList = document.getElementById("groupFilterList");
const clearGroupFilterBtn = document.getElementById("clearGroupFilterBtn");
const totalGroupsCount = document.getElementById("totalGroupsCount");
const activeChatsCount = document.getElementById("activeChatsCount");
const totalGroupMembersCount = document.getElementById("totalGroupMembersCount");
const groupSnapshot = document.getElementById("groupSnapshot");
const groupSnapshotName = document.getElementById("groupSnapshotName");
const groupSnapshotInfo = document.getElementById("groupSnapshotInfo");
const groupSnapshotMembers = document.getElementById("groupSnapshotMembers");
const groupSnapshotRoles = document.getElementById("groupSnapshotRoles");
const groupSnapshotDescription = document.getElementById("groupSnapshotDescription");
const openGroupInfoBtn = document.getElementById("openGroupInfoBtn");
const examNameInput = document.getElementById("examNameInput");
const examSubjectInput = document.getElementById("examSubjectInput");
const examDateInput = document.getElementById("examDateInput");
const studyDaysInput = document.getElementById("studyDaysInput");
const examFileInput = document.getElementById("examFileInput");
const addExamBtn = document.getElementById("addExamBtn");
const examsList = document.getElementById("examsList");
const timetableSection = document.getElementById("timetableSection");
const timetableTable = document.getElementById("timetableTable");
const announcementInput = document.getElementById("announcementInput");
const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
const announcementsList = document.getElementById("announcementsList");
const noteTitleInput = document.getElementById("noteTitleInput");
const noteContentInput = document.getElementById("noteContentInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const groupChatPanel = document.getElementById("groupChatPanel");
const chatGroupTitle = document.getElementById("chatGroupTitle");
const chatParticipants = document.getElementById("chatParticipants");
const groupCallBtn = document.getElementById("groupCallBtn");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const parentNameInput = document.getElementById("parentNameInput");
const parentPhoneInput = document.getElementById("parentPhoneInput");
const parentEmailInput = document.getElementById("parentEmailInput");
const parentGroupSelect = document.getElementById("parentGroupSelect");
const addParentBtn = document.getElementById("addParentBtn");
const parentsList = document.getElementById("parentsList");
const parentTeacherContact = document.getElementById("parentTeacherContact");
const teacherNameEl = document.getElementById("teacherName");
const teacherEmailEl = document.getElementById("teacherEmail");
const teacherCallBtn = document.getElementById("teacherCallBtn");
const showTeacherMessageBtn = document.getElementById("showTeacherMessageBtn");
const teacherMessagePanel = document.getElementById("teacherMessagePanel");
const parentMessageInput = document.getElementById("parentMessageInput");
const sendParentMessageBtn = document.getElementById("sendParentMessageBtn");
const parentMessagesList = document.getElementById("parentMessagesList");
const parentNotificationsCard = document.getElementById("parentNotifications");
const parentNotificationsContent = document.getElementById("parentNotificationsContent");
const groupDetailsCard = document.getElementById("groupDetailsCard");
const groupDetails = document.getElementById("groupDetails");
const closeGroupDetailsBtn = document.getElementById("closeGroupDetailsBtn");
const groupSearchInput = document.getElementById("groupSearchInput");
const groupInfoModal = document.getElementById("groupInfoModal");
const closeGroupInfoBtn = document.getElementById("closeGroupInfoBtn");
const groupInfoTitle = document.getElementById("groupInfoTitle");
const groupInfoSubtitle = document.getElementById("groupInfoSubtitle");
const groupInfoMeta = document.getElementById("groupInfoMeta");
const groupInfoParticipants = document.getElementById("groupInfoParticipants");
const openAddParticipantsBtn = document.getElementById("openAddParticipantsBtn");
const addParticipantsPanel = document.getElementById("addParticipantsPanel");
const closeAddParticipantsBtn = document.getElementById("closeAddParticipantsBtn");
const contactsPickerList = document.getElementById("contactsPickerList");
const addSelectedParticipantsBtn = document.getElementById("addSelectedParticipantsBtn");
const groupInfoCallBtn = document.getElementById("groupInfoCallBtn");
const loginPage = document.getElementById("loginPage");
const notificationBtn = document.getElementById("notificationBtn");
const notificationBadge = document.getElementById("notificationBadge");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const clearNotificationsBtn = document.getElementById("clearNotificationsBtn");
const closeNotificationPanelBtn = document.getElementById("closeNotificationPanelBtn");
const principalSearchInput = document.getElementById("principalSearchInput");
const principalFilterSelect = document.getElementById("principalFilterSelect");
const parentOverviewCard = document.getElementById("parentOverviewCard");
const parentChildName = document.getElementById("parentChildName");
const parentChildClass = document.getElementById("parentChildClass");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const roleDisplay = document.getElementById("roleDisplay");
const signupRoleSelect = document.getElementById("signupRoleSelect");
const signupRoleWrapper = document.getElementById("signupRoleWrapper");
const passwordInput = document.getElementById("passwordInput");
const loginError = document.getElementById("loginError");
const welcomeMessage = document.getElementById("welcomeMessage");
const currentRoleBadge = document.getElementById("currentRoleBadge");
const currentClassBadge = document.getElementById("currentClassBadge");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("principalSearchInput") || document.getElementById("launchpadSearch");
const filterBtns = document.querySelectorAll(".filter-btn");
const appContainer = document.querySelector(".app");
const editTaskModal = document.getElementById("editTaskModal");
const editTaskTextarea = document.getElementById("editTaskTextarea");
const saveEditTaskBtn = document.getElementById("saveEditTaskBtn");
const cancelEditTaskBtn = document.getElementById("cancelEditTaskBtn");

let currentFilter = "all";
let editingTaskId = null;
let searchQuery = "";
let groupSearchQuery = "";
let dashboardSearchQuery = "";
let dashboardClassFilter = "";
let adminUserRoleFilter = "all";
let umSearchQuery = "";
let umSortColumn = "";
let umSortAsc = true;
let umCurrentPage = 1;
const umItemsPerPage = 5;

// Role Works Constants & Data Defaults
const ROLE_WORKS_STORAGE_KEY = "vibgyor_role_works_v4";
const ROLE_WORKS_FEED_KEY = "vibgyor_role_works_feed_v4";
let activeRoleWorksFilter = "all";

const DEFAULT_ROLE_WORKS = [
  // Principal Works (aligned with Principal role used by auth)
  { id: "w_adm_1", role: "Principal", title: "Approve Staff Leave & Substitute Schedule", priority: "High", completed: true, timestamp: "Today, 09:30 AM" },
  { id: "w_adm_2", role: "Principal", title: "Finalize Term 2 Board Exam Timetable", priority: "High", completed: true, timestamp: "Today, 10:15 AM" },
  { id: "w_adm_3", role: "Principal", title: "Audit Monthly Transport & Fee Disbursements", priority: "Medium", completed: false, timestamp: "Today, 11:00 AM" },
  { id: "w_adm_4", role: "Principal", title: "Campus Safety & Smart Gate Sync Check", priority: "Normal", completed: true, timestamp: "Yesterday" },
  
  // Staff Works
  { id: "w_stf_1", role: "Staff", title: "Update Staff Attendance & Monthly Register", priority: "High", completed: true, timestamp: "Today, 08:30 AM" },
  { id: "w_stf_2", role: "Staff", title: "Process Facilities Maintenance Requests", priority: "Medium", completed: false, timestamp: "Today, 11:30 AM" }
];

const DEFAULT_ACTIVITY_FEED = [
  { icon: "👑", text: "Principal approved Term 2 Schedules", time: "5m ago" },
  { icon: "💼", text: "Staff updated monthly register", time: "15m ago" }
];

// Wipe all stored data on first load (tasks, groups, exams, parents, notifications, etc.)
function wipeAllDataOnce() {
  const WIPE_FLAG = "student-homework-all-data-cleared-v2";
  if (localStorage.getItem(WIPE_FLAG)) return;
  const keysToClear = [
    STORAGE_KEY,
    STATS_KEY,
    SESSIONS_KEY,
    GROUPS_KEY,
    EXAMS_KEY,
    PARENTS_KEY,
    PARENT_TEACHER_MESSAGES_KEY,
    TIMETABLE_KEY,
    ANNOUNCEMENTS_KEY,
    NOTES_KEY,
    NOTIFICATIONS_KEY,
    ROLE_WORKS_STORAGE_KEY,
    ROLE_WORKS_FEED_KEY,
    USERS_KEY,
    USERS_SEED_KEY,
    LOGIN_KEY,
    FEES_KEY,
    ACADEMIC_REPORTS_KEY,
    "vibgyor_student_fees_hierarchical_v2",
    "vibgyor_role_works_v3",
    "vibgyor_role_works_feed_v3",
    "student-homework-clear-flag",
    "student-homework-all-data-cleared-v1",
  ];
  keysToClear.forEach((k) => {
    if (k) localStorage.removeItem(k);
  });
  // Also clear any persisted current user
  localStorage.removeItem("currentUser");
  localStorage.setItem(WIPE_FLAG, "1");
  // Reload page to reflect cleared state
  location.reload();
}

// Call the wipe function early
wipeAllDataOnce();

let groups = loadGroups();
let tasks = loadTasks();
let stats = loadStats();
let exams = loadExams();
let parents = loadParents();
let parentTeacherMessages = loadParentTeacherMessages();
let timetable = loadTimetable();
let announcements = loadAnnouncements();
let notes = loadNotes();
let notifications = loadNotifications();
let selectedQuickType = "";
let selectedGroupId = "";
currentUser = loadCurrentUser();
let currentRole = currentUser?.role || "Principal";
let authMode = "login";
refreshStreakIfBroken();
renderTasks();
renderGroups();
renderExams();
renderParents();
renderParentNotifications();
renderParentMessages();
renderStats();
renderDashboard();
renderTimetable();
renderAnnouncements();
renderNotes();
renderNotifications();
initRoleWorksHub();

if (addTaskBtn) addTaskBtn.addEventListener("click", addTaskFromInput);
quickAddBtns.forEach((button) => {
  button.addEventListener("click", () => {
    const clickedType = button.dataset.quickType || "";
    selectedQuickType = selectedQuickType === clickedType ? "" : clickedType;
    updateQuickAddSelection();
  });
});
if (homeworkInput) {
  homeworkInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addTaskFromInput();
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("input", handleSearchInput);
}
filterBtns.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter || "all";
    filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });
    renderTasks();
  });
});

if (clearGroupFilterBtn) {
  clearGroupFilterBtn.addEventListener("click", () => {
    clearGroupFilter();
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", login);
}

document.querySelectorAll(".demo-login-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const username = button.dataset.username || "";
    const password = button.dataset.password || "";
    if (usernameInput) usernameInput.value = username;
    if (passwordInput) passwordInput.value = password;
    if (loginError) loginError.textContent = "";
    updateRoleDisplay();
    usernameInput?.focus();
  });
});

if (usernameInput) {
  usernameInput.addEventListener("input", updateRoleDisplay);
}

if (signupRoleSelect) {
  signupRoleSelect.addEventListener("change", updateRoleDisplay);
}

if (logoutBtn) {
  const logoutOverlay   = document.getElementById('logoutOverlay');
  const logoutCancelBtn = document.getElementById('logoutCancelBtn');
  const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');

  logoutBtn.addEventListener('click', () => {
    if (logoutOverlay) logoutOverlay.classList.remove('hidden');
  });

  if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', () => {
      if (logoutOverlay) logoutOverlay.classList.add('hidden');
    });
  }

  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', () => {
      if (logoutOverlay) logoutOverlay.classList.add('hidden');
      logout();
    });
  }

  // Close on backdrop click
  if (logoutOverlay) {
    logoutOverlay.addEventListener('click', (e) => {
      if (e.target === logoutOverlay) logoutOverlay.classList.add('hidden');
    });
  }
}

if (notificationBtn) {
  notificationBtn.addEventListener("click", () => {
    if (notificationPanel) {
      notificationPanel.classList.toggle("hidden");
      if (!notificationPanel.classList.contains("hidden")) {
        markNotificationsRead();
      }
    }
  });
}

if (closeNotificationPanelBtn) {
  closeNotificationPanelBtn.addEventListener("click", () => {
    if (notificationPanel) notificationPanel.classList.add("hidden");
  });
}

if (clearNotificationsBtn) {
  clearNotificationsBtn.addEventListener("click", () => {
    notifications = [];
    saveNotifications();
    renderNotifications();
    updateNotificationBadge();
  });
}

const backToLaunchpadBtn = document.getElementById("backToLaunchpadBtn");
if (backToLaunchpadBtn) 
  backToLaunchpadBtn.addEventListener("click", () => {
    switchTab("launchpad");
  });

if (principalSearchInput) {
  principalSearchInput.addEventListener("input", handlePrincipalSearchInput);
}

if (principalFilterSelect) {
  principalFilterSelect.addEventListener("change", handlePrincipalFilterChange);
}

if (examFileInput) {
  examFileInput.addEventListener("change", handleExamFileUpload);
}
if (sendChatBtn) {
  sendChatBtn.addEventListener("click", sendGroupChatMessage);
}
if (chatInput) {
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendGroupChatMessage();
    }
  });
}

if (groupCallBtn) {
  groupCallBtn.addEventListener("click", callGroup);
}
if (openGroupInfoBtn) {
  openGroupInfoBtn.addEventListener("click", openGroupInfoModal);
}

if (groupSearchInput) {
  groupSearchInput.addEventListener("input", (event) => {
    groupSearchQuery = event.target.value.trim().toLowerCase();
    renderGroups();
  });
}

if (closeGroupDetailsBtn) {
  closeGroupDetailsBtn.addEventListener("click", () => {
    if (groupDetailsCard) groupDetailsCard.classList.add("hidden");
  });
}

if (chatGroupTitle) {
  chatGroupTitle.addEventListener("click", () => {
    const group = groups.find((item) => item.id === selectedGroupId);
    if (!group) return;
    openGroupInfoModal();
  });
}

if (closeGroupInfoBtn) {
  closeGroupInfoBtn.addEventListener("click", closeGroupInfoModal);
}

if (groupInfoModal) {
  groupInfoModal.addEventListener("click", (event) => {
    if (event.target === groupInfoModal) {
      closeGroupInfoModal();
    }
  });
}

if (openAddParticipantsBtn) {
  openAddParticipantsBtn.addEventListener("click", () => {
    if (!addParticipantsPanel) return;
    addParticipantsPanel.classList.remove("hidden");
    renderContactsPicker();
  });
}

if (closeAddParticipantsBtn) {
  closeAddParticipantsBtn.addEventListener("click", () => {
    if (addParticipantsPanel) addParticipantsPanel.classList.add("hidden");
  });
}

if (addSelectedParticipantsBtn) {
  addSelectedParticipantsBtn.addEventListener("click", addSelectedParticipantsToGroup);
}

if (groupInfoCallBtn) {
  groupInfoCallBtn.addEventListener("click", callGroup);
}

if (showTeacherMessageBtn) {
  showTeacherMessageBtn.addEventListener("click", () => {
    if (!teacherMessagePanel) return;
    teacherMessagePanel.classList.toggle("hidden");
  });
}
if (sendParentMessageBtn) {
  sendParentMessageBtn.addEventListener("click", sendParentTeacherMessage);
}
if (teacherCallBtn) {
  teacherCallBtn.addEventListener("click", () => {
    const child = getChildInfoForParent(currentUser);
    if (!child) return;
    const users = loadAllUsers();
    const teacher = users.find(u => u.role === "Teacher" && (u.assignedClasses || []).some(ac => classesEqual(ac, child.classSection)));
    if (teacher && teacher.phone) {
      window.location.href = `tel:${formatTelHref(teacher.phone)}`;
    } else {
      window.alert("No phone number available for the teacher.");
    }
  });
}

if (saveEditTaskBtn) {
  saveEditTaskBtn.addEventListener("click", saveTaskEdit);
}
if (cancelEditTaskBtn) {
  cancelEditTaskBtn.addEventListener("click", closeTaskEditModal);
}
if (editTaskModal) {
  editTaskModal.addEventListener("click", (event) => {
    if (event.target === editTaskModal) {
      closeTaskEditModal();
    }
  });
}

if (addGroupBtn) {
  addGroupBtn.addEventListener("click", addGroup);
}
if (addParentBtn) {
  addParentBtn.addEventListener("click", addParent);
}
if (addExamBtn) {
  addExamBtn.addEventListener("click", addExam);
}
if (addAnnouncementBtn) {
  addAnnouncementBtn.addEventListener("click", addAnnouncement);
}
if (addNoteBtn) {
  addNoteBtn.addEventListener("click", addNote);
}

const createUserBtn = document.getElementById("createUserBtn");
if (createUserBtn) {
  createUserBtn.addEventListener("click", handleUserFormSubmit);
}

// User Management Event Listeners
document.querySelectorAll(".um-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".um-tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    adminUserRoleFilter = btn.dataset.role || "all";
    umCurrentPage = 1;
    renderUsers();
  });
});

const umSearchInput = document.getElementById("umSearchInput");
if (umSearchInput) {
  umSearchInput.addEventListener("input", (e) => {
    umSearchQuery = e.target.value.trim();
    umCurrentPage = 1;
    renderUsers();
  });
}

const umAddNewUserBtn = document.getElementById("umAddNewUserBtn");
if (umAddNewUserBtn) {
  umAddNewUserBtn.addEventListener("click", () => {
    resetUserForm();
    openUserModal();
  });
}

const umResetFormBtn = document.getElementById("umResetFormBtn");
if (umResetFormBtn) {
  umResetFormBtn.addEventListener("click", () => {
    resetUserForm();
  });
}

const umCloseModalBtn = document.getElementById("umCloseModalBtn");
if (umCloseModalBtn) {
  umCloseModalBtn.addEventListener("click", () => {
    closeUserModal();
  });
}

const umCancelModalBtn = document.getElementById("umCancelModalBtn");
if (umCancelModalBtn) {
  umCancelModalBtn.addEventListener("click", () => {
    closeUserModal();
  });
}

const umUserModal = document.getElementById("umUserModal");
if (umUserModal) {
  umUserModal.addEventListener("click", (e) => {
    if (e.target === umUserModal) {
      closeUserModal();
    }
  });
}

document.querySelectorAll(".admin-subnav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    switchAdminPanel(button.dataset.adminPanel);
  });
});

document.querySelectorAll(".admin-user-filter").forEach((button) => {
  button.addEventListener("click", () => {
    setAdminUserFilter(button.dataset.role);
  });
});

document.querySelectorAll(".admin-goto-btn").forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.gotoTab);
  });
});

const appSidebar = document.querySelector(".app-sidebar");
const sidebarHamburger = document.querySelector(".sidebar-hamburger");

if (sidebarHamburger && appSidebar) {
  sidebarHamburger.addEventListener("click", (event) => {
    event.stopPropagation();
    appSidebar.classList.toggle("sidebar-open");
  });
}

document.addEventListener("click", (event) => {
  if (!appSidebar?.classList.contains("sidebar-open")) return;
  if (appSidebar.contains(event.target)) return;
  appSidebar.classList.remove("sidebar-open");
});

function handleSearchInput(event) {
  searchQuery = event.target.value.trim().toLowerCase();
  renderTasks();
}

function initSplashScreen() {
  console.log("Initializing Vibgyor Splash Screen...");
  const splashScreen = document.getElementById("splashScreen");
  const splashTitle = document.getElementById("splashTitle");

  if (!splashScreen || !splashTitle) {
    console.error("Splash screen elements not found:", { splashScreen, splashTitle });
    return;
  }

  splashScreen.classList.remove("hidden", "fade-out");

  const fullText = "VIBGYOR Group of Schools";
  splashTitle.innerHTML = "";

  fullText.split("").forEach((char, index) => {
    const span = document.createElement("span");
    
    if (char === " ") {
      span.classList.add("splash-space");
    } else {
      span.textContent = char;
      span.classList.add("splash-letter");
      
      // First 7 characters ("VIBGYOR") get the rainbow colors
      if (index < 7) {
        span.classList.add("letter-" + char.toLowerCase());
      } else {
        // Remaining characters (" Group of Schools") get the premium white glow
        span.classList.add("splash-letter-white");
      }

      // Stagger start after logo animation (0.8s) with 0.08s steps
      const delay = 0.8 + index * 0.08;
      span.style.animationDelay = delay + "s";

      // Mark as typed to start breathing glow once active
      setTimeout(() => {
        span.classList.add("typed");
      }, (delay + 0.6) * 1000);
    }
    
    splashTitle.appendChild(span);
  });

  console.log("Vibgyor Splash Screen letters appended.");

  // Start fade out at 4.7 seconds (so the completed text is fully visible for exactly 2.0 seconds)
  setTimeout(() => {
    splashScreen.classList.add("fade-out");
  }, 4700);

  // Mark hidden (display: none) at 7.0 seconds (for a total page lifecycle of 7.0s)
  setTimeout(() => {
    splashScreen.classList.add("hidden");
  }, 7000);
}

function startIndianTimeWidget() {
  const widget = document.getElementById('indianTimeWidget');
  if (!widget) return;
  const update = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
    widget.textContent = timeStr;
  };
  update();
  setInterval(update, 1000);
}

function startLiveClock() {
  const update = () => {
    const clockText1 = document.getElementById('liveClockText');
    const widgetTime = document.getElementById('widgetTime');
    const widgetDate = document.getElementById('widgetDate');
    
    if (!clockText1 && !widgetTime) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    if (clockText1) clockText1.textContent = timeStr;
    if (widgetTime) widgetTime.textContent = timeStr;
    if (widgetDate) widgetDate.textContent = dateStr;
  };
  update();
  setInterval(update, 1000);
}

// Call the widget initializer within app init
function initializeApp() {
  // Existing initialization code (unchanged) ...
  startIndianTimeWidget();
  startLiveClock();
  initAcademicReportListeners();
  updateRoleUI();
  if (currentUser) {
    loadUserData();
    renderUsers();
    showApp();
    switchTab("dashboard");
  } else {
    showLoginPage("login");
  }
}


initializeApp();

function updateRoleUI() {
  const isStudent = currentRole === "Student";
  const isTeacher = currentRole === "Teacher";
  const isParent = currentRole === "Parent";
  const isPrincipal = currentRole === "Principal";
  const isAdmin = isPrincipal || currentRole === "Staff";
  const roleHint = document.getElementById("roleHint");

  if (welcomeMessage) {
    welcomeMessage.textContent = currentUser?.displayName
      ? `Welcome, ${currentUser.displayName}!`
      : "Welcome to your dashboard";
  }

  if (currentRoleBadge) {
    currentRoleBadge.textContent = `Role: ${currentRole}`;
  }

  if (currentClassBadge) {
    const userClass = getUserClass(currentUser);
    currentClassBadge.textContent = `Class: ${Array.isArray(userClass) ? userClass.join(", ") : userClass || "N/A"}`;
  }

  if (roleHint) {
    roleHint.textContent = isStudent
      ? "View tasks, groups, and exams."
      : isTeacher
      ? "Create tasks, groups, and manage content."
      : isParent
      ? "View your child’s class progress and announcements."
      : "Manage users and system settings.";
  }

  const showGroupsTab = true;
  const showExamTab = true;
  const showAdminTab = isAdmin;
  const canAccessFees = isAdmin || isParent;

  tabButtons.forEach((button) => {
    const tab = button.dataset.tab;
    button.style.display =
      tab === "launchpad" ||
      tab === "home" ||
      tab === "tasks" ||
      tab === "dashboard" ||
      tab === "timetable" ||
      tab === "announcements" ||
      tab === "notes" ||
      tab === "reports" ||
      (tab === "fees" && canAccessFees) ||
      (tab === "groups" && showGroupsTab) ||
      (tab === "exam" && showExamTab) ||
      (tab === "admin" && showAdminTab)
        ? "inline-flex"
        : "none";
  });

  document.querySelectorAll(".nav-section-label.admin-only").forEach((label) => {
    label.style.display = showAdminTab ? "block" : "none";
  });

  const inputCard = document.querySelector(".input-card");
  const groupForm = document.querySelector(".group-form");
  const examForm = document.querySelector(".exam-form");
  const parentForm = document.querySelector(".parent-form");
  const principalPanel = document.getElementById("principalDashboardPanel");
  const parentDashboardPanel = document.querySelector(".parent-dashboard-panel");
  const studentStatsGroup = document.querySelector(".student-stats-group");
  const homeFormSide = document.querySelector(".home-split .content-split-side");
  const examFormSide = document.querySelector("#examSection .content-split-side");
  const announcementFormSide = document.querySelector("#announcementsSection .content-split-side");
  const pointsChip = totalPointsEl?.closest(".stat-chip");
  const streakChip = streakCountEl?.closest(".stat-chip");
  const canManageContent = isTeacher || isAdmin;

  if (inputCard) {
    inputCard.style.display = canManageContent ? "block" : "none";
  }
  if (homeFormSide) {
    homeFormSide.style.display = canManageContent ? "block" : "none";
  }
  if (examFormSide) {
    examFormSide.style.display = canManageContent ? "block" : "none";
  }
  if (announcementFormSide) {
    announcementFormSide.style.display = canManageContent ? "block" : "none";
  }
  document.querySelectorAll(".content-split").forEach((split) => {
    const side = split.querySelector(".content-split-side");
    split.classList.toggle("content-split-single", !side || side.style.display === "none");
  });
  if (groupForm) {
    groupForm.style.display = isTeacher || isAdmin ? "grid" : "none";
  }
  if (examForm) {
    examForm.style.display = isTeacher || isAdmin ? "grid" : "none";
  }
  const announcementForm = document.querySelector(".announcement-form");
  if (announcementForm) {
    announcementForm.style.display = isTeacher || isAdmin ? "grid" : "none";
  }
  if (principalPanel) {
    principalPanel.style.display = isAdmin ? "block" : "none";
  }
  if (parentForm) {
    parentForm.style.display = isAdmin ? "grid" : "none";
  }
  if (parentDashboardPanel) {
    parentDashboardPanel.classList.toggle("hidden", !isParent);
  }
  if (parentTeacherContact) {
    parentTeacherContact.style.display = isParent ? "grid" : "none";
  }
  if (parentNotificationsCard) {
    parentNotificationsCard.style.display = isParent ? "grid" : "none";
  }
  if (isParent) {
    const child = getChildInfoForParent(currentUser);
    if (child) {
      const users = loadAllUsers();
      const teacher = users.find(u => u.role === "Teacher" && (u.assignedClasses || []).some(ac => classesEqual(ac, child.classSection)));
      if (teacher) {
        if (teacherNameEl) teacherNameEl.textContent = teacher.displayName || teacher.username;
        if (teacherEmailEl) teacherEmailEl.textContent = teacher.email || "No email available";
      } else {
        if (teacherNameEl) teacherNameEl.textContent = "No teacher assigned";
        if (teacherEmailEl) teacherEmailEl.textContent = "—";
      }
    }
  }
  if (pointsChip) {
    pointsChip.style.display = isStudent ? "block" : "none";
  }
  if (streakChip) {
    streakChip.style.display = isStudent ? "block" : "none";
  }
  if (rewardBanner) {
    rewardBanner.style.display = isStudent ? "block" : "none";
  }
  if (studentStatsGroup) {
    studentStatsGroup.style.display = isStudent ? "grid" : "none";
  }
  const statsRow = document.querySelector(".stats-row-organized");
  if (statsRow) {
    statsRow.classList.toggle("stats-row-single", !isStudent);
  }
  const groupCreateBlock = document.querySelector(".groups-nav-create");
  if (groupCreateBlock) {
    groupCreateBlock.style.display = canManageContent ? "grid" : "none";
  }
  if (parentOverviewCard) {
    parentOverviewCard.style.display = isParent ? "grid" : "none";
  }

  const activeTab = currentTab || "launchpad";
  if (activeTab === "groups" && !showGroupsTab) {
    switchTab("dashboard");
  } else if (activeTab === "exam" && !showExamTab) {
    switchTab(showGroupsTab ? "groups" : "home");
  } else if (activeTab === "admin" && !showAdminTab) {
    switchTab("dashboard");
  }
  renderGroupDetails();
}

function showLoginPage(mode = "login") {
  authMode = mode;
  if (appContainer) appContainer.classList.add("hidden");
  if (loginPage) loginPage.classList.remove("hidden");
  if (loginError) loginError.textContent = "";
  if (loginPage) {
    loginPage.classList.toggle("login-mode", mode === "login");
    loginPage.classList.toggle("signup-mode", mode === "signup");
  }

  const loginTitle = document.querySelector(".login-card h2");
  const submitBtn = loginForm?.querySelector("button[type='submit']");
  const loginNote = document.querySelector(".login-note");

  if (loginTitle) {
    loginTitle.textContent = "Login to Vibgyor";
  }
  if (submitBtn) {
    submitBtn.textContent = "Sign In";
  }
  if (loginNote) {
    loginNote.textContent = "Use your Vibgyor username, email, or password. Demo accounts are listed below.";
  }
  if (signupRoleWrapper) {
    signupRoleWrapper.classList.toggle("hidden", mode !== "signup");
  }
  if (usernameInput) {
    usernameInput.placeholder = "Enter your username";
  }
  if (roleDisplay) {
    roleDisplay.textContent = mode === "signup" ? `Selected role: ${signupRoleSelect?.value || "Student"}` : "Role will appear here";
  }
  if (welcomeMessage && currentUser) {
    welcomeMessage.textContent = `Welcome, ${getDisplayName(currentUser.username)}!`;
  }
  authMode = mode;
  if (usernameInput) {
    updateRoleDisplay();
  }
}

function showApp() {
  if (loginPage) loginPage.classList.add("hidden");
  if (appContainer) appContainer.classList.remove("hidden");
}

function getDisplayName(username) {
  const raw = username.trim();
  if (!raw) return "Guest";
  const namePart = raw.includes("@") ? raw.split("@")[0] : raw;
  return namePart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getGroupInitials(name) {
  if (!name) return "G";
  const parts = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0].toUpperCase());
  return parts.join("") || name.slice(0, 1).toUpperCase();
}

function formatTimeLabel(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function deriveRoleFromUsername(username) {
  const localPart = username.split("@")[0].toLowerCase();
  const roleMap = {
    staff: "Staff",
    admin: "Principal",
    principal: "Principal",
  };
  return roleMap[localPart] || "Staff";
}

function findUserByCredentials(users, loginValue, password) {
  const normalizedLogin = String(loginValue || "").toLowerCase().trim();
  const normalizedPassword = String(password || "").trim();
  if (!normalizedLogin || !normalizedPassword) return null;

  // 1. Exact match with password
  let found = users.find((u) => {
    const storedUsername = String(u.username || "").toLowerCase().trim();
    const storedEmail = String(u.email || "").toLowerCase().trim();
    const storedPhone = String(u.phone || "").replace(/\s+/g, "").toLowerCase().trim();
    const storedDisplayName = String(u.displayName || "").toLowerCase().trim();
    const cleanLoginPhone = normalizedLogin.replace(/\s+/g, "");

    return (
      (storedUsername === normalizedLogin ||
        storedEmail === normalizedLogin ||
        (storedPhone && storedPhone === cleanLoginPhone) ||
        storedDisplayName === normalizedLogin) &&
      String(u.password || "").trim() === normalizedPassword
    );
  });
  return found || null;
}

function login(event) {
  event.preventDefault();
  try {
    const username = usernameInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";

    if (!username || !password) {
      if (loginError) {
        loginError.textContent = "Please enter both username and password.";
      }
      return;
    }

    const users = loadAllUsers();
    const user = findUserByCredentials(users, username, password);

    if (!user) {
      if (loginError) {
        loginError.textContent = "Invalid username, email, or password. Please use one of the demo accounts shown below.";
      }
      console.error("Login failed: User not found for username:", username);
      return;
    }

    currentUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      classSection: user.classSection,
      assignedClasses: user.assignedClasses,
      linkedStudentId: user.linkedStudentId,
    };
    saveCurrentUser(currentUser);
    currentRole = currentUser.role;

    if (loginError) loginError.textContent = "";
    if (loginForm) loginForm.reset();

    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${currentUser.displayName}!`;
    }
    updateRoleUI();
    if (currentRoleBadge) {
      currentRoleBadge.textContent = `Role: ${currentRole}`;
    }
    if (currentClassBadge) {
      const userClass = getUserClass(currentUser);
      currentClassBadge.textContent = `Class: ${Array.isArray(userClass) ? userClass.join(', ') : userClass || 'N/A'}`;
    }

    // Load only accessible data based on role and class
    loadUserData();
    showApp();
    switchTab("dashboard");
    console.log("Login successful for:", currentUser.displayName);
  } catch (error) {
    console.error("Login error:", error);
    if (loginError) {
      loginError.textContent = "An error occurred during login. Please try again.";
    }
  }
}

function loadUserData() {
  if (!currentUser) return;

  // Populate selects
  populateGroupSelect();
  populateClassSelect();
  populateGroupClassSelect();
  populateExamClassSelect();
  populateAnnouncementClassSelect();

  // Render all sections with filtered data
  renderTasks();
  renderGroups();
  renderParents();
  renderExams();
  renderDashboard();
  renderParentOverview();
  renderTimetable();
  renderAnnouncements();
  renderNotes();
  renderStats();
  if (currentUser.role === "Principal" || currentUser.role === "Staff") {
    renderUsers();
  }
}

function getChildrenForParent(user) {
  if (!user || user.role !== "Parent") return [];
  const users = loadAllUsers();
  const linkedIds = Array.isArray(user.linkedStudentIds) && user.linkedStudentIds.length > 0
    ? user.linkedStudentIds
    : (user.linkedStudentId ? [user.linkedStudentId] : []);
  return users.filter(u => u.role === "Student" && linkedIds.includes(u.id));
}

function getChildInfoForParent(user) {
  const children = getChildrenForParent(user);
  return children.length > 0 ? children[0] : null;
}

function getUserClass(user) {
  if (!user) return null;
  if (user.role === "Parent") {
    const child = getChildInfoForParent(user);
    return child ? child.classSection : user.classSection;
  }
  if (user.role === "Student") {
    return user.classSection;
  }
  if (user.role === "Teacher") {
    return user.assignedClasses || [];
  }
  if (user.role === "Principal" || user.role === "Staff" || user.role === "Admin") {
    return "All";
  }
  return user.classSection || null;
}

function renderParentOverview() {
  if (!parentOverviewCard || !parentChildName || !parentChildClass) return;
  const child = getChildInfoForParent(currentUser);
  if (!child) {
    parentOverviewCard.style.display = "none";
    return;
  }
  parentChildName.textContent = child.displayName || "Your child";
  parentChildClass.textContent = `Class: ${child.classSection || "N/A"}`;
  parentOverviewCard.style.display = "grid";
}

function handlePrincipalSearchInput(event) {
  dashboardSearchQuery = event.target.value.trim().toLowerCase();
  renderDashboard();
}

function handlePrincipalFilterChange(event) {
  dashboardClassFilter = event.target.value;
  renderDashboard();
}

function matchDashboardSearch(item, search) {
  if (!search) return true;
  const content = [item.name, item.subject, item.text, item.classSection, item.groupName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return content.includes(search);
}

function logout() {
  currentUser = null;
  clearCurrentUserStorage();
  if (loginForm) loginForm.reset();
  if (welcomeMessage) welcomeMessage.textContent = "Welcome to your dashboard";
  showLoginPage();
}

function updateRoleDisplay() {
  if (!roleDisplay || !usernameInput) return;
  const username = usernameInput.value.trim();

  if (!username) {
    roleDisplay.textContent = authMode === "signup" ? `Selected role: ${signupRoleSelect?.value || "Student"}` : "Role will appear here";
    return;
  }

  const displayName = getDisplayName(username);
  if (authMode === "signup") {
    const role = signupRoleSelect?.value || "Student";
    roleDisplay.textContent = `Welcome, ${displayName}! Selected role: ${role}`;
    return;
  }

  roleDisplay.textContent = `Welcome, ${displayName}!`;
}

function loadAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const seed = localStorage.getItem(USERS_SEED_KEY);
    let users = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(users)) users = [];

    // Re-seed demo accounts when credentials change; keep any custom users.
    if (seed !== USERS_SEED_VERSION || !users.length) {
      const defaultIds = new Set(DEFAULT_USERS.map((user) => user.id));
      const customUsers = users.filter((user) => !defaultIds.has(user.id));
      users = [...DEFAULT_USERS.map((user) => ({ ...user })), ...customUsers];
      saveAllUsers(users);
      localStorage.setItem(USERS_SEED_KEY, USERS_SEED_VERSION);
    }

    return users.map(normalizeUser);
  } catch {
    saveAllUsers(DEFAULT_USERS);
    localStorage.setItem(USERS_SEED_KEY, USERS_SEED_VERSION);
    return DEFAULT_USERS.map(normalizeUser);
  }
}

// State for User Management Module (variables declared at top near line 654)

function normalizeUser(user) {
  let linkedStudentIds = [];
  if (Array.isArray(user.linkedStudentIds)) {
    linkedStudentIds = user.linkedStudentIds.map((id) => String(id).trim()).filter(Boolean);
  } else if (user.linkedStudentId) {
    linkedStudentIds = [String(user.linkedStudentId).trim()];
  }
  return {
    ...user,
    email: String(user.email || "").trim(),
    phone: String(user.phone || "").trim(),
    status: String(user.status || "Active").trim(),
    classSection: String(user.classSection || "").trim(),
    assignedClasses: Array.isArray(user.assignedClasses)
      ? user.assignedClasses.map((item) => String(item || "").trim()).filter(Boolean)
      : typeof user.assignedClasses === "string"
      ? String(user.assignedClasses)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    linkedStudentId: String(user.linkedStudentId || (linkedStudentIds[0] || "")).trim(),
    linkedStudentIds: linkedStudentIds,
  };
}

function saveAllUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

function handleRoleChangeInModal(roleVal) {
  const gradeGroup = document.getElementById("umGradeGroup");
  const sectionGroup = document.getElementById("umSectionGroup");
  if (roleVal === "Student" || roleVal === "Teacher") {
    if (gradeGroup) gradeGroup.classList.remove("hidden");
    if (sectionGroup) sectionGroup.classList.remove("hidden");
  } else {
    if (gradeGroup) gradeGroup.classList.add("hidden");
    if (sectionGroup) sectionGroup.classList.add("hidden");
  }
}

function addNewUser(username, password, role, email, phone, displayName, status = "Active", grade = "Grade 8", section = "Section A", classSection = "8A") {
  if (!username || !password || !role || !displayName) return null;
  const users = loadAllUsers();
  if (users.find((u) => u.username === username)) return null;

  const shortClass = classSection && !String(classSection).includes("Grade")
    ? normalizeClassKey(classSection)
    : toShortClassSection(grade, section) || normalizeClassKey(classSection) || "8A";
  const parsed = parseClassSection(shortClass);

  const newUser = {
    id: `${role.toLowerCase()}-${Date.now()}`,
    username,
    password,
    role,
    email: email || "",
    phone: phone || "",
    status: status || "Active",
    displayName,
    grade: parsed?.grade || grade,
    section: parsed?.section || section,
    classSection: shortClass,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveAllUsers(users);
  return newUser;
}

function deleteUser(userId) {
  let users = loadAllUsers();
  users = users.filter((u) => u.id !== userId);
  saveAllUsers(users);
}

function updateUserPassword(userId, newPassword) {
  const users = loadAllUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.password = newPassword;
    saveAllUsers(users);
    return true;
  }
  return false;
}

function updateUser(userId, updates) {
  const users = loadAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      user[key] = updates[key];
    }
  });
  saveAllUsers(users);
  return true;
}

function deleteUserAccount(userId) {
  if (currentUser?.id === userId) {
    alert("You cannot delete your own active account.");
    return;
  }
  if (!confirm("Delete this user account permanently?")) {
    return;
  }
  deleteUser(userId);
  renderUsers();
}

function editUser(userId) {
  const users = loadAllUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  const editingIdInput = document.getElementById("umEditingUserId");
  const formTitle = document.getElementById("umFormTitle");
  const formSubtitle = document.getElementById("umFormSubtitle");
  const submitBtnText = document.getElementById("umSubmitBtnText");
  const usernameInput = document.getElementById("newUsername");
  const passwordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("newConfirmPassword");
  const displayNameInput = document.getElementById("newDisplayName");
  const emailInput = document.getElementById("newEmail");
  const roleSelect = document.getElementById("newRole");
  const gradeSelect = document.getElementById("newGrade");
  const sectionSelect = document.getElementById("newSection");
  const statusSelect = document.getElementById("newStatus");

  if (editingIdInput) editingIdInput.value = user.id;
  if (formTitle) formTitle.textContent = "Edit User";
  if (formSubtitle) formSubtitle.textContent = `Update details for ${user.displayName}`;
  if (submitBtnText) submitBtnText.textContent = "Save Changes";

  if (usernameInput) usernameInput.value = user.username;
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.placeholder = "Leave blank to keep current";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
    confirmPasswordInput.placeholder = "Leave blank to keep current";
  }
  if (displayNameInput) displayNameInput.value = user.displayName;
  if (emailInput) {
    emailInput.value = user.email || user.phone || "";
  }
  if (roleSelect) {
    roleSelect.value = user.role;
    handleRoleChangeInModal(user.role);
  }
  if (gradeSelect && user.grade) gradeSelect.value = user.grade;
  if (sectionSelect && user.section) sectionSelect.value = user.section;
  if (statusSelect) statusSelect.value = user.status || "Active";

  openUserModal();
}

function openUserModal() {
  const modal = document.getElementById("umUserModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeUserModal() {
  const modal = document.getElementById("umUserModal");
  if (modal) {
    modal.classList.add("hidden");
  }
  resetUserForm();
}

function resetUserForm() {
  const editingIdInput = document.getElementById("umEditingUserId");
  const formTitle = document.getElementById("umFormTitle");
  const formSubtitle = document.getElementById("umFormSubtitle");
  const submitBtnText = document.getElementById("umSubmitBtnText");
  const usernameInput = document.getElementById("newUsername");
  const passwordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("newConfirmPassword");
  const displayNameInput = document.getElementById("newDisplayName");
  const emailInput = document.getElementById("newEmail");
  const phoneInput = document.getElementById("newPhone");
  const roleSelect = document.getElementById("newRole");
  const gradeSelect = document.getElementById("newGrade");
  const sectionSelect = document.getElementById("newSection");
  const statusSelect = document.getElementById("newStatus");

  if (editingIdInput) editingIdInput.value = "";
  if (formTitle) formTitle.textContent = "Create New User";
  if (formSubtitle) formSubtitle.textContent = "Add a new user to the system";
  if (submitBtnText) submitBtnText.textContent = "Create User";

  if (usernameInput) usernameInput.value = "";
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.placeholder = "Enter password";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
    confirmPasswordInput.placeholder = "Confirm password";
  }
  if (displayNameInput) displayNameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (roleSelect) {
    roleSelect.value = "";
    handleRoleChangeInModal("");
  }
  if (gradeSelect) gradeSelect.value = "Grade 8";
  if (sectionSelect) sectionSelect.value = "Section A";

  if (roleSelect) roleSelect.value = "";
  if (statusSelect) statusSelect.value = "Active";
}

function getUserInitials(displayName, username) {
  const name = (displayName || username || "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function resetUserPassword(userId) {
  const newPassword = prompt("Reset password for this user:", "");
  if (newPassword === null || newPassword.trim().length < 5) {
    alert("Password reset cancelled or too short (min 5 chars).");
    return;
  }
  if (updateUserPassword(userId, newPassword.trim())) {
    alert("Password updated successfully.");
  }
}

function renderUsers() {
  const allUsers = loadAllUsers();

  // Update Stat counters
  const statTotal = document.getElementById("umStatTotal");
  const statStudents = document.getElementById("umStatStudents");
  const statTeachers = document.getElementById("umStatTeachers");
  const statParents = document.getElementById("umStatParents");
  const statStaff = document.getElementById("umStatStaff");

  if (statTotal) statTotal.textContent = String(allUsers.length);
  if (statStudents) statStudents.textContent = String(allUsers.filter((u) => u.role === "Student").length);
  if (statTeachers) statTeachers.textContent = String(allUsers.filter((u) => u.role === "Teacher").length);
  if (statParents) statParents.textContent = String(allUsers.filter((u) => u.role === "Parent").length);
  if (statStaff) statStaff.textContent = String(allUsers.filter((u) => u.role === "Staff").length);

  renderUsersInto("usersList", adminUserRoleFilter === "all" ? null : adminUserRoleFilter);
  document.querySelectorAll(".admin-role-users-list").forEach((container) => {
    renderUsersInto(container.id, container.dataset.role || null);
  });
}

function renderUsersInto(containerId, roleFilter) {
  const usersListContainer = document.getElementById(containerId);
  if (!usersListContainer) return;

  let users = loadAllUsers();

  // Role Filter
  if (roleFilter) {
    users = users.filter((user) => user.role === roleFilter);
  }

  // Search Filter
  if (umSearchQuery && containerId === "usersList") {
    const q = umSearchQuery.toLowerCase();
    users = users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (umSortColumn && containerId === "usersList") {
    users.sort((a, b) => {
      let valA = (a[umSortColumn] || "").toString().toLowerCase();
      let valB = (b[umSortColumn] || "").toString().toLowerCase();
      if (valA < valB) return umSortAsc ? -1 : 1;
      if (valA > valB) return umSortAsc ? 1 : -1;
      return 0;
    });
  }

  const totalFilteredCount = users.length;

  // Pagination for main table
  if (containerId === "usersList") {
    const totalPages = Math.ceil(totalFilteredCount / umItemsPerPage) || 1;
    if (umCurrentPage > totalPages) umCurrentPage = totalPages;
    if (umCurrentPage < 1) umCurrentPage = 1;

    const startIndex = (umCurrentPage - 1) * umItemsPerPage;
    const endIndex = Math.min(startIndex + umItemsPerPage, totalFilteredCount);
    users = users.slice(startIndex, endIndex);

    renderPaginationFooter(totalFilteredCount, startIndex, endIndex, totalPages);
  }

  usersListContainer.innerHTML = "";

  if (!totalFilteredCount) {
    usersListContainer.innerHTML = `
      <div style="padding: 2.5rem 1rem; text-align: center; color: #64748b;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 0.5rem; opacity: 0.5;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p style="margin: 0; font-weight: 600; font-size: 0.9rem;">No users found</p>
        <p style="margin: 0.25rem 0 0; font-size: 0.8rem; color: #94a3b8;">Try adjusting your search or role filter.</p>
      </div>
    `;
    return;
  }

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "um-table-responsive";
  tableWrapper.innerHTML = `
    <table class="um-table">
      <thead>
        <tr>
          <th class="um-sortable" onclick="handleUmSort('username')">
            USER <span class="um-sort-icon">${umSortColumn === 'username' ? (umSortAsc ? '↑' : '↓') : '⇅'}</span>
          </th>
          <th>DISPLAY NAME</th>
          <th>ROLE</th>
          <th class="um-sortable" onclick="handleUmSort('email')">
            EMAIL / MOBILE <span class="um-sort-icon">${umSortColumn === 'email' ? (umSortAsc ? '↑' : '↓') : '⇅'}</span>
          </th>
          <th class="um-sortable" onclick="handleUmSort('status')">
            STATUS <span class="um-sort-icon">${umSortColumn === 'status' ? (umSortAsc ? '↑' : '↓') : '⇅'}</span>
          </th>
          <th style="text-align: right;">ACTIONS</th>
        </tr>
      </thead>
      <tbody id="umTableBody_${containerId}"></tbody>
    </table>
  `;

  usersListContainer.appendChild(tableWrapper);

  const tbody = tableWrapper.querySelector("tbody");

  users.forEach((user) => {
    const initials = getUserInitials(user.displayName, user.username);
    const roleLower = (user.role || "").toLowerCase();
    const statusClass = (user.status || "Active").toLowerCase() === "active" ? "status-active" : "status-inactive";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="um-user-cell">
          <div class="um-avatar avatar-${roleLower}">${initials}</div>
          <span class="um-username">${user.username}</span>
        </div>
      </td>
      <td>
        <span class="um-display-name">${user.displayName}</span>
      </td>
      <td>
        <span class="um-role-badge role-${roleLower}">${user.role}</span>
      </td>
      <td>
        <div class="um-contact-cell">
          <span class="um-contact-email">${user.email || "—"}</span>
          ${user.phone ? `<span class="um-contact-phone">${user.phone}</span>` : ""}
        </div>
      </td>
      <td>
        <span class="um-status-badge ${statusClass}">
          <span class="um-status-dot"></span>
          ${user.status || "Active"}
        </span>
      </td>
      <td>
        <div class="um-actions-cell">
          <button type="button" class="um-action-btn btn-edit" title="Edit User" onclick="editUser('${user.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="um-action-btn btn-delete" title="Delete User" onclick="deleteUserAccount('${user.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPaginationFooter(totalCount, startIdx, endIdx, totalPages) {
  const tableCard = document.querySelector(".um-table-card");
  if (!tableCard) return;

  let footer = tableCard.querySelector(".um-table-footer");
  if (!footer) {
    footer = document.createElement("div");
    footer.className = "um-table-footer";
    tableCard.appendChild(footer);
  }

  const showingStart = totalCount > 0 ? startIdx + 1 : 0;
  const showingEnd = endIdx;

  let pagesHtml = "";

  pagesHtml += `
    <button type="button" class="um-page-btn" ${umCurrentPage <= 1 ? 'disabled' : ''} onclick="changeUmPage(${umCurrentPage - 1})">
      &lt;
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= umCurrentPage - 1 && i <= umCurrentPage + 1)) {
      pagesHtml += `
        <button type="button" class="um-page-btn ${i === umCurrentPage ? 'active' : ''}" onclick="changeUmPage(${i})">
          ${i}
        </button>
      `;
    } else if (i === umCurrentPage - 2 || i === umCurrentPage + 2) {
      pagesHtml += `<span style="font-size: 0.8rem; color: #94a3b8; padding: 0 2px;">...</span>`;
    }
  }

  pagesHtml += `
    <button type="button" class="um-page-btn" ${umCurrentPage >= totalPages ? 'disabled' : ''} onclick="changeUmPage(${umCurrentPage + 1})">
      &gt;
    </button>
  `;

  footer.innerHTML = `
    <div class="um-pagination-info">
      Showing ${showingStart} to ${showingEnd} of ${totalCount} users
    </div>
    <div class="um-pagination-controls">
      ${pagesHtml}
    </div>
  `;
}

function changeUmPage(page) {
  umCurrentPage = page;
  renderUsers();
}

function handleUmSort(col) {
  if (umSortColumn === col) {
    umSortAsc = !umSortAsc;
  } else {
    umSortColumn = col;
    umSortAsc = true;
  }
  renderUsers();
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  btn.innerHTML = isPassword
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
}

function syncStudentToModules(user) {
  if (!user) return;

  // 1. Sync to Attendance
  if (typeof attInit === 'function') {
    attInit();
  }

  // 2. Sync to Groups (add user to group for their class)
  try {
    let allGroups = typeof loadGroups === 'function' ? loadGroups() : [];
    const targetClassSection = normalizeClassKey(user.classSection) || toShortClassSection(user.grade, user.section) || "8A";
    
    let targetGroup = allGroups.find(g => classesEqual(g.classSection, targetClassSection) || (g.name && g.name.toLowerCase().includes(targetClassSection.toLowerCase())));
    
    if (!targetGroup) {
      targetGroup = {
        id: `group_${Date.now()}`,
        name: `${targetClassSection} Group`,
        description: `Official group for ${targetClassSection} students and staff`,
        classSection: targetClassSection,
        members: [],
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: "system",
            senderName: "System",
            text: `Welcome to the official ${targetClassSection} group!`,
            createdAt: new Date().toISOString()
          }
        ]
      };
      allGroups.push(targetGroup);
    }

    const isMember = (targetGroup.members || []).some(m => m.id === user.id || m.name?.toLowerCase() === (user.displayName || user.username).toLowerCase());
    if (!isMember) {
      if (!targetGroup.members) targetGroup.members = [];
      targetGroup.members.push({
        id: user.id,
        name: user.displayName || user.username,
        email: user.email || `${user.username}@vibgyor.edu.in`,
        role: user.role,
        isAdmin: false
      });
    }

    groups = allGroups;
    if (typeof saveGroups === 'function') saveGroups();
    if (typeof renderGroups === 'function') renderGroups();
  } catch (err) {
    console.error("Error syncing student to groups:", err);
  }

  // 3. Sync to Fees & Student Roster
  if (user.role === "Student") {
    try {
      const parsed = parseClassSection(user.classSection) || {};
      const uGrade = user.grade || parsed.grade || "Grade 8";
      const uSec = user.section || parsed.section || "Section A";
      const uName = user.displayName || user.username;
      
      if (typeof feesList !== 'undefined') {
        const existingFee = feesList.find(f => {
          const feeName = String(f.studentName || "").toLowerCase();
          return feeName.includes(uName.toLowerCase()) && f.grade === uGrade && f.section === uSec;
        });
        if (!existingFee) {
          feesList.unshift({
            id: `fee_${Date.now()}`,
            grade: uGrade,
            section: uSec,
            studentName: uName,
            studentId: user.id,
            category: "Tuition Fee",
            title: "Academic Fee 2026-2027",
            amount: 12000,
            paidAmount: 0,
            status: "pending",
            dueDate: "2026-10-15",
            session: "2026-2027"
          });
          if (typeof saveFeesData === 'function') saveFeesData(feesList);
          if (typeof renderFees === 'function') renderFees();
        }
      }
    } catch (err) {
      console.error("Error syncing student to fees:", err);
    }
  }

  // 4. Sync User Management view
  if (typeof renderUsers === 'function') {
    renderUsers();
  }
}

function handleUserFormSubmit() {
  const editingId = document.getElementById("umEditingUserId")?.value || "";
  const username = document.getElementById("newUsername")?.value.trim() || "";
  const password = document.getElementById("newPassword")?.value || "";
  const confirmPassword = document.getElementById("newConfirmPassword")?.value || "";
  const displayName = document.getElementById("newDisplayName")?.value.trim() || "";
  const emailOrPhone = document.getElementById("newEmail")?.value.trim() || "";
  const role = document.getElementById("newRole")?.value || "";
  const grade = document.getElementById("newGrade")?.value || "Grade 8";
  const section = document.getElementById("newSection")?.value || "Section A";
  const status = document.getElementById("newStatus")?.value || "Active";

  if (!username || !displayName || !role) {
    alert("Please fill in all required fields (Username, Display Name, Role).");
    return;
  }

  let email = "";
  let phone = "";
  if (emailOrPhone.includes("@")) {
    email = emailOrPhone;
  } else {
    phone = emailOrPhone;
  }

  const classSection = toShortClassSection(grade, section) || "8A";
  const parsedClass = parseClassSection(classSection);

  if (editingId) {
    const updates = {
      username,
      displayName,
      role,
      grade: parsedClass?.grade || grade,
      section: parsedClass?.section || section,
      classSection,
      email,
      phone,
      status,
    };
    if (password) {
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      updates.password = password;
    }
    if (updateUser(editingId, updates)) {
      const updatedUser = loadAllUsers().find(u => u.id === editingId);
      if (updatedUser) syncStudentToModules(updatedUser);
      alert(`User "${displayName}" updated successfully and synced across all modules!`);
      closeUserModal();
      renderUsers();
    } else {
      alert("Failed to update user.");
    }
  } else {
    if (!password) {
      alert("Please enter a password for the new user.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const newUser = addNewUser(username, password, role, email, phone, displayName, status, grade, section, classSection);
    if (newUser) {
      syncStudentToModules(newUser);
      alert(`User "${displayName}" (${role}) created successfully and automatically added to Attendance, Groups, and Student Rosters!`);
      closeUserModal();
      renderUsers();
    } else {
      alert("Failed to create user. Username may already exist.");
    }
  }
}

// --- Forgot Password Recovery Module ---
let forgotMethod = "email"; // "email" or "phone"
let forgotTargetUser = null;
let currentOtpCode = "";
let otpCountdownTimer = null;
let otpTimeLeft = 45;

function openForgotPasswordModal() {
  const modal = document.getElementById("forgotPasswordModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  goToForgotStep(1);
}

function closeForgotPasswordModal() {
  const modal = document.getElementById("forgotPasswordModal");
  if (modal) modal.classList.add("hidden");
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
}

function closeForgotPasswordModalAndFill() {
  closeForgotPasswordModal();
  if (forgotTargetUser && usernameInput) {
    usernameInput.value = forgotTargetUser.email || forgotTargetUser.username;
    if (passwordInput) passwordInput.focus();
  }
}

function switchForgotMethod(method) {
  forgotMethod = method;
  const tabGmail = document.getElementById("tabForgotGmail");
  const tabMobile = document.getElementById("tabForgotMobile");
  const label = document.getElementById("forgotInputLabel");
  const input = document.getElementById("forgotAccountInput");
  const error = document.getElementById("forgotStep1Error");

  if (error) error.textContent = "";

  if (method === "email") {
    if (tabGmail) tabGmail.classList.add("active");
    if (tabMobile) tabMobile.classList.remove("active");
    if (label) label.textContent = "Linked Gmail Address / Username";
    if (input) input.placeholder = "e.g. user@gmail.com or admin.schoolapp@org";
  } else {
    if (tabMobile) tabMobile.classList.add("active");
    if (tabGmail) tabGmail.classList.remove("active");
    if (label) label.textContent = "Registered Mobile Number";
    if (input) input.placeholder = "e.g. +91 9876543210 or 9876543210";
  }
}

function goToForgotStep(stepNumber) {
  document.querySelectorAll(".forgot-step").forEach((step) => step.classList.add("hidden"));
  const stepEl = document.getElementById(`forgotStep${stepNumber}`);
  if (stepEl) stepEl.classList.remove("hidden");
}

function handleForgotLookup(event) {
  event.preventDefault();
  const inputVal = document.getElementById("forgotAccountInput")?.value.trim() || "";
  const errorEl = document.getElementById("forgotStep1Error");
  if (errorEl) errorEl.textContent = "";

  if (!inputVal) {
    if (errorEl) errorEl.textContent = "Please enter your linked Gmail address or mobile number.";
    return;
  }

  const users = loadAllUsers();
  const normalizedInput = inputVal.toLowerCase();
  const cleanPhone = inputVal.replace(/\s+/g, "");

  // Match against email, username, or phone
  const user = users.find((u) => {
    const uEmail = String(u.email || "").toLowerCase();
    const uUsername = String(u.username || "").toLowerCase();
    const uPhone = String(u.phone || "").replace(/\s+/g, "");

    if (forgotMethod === "email") {
      return uEmail === normalizedInput || uUsername === normalizedInput;
    } else {
      return (uPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone))) || uUsername === normalizedInput || uEmail === normalizedInput;
    }
  });

  if (!user) {
    if (errorEl) {
      errorEl.textContent = forgotMethod === "email"
        ? "No account found matching this Gmail address. Please check or contact your administrator."
        : "No account found matching this Mobile number. Please check or contact your administrator.";
    }
    return;
  }

  forgotTargetUser = user;
  sendForgotOtp();
}

function sendForgotOtp() {
  currentOtpCode = String(Math.floor(100000 + Math.random() * 900000));
  
  const recipientNotice = document.getElementById("forgotRecipientNotice");
  const simulatedOtpCodeEl = document.getElementById("simulatedOtpCode");

  if (simulatedOtpCodeEl) simulatedOtpCodeEl.textContent = currentOtpCode;

  if (recipientNotice && forgotTargetUser) {
    if (forgotMethod === "email") {
      const email = forgotTargetUser.email || forgotTargetUser.username;
      recipientNotice.textContent = `We sent a 6-digit OTP verification code to Gmail (${maskContact(email, "email")}).`;
    } else {
      const phone = forgotTargetUser.phone || "+91 9876543210";
      recipientNotice.textContent = `We sent a 6-digit OTP code via SMS to Mobile (${maskContact(phone, "phone")}).`;
    }
  }

  const otpInput = document.getElementById("forgotOtpInput");
  if (otpInput) otpInput.value = currentOtpCode;

  const errorEl = document.getElementById("forgotStep2Error");
  if (errorEl) errorEl.textContent = "";

  startOtpTimer();
  goToForgotStep(2);
}

function maskContact(val, type) {
  if (!val) return "*****";
  if (type === "email" && val.includes("@")) {
    const parts = val.split("@");
    const name = parts[0];
    const maskedName = name.length <= 2 ? name + "***" : name[0] + "***" + name[name.length - 1];
    return maskedName + "@" + parts[1];
  }
  if (val.length >= 7) {
    return val.slice(0, 3) + "****" + val.slice(-3);
  }
  return val;
}

function startOtpTimer() {
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
  otpTimeLeft = 45;
  const countdownEl = document.getElementById("otpCountdown");
  const resendBtn = document.getElementById("resendOtpBtn");
  if (resendBtn) resendBtn.disabled = true;

  otpCountdownTimer = setInterval(() => {
    otpTimeLeft--;
    if (countdownEl) countdownEl.textContent = otpTimeLeft;
    if (otpTimeLeft <= 0) {
      clearInterval(otpCountdownTimer);
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.innerHTML = `Resend OTP`;
      }
    }
  }, 1000);
}

function resendForgotOtp() {
  sendForgotOtp();
}

function handleForgotResetSubmit(event) {
  event.preventDefault();
  const enteredOtp = document.getElementById("forgotOtpInput")?.value.trim() || "";
  const newPass = document.getElementById("forgotNewPassword")?.value || "";
  const confirmPass = document.getElementById("forgotConfirmPassword")?.value || "";
  const errorEl = document.getElementById("forgotStep2Error");

  if (errorEl) errorEl.textContent = "";

  if (enteredOtp !== currentOtpCode) {
    if (errorEl) errorEl.textContent = "Invalid OTP code. Please enter the code sent to your linked Gmail/Mobile.";
    return;
  }

  if (newPass.length < 5) {
    if (errorEl) errorEl.textContent = "Password must be at least 5 characters long.";
    return;
  }

  if (newPass !== confirmPass) {
    if (errorEl) errorEl.textContent = "Passwords do not match. Please re-enter.";
    return;
  }

  if (!forgotTargetUser) {
    if (errorEl) errorEl.textContent = "Session expired. Please restart recovery process.";
    return;
  }

  const success = updateUserPassword(forgotTargetUser.id, newPass);
  if (success) {
    goToForgotStep(3);
  } else {
    if (errorEl) errorEl.textContent = "Failed to update password. Please try again.";
  }
}

function switchAdminPanel(panelId) {
  document.querySelectorAll(".admin-panel").forEach((panel) => {
    const isActive = panel.id === panelId;
    panel.classList.toggle("hidden", !isActive);
    panel.classList.toggle("active", isActive);
  });
  document.querySelectorAll(".admin-subnav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminPanel === panelId);
  });
  if (panelId === "adminPanelReports") {
    renderAdminReports();
  }
  if (panelId === "adminPanelParents") {
    renderParents();
  }
  renderUsers();
}

function renderAdminReports() {
  const reportTasks = document.getElementById("adminReportTasks");
  const reportExams = document.getElementById("adminReportExams");
  const reportGroups = document.getElementById("adminReportGroups");
  const reportUsers = document.getElementById("adminReportUsers");
  if (reportTasks) reportTasks.textContent = String(loadTasks().length);
  if (reportExams) reportExams.textContent = String(loadExams().length);
  if (reportGroups) reportGroups.textContent = String(loadGroups().length);
  if (reportUsers) reportUsers.textContent = String(loadAllUsers().length);
}

function setAdminUserFilter(role) {
  adminUserRoleFilter = role;
  document.querySelectorAll(".admin-user-filter").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  renderUsers();
}

function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(LOGIN_KEY) || localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  try {
    const serialized = JSON.stringify(user);
    localStorage.setItem(LOGIN_KEY, serialized);
    localStorage.setItem("currentUser", serialized);
  } catch {
    // ignore storage errors
  }
}

function clearCurrentUserStorage() {
  localStorage.removeItem(LOGIN_KEY);
  localStorage.removeItem("currentUser");
}

function switchTab(tab, options) {
  // Close folder overlay if open
  if (typeof closeFolder === "function") {
    closeFolder();
  }

  // Track navigation history (skip when going back so the stack doesn't bounce)
  const skipHistory = typeof options === "object" && options?.skipHistory;
  if (!skipHistory && currentTab && currentTab !== tab) {
    navigationHistory.push(currentTab);
    // Keep only last 10 items in history
    if (navigationHistory.length > 10) {
      navigationHistory.shift();
    }
  }
  currentTab = tab;

  const sections = {
    launchpad: document.getElementById("launchpadSection"),
    dashboard: document.getElementById("dashboardSection"),
    home: tasksSection,
    tasks: tasksSection,
    groups: groupsSection,
    exam: examSection,
    timetable: timetableSection,
    fees: document.getElementById("feesSection"),
    announcements: document.getElementById("announcementsSection"),
    notes: document.getElementById("notesSection"),
    admin: document.getElementById("adminSection"),
    attendance: document.getElementById("attendanceSection"),
    "subject-selection": document.getElementById("subjectSelectionSection"),
    profile: document.getElementById("profileSection"),
    reports: document.getElementById("reportsSection"),
    care: document.getElementById("careSection"),
    resources: document.getElementById("resourcesSection"),
    jagath: document.getElementById("jagathSection"),
  };


  tabButtons.forEach((button) => {
    const btnTab = button.dataset.tab;
    button.classList.toggle(
      "active",
      btnTab === tab || (tab === "tasks" && btnTab === "home")
    );
  });

  Object.entries(sections).forEach(([key, section]) => {
    if (!section) return;
    const isActive =
      key === tab ||
      key === tab ||
      (tab === "home" && key === "tasks") ||
      (tab === "tasks" && key === "home");
    section.classList.toggle("hidden", !isActive);
    section.style.display = "";
  });

  if (tab === "tasks" || tab === "home") {
    renderTasks();
    renderHomeworkRoster();
  }
  if (tab === "groups") {
    renderGroups();
  }
  if (tab === "exam") {
    renderExams();
  }
  if (tab === "dashboard") {
    renderDashboard();
  }
  if (tab === "timetable") {
    renderTimetable();
  }
  if (tab === "launchpad") {
    renderLaunchpad();
  }
  if (tab === "profile") {
    renderProfile();
  }
  if (tab === "reports") {
    renderReports();
  }
  if (tab === "announcements") {
    renderAnnouncements();
  }
  if (tab === "notes") {
    renderNotes();
  }
  if (tab === "attendance") {
    renderAttGradesRoster();
  }
  if (tab === "fees") {
    const isAdmin = currentRole === "Principal" || currentRole === "Staff" || currentRole === "Admin";
    const isParent = currentRole === "Parent";
    if (!isAdmin && !isParent) {
      window.alert("Fees & Finance section is only accessible to Admins and Parents.");
      switchTab("dashboard");
      return;
    }
    renderFees();
  }
  
  const globalLpBtn = document.getElementById("globalLaunchpadBtn");
  if (globalLpBtn) {
    if (tab === "launchpad") {
      globalLpBtn.classList.add("hidden");
    } else {
      globalLpBtn.classList.remove("hidden");
    }
  }
  if (tab === "admin") {
    renderUsers();
    renderAdminReports();
    renderParents();
  }

  const backToLaunchpadBtn = document.getElementById("backToLaunchpadBtn");
  if (backToLaunchpadBtn) {
    backToLaunchpadBtn.classList.toggle("hidden", tab === "launchpad" || tab === "dashboard");
  }

  const topDashboardBtn = document.getElementById("topDashboardBtn");
  if (topDashboardBtn) {
    topDashboardBtn.classList.toggle("hidden", tab === "dashboard");
  }

  const globalBackBtn = document.getElementById("globalBackBtn");
  if (globalBackBtn) {
    globalBackBtn.classList.toggle("hidden", navigationHistory.length === 0 || tab === "launchpad" || tab === "dashboard");
  }


  updateBackButtons();
}

function goBack() {
  if (navigationHistory.length > 0) {
    const previousTab = navigationHistory.pop();
    switchTab(previousTab, { skipHistory: true });
  } else {
    switchTab("launchpad", { skipHistory: true });
  }
}

function updateBackButtons() {
  const lpBackBtn = document.getElementById("lpBackBtn");
  if (!lpBackBtn) return;
  const folderOverlay = document.getElementById("folderOverlay");
  const folderOpen = Boolean(typeof activeFolder !== "undefined" && activeFolder) || (folderOverlay && !folderOverlay.classList.contains("hidden"));
  const inSubView = Boolean(typeof launchpadNavState !== "undefined" && launchpadNavState.view && launchpadNavState.view !== "root");
  lpBackBtn.classList.toggle("hidden", !folderOpen && !inSubView);
}

function addGroup() {
  if (!canManageGroup()) {
    window.alert("Only teachers and admins can create groups.");
    return;
  }
  const name = groupNameInput?.value.trim() || "";
  const description = groupDescriptionInput?.value.trim() || "";
  if (!name) return;

  const newGroupId = crypto.randomUUID();
  const createdBy = currentUser?.username || "";
  const creatorMember = createdBy
    ? {
        id: `user:${createdBy}`,
        name: getDisplayName(createdBy),
        role: currentRole || "Member",
        phone: "",
        email: createdBy.includes("@") ? createdBy : "",
        isAdmin: true,
        addedAt: new Date().toISOString(),
      }
    : null;
  groups = [
    {
      id: newGroupId,
      name,
      description,
      classSection: "All",
      createdBy,
      createdAt: new Date().toISOString(),
      messages: [],
      members: creatorMember ? [creatorMember] : [],
    },
    ...groups,
  ];
  selectedGroupId = newGroupId;
  saveGroups();
  renderGroups();
  if (groupNameInput) groupNameInput.value = "";
  if (groupDescriptionInput) groupDescriptionInput.value = "";
}

function renderGroups() {
  if (!groupsList) return;
  groupsList.innerHTML = "";

  let allGroups = loadGroups();
  // Filter by class access
  allGroups = filterDataByClass(allGroups, currentUser);

  const filteredGroups = groupSearchQuery
    ? allGroups.filter((group) => {
        const needle = groupSearchQuery;
        return (
          String(group.name || "").toLowerCase().includes(needle) ||
          String(group.description || "").toLowerCase().includes(needle)
        );
      })
    : allGroups;

  if (!filteredGroups.length) {
    groupsList.innerHTML = groupSearchQuery
      ? `<div class="groups-middle-empty"><p class="section-empty">No groups match your search.</p></div>`
      : `<div class="groups-middle-empty">
          <div class="groups-middle-illus">
            <svg width="90" height="90" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="70" cy="70" r="70" fill="rgba(79,98,255,0.06)"/>
              <rect x="25" y="42" width="66" height="46" rx="14" fill="rgba(79,98,255,0.14)"/>
              <rect x="36" y="55" width="42" height="7" rx="3.5" fill="rgba(79,98,255,0.38)"/>
              <rect x="36" y="67" width="28" height="7" rx="3.5" fill="rgba(79,98,255,0.25)"/>
              <rect x="62" y="76" width="60" height="42" rx="12" fill="rgba(79,98,255,0.22)"/>
              <rect x="72" y="89" width="36" height="6" rx="3" fill="rgba(79,98,255,0.52)"/>
              <rect x="72" y="100" width="24" height="6" rx="3" fill="rgba(79,98,255,0.35)"/>
            </svg>
          </div>
          <h4>No groups yet</h4>
          <p>Create one to start organizing conversations and collaborating with your class or team.</p>
        </div>`;
    populateGroupSelect();
    populateParentGroupSelect();
    updateGroupFilterUI();
    return;
  }

  const allTasks = filterDataByClass(loadTasks(), currentUser);
  filteredGroups.forEach((group) => {
    const card = document.createElement("div");
    card.className = "group-card";
    if (selectedGroupId === group.id) {
      card.classList.add("group-card-selected");
    }

    card.addEventListener("click", () => selectGroup(group.id));

    const lastMessage = (group.messages || []).slice(-1)[0];
    const taskCount = allTasks.filter((task) => task.groupId === group.id).length;
    const memberCount = (group.members || []).length;
    const previewText =
      (lastMessage && lastMessage.text) ||
      group.description ||
      "No messages yet. Start the conversation.";
    const previewTime = lastMessage?.createdAt ? formatTimeLabel(lastMessage.createdAt) : "";

    card.innerHTML = `
      <div class="group-card-body">
        <div class="group-avatar">${getGroupInitials(group.name)}</div>
        <div class="group-card-content">
          <div class="group-card-top">
            <h4>${group.name}</h4>
            <span class="class-badge">${group.classSection || 'N/A'}</span>
            <span class="group-card-time">${previewTime}</span>
          </div>
          <p class="group-description">${previewText}</p>
          <div class="group-card-meta">
            <span>${memberCount} member${memberCount === 1 ? "" : "s"}</span>
            <span>${taskCount} task${taskCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>
    `;

    if (currentRole === "Teacher") {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "action-btn action-delete group-card-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteGroup(group.id);
      });
      card.append(deleteBtn);
    }

    groupsList.append(card);
  });

  populateGroupSelect();
  populateParentGroupSelect();
  updateGroupFilterUI();
  renderGroupChat();
  renderGroupDetails();
  renderGroupOverview();

  if (addGroupBtn) {
    addGroupBtn.disabled = !canManageGroup();
    addGroupBtn.title = canManageGroup() ? "" : "Only teachers and admins can create groups.";
  }

  // Legacy drawer no longer used (replaced by full Group Info modal).
  if (groupDetailsCard) {
    groupDetailsCard.classList.add("hidden");
  }
}

function isTeacher() {
  return canManageGroup();
}

function canManageGroup() {
  return (
    currentRole === "Teacher" ||
    currentRole === "Principal" ||
    currentRole === "Staff" ||
    currentRole === "Admin"
  );
}

function openGroupInfoModal() {
  if (!groupInfoModal) return;
  groupInfoModal.classList.remove("hidden");
  if (addParticipantsPanel) addParticipantsPanel.classList.add("hidden");
  renderGroupInfoModal();
}

function closeGroupInfoModal() {
  if (!groupInfoModal) return;
  groupInfoModal.classList.add("hidden");
  if (addParticipantsPanel) addParticipantsPanel.classList.add("hidden");
}

function renderGroupInfoModal() {
  if (!groupInfoTitle || !groupInfoSubtitle || !groupInfoParticipants || !groupInfoMeta) return;
  const group = groups.find((g) => g.id === selectedGroupId);
  if (!group) return;

  groupInfoTitle.textContent = group.name || "Group info";
  const count = (group.members || []).length;
  groupInfoSubtitle.textContent = `${count} participant${count === 1 ? "" : "s"}`;
  groupInfoMeta.textContent = group.description ? group.description : "No description set.";

  const canManage = canManageGroup();
  if (openAddParticipantsBtn) {
    openAddParticipantsBtn.style.display = canManage ? "inline-flex" : "none";
  }

  const existingEditPanel = groupInfoMeta.nextElementSibling;
  if (canManage) {
    let editPanel = existingEditPanel && existingEditPanel.classList.contains("group-edit-form") ? existingEditPanel : null;
    if (!editPanel) {
      editPanel = document.createElement("div");
      editPanel.className = "group-edit-form";
      editPanel.innerHTML = `
        <label for="groupInfoNameInput">Group name</label>
        <input id="groupInfoNameInput" type="text" />
        <label for="groupInfoDescriptionInput">Description</label>
        <textarea id="groupInfoDescriptionInput" rows="3"></textarea>
        <div class="modal-actions">
          <button id="saveGroupDetailsBtn" type="button" class="action-btn action-call">Save details</button>
          <button id="deleteGroupBtn" type="button" class="action-btn action-delete">Delete group</button>
        </div>
      `;
      groupInfoMeta.after(editPanel);
    }

    const nameInput = editPanel.querySelector("#groupInfoNameInput");
    const descriptionInput = editPanel.querySelector("#groupInfoDescriptionInput");
    if (nameInput) nameInput.value = group.name || "";
    if (descriptionInput) descriptionInput.value = group.description || "";

    const saveDetailsBtn = editPanel.querySelector("#saveGroupDetailsBtn");
    const deleteGroupBtn = editPanel.querySelector("#deleteGroupBtn");
    if (saveDetailsBtn) {
      saveDetailsBtn.onclick = () => {
        updateGroupDetails(group.id, String(nameInput?.value || "").trim(), String(descriptionInput?.value || "").trim());
      };
    }
    if (deleteGroupBtn) {
      deleteGroupBtn.onclick = () => {
        if (window.confirm("Delete this group and all chat history?")) {
          deleteGroup(group.id);
          closeGroupInfoModal();
        }
      };
    }
  } else if (existingEditPanel && existingEditPanel.classList.contains("group-edit-form")) {
    existingEditPanel.remove();
  }

  groupInfoParticipants.innerHTML = "";
  if (!count) {
    groupInfoParticipants.innerHTML = "<p class=\"section-empty\">No participants yet.</p>";
    return;
  }

  (group.members || []).forEach((member) => {
    const row = document.createElement("div");
    row.className = "group-member-row";

    const left = document.createElement("div");
    const adminPill = member.isAdmin ? `<span class="admin-pill">Admin</span>` : "";
    left.innerHTML = `<strong>${member.name || "Unnamed"}${adminPill}</strong><span>${member.role || "Member"}</span>`;

    const actions = document.createElement("div");
    actions.className = "member-actions";

    if (member.phone) {
      const callBtn = document.createElement("a");
      callBtn.href = `tel:${formatTelHref(member.phone)}`;
      callBtn.className = "action-btn action-call";
      callBtn.textContent = "Call";
      actions.append(callBtn);
    }

    if (canManage) {
      const toggleAdminBtn = document.createElement("button");
      toggleAdminBtn.type = "button";
      toggleAdminBtn.className = "action-btn action-edit";
      toggleAdminBtn.textContent = member.isAdmin ? "Remove admin" : "Make admin";
      toggleAdminBtn.addEventListener("click", () => {
        toggleGroupAdmin(group.id, member.id);
        renderGroupInfoModal();
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "action-btn action-delete";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        removeGroupMember(group.id, member.id);
        renderGroupInfoModal();
      });

      actions.append(toggleAdminBtn, removeBtn);
    }

    row.append(left, actions);
    groupInfoParticipants.append(row);
  });
}

function renderContactsPicker() {
  if (!contactsPickerList) return;
  const group = groups.find((g) => g.id === selectedGroupId);
  if (!group) return;

  const memberEmails = new Set((group.members || []).map((m) => (m.email || "").toLowerCase()).filter(Boolean));
  const memberPhones = new Set((group.members || []).map((m) => (m.phone || "").toLowerCase()).filter(Boolean));

  contactsPickerList.innerHTML = "";
  if (!parents.length) {
    contactsPickerList.innerHTML = "<p class=\"section-empty\">No contacts yet. Add a Parent contact first.</p>";
    return;
  }

  parents.forEach((contact) => {
    const emailKey = String(contact.email || "").toLowerCase();
    const phoneKey = String(contact.phone || "").toLowerCase();
    const alreadyInGroup = (emailKey && memberEmails.has(emailKey)) || (phoneKey && memberPhones.has(phoneKey));

    const row = document.createElement("label");
    row.className = "contact-picker-row";

    const info = document.createElement("div");
    info.innerHTML = `<strong>${contact.name}</strong><span>${contact.phone} · ${contact.email}</span>`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = contact.id;
    checkbox.disabled = alreadyInGroup;
    checkbox.checked = false;
    if (alreadyInGroup) {
      row.title = "Already a participant";
      row.style.opacity = "0.75";
    }

    row.append(info, checkbox);
    contactsPickerList.append(row);
  });
}

function addSelectedParticipantsToGroup() {
  const group = groups.find((g) => g.id === selectedGroupId);
  if (!group) return;
  if (!canManageGroup()) {
    window.alert("Only teachers can add participants.");
    return;
  }
  if (!contactsPickerList) return;

  const checked = Array.from(contactsPickerList.querySelectorAll("input[type='checkbox']:checked"));
  if (!checked.length) return;

  checked.forEach((checkbox) => {
    const contact = parents.find((p) => String(p.id) === String(checkbox.value));
    if (!contact) return;
    addGroupMember(group.id, {
      name: contact.name,
      role: "Parent",
      phone: contact.phone,
      email: contact.email,
      isAdmin: false,
    });
  });

  saveGroups();
  renderGroups();
  renderGroupInfoModal();
  if (addParticipantsPanel) addParticipantsPanel.classList.add("hidden");
}

function selectGroup(groupId) {
  selectedGroupId = groupId;
  if (taskGroupInput) {
    taskGroupInput.value = groupId;
  }
  ensureCurrentUserIsAdminIfNoAdmins(groupId);
  renderTasks();
  renderGroups();
}

function clearGroupFilter() {
  selectedGroupId = "";
  if (taskGroupInput) {
    taskGroupInput.value = "";
  }
  renderTasks();
  renderGroups();
}

function updateGroupFilterUI() {
  if (!groupFilterList) return;

  groupFilterList.innerHTML = "";

  if (!groups.length) {
    const empty = document.createElement("span");
    empty.className = "group-filter-empty";
    empty.textContent = "No groups created yet.";
    groupFilterList.append(empty);
    return;
  }

  groups.forEach((group) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "group-filter-chip";
    chip.textContent = group.name;
    if (selectedGroupId === group.id) {
      chip.classList.add("active");
    }
    chip.addEventListener("click", () => selectGroup(group.id));
    groupFilterList.append(chip);
  });
}

function renderGroupDetails() {
  if (!groupDetailsCard || !groupDetails) return;
  const group = groups.find((item) => item.id === selectedGroupId);
  if (!group) {
    groupDetailsCard.classList.add("hidden");
    return;
  }

  // Only show when explicitly opened (WhatsApp-like info drawer).
  groupDetails.innerHTML = "";

  const title = document.createElement("h4");
  title.textContent = group.name;
  const description = document.createElement("p");
  description.className = "group-details-description";
  description.textContent = group.description || "No description set.";

  const taskCount = tasks.filter((task) => task.groupId === group.id).length;
  const summary = document.createElement("p");
  summary.className = "group-details-summary";
  summary.textContent = `${taskCount} task${taskCount === 1 ? "" : "s"} assigned`;

  const membersHeader = document.createElement("h5");
  const memberCount = (group.members || []).length;
  membersHeader.textContent = `Participants (${memberCount})`;
  const membersList = document.createElement("div");
  membersList.className = "group-members-list";

  if (!group.members?.length) {
    const empty = document.createElement("p");
    empty.className = "section-empty";
    empty.textContent = "No members added yet.";
    membersList.append(empty);
  } else {
    group.members.forEach((member) => {
      const memberRow = document.createElement("div");
      memberRow.className = "group-member-row";
      const memberInfo = document.createElement("div");
      const adminPill = member.isAdmin ? `<span class="admin-pill">Admin</span>` : "";
      memberInfo.innerHTML = `<strong>${member.name}${adminPill}</strong> <span>${member.role || "Member"}</span>`;
      memberRow.append(memberInfo);

      const actions = document.createElement("div");
      actions.className = "member-actions";

      if (member.phone) {
        const callBtn = document.createElement("a");
        callBtn.href = `tel:${formatTelHref(member.phone)}`;
        callBtn.className = "action-btn action-call";
        callBtn.textContent = "Call";
        actions.append(callBtn);
      }

      if (currentRole === "Teacher") {
        const toggleAdminBtn = document.createElement("button");
        toggleAdminBtn.type = "button";
        toggleAdminBtn.className = "action-btn action-edit";
        toggleAdminBtn.textContent = member.isAdmin ? "Remove admin" : "Make admin";
        toggleAdminBtn.addEventListener("click", () => toggleGroupAdmin(group.id, member.id));

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "action-btn action-delete";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => removeGroupMember(group.id, member.id));

        actions.append(toggleAdminBtn, removeBtn);
      }

      if (actions.childElementCount) {
        memberRow.append(actions);
      }
      membersList.append(memberRow);
    });
  }

  groupDetails.append(title, description, summary, membersHeader, membersList);

if (currentRole === "Principal" || currentRole === "Staff" || currentRole === "Admin" || currentRole === "Teacher") {
      const addMemberCard = document.createElement("div");
      addMemberCard.className = "group-add-member-card";
      addMemberCard.innerHTML = `
        <label for="groupMemberNameInput">Add participant</label>
        <input id="groupMemberNameInput" type="text" placeholder="Full name" />
        <label for="groupMemberPhoneInput">Phone (optional)</label>
        <input id="groupMemberPhoneInput" type="tel" placeholder="+1 555 123 4567" />
        <label for="groupMemberEmailInput">Email (optional)</label>
        <input id="groupMemberEmailInput" type="email" placeholder="name@example.com" />
        <label for="groupMemberRoleInput">Role</label>
        <select id="groupMemberRoleInput">
          <option value="Staff">Staff</option>
          <option value="Principal">Principal</option>
        </select>
      <label class="checkbox-row"><input id="groupMemberAdminInput" type="checkbox" /> Add as admin</label>
      <button id="addGroupMemberBtn" type="button">Add</button>
    `;

    groupDetails.append(addMemberCard);

    const addMemberBtnEl = addMemberCard.querySelector("#addGroupMemberBtn");
    const memberNameInput = addMemberCard.querySelector("#groupMemberNameInput");
    const memberPhoneInput = addMemberCard.querySelector("#groupMemberPhoneInput");
    const memberEmailInput = addMemberCard.querySelector("#groupMemberEmailInput");
    const memberRoleInput = addMemberCard.querySelector("#groupMemberRoleInput");
    const memberAdminInput = addMemberCard.querySelector("#groupMemberAdminInput");

    if (addMemberBtnEl) {
      addMemberBtnEl.addEventListener("click", () => {
        const memberName = memberNameInput?.value.trim();
        const memberRole = memberRoleInput?.value.trim() || "Member";
        if (!memberName) return;
        addGroupMember(group.id, {
          name: memberName,
          role: memberRole,
          phone: memberPhoneInput?.value.trim() || "",
          email: memberEmailInput?.value.trim() || "",
          isAdmin: Boolean(memberAdminInput?.checked),
        });
        if (memberNameInput) memberNameInput.value = "";
        if (memberPhoneInput) memberPhoneInput.value = "";
        if (memberEmailInput) memberEmailInput.value = "";
        if (memberRoleInput) memberRoleInput.value = "";
        if (memberAdminInput) memberAdminInput.checked = false;
      });
    }
  }
}

function addGroupMember(groupId, member) {
  if (!canManageGroup()) {
    window.alert("Only teachers can modify group members.");
    return;
  }
  groups = groups.map((group) => {
    if (group.id !== groupId) return group;
    const currentCount = (group.members || []).length;
    if (currentCount >= MAX_GROUP_MEMBERS) {
      window.alert(`Maximum participants reached (${MAX_GROUP_MEMBERS}).`);
      return group;
    }
    const memberId = crypto.randomUUID();
    return {
      ...group,
      members: [
        ...(group.members || []),
        {
          id: memberId,
          name: member.name,
          role: member.role,
          phone: member.phone || "",
          email: member.email || "",
          isAdmin: Boolean(member.isAdmin),
          addedAt: new Date().toISOString(),
        },
      ],
    };
  });
  saveGroups();
  renderGroups();
}

function removeGroupMember(groupId, memberId) {
  const group = groups.find((g) => g.id === groupId);
  if (!group || !canManageGroup()) {
    window.alert("Only teachers can remove members.");
    return;
  }
  groups = groups.map((group) => {
    if (group.id !== groupId) return group;
    const members = group.members || [];
    const nextCount = members.filter((member) => member.id !== memberId).length;
    if (members.length >= MIN_GROUP_MEMBERS && nextCount < MIN_GROUP_MEMBERS) {
      window.alert(`Groups must have at least ${MIN_GROUP_MEMBERS} participants.`);
      return group;
    }
    return {
      ...group,
      members: members.filter((member) => member.id !== memberId),
    };
  });
  saveGroups();
  renderGroups();
}

function isCurrentUserGroupAdmin(group) {
  const username = currentUser?.username;
  if (!username) return false;
  const userMemberId = `user:${username}`;
  return Boolean((group.members || []).some((m) => m.id === userMemberId && m.isAdmin));
}

function ensureCurrentUserIsAdminIfNoAdmins(groupId) {
  if (!isTeacher()) return;
  const username = currentUser?.username;
  if (!username) return;

  const userMemberId = `user:${username}`;
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  const hasAnyAdmin = (group.members || []).some((m) => m.isAdmin);
  if (hasAnyAdmin) return;

  groups = groups.map((g) => {
    if (g.id !== groupId) return g;
    const existing = (g.members || []).find((m) => m.id === userMemberId);
    if (existing) {
      return {
        ...g,
        members: (g.members || []).map((m) => (m.id === userMemberId ? { ...m, isAdmin: true } : m)),
      };
    }
    return {
      ...g,
      members: [
        {
          id: userMemberId,
          name: getDisplayName(username),
          role: currentRole || "Member",
          phone: "",
          email: username.includes("@") ? username : "",
          isAdmin: true,
          addedAt: new Date().toISOString(),
        },
        ...(g.members || []),
      ],
    };
  });
  saveGroups();
}

function toggleGroupAdmin(groupId, memberId) {
  const group = groups.find((g) => g.id === groupId);
  if (!group || !canManageGroup()) return;

  groups = groups.map((g) => {
    if (g.id !== groupId) return g;
    return {
      ...g,
      members: (g.members || []).map((m) => (m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m)),
    };
  });
  saveGroups();
  renderGroups();
}

function callGroup() {
  const group = groups.find((g) => g.id === selectedGroupId);
  if (!group) return;
  const members = group.members || [];
  const adminWithPhone = members.find((m) => m.isAdmin && m.phone);
  const anyWithPhone = members.find((m) => m.phone);
  const target = adminWithPhone || anyWithPhone;
  if (!target?.phone) {
    window.alert("No phone number found for participants in this group.");
    return;
  }
  window.location.href = `tel:${formatTelHref(target.phone)}`;
}

function addParent() {
  const name = parentNameInput?.value.trim();
  const phone = parentPhoneInput?.value.trim();
  const email = parentEmailInput?.value.trim();
  const groupId = parentGroupSelect?.value || "";
  if (!name || !email || !phone || !groupId) return;

  parents = [
    {
      id: crypto.randomUUID(),
      name,
      phone,
      email,
      groupId,
      groupName: getGroupName(groupId),
      addedAt: new Date().toISOString(),
    },
    ...parents,
  ];

  addGroupMember(groupId, { name, role: "Parent", phone, email, isAdmin: false });

  saveParents();
  renderParents();

  if (parentNameInput) parentNameInput.value = "";
  if (parentPhoneInput) parentPhoneInput.value = "";
  if (parentEmailInput) parentEmailInput.value = "";
  if (parentGroupSelect) parentGroupSelect.value = "";
}

function populateParentGroupSelect() {
  if (!parentGroupSelect) return;
  const currentValue = parentGroupSelect.value;
  parentGroupSelect.innerHTML = "<option value=''>Select a group</option>";
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    parentGroupSelect.append(option);
  });
  if (currentValue && Array.from(parentGroupSelect.options).some((opt) => opt.value === currentValue)) {
    parentGroupSelect.value = currentValue;
  }
}

function renderParents() {
  if (!parentsList) return;
  parentsList.innerHTML = "";

  if (!parents.length) {
    parentsList.innerHTML = "<p class=\"section-empty\">No parent contacts added yet.</p>";
    return;
  }

  parents.forEach((parent) => {
    const dialNumber = formatTelHref(parent.phone);

    const card = document.createElement("div");
    card.className = "parent-card-row";

    const info = document.createElement("div");
    const nameEl = document.createElement("strong");
    nameEl.textContent = parent.name;
    const phoneEl = document.createElement("a");
    phoneEl.href = `tel:${dialNumber}`;
    phoneEl.className = "parent-contact-link";
    phoneEl.textContent = parent.phone;
    phoneEl.setAttribute("aria-label", `Call ${parent.name}`);
    const emailEl = document.createElement("span");
    emailEl.textContent = parent.email;

    info.append(nameEl, phoneEl, emailEl);
    card.append(info);

    const callBtn = document.createElement("a");
    callBtn.href = `tel:${dialNumber}`;
    callBtn.className = "action-btn action-call";
    callBtn.textContent = "Call";
    callBtn.setAttribute("aria-label", `Call ${parent.name}`);
    callBtn.setAttribute("rel", "noopener noreferrer");

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn action-delete";
    deleteBtn.textContent = "Remove";
    deleteBtn.addEventListener("click", () => deleteParent(parent.id));

    const actions = document.createElement("div");
    actions.className = "parent-actions";
    actions.append(callBtn, deleteBtn);

    card.append(actions);
    parentsList.append(card);
  });
}

function formatTelHref(phone) {
  if (!phone) return "";
  const cleaned = phone
    .trim()
    .replace(/[^+\d]/g, "")
    .replace(/^00/, "+");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

function deleteParent(parentId) {
  parents = parents.filter((parent) => parent.id !== parentId);
  saveParents();
  renderParents();
}

function loadParents() {
  try {
    const raw = localStorage.getItem(PARENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadParentTeacherMessages() {
  try {
    const raw = localStorage.getItem(PARENT_TEACHER_MESSAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveParentTeacherMessages() {
  try {
    localStorage.setItem(PARENT_TEACHER_MESSAGES_KEY, JSON.stringify(parentTeacherMessages));
  } catch {
    // ignore storage errors
  }
}

function sendParentTeacherMessage() {
  if (!parentMessageInput || !parentMessageInput.value.trim()) return;

  parentTeacherMessages.unshift({
    id: crypto.randomUUID(),
    text: parentMessageInput.value.trim(),
    createdAt: new Date().toISOString(),
  });
  saveParentTeacherMessages();
  renderParentMessages();
  parentMessageInput.value = "";
}

function renderParentMessages() {
  if (!parentMessagesList) return;
  parentMessagesList.innerHTML = "";

  if (!parentTeacherMessages.length) {
    parentMessagesList.innerHTML = "<p class=\"section-empty\">No messages sent yet.</p>";
    return;
  }

  parentTeacherMessages.forEach((message) => {
    const item = document.createElement("div");
    item.className = "parent-message-item";
    item.innerHTML = `
      <strong>You</strong>
      <p>${message.text}</p>
      <small>${new Date(message.createdAt).toLocaleString()}</small>
    `;
    parentMessagesList.append(item);
  });
}

function renderParentNotifications() {
  if (!parentNotificationsContent) return;
  let filteredTasks = tasks;
  if (currentUser) {
    filteredTasks = filterDataByClass(tasks, currentUser);
    filteredTasks = filteredTasks.filter(task => !task.ownerId || task.ownerId === currentUser.username);
  }
  const pending = filteredTasks.filter((task) => !task.completed).length;
  const overdue = filteredTasks.filter((task) => isOverdue(task)).length;
  const dueSoon = filteredTasks.filter((task) => isDueSoon(task)).length;
  const completed = filteredTasks.filter((task) => task.completed).length;

  parentNotificationsContent.innerHTML = `
    <p><strong>${pending}</strong> pending student task${pending === 1 ? "" : "s"}.</p>
    <p><strong>${overdue}</strong> overdue task${overdue === 1 ? "" : "s"}.</p>
    <p><strong>${dueSoon}</strong> task${dueSoon === 1 ? "" : "s"} due soon.</p>
    <p><strong>${completed}</strong> completed task${completed === 1 ? "" : "s"}.</p>
  `;
}

function saveParents() {
  localStorage.setItem(PARENTS_KEY, JSON.stringify(parents));
}

function deleteGroup(groupId) {
  if (!isTeacher()) {
    window.alert("Only teachers can delete groups.");
    return;
  }
  groups = groups.filter((group) => group.id !== groupId);
  tasks = tasks.map((task) =>
    task.groupId === groupId
      ? { ...task, groupId: "", groupName: "" }
      : task
  );
  if (selectedGroupId === groupId) {
    selectedGroupId = "";
  }
  saveGroups();
  saveTasks();
  renderGroups();
  renderTasks();
}

function updateGroupDetails(groupId, name, description) {
  if (!isTeacher()) {
    window.alert("Only teachers can edit group details.");
    return;
  }
  groups = groups.map((group) =>
    group.id === groupId
      ? { ...group, name: name || group.name, description: description || group.description }
      : group
  );
  saveGroups();
  renderGroups();
  renderGroupInfoModal();
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map((group) => ({
          ...group,
          messages: Array.isArray(group.messages) ? group.messages : [],
          members: Array.isArray(group.members) ? group.members : [],
        }))
      : [];
  } catch {
    return [];
  }
}

function saveGroups() {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function getGroupName(groupId) {
  if (!groupId) return "";
  const group = groups.find((entry) => entry.id === groupId);
  return group ? group.name : "";
}

function populateGroupSelect() {
  if (!taskGroupInput) return;
  taskGroupInput.innerHTML = "<option value=''>Assign to group (optional)</option>";
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    taskGroupInput.append(option);
  });
}

function populateClassSelect() {
  const taskClassInput = document.getElementById("taskClassInput");
  if (!taskClassInput) return;
  taskClassInput.innerHTML = "<option value=''>Select class</option>";
  const accessibleClasses = getUserAccessibleClasses(currentUser);
  accessibleClasses.forEach((classSection) => {
    const option = document.createElement("option");
    option.value = classSection;
    option.textContent = classSection;
    taskClassInput.append(option);
  });
  // If only one class, select it
  if (accessibleClasses.length === 1) {
    taskClassInput.value = accessibleClasses[0];
  }
}

function populateGroupClassSelect() {
  const groupClassInput = document.getElementById("groupClassInput");
  if (!groupClassInput) return;
  groupClassInput.innerHTML = "<option value=''>Select class</option>";
  const accessibleClasses = getUserAccessibleClasses(currentUser);
  accessibleClasses.forEach((classSection) => {
    const option = document.createElement("option");
    option.value = classSection;
    option.textContent = classSection;
    groupClassInput.append(option);
  });
  // If only one class, select it
  if (accessibleClasses.length === 1) {
    groupClassInput.value = accessibleClasses[0];
  }
}

function populateExamClassSelect() {
  const examClassInput = document.getElementById("examClassInput");
  if (!examClassInput) return;
  examClassInput.innerHTML = "<option value=''>Select class</option>";
  const accessibleClasses = getUserAccessibleClasses(currentUser);
  accessibleClasses.forEach((classSection) => {
    const option = document.createElement("option");
    option.value = classSection;
    option.textContent = classSection;
    examClassInput.append(option);
  });
  // If only one class, select it
  if (accessibleClasses.length === 1) {
    examClassInput.value = accessibleClasses[0];
  }
}

function populateAnnouncementClassSelect() {
  const announcementClassInput = document.getElementById("announcementClassInput");
  if (!announcementClassInput) return;
  announcementClassInput.innerHTML = "<option value=''>Select class</option>";
  const accessibleClasses = getUserAccessibleClasses(currentUser);
  accessibleClasses.forEach((classSection) => {
    const option = document.createElement("option");
    option.value = classSection;
    option.textContent = classSection;
    announcementClassInput.append(option);
  });
  // If only one class, select it
  if (accessibleClasses.length === 1) {
    announcementClassInput.value = accessibleClasses[0];
  }
}

function handleTaskFileUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  Promise.all(files.map(processTaskFileUpload)).then((newTasksArrays) => {
    const tasksToAdd = newTasksArrays.flat();
    if (!tasksToAdd.length) return;
    tasks = [...tasksToAdd.reverse(), ...tasks];
    saveTasks();
    renderTasks();
    if (taskFileInput) taskFileInput.value = "";
  });
}

function processTaskFileUpload(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv");
    const defaultTask = {
      id: crypto.randomUUID(),
      text: `Uploaded file: ${file.name}`,
      subject: "",
      type: "attachment",
      dueDate: "",
      dueDateLabel: "",
      hasDeadline: false,
      pointsAwarded: false,
      completed: false,
      groupId: selectedGroupId,
      groupName: getGroupName(selectedGroupId),
      attachments: [{ name: file.name, type: file.type, fileName: file.name }],
    };

    if (!isText) {
      resolve([defaultTask]);
      return;
    }

    reader.onload = () => {
      const content = String(reader.result || "");
      const parsedTasks = parseTaskInput(content, "");
      if (parsedTasks.length) {
        resolve(
          parsedTasks
            .filter((parsed) => parsed.title)
            .map((parsed) => ({
              id: crypto.randomUUID(),
              text: capitalizeTaskText(parsed.title),
              subject: parsed.subject,
              type: parsed.type,
              dueDate: parsed.dueDate,
              dueDateLabel: parsed.dueDate
                ? formatDateLabel(parseISODate(parsed.dueDate))
                : "",
              hasDeadline: Boolean(parsed.dueDate),
              pointsAwarded: false,
              completed: false,
              groupId: selectedGroupId,
              groupName: getGroupName(selectedGroupId),
              attachments: [{ name: file.name, type: file.type, fileName: file.name }],
            }))
        );
      } else {
        resolve([defaultTask]);
      }
    };

    reader.onerror = () => resolve([defaultTask]);
    reader.readAsText(file);
  });
}

function handleExamFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  autoCreateExamFromFile(file);
}

function autoCreateExamFromFile(file) {
  const reader = new FileReader();
  const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv");

  const createExam = (exam) => {
    exams = [
      {
        id: crypto.randomUUID(),
        name: exam.name,
        subject: exam.subject,
        dueDate: exam.dueDate,
        dueDateLabel: exam.dueDate ? formatDateLabel(parseISODate(exam.dueDate)) : "Date not set",
        studyDays: Number(exam.studyDays) || 0,
        attachment: { name: file.name, type: file.type },
      },
      ...exams,
    ];
    saveExams();
    renderExams();
    if (examFileInput) examFileInput.value = "";
  };

  if (!isText) {
    createExam({
      name: file.name.replace(/\.[^.]+$/, ""),
      subject: "Uploaded exam file",
      dueDate: "",
      studyDays: 0,
    });
    return;
  }

  reader.onload = () => {
    const content = String(reader.result || "");
    const examsFromText = parseExamTextFromString(content);
    if (examsFromText.length) {
      examsFromText.forEach(createExam);
    } else {
      createExam({
        name: file.name.replace(/\.[^.]+$/, ""),
        subject: "Uploaded exam file",
        dueDate: "",
        studyDays: 0,
      });
    }
  };
  reader.onerror = () => {
    createExam({
      name: file.name.replace(/\.[^.]+$/, ""),
      subject: "Uploaded exam file",
      dueDate: "",
      studyDays: 0,
    });
  };
  reader.readAsText(file);
}

function parseExamTextFromString(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const examsFound = [];
  const dateRegex = /(?:(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}\.\d{1,2}\.\d{2,4}))/;

  lines.forEach((line) => {
    const matched = line.match(dateRegex);
    if (!matched) return;
    const dateValue = matched[1] || matched[2] || matched[3];
    let isoDate = "";
    try {
      isoDate = dateValue.includes("/") || dateValue.includes(".")
        ? toISODate(new Date(dateValue))
        : dateValue;
    } catch {
      isoDate = "";
    }
    const name = line.replace(dateRegex, "").trim() || "Uploaded Exam";
    examsFound.push({ name, subject: "Imported exam", dueDate: isoDate, studyDays: 0 });
  });

  return examsFound;
}

function sendGroupChatMessage() {
  const text = chatInput?.value.trim();
  if (!text || !selectedGroupId) return;
  const group = groups.find((item) => item.id === selectedGroupId);
  if (!group) return;

  const message = {
    id: crypto.randomUUID(),
    text,
    senderId: currentUser?.username || "",
    senderName: getDisplayName(currentUser?.username || "") || currentRole,
    senderRole: currentRole,
    timestamp: new Date().toISOString(),
  };

  group.messages = group.messages || [];
  group.messages.push(message);
  saveGroups();
  renderGroupChat();
  if (chatInput) chatInput.value = "";
  addNotification(
    "message",
    `New message in ${group.name}`,
    `${message.senderName} sent a new group message.`
  );
}

function renderGroupChat() {
  if (!groupChatPanel || !chatMessages || !chatGroupTitle) return;
  const group = groups.find((item) => item.id === selectedGroupId);
  if (!group) {
    chatGroupTitle.textContent = "Select a group to chat";
    if (chatParticipants) chatParticipants.textContent = "0 participants";
    chatMessages.innerHTML = "<p class=\"section-empty\">Choose a group from the left to start chatting.</p>";
    if (chatInput) chatInput.disabled = true;
    if (sendChatBtn) sendChatBtn.disabled = true;
    if (groupCallBtn) groupCallBtn.disabled = true;
    if (groupSnapshot) groupSnapshot.classList.add("hidden");
    return;
  }

  chatGroupTitle.textContent = `Chat — ${group.name}`;
  if (chatParticipants) {
    const count = (group.members || []).length;
    chatParticipants.textContent = `${count} participant${count === 1 ? "" : "s"}`;
  }

  const participantCount = (group.members || []).length;
  if (chatInput) chatInput.disabled = false;
  if (sendChatBtn) sendChatBtn.disabled = false;
  if (groupCallBtn) groupCallBtn.disabled = participantCount === 0;
  if (groupSnapshot) groupSnapshot.classList.remove("hidden");
  renderGroupSnapshot(group);

  chatMessages.innerHTML = "";
  if (!(group.messages || []).length) {
    chatMessages.innerHTML = "<p class=\"section-empty\">No messages yet. Send the first message to start the discussion.</p>";
  }

  (group.messages || []).forEach((message) => {
    const senderName = message.senderName || message.sender || "Unknown";
    const senderRole = message.senderRole || message.sender || "Member";
    const isCurrentUserMessage = Boolean(
      message.senderId && currentUser?.username && message.senderId === currentUser.username
    );
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${isCurrentUserMessage ? "sent" : "received"}`;
    bubble.innerHTML = `<strong>${senderName} · ${senderRole}</strong><span>${message.text}</span><small>${new Date(message.timestamp).toLocaleString()}</small>`;
    chatMessages.append(bubble);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderGroupOverview() {
  if (totalGroupsCount) {
    totalGroupsCount.textContent = String(groups.length);
  }
  const activeChats = groups.filter((group) => (group.messages || []).length > 0).length;
  if (activeChatsCount) {
    activeChatsCount.textContent = `${activeChats} active`;
  }
  const totalMembers = groups.reduce(
    (sum, group) => sum + ((group.members && group.members.length) || 0),
    0
  );
  if (totalGroupMembersCount) {
    totalGroupMembersCount.textContent = String(totalMembers);
  }
}

function renderGroupSnapshot(group) {
  if (!groupSnapshot || !groupSnapshotName || !groupSnapshotInfo || !groupSnapshotMembers || !groupSnapshotRoles || !groupSnapshotDescription) return;
  groupSnapshot.classList.remove("hidden");
  groupSnapshotName.textContent = group.name || "Unnamed group";
  groupSnapshotInfo.textContent = group.description || "No description provided.";
  groupSnapshotMembers.textContent = `${(group.members || []).length} participant${(group.members || []).length === 1 ? "" : "s"}`;

  const counts = (group.members || []).reduce(
    (acc, member) => {
      const role = String(member.role || "Student");
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {}
  );
  const teachers = counts.Teacher || 0;
  const students = counts.Student || 0;
  const staff = counts.Staff || 0;
  groupSnapshotRoles.textContent = `${teachers} teacher${teachers === 1 ? "" : "s"} · ${students} student${students === 1 ? "" : "s"} · ${staff} staff${staff === 1 ? "" : "s"}`;
  groupSnapshotDescription.textContent = group.description || "No description provided.";
  const avatar = document.getElementById("groupAvatar");
  if (avatar) {
    avatar.textContent = (group.name || "G").trim().slice(0, 1).toUpperCase();
  }
}

function addExam() {
  const name = examNameInput.value.trim();
  const subject = examSubjectInput.value.trim();
  const selectedClassValue = document.getElementById("examClassInput")?.value;
  const userClass = getUserClass(currentUser);
  const classSection = selectedClassValue || (Array.isArray(userClass) ? userClass[0] : userClass) || "";
  const dueDate = examDateInput.value;
  const studyDays = Number(studyDaysInput.value) || 0;
  const fileInput = document.getElementById("examFileInput");
  const fileName = fileInput?.files?.[0]?.name || "";

  if (!name || !dueDate || !classSection) {
    alert("Please enter Exam Name, Class, and Date.");
    return;
  }

  exams = [
    {
      id: crypto.randomUUID(),
      name,
      subject,
      classSection,
      dueDate,
      studyDays,
      fileName,
      dueDateLabel: formatDateLabel(parseISODate(dueDate)),
    },
    ...exams,
  ];
  saveExams();
  renderExams();
  addNotification(
    "exam",
    `Exam added: ${name}`,
    `${subject || "Exam"} scheduled for ${formatDateLabel(parseISODate(dueDate))}`
  );
  examNameInput.value = "";
  examSubjectInput.value = "";
  examDateInput.value = "";
  studyDaysInput.value = "";
  if (fileInput) fileInput.value = "";
}

function renderExams() {
  if (!examsList) return;
  examsList.innerHTML = "";

  let allExams = loadExams();
  // Filter by class access
  allExams = filterDataByClass(allExams, currentUser);

  if (!allExams.length) {
    examsList.innerHTML = `
      <div class="ex-empty-state">
        <div class="ex-empty-illustration">
          <svg width="260" height="175" viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="140" cy="115" rx="110" ry="55" fill="#f3e8ff" opacity="0.65"/>
            <path d="M180 35 L183 42 L190 45 L183 48 L180 55 L177 48 L170 45 L177 42 Z" fill="#3b82f6"/>
            <path d="M48 65 L50 70 L55 72 L50 74 L48 79 L46 74 L41 72 L46 70 Z" fill="#a855f7"/>
            <rect x="52" y="125" width="115" height="22" rx="4" fill="#6366f1"/>
            <rect x="58" y="129" width="102" height="14" rx="2" fill="#ffffff"/>
            <rect x="52" y="103" width="110" height="22" rx="4" fill="#f59e0b"/>
            <rect x="58" y="107" width="97" height="14" rx="2" fill="#ffffff"/>
            <rect x="55" y="80" width="100" height="22" rx="4" fill="#3b82f6"/>
            <rect x="61" y="84" width="88" height="14" rx="2" fill="#ffffff"/>
            <g transform="translate(165, 88)">
              <rect x="0" y="0" width="76" height="58" rx="8" fill="#4f46e5"/>
              <rect x="4" y="14" width="68" height="40" rx="4" fill="#ffffff"/>
              <rect x="14" y="-5" width="6" height="12" rx="3" fill="#312e81"/>
              <rect x="35" y="-5" width="6" height="12" rx="3" fill="#312e81"/>
              <rect x="56" y="-5" width="6" height="12" rx="3" fill="#312e81"/>
              <circle cx="18" cy="26" r="3" fill="#cbd5e1"/>
              <circle cx="38" cy="26" r="3" fill="#cbd5e1"/>
              <circle cx="58" cy="26" r="3" fill="#cbd5e1"/>
              <circle cx="18" cy="40" r="3" fill="#cbd5e1"/>
              <rect x="30" y="32" width="28" height="18" rx="4" fill="#6366f1"/>
              <path d="M36 41 L41 45 L52 36" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g transform="translate(225, 95)">
              <rect x="0" y="20" width="34" height="42" rx="6" fill="#8b5cf6"/>
              <rect x="6" y="-15" width="6" height="38" fill="#f59e0b"/>
              <polygon points="6,-15 12,-15 9,-22" fill="#ef4444"/>
              <rect x="18" y="-20" width="6" height="43" fill="#ec4899"/>
              <polygon points="18,-20 24,-20 21,-27" fill="#3b82f6"/>
            </g>
            <path d="M255 110 Q270 95 260 80 Q250 95 255 110 Z" fill="#10b981"/>
            <path d="M258 115 Q275 110 270 98 Q255 105 258 115 Z" fill="#059669"/>
          </svg>
        </div>
        <div class="ex-empty-header">
          <span class="ex-sparkle-decor">✨</span>
          <h2 class="ex-empty-title">No Exams <span class="ex-script-highlight">Yet!</span></h2>
          <span class="ex-sparkle-decor">✨</span>
        </div>
        <p class="ex-empty-desc">
          Add your first exam using the form on the left and start planning your study journey!
        </p>
        <div class="ex-empty-badge">
          💡 Good luck! ♡
        </div>
      </div>
    `;
    return;
  }

  allExams.forEach((exam) => {
    const card = document.createElement("div");
    card.className = "ex-item-card";

    const heading = document.createElement("div");
    heading.className = "ex-item-header";

    const title = document.createElement("h4");
    title.className = "ex-item-title";
    title.textContent = exam.name;

    const badges = document.createElement("div");
    badges.className = "ex-item-badges";

    if (exam.classSection) {
      const classBadge = document.createElement("span");
      classBadge.className = "ex-badge-class";
      classBadge.textContent = exam.classSection;
      badges.appendChild(classBadge);
    }
    if (exam.subject) {
      const subjectBadge = document.createElement("span");
      subjectBadge.className = "ex-badge-subject";
      subjectBadge.textContent = exam.subject;
      badges.appendChild(subjectBadge);
    }

    heading.append(title, badges);

    if (isTeacher() || currentRole === "Staff" || currentRole === "Principal" || currentRole === "Admin") {
      const actions = document.createElement("div");
      actions.className = "ex-item-actions";
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "ex-delete-btn";
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.addEventListener("click", () => deleteExam(exam.id));
      actions.appendChild(deleteBtn);
      heading.append(actions);
    }

    const meta = document.createElement("div");
    meta.className = "ex-item-meta";

    const dateSpan = document.createElement("span");
    dateSpan.className = "ex-item-date";
    dateSpan.innerHTML = `📅 ${exam.dueDateLabel || exam.dueDate}`;

    const countdownSpan = document.createElement("span");
    countdownSpan.className = "ex-item-countdown";
    countdownSpan.textContent = getExamCountdownText(exam.dueDate);

    meta.append(dateSpan, countdownSpan);

    if (exam.fileName) {
      const fileSpan = document.createElement("span");
      fileSpan.style.cssText = "font-size: 0.775rem; color: #6366f1; font-weight: 600;";
      fileSpan.textContent = `📎 ${exam.fileName}`;
      meta.append(fileSpan);
    }

    const studyPlan = buildExamStudyPlan(exam);
    const details = document.createElement("p");
    details.className = "exam-details";
    details.textContent = studyPlan.length
      ? `Study plan for ${studyPlan.length} day${studyPlan.length === 1 ? "" : "s"}.`
      : getExamStudySuggestion(exam.dueDate);

    card.append(heading, meta, details);

    if (studyPlan.length) {
      const planList = document.createElement("ol");
      planList.className = "study-plan";
      studyPlan.forEach((step) => {
        const stepItem = document.createElement("li");
        stepItem.textContent = step;
        planList.append(stepItem);
      });
      card.append(planList);
    }

    examsList.append(card);
  });
}

function loadTimetable() {
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : getDefaultTimetable();
  } catch {
    return getDefaultTimetable();
  }
}

function saveTimetable() {
  try {
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
  } catch {
    // ignore storage errors
  }
}

function getDefaultTimetable() {
  return [
    { time: "8:00 - 9:00", Mon: "Math", Tue: "English", Wed: "Science", Thu: "History", Fri: "Art" },
    { time: "9:10 - 10:10", Mon: "Science", Tue: "Math", Wed: "English", Thu: "PE", Fri: "Geography" },
    { time: "10:20 - 11:20", Mon: "English", Tue: "History", Wed: "Math", Thu: "Science", Fri: "Music" },
    { time: "11:30 - 12:30", Mon: "Computer", Tue: "Art", Wed: "Geography", Thu: "English", Fri: "Math" },
    { time: "13:30 - 14:30", Mon: "History", Tue: "Science", Wed: "PE", Thu: "Math", Fri: "Library" },
  ];
}

function renderTimetable() {
  if (!timetableTable) return;
  const tbody = timetableTable.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  timetable.forEach((row) => {
    const tr = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = row.time || "";
    tr.append(timeCell);

    ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((day) => {
      const cell = document.createElement("td");
      cell.textContent = row[day] || "-";
      tr.append(cell);
    });

    tbody.append(tr);
  });
}

function loadAnnouncements() {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAnnouncements() {
  try {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  } catch {
    // ignore storage errors
  }
}

function addAnnouncement() {
  if (!announcementInput) return;
  const text = announcementInput.value.trim();
  const selectedClassValue = document.getElementById("announcementClassInput")?.value;
  const userClass = getUserClass(currentUser);
  const classSection = selectedClassValue || (Array.isArray(userClass) ? userClass[0] : userClass) || "";
  if (!text || !classSection) return;

  announcements.unshift({
    id: crypto.randomUUID(),
    text,
    classSection,
    createdAt: new Date().toISOString(),
  });
  saveAnnouncements();
  renderAnnouncements();
  addNotification(
    "announcement",
    "New announcement posted",
    text.length > 80 ? `${text.slice(0, 80)}…` : text
  );
  announcementInput.value = "";
}

function deleteAnnouncement(id) {
  if (!isTeacher() && currentRole !== "Staff" && currentRole !== "Principal") {
    window.alert("Only teachers and admin can delete announcements.");
    return;
  }
  announcements = announcements.filter((item) => item.id !== id);
  saveAnnouncements();
  renderAnnouncements();
}

function renderAnnouncements() {
  if (!announcementsList) return;
  announcementsList.innerHTML = "";

  let allAnnouncements = loadAnnouncements();
  // Filter by class access
  allAnnouncements = filterDataByClass(allAnnouncements, currentUser);

  if (!allAnnouncements.length) {
    announcementsList.innerHTML = "<p class=\"section-empty\">No announcements yet. Post an update to share with your class.</p>";
    return;
  }

  allAnnouncements.forEach((announcement) => {
    const card = document.createElement("div");
    card.className = "announcement-item";

    const header = document.createElement("div");
    header.className = "announcement-header";
    const timestamp = document.createElement("small");
    timestamp.textContent = new Date(announcement.createdAt).toLocaleString();
    const classBadge = document.createElement("span");
    classBadge.className = "class-badge announcement-class-badge";
    classBadge.textContent = announcement.classSection || "All";
    header.append(timestamp, classBadge);
    if (isTeacher() || currentRole === "Staff" || currentRole === "Principal") {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "action-btn action-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteAnnouncement(announcement.id));
      header.append(deleteBtn);
    }

    const body = document.createElement("p");
    body.textContent = announcement.text;

    card.append(header, body);
    announcementsList.append(card);
  });
}

function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications() {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {
    // ignore storage errors
  }
}

function addNotification(type, title, message) {
  if (!type || !title) return;
  notifications.unshift({
    id: crypto.randomUUID(),
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}

function renderNotifications() {
  if (!notificationList) return;
  notificationList.innerHTML = "";

  const countLabel = document.getElementById("notificationCountLabel");
  const unreadCount = notifications.filter((item) => !item.read).length;
  if (countLabel) {
    countLabel.textContent = unreadCount
      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
      : "All caught up";
  }

  if (!notifications.length) {
    notificationList.innerHTML = "<p class=\"notification-empty\">No notifications yet. New alerts will appear here.</p>";
    return;
  }

  notifications.forEach((notification) => {
    const item = document.createElement("div");
    item.className = `notification-item ${notification.read ? "read" : "unread"}`;
    const icon = notification.type === "exam" ? "📚" : notification.type === "announcement" ? "📣" : "💬";
    item.innerHTML = `
      <div class="notification-type notification-${notification.type}">${icon}</div>
      <div class="notification-body">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        <div class="notification-time">${new Date(notification.createdAt).toLocaleString()}</div>
      </div>
    `;
    notificationList.append(item);
  });
}

function updateNotificationBadge() {
  if (!notificationBadge) return;
  const unreadCount = notifications.filter((item) => !item.read).length;
  notificationBadge.textContent = String(unreadCount);
  notificationBadge.classList.toggle("hidden", unreadCount === 0);
}

function markNotificationsRead() {
  if (!notifications.length) return;
  notifications = notifications.map((item) => ({ ...item, read: true }));
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // ignore storage errors
  }
}

function addNote() {
  if (!noteTitleInput || !noteContentInput) return;
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();
  if (!title && !content) return;

  notes.unshift({
    id: crypto.randomUUID(),
    title: title || "Untitled note",
    content,
    createdAt: new Date().toISOString(),
  });
  saveNotes();
  renderNotes();
  noteTitleInput.value = "";
  noteContentInput.value = "";
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  renderNotes();
}

function renderNotes() {
  if (!notesList) return;
  notesList.innerHTML = "";

  if (!notes.length) {
    notesList.innerHTML = "<p class=\"section-empty\">No notes saved yet. Use the form above to keep important points handy.</p>";
    return;
  }

  notes.forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-card";

    const title = document.createElement("h4");
    title.textContent = note.title;
    const timestamp = document.createElement("small");
    timestamp.textContent = new Date(note.createdAt).toLocaleString();
    const body = document.createElement("p");
    body.textContent = note.content;
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn action-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    card.append(title, timestamp, body, deleteBtn);
    notesList.append(card);
  });
}

function renderDashboard() {
  if (
    !dashboardTotalTasksEl ||
    !dashboardCompletedTasksEl ||
    !dashboardPendingTasksEl ||
    !dashboardExamCountEl ||
    !dashboardUpcomingExamsEl ||
    !dashboardProgressEl ||
    !dashboardOverviewEl
  )
    return;

  let allTasks = filterDataByClass(loadTasks(), currentUser);
  let allExams = filterDataByClass(loadExams(), currentUser);

  // Apply owner filter
  if (currentUser) {
    allTasks = allTasks.filter(t => !t.ownerId || t.ownerId === currentUser.username);
  }

  if (dashboardClassFilter) {
    allTasks = allTasks.filter((task) => task.classSection === dashboardClassFilter);
    allExams = allExams.filter((exam) => exam.classSection === dashboardClassFilter);
  }
  if (dashboardSearchQuery) {
    allTasks = allTasks.filter((task) => matchDashboardSearch(task, dashboardSearchQuery));
    allExams = allExams.filter((exam) => matchDashboardSearch(exam, dashboardSearchQuery));
  }

  const totalCount = allTasks.length;
  const completedCount = allTasks.filter((task) => task.completed).length;
  const pendingCount = totalCount - completedCount;
  const upcomingExamCount = allExams.filter((exam) => {
    const days = getDaysUntil(exam.dueDate);
    return days !== null && days >= 0 && days <= 14;
  }).length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalEl = document.getElementById("dashboardTotalTasks") || dashboardTotalTasksEl;
  const completedEl = document.getElementById("dashboardCompletedTasks") || dashboardCompletedTasksEl;
  const pendingEl = document.getElementById("dashboardPendingTasks") || dashboardPendingTasksEl;
  const examCountEl = document.getElementById("dashboardExamCount") || dashboardExamCountEl;
  const upcomingExamsEl = document.getElementById("dashboardUpcomingExams") || dashboardUpcomingExamsEl;
  const progressEl = document.getElementById("dashboardProgress") || dashboardProgressEl;
  const overviewEl = document.getElementById("dashboardOverview") || dashboardOverviewEl;

  if (totalEl) totalEl.textContent = String(totalCount);
  if (completedEl) completedEl.textContent = String(completedCount);
  if (pendingEl) pendingEl.textContent = String(pendingCount);
  if (examCountEl) examCountEl.textContent = String(allExams.length);
  if (upcomingExamsEl) upcomingExamsEl.textContent = String(upcomingExamCount);
  if (progressEl) progressEl.textContent = `${progress}%`;

  const userClass = getUserClass(currentUser);
  const classText = Array.isArray(userClass) ? userClass.join(", ") : userClass || "N/A";

  if (overviewEl) {
    if (currentRole === "Principal") {
      const filterLabel = dashboardClassFilter ? ` for ${dashboardClassFilter}` : "";
      let searchLabel = dashboardSearchQuery ? ` matching "${dashboardSearchQuery}"` : "";
      overviewEl.textContent = `Principal dashboard${filterLabel}${searchLabel}. Use search and filters for fast class visibility.`;
    } else {
      overviewEl.textContent = `Welcome ${getDisplayName(currentUser?.username || "Student")}, your current role is ${currentRole} in class ${classText}. Check your tasks, timetable, announcements and notes to stay organized.`;
    }
  }

  // ── Right panel: progress ring ──
  const circle = document.getElementById("dbProgressCircle");
  const pctEl  = document.getElementById("dbProgressPct");
  if (circle) {
    const circumference = 251.2;
    circle.style.strokeDashoffset = String(circumference - (circumference * progress / 100));
  }
  if (pctEl) pctEl.textContent = `${progress}%`;

  // ── Right panel: pending task list ──
  const pendingListEl = document.getElementById("dbPendingList");
  if (pendingListEl) {
    const pendingTasks = allTasks.filter(t => !t.completed).slice(0, 8);
    if (pendingTasks.length === 0) {
      pendingListEl.innerHTML = `<p class="db-empty-state">All caught up! 🎉</p>`;
    } else {
      pendingListEl.innerHTML = pendingTasks.map(t => `
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.45rem 0.6rem;background:#f8fafc;border-radius:8px;border:1px solid #e8ecf3;">
          <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;"></span>
          <span style="font-size:0.8rem;color:#334155;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.text || "Untitled task"}</span>
          ${t.dueDate ? `<span style="font-size:0.7rem;color:#94a3b8;">${t.dueDate}</span>` : ""}
        </div>`).join("");
    }
  }

  // ── Left panel: recent completions ──
  const recentEl = document.getElementById("dbRecentActivity");
  if (recentEl) {
    const recentDone = allTasks.filter(t => t.completed).slice(-6).reverse();
    if (recentDone.length === 0) {
      recentEl.innerHTML = `<p class="db-empty-state">No completed tasks yet. Start ticking things off!</p>`;
    } else {
      recentEl.innerHTML = recentDone.map(t => `
        <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;background:#fff;border-radius:10px;border:1.5px solid #e8ecf3;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <span style="width:20px;height:20px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:0.7rem;flex-shrink:0;">✓</span>
          <span style="font-size:0.82rem;color:#334155;flex:1;">${t.text || "Task completed"}</span>
          <span style="font-size:0.72rem;color:#10b981;font-weight:600;">Done</span>
        </div>`).join("");
    }
  }

  // ── Quick note: restore from localStorage ──
  const noteEl = document.getElementById("dbQuickNote");
  if (noteEl && !noteEl._bound) {
    noteEl._bound = true;
    noteEl.value = localStorage.getItem("dbQuickNote_" + (currentUser?.username || "guest")) || "";
    noteEl.addEventListener("input", () => {
      localStorage.setItem("dbQuickNote_" + (currentUser?.username || "guest"), noteEl.value);
    });
  }
}

function buildExamStudyPlan(exam) {
  const daysUntil = getDaysUntil(exam.dueDate);
  if (daysUntil === null || daysUntil <= 0) return [];

  const maxStudyDays = exam.studyDays && exam.studyDays > 0 ? Math.min(exam.studyDays, daysUntil) : Math.max(1, Math.ceil(daysUntil * 0.35));
  const suggestions = [
    "Organize notes and outline the syllabus.",
    "Review key concepts and definitions.",
    "Practice example questions and exercises.",
    "Focus on weaker topics and difficult problems.",
    "Do a timed practice test or quiz.",
    "Review mistakes and refine your notes.",
    "Do a final summary and rest before exam day."
  ];

  return Array.from({ length: maxStudyDays }, (_, index) => {
    const suggestion = suggestions[index % suggestions.length];
    return `Day ${index + 1}: ${suggestion}`;
  });
}

function deleteExam(examId) {
  if (!isTeacher() && currentRole !== "Staff" && currentRole !== "Principal") {
    window.alert("Only teachers and admin can delete exams.");
    return;
  }
  exams = exams.filter((exam) => exam.id !== examId);
  saveExams();
  renderExams();
}

function loadExams() {
  try {
    const raw = localStorage.getItem(EXAMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExams() {
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
}

function getDaysUntil(dateValue) {
  if (!dateValue) return null;
  const today = parseISODate(toISODate(new Date()));
  const target = parseISODate(dateValue);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target - today) / msPerDay);
}

function getExamCountdownText(dueDate) {
  const daysUntil = getDaysUntil(dueDate);
  if (daysUntil === null) return "No exam date set.";
  if (daysUntil < 0) return `Exam passed ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"} ago.`;
  if (daysUntil === 0) return "Exam today!";
  return `Countdown: ${daysUntil} day${daysUntil === 1 ? "" : "s"}.`;
}

function getExamStudySuggestion(dueDate) {
  const daysUntil = getDaysUntil(dueDate);
  if (daysUntil === null) return "Study plan unavailable.";
  if (daysUntil <= 0) return "Focus on review and last-minute practice."
  const suggestedDays = Math.max(1, Math.ceil(daysUntil * 0.35));
  return `Suggested study days: ${suggestedDays} day${suggestedDays === 1 ? "" : "s"} before the exam.`;
}

function addTaskFromInput() {
  const rawText = homeworkInput.value.trim();
  if (!rawText && !selectedQuickType) return;

  let newTasks = [];
  if (rawText) {
    const parsedTasks = parseTaskInput(rawText, dueDateInput.value);
    newTasks = parsedTasks
      .map((parsed) => {
        if (!parsed.title) return null;
        return {
          id: crypto.randomUUID(),
          text: capitalizeTaskText(parsed.title),
          subject: parsed.subject,
          type: parsed.type,
          dueDate: parsed.dueDate,
          dueDateLabel: parsed.dueDate
            ? formatDateLabel(parseISODate(parsed.dueDate))
            : "",
          hasDeadline: Boolean(parsed.dueDate),
          pointsAwarded: false,
          completed: false,
          ownerId: currentUser?.username || "",
        };
      })
      .filter(Boolean);
  } else {
    newTasks = [buildQuickTask(selectedQuickType)];
  }

  if (!newTasks.length) return;

  const taskGroupValue = taskGroupInput?.value || "";
  const selectedGroupForTask = taskGroupValue || selectedGroupId || "";
  const selectedClassValue = document.getElementById("taskClassInput")?.value;
  const userClass = getUserClass(currentUser);
  const taskClassValue = selectedClassValue || (Array.isArray(userClass) ? userClass[0] : userClass) || "";
  newTasks = newTasks.map((task) => ({
    ...task,
    groupId: selectedGroupForTask,
    groupName: getGroupName(selectedGroupForTask),
    classSection: taskClassValue,
  }));

  tasks = [...newTasks.reverse(), ...tasks];
  saveTasks();
  renderTasks();
  homeworkInput.value = "";
  dueDateInput.value = "";
  if (taskGroupInput) taskGroupInput.value = "";
  selectedQuickType = "";
  updateQuickAddSelection();
  homeworkInput.focus();
}

function buildQuickTask(type) {
  return {
    id: crypto.randomUUID(),
    text: capitalizeTaskText(QUICK_TASK_TEXT_MAP[type] || "Complete study task"),
    subject: "",
    type: type.toLowerCase(),
    dueDate: "",
    dueDateLabel: "",
    hasDeadline: false,
    pointsAwarded: false,
    completed: false,
    groupId: "",
    groupName: "",
    ownerId: currentUser?.username || "",
  };
}

function updateQuickAddSelection() {
  quickAddBtns.forEach((button) => {
    const isSelected = button.dataset.quickType === selectedQuickType;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;

    const nextCompleted = !task.completed;
    let updatedTask = { ...task, completed: nextCompleted };

    if (nextCompleted && !task.pointsAwarded) {
      updatedTask = { ...updatedTask, pointsAwarded: true };
      stats.totalPoints += POINTS_PER_COMPLETION;
      updateStreakOnCompletion();
      updateLevelAndBadge();
    }

    return updatedTask;
  });

  saveTasks();
  saveStats();
  renderTasks();
  renderStats();
}

function renderTasks() {
  if (!todayTaskList || !upcomingTaskList || !completedTaskList) return;

  todayTaskList.innerHTML = "";
  upcomingTaskList.innerHTML = "";
  completedTaskList.innerHTML = "";

  const today = toISODate(new Date());

  let allTasks = loadTasks();
  // Filter by class access
  allTasks = filterDataByClass(allTasks, currentUser);

  // Filter tasks to only show those belonging to the current user
  if (currentUser) {
    allTasks = allTasks.filter(task => !task.ownerId || task.ownerId === currentUser.username);
  } else {
    allTasks = [];
  }

  const allPendingTasks = allTasks.filter((task) => !task.completed);
  let todayTasks = allPendingTasks.filter((task) => !task.dueDate || task.dueDate <= today);
  let upcomingTasks = allPendingTasks.filter((task) => task.dueDate && task.dueDate > today);
  let completedTasks = allTasks.filter((task) => task.completed);

  // 🧩 Group filter
  if (selectedGroupId) {
    todayTasks = todayTasks.filter((task) => task.groupId === selectedGroupId);
    upcomingTasks = upcomingTasks.filter((task) => task.groupId === selectedGroupId);
    completedTasks = completedTasks.filter((task) => task.groupId === selectedGroupId);
  }

  // 🔍 Search filter
  if (searchQuery) {
    todayTasks = todayTasks.filter((task) =>
      task.text.toLowerCase().includes(searchQuery)
    );
    upcomingTasks = upcomingTasks.filter((task) =>
      task.text.toLowerCase().includes(searchQuery)
    );
    completedTasks = completedTasks.filter((task) =>
      task.text.toLowerCase().includes(searchQuery)
    );
  }

  upcomingTasks.sort(compareByDueDateSoonest);
  todayTasks.sort(compareByDueDateSoonest);

  const showToday = currentFilter === "all" || currentFilter === "today";
  const showUpcoming = currentFilter === "all" || currentFilter === "upcoming";
  const showCompleted = currentFilter === "all" || currentFilter === "completed";

  renderTaskGroup(showToday ? todayTasks : [], todayTaskList, showToday);
  renderTaskGroup(showUpcoming ? upcomingTasks : [], upcomingTaskList, true);
  renderTaskGroup(showCompleted ? completedTasks : [], completedTaskList, false);
  renderReminderBanner(allPendingTasks);

  if (todayTaskSection) {
    todayTaskSection.classList.toggle("hidden", !showToday);
  }
  if (upcomingTaskSection) {
    upcomingTaskSection.classList.toggle("hidden", !showUpcoming);
  }
  if (completedTaskSection) {
    completedTaskSection.classList.toggle("hidden", !showCompleted);
  }

  if (todayEmpty) {
    todayEmpty.style.display = showToday && todayTasks.length === 0 ? "block" : "none";
  }
  if (upcomingEmpty) {
    upcomingEmpty.style.display = showUpcoming && upcomingTasks.length === 0 ? "block" : "none";
  }
  if (completedEmpty) {
    completedEmpty.style.display = showCompleted && completedTasks.length === 0 ? "block" : "none";
  }
  renderParentNotifications();
  renderStats();
}

function renderReminderBanner(activeTasks) {
  if (!reminderBanner) return;

  const overdueCount = activeTasks.filter(isOverdue).length;
  const dueSoonCount = activeTasks.filter(
    (task) => !isOverdue(task) && isDueSoon(task)
  ).length;

  if (overdueCount > 0) {
    reminderBanner.textContent = `⚠️ ${overdueCount} overdue task${
      overdueCount === 1 ? "" : "s"
    }. Finish them first.`;
    reminderBanner.classList.add("reminder-active");
    reminderBanner.classList.remove("reminder-safe");
    return;
  }

  if (dueSoonCount > 0) {
    reminderBanner.textContent = `🔔 ${dueSoonCount} task${
      dueSoonCount === 1 ? "" : "s"
    } due soon. Keep your workflow moving.`;
    reminderBanner.classList.add("reminder-active");
    reminderBanner.classList.remove("reminder-safe");
    return;
  }

  reminderBanner.textContent = "✅ No urgent reminders right now. Add due dates to stay on schedule.";
  reminderBanner.classList.add("reminder-safe");
  reminderBanner.classList.remove("reminder-active");
}

function renderTaskGroup(taskGroup, container, showReminder) {
  for (const task of taskGroup) {
    const li = document.createElement("li");
    li.className = buildTaskClasses(task);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const main = document.createElement("div");
    main.className = "task-main";

    const text = document.createElement("p");
    text.className = "task-text";
    text.textContent = task.text;
    main.appendChild(text);

    if (task.subject) {
      const subject = document.createElement("p");
      const subjectClass = `subject-${task.subject.toLowerCase()}`;
      subject.className = `task-subject ${subjectClass}`;
      subject.textContent = `Subject: ${task.subject}`;
      main.appendChild(subject);
    }

    if (task.groupId || task.groupName) {
      const group = document.createElement("p");
      group.className = "task-group";
      group.textContent = `Group: ${task.groupName || task.groupId}`;
      main.appendChild(group);
    }

    if (task.type) {
      const type = document.createElement("p");
      type.className = "task-type";
      type.textContent = `Type: ${capitalizeTaskText(task.type)}`;
      main.appendChild(type);
    }

    if (task.dueDate) {
      const due = document.createElement("p");
      due.className = "task-date";
      due.textContent = `Due: ${task.dueDateLabel || task.dueDate}`;
      main.appendChild(due);

      if (showReminder) {
        const badge = buildReminderBadge(task);
        if (badge) main.appendChild(badge);
      }
    }

    if (task.attachments?.length) {
      const attachments = document.createElement("div");
      attachments.className = "task-attachments";
      task.attachments.forEach((attachment) => {
        const item = document.createElement("div");
        item.className = "task-attachment";
        item.textContent = attachment.name;
        attachments.appendChild(item);
      });
      main.appendChild(attachments);
    }

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "action-btn action-edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => editTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn action-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    const canEditTask = currentRole === "Teacher" || currentRole === "Staff";
    checkbox.disabled = !canEditTask;
    if (!canEditTask) {
      checkbox.title = "Only teachers and staff can update task completion.";
    }

    actions.append(editBtn, deleteBtn);
    actions.style.display = canEditTask ? "flex" : "none";
    li.append(checkbox, main, actions);
    container.appendChild(li);
  }
}

function buildTaskClasses(task) {
  const classes = ["task-item"];
  const hasDeadline = Boolean(task.hasDeadline || task.dueDate);
  if (task.completed) classes.push("completed");
  if (hasDeadline) classes.push("deadline-task");

  if (isOverdue(task)) {
    classes.push("overdue-task");
  } else if (isDueSoon(task)) {
    classes.push("due-soon-task");
  }

  return classes.join(" ");
}

function buildReminderBadge(task) {
  if (isOverdue(task)) {
    return createBadge("Overdue", "badge-overdue");
  }
  if (isDueSoon(task)) {
    return createBadge("Due Soon", "badge-soon");
  }
  return null;
}

function createBadge(text, className) {
  const badge = document.createElement("p");
  badge.className = `task-badge ${className}`;
  badge.textContent = text;
  return badge;
}

function compareByDueDateSoonest(a, b) {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate.localeCompare(b.dueDate);
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = toISODate(new Date());
  return task.dueDate < today;
}

function isDueSoon(task) {
  if (!task.dueDate || task.completed) return false;
  const today = toISODate(new Date());
  const daysDiff = getDayDifference(today, task.dueDate);
  return daysDiff >= 0 && daysDiff <= 2;
}

function editTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task || !editTaskModal || !editTaskTextarea) return;

  editingTaskId = taskId;
  editTaskTextarea.value = task.text || "";
  editTaskModal.classList.remove("hidden");
  editTaskTextarea.focus();
}

function saveTaskEdit() {
  if (!editingTaskId || !editTaskTextarea) return;
  const nextText = editTaskTextarea.value.trim();
  const cleaned = capitalizeTaskText(nextText);
  if (!cleaned) return;

  tasks = tasks.map((item) =>
    item.id === editingTaskId ? { ...item, text: cleaned } : item
  );
  saveTasks();
  renderTasks();
  closeTaskEditModal();
}

function closeTaskEditModal() {
  editingTaskId = null;
  if (editTaskModal) {
    editTaskModal.classList.add("hidden");
  }
  if (editTaskTextarea) {
    editTaskTextarea.value = "";
  }
}

function deleteTask(taskId) {
  const shouldDelete = window.confirm(
    "Are you sure you want to delete this task?"
  );
  if (!shouldDelete) return;

  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((task) => {
      const normalizedDue = task.dueDate || "";
      return {
        ...task,
        text: capitalizeTaskText(task.text || ""),
        subject: task.subject || "",
        type: task.type || "",
        dueDate: normalizedDue,
        dueDateLabel: task.dueDateLabel || (normalizedDue ? formatDateLabel(parseISODate(normalizedDue)) : ""),
        hasDeadline: Boolean(task.hasDeadline || normalizedDue),
        pointsAwarded: Boolean(task.pointsAwarded),
        groupId: task.groupId || "",
        groupName: task.groupName || getGroupName(task.groupId || ""),
      };
    });
  } catch {
    return [];
  }
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) {
      return {
        totalPoints: 0,
        streakCount: 0,
        lastCompletionDate: "",
        lastRewardedStreak: 0,
        rewardMessage: "Keep going to earn streak rewards.",
      };
    }

    return {
      totalPoints: Number(parsed.totalPoints) || 0,
      streakCount: Number(parsed.streakCount) || 0,
      lastCompletionDate: parsed.lastCompletionDate || "",
      lastRewardedStreak: Number(parsed.lastRewardedStreak) || 0,
      rewardMessage:
        parsed.rewardMessage || "Keep going to earn streak rewards.",
    };
  } catch {
    return {
      totalPoints: 0,
      streakCount: 0,
      lastCompletionDate: "",
      lastRewardedStreak: 0,
      rewardMessage: "Keep going to earn streak rewards.",
    };
  }
}

function renderStats() {
  if (totalPointsEl) totalPointsEl.textContent = String(stats.totalPoints);
  const dayLabel = stats.streakCount === 1 ? "day" : "days";
  if (streakCountEl) streakCountEl.textContent = `${stats.streakCount} ${dayLabel}`;
  if (levelValueEl) levelValueEl.textContent = String(getCurrentLevel(stats.totalPoints));
  let filteredTasks = tasks;
  if (currentUser) {
    filteredTasks = filterDataByClass(tasks, currentUser);
    filteredTasks = filteredTasks.filter(task => !task.ownerId || task.ownerId === currentUser.username);
  }

  if (badgeLabelEl) badgeLabelEl.textContent = getBadgeForCompletedTasks(
    filteredTasks.filter((task) => task.completed).length
  );

  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((task) => task.completed).length;
  const pendingCount = totalCount - completedCount;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  if (totalTasksEl) totalTasksEl.textContent = String(totalCount);
  if (completedTasksEl) completedTasksEl.textContent = String(completedCount);
  if (pendingTasksEl) pendingTasksEl.textContent = String(pendingCount);
  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressPercent) progressPercent.textContent = `${progress}%`;

  if (rewardBanner) rewardBanner.textContent = stats.rewardMessage;
}

function getCurrentLevel(points) {
  return Math.max(1, Math.floor(points / LEVEL_POINTS) + 1);
}

function getBadgeForCompletedTasks(completedCount) {
  return (
    BADGE_TIERS.find((tier) => completedCount >= tier.threshold) || BADGE_TIERS.slice(-1)[0]
  ).label;
}

function getStreakBonus(streak) {
  // Only award at exact milestone days (3, 7, 14)
  return STREAK_BONUSES[streak] || 0;
}

function updateLevelAndBadge() {
  let filteredTasks = tasks;
  if (currentUser) {
    filteredTasks = filterDataByClass(tasks, currentUser);
    filteredTasks = filteredTasks.filter(task => !task.ownerId || task.ownerId === currentUser.username);
  }
  stats.currentLevel = getCurrentLevel(stats.totalPoints);
  stats.currentBadge = getBadgeForCompletedTasks(
    filteredTasks.filter((task) => task.completed).length
  );
}

function updateStreakOnCompletion() {
  const today = toISODate(new Date());
  const lastDate = stats.lastCompletionDate;

  if (!lastDate) {
    stats.streakCount = 1;
    stats.lastCompletionDate = today;
    stats.rewardMessage =
      "Great start! Keep completing tasks daily to earn streak bonuses.";
    stats.lastRewardedStreak = 0;
    return;
  }

  const daysDiff = getDayDifference(lastDate, today);
  if (daysDiff === 0) {
    return;
  }

  if (daysDiff === 1) {
    stats.streakCount += 1;
    const bonus = getStreakBonus(stats.streakCount);

    if (bonus && stats.lastRewardedStreak < stats.streakCount) {
      stats.totalPoints += bonus;
      stats.lastRewardedStreak = stats.streakCount;
      stats.rewardMessage = `Streak bonus! ${bonus} extra points for ${stats.streakCount} days straight.`;
    } else {
      stats.rewardMessage = `Nice streak! ${stats.streakCount} days in a row.`;
    }
  } else {
    stats.streakCount = 1;
    stats.lastRewardedStreak = 0;
    stats.rewardMessage = "Streak reset — start a new streak today!";
  }

  stats.lastCompletionDate = today;
}

function refreshStreakIfBroken() {
  if (!stats.lastCompletionDate || stats.streakCount === 0) return;

  const today = toISODate(new Date());
  const daysDiff = getDayDifference(stats.lastCompletionDate, today);
  if (daysDiff > 1) {
    stats.streakCount = 0;
    stats.lastRewardedStreak = 0;
    stats.rewardMessage = "Streak broken. Complete a task today to restart it.";
    saveStats();
  }
}

function getDayDifference(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((utcEnd - utcStart) / msPerDay);
}

function capitalizeTaskText(text) {
  const trimmed = String(text).trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// Launchpad Implementation
var launchpadSearchInitialized = false;

function renderLaunchpad() {
  const gridEl = document.getElementById("launchpadGrid");
  const searchInput = document.getElementById("launchpadSearch");
  if (!gridEl) return;

  // Initialize search input listener once
  if (searchInput && !launchpadSearchInitialized) {
    searchInput.value = ""; // Clear search on initial load
    searchInput.addEventListener("input", () => {
      renderLaunchpadCards(gridEl, searchInput.value.trim());
    });
    launchpadSearchInitialized = true;
  }

  // Initialize folder overlay and back button listeners
  initFolderOverlayListeners();

  const query = searchInput ? searchInput.value.trim() : "";
  renderLaunchpadCards(gridEl, query);
  updateLaunchpadBreadcrumbs();
  updateBackButtons();
}

function renderLaunchpadCards(gridEl, searchQuery) {
  gridEl.innerHTML = "";
  const role = currentRole || "Student";
  const normalizedQuery = searchQuery.toLowerCase();

  if (normalizedQuery) {
    gridEl.classList.remove("launchpad-sections");
    gridEl.classList.add("launchpad-search-results");

    const allItems = [
      ...LAUNCHPAD_MODULES,
      ...LAUNCHPAD_GRADES,
      ...LAUNCHPAD_SECTIONS,
      ...LAUNCHPAD_SECTION_MODULES,
    ];

    const uniqueItems = [];
    const seen = new Set();
    for (const item of allItems) {
      const id = item.key || item.name;
      if (!seen.has(id)) {
        seen.add(id);
        uniqueItems.push(item);
      }
    }

    const filtered = uniqueItems.filter((mod) => {
      return (
        mod.name.toLowerCase().includes(normalizedQuery) ||
        (mod.fullName && mod.fullName.toLowerCase().includes(normalizedQuery)) ||
        (mod.desc && mod.desc.toLowerCase().includes(normalizedQuery))
      );
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `<div class="no-results-msg">No matching modules found</div>`;
      return;
    }

    const row = document.createElement("div");
    row.className = "launchpad-section-row";
    filtered.forEach((mod) => row.appendChild(createModuleCard(mod, role)));
    gridEl.appendChild(row);
    return;
  }

  gridEl.classList.remove("launchpad-search-results");
  gridEl.classList.add("launchpad-sections");

  const view = launchpadNavState.view || "root";

  if (view === "root") {
    LAUNCHPAD_CATEGORIES.forEach((catObj) => {
      const sec = document.createElement("section");
      sec.className = "launchpad-section";

      const badge = document.createElement("div");
      badge.className = "launchpad-section-badge";
      badge.textContent = catObj.category;
      sec.appendChild(badge);

      const row = document.createElement("div");
      row.className = "launchpad-section-row";
      catObj.modules.forEach((mod) => row.appendChild(createModuleCard(mod, role)));
      sec.appendChild(row);

      gridEl.appendChild(sec);
    });
  } else {
    let itemsToRender = [];
    if (view === "academics") {
      itemsToRender = LAUNCHPAD_GRADES;
    } else if (view === "grade") {
      itemsToRender = LAUNCHPAD_SECTIONS;
    } else if (view === "section") {
      itemsToRender = LAUNCHPAD_SECTION_MODULES;
    }

    const section = document.createElement("section");
    section.className = "launchpad-section";

    const row = document.createElement("div");
    row.className = "launchpad-section-row";
    itemsToRender.forEach((mod) => row.appendChild(createModuleCard(mod, role)));
    section.appendChild(row);

    gridEl.appendChild(section);
  }
}

function createModuleCard(mod, role) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "launchpad-card";
  card.setAttribute("aria-label", `${mod.fullName || mod.name} module`);

  if (mod.key === "live-clock-module") {
    card.classList.add("launchpad-widget-card");
    card.innerHTML = `
      <div class="widget-content">
        <div class="widget-label">🕐 IST Time</div>
        <div>
          <div id="widgetTime" class="widget-time">--:--</div>
          <div id="widgetDate" class="widget-date">--</div>
        </div>
      </div>
    `;
  } else {
    const isAI = mod.key === "vgs-ai" || mod.key === "antigravity-ai";
    const squircleClass = isAI ? "launchpad-squircle launchpad-squircle-none" : "launchpad-squircle";

    const iconMarkup = mod.icon || "📁";
    card.innerHTML = `
      <span class="${squircleClass}">${iconMarkup}</span>
      <span class="launchpad-card-label" title="${mod.fullName || mod.name}">${mod.name}</span>
    `;
  }

  card.addEventListener("click", () => {
    const searchInput = document.getElementById("launchpadSearch");

    if (mod.key === "academics" || mod.type === "folder") {
      if (searchInput) searchInput.value = "";
      launchpadNavState = { view: "academics" };
      renderLaunchpad();
      return;
    }

    if (mod.type === "grade") {
      if (searchInput) searchInput.value = "";
      launchpadNavState = {
        view: "grade",
        grade: mod.grade,
        gradeName: mod.name,
      };
      renderLaunchpad();
      return;
    }

    if (mod.type === "section") {
      if (searchInput) searchInput.value = "";
      launchpadNavState = {
        view: "section",
        grade: launchpadNavState.grade || 1,
        gradeName: launchpadNavState.gradeName || "Grade 1",
        section: mod.section,
        sectionName: mod.name,
      };
      renderLaunchpad();
      return;
    }

    // Leaf module actions
    if (mod.action === "overlay" && mod.overlayId) {
      openOverlay(mod.overlayId);
    } else if (mod.action === "tab" && mod.tab) {
      switchTab(mod.tab);
    }
  });

  return card;
}

var activeFolder = null;

function openFolder(folder, modules, role) {
  activeFolder = folder;
  const overlay = document.getElementById("folderOverlay");
  const titleEl = document.getElementById("folderOverlayTitle");
  const gridEl = document.getElementById("folderOverlayGrid");

  if (!overlay || !titleEl || !gridEl) return;

  titleEl.textContent = folder.name;
  gridEl.innerHTML = "";

  modules.forEach(mod => {
    const card = createModuleCard(mod, role);
    gridEl.appendChild(card);
  });

  overlay.classList.remove("hidden");
  updateLaunchpadBreadcrumbs();
  updateBackButtons();
}

function closeFolder() {
  const overlay = document.getElementById("folderOverlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
  activeFolder = null;
  updateLaunchpadBreadcrumbs();
  updateBackButtons();
}

var folderListenersInitialized = false;
function initFolderOverlayListeners() {
  if (folderListenersInitialized) return;

  const overlay = document.getElementById("folderOverlay");
  const closeBtn = document.getElementById("folderCloseBtn");
  const lpBackBtn = document.getElementById("lpBackBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeFolder();
    });
  }

  if (lpBackBtn) {
    lpBackBtn.addEventListener("click", () => {
      if (activeFolder || (overlay && !overlay.classList.contains("hidden"))) {
        closeFolder();
        return;
      }
      if (launchpadNavState.view === "section") {
        launchpadNavState = {
          view: "grade",
          grade: launchpadNavState.grade,
          gradeName: launchpadNavState.gradeName,
        };
        renderLaunchpad();
      } else if (launchpadNavState.view === "grade") {
        launchpadNavState = { view: "academics" };
        renderLaunchpad();
      } else if (launchpadNavState.view === "academics") {
        launchpadNavState = { view: "root" };
        renderLaunchpad();
      } else {
        goBack();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeFolder();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(".modal-overlay:not(.hidden)");
      if (openModal) {
        closeOverlay(openModal.id);
        return;
      }
      closeFolder();
    }
  });

  folderListenersInitialized = true;
}

function updateLaunchpadBreadcrumbs() {
  const crumbs = document.getElementById("lpBreadcrumbs");
  if (!crumbs) return;
  crumbs.innerHTML = "";
}

function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.add("hidden");
}

function openOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove("hidden");
}

window.closeOverlay = closeOverlay;
window.openOverlay = openOverlay;

function initOverlaySidebarTabs() {
  document.querySelectorAll(".overlay-sidebar").forEach((sidebar) => {
    const panel = sidebar.closest(".overlay-content-split") || sidebar.parentElement;
    if (!panel || sidebar.dataset.tabsReady === "1") return;
    sidebar.dataset.tabsReady = "1";
    sidebar.querySelectorAll(".sidebar-tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const targetId = tabBtn.dataset.tab;
        if (!targetId) return;
        sidebar.querySelectorAll(".sidebar-tab").forEach((btn) => {
          btn.classList.toggle("active", btn === tabBtn);
        });
        panel.querySelectorAll(".sub-tab-content").forEach((content) => {
          content.classList.toggle("hidden", content.id !== targetId);
        });
      });
    });
  });
}

initOverlaySidebarTabs();
updateLaunchpadBreadcrumbs();

function renderProfile() {
  const profileNameEl = document.getElementById("profileNameEl");
  const profileEmailEl = document.getElementById("profileEmailEl");
  const profileAvatarEl = document.getElementById("profileAvatarEl");
  const profileClassEl = document.getElementById("profileClassEl");
  const profileRoleBadge = document.getElementById("profileRoleBadge");

  if (!currentUser) return;

  if (profileNameEl) profileNameEl.textContent = currentUser.displayName || currentUser.username;
  if (profileEmailEl) profileEmailEl.textContent = currentUser.email || `${currentUser.username}@school.com`;
  if (profileRoleBadge) profileRoleBadge.textContent = currentUser.role;
  if (profileClassEl) {
    const userClass = getUserClass(currentUser);
    profileClassEl.textContent = Array.isArray(userClass) ? userClass.join(", ") : userClass || "N/A";
  }
  if (profileAvatarEl) {
    profileAvatarEl.textContent = getGroupInitials(currentUser.displayName || currentUser.username);
  }
}

// VGS AI Communication & Intelligent Assistant Engine
function sendVGSAIMessage(presetText) {
  const chatInput = document.getElementById("aiChatInput");
  const messagesContainer = document.getElementById("aiChatMessages");
  if (!messagesContainer) return;

  const query = (presetText || (chatInput ? chatInput.value : "")).trim();
  if (!query) return;

  if (chatInput) chatInput.value = "";

  // 1. Append User Message
  appendVGSAIMessage(query, "user");

  // 2. Show Typing Indicator
  const typingEl = showVGSAITypingIndicator();

  // 3. Generate Intelligent Response
  setTimeout(() => {
    if (typingEl && typingEl.parentNode) {
      typingEl.parentNode.removeChild(typingEl);
    }
    const response = generateVGSResponse(query);
    appendVGSAIMessage(response, "ai");
  }, 450);
}

function appendVGSAIMessage(text, sender) {
  const messagesContainer = document.getElementById("aiChatMessages");
  if (!messagesContainer) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `ai-message ${sender === "user" ? "sent" : "received"}`;
  msgDiv.style.display = "flex";
  msgDiv.style.gap = "0.75rem";
  msgDiv.style.alignItems = "flex-start";
  msgDiv.style.maxWidth = "85%";
  msgDiv.style.marginBottom = "0.75rem";

  if (sender === "user") {
    msgDiv.style.alignSelf = "flex-end";
    msgDiv.style.flexDirection = "row-reverse";
    msgDiv.innerHTML = `
      <span class="user-avatar" style="width: 28px; height: 28px; border-radius: 50%; background: #6366f1; color:#fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">👤</span>
      <div class="bubble" style="background: #6366f1; color: #ffffff; padding: 0.75rem 1rem; border-radius: 16px; border-top-right-radius: 4px; line-height: 1.5; font-size: 0.9rem;">
        ${escapeHTML(text)}
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <span class="ai-avatar" style="width: 28px; height: 28px; border-radius: 50%; background: #4f61ff; color:#fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">🤖</span>
      <div class="bubble" style="background: rgba(79, 97, 255, 0.08); color: var(--text, #1e293b); padding: 0.75rem 1rem; border-radius: 16px; border-top-left-radius: 4px; line-height: 1.5; font-size: 0.9rem;">
        ${formatAIResponseText(text)}
      </div>
    `;
  }

  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showVGSAITypingIndicator() {
  const messagesContainer = document.getElementById("aiChatMessages");
  if (!messagesContainer) return null;

  const typingDiv = document.createElement("div");
  typingDiv.className = "ai-message received typing-indicator-msg";
  typingDiv.style.display = "flex";
  typingDiv.style.gap = "0.75rem";
  typingDiv.style.alignItems = "flex-start";
  typingDiv.style.maxWidth = "85%";
  typingDiv.style.marginBottom = "0.75rem";
  typingDiv.innerHTML = `
    <span class="ai-avatar" style="width: 28px; height: 28px; border-radius: 50%; background: #4f61ff; color:#fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;">🤖</span>
    <div class="bubble" style="background: rgba(79, 97, 255, 0.08); padding: 0.6rem 1rem; border-radius: 16px; border-top-left-radius: 4px; font-size: 0.85rem; color: #64748b; font-style: italic;">
      VGS AI is typing...
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return typingDiv;
}

window.sendVGSAIMessage = sendVGSAIMessage;

function initVGSAIChat() {
  const chatInput = document.getElementById("aiChatInput");
  const form = document.getElementById("aiChatForm");
  const sendBtn = document.getElementById("sendAIChatBtn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      sendVGSAIMessage();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sendVGSAIMessage();
    });
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendVGSAIMessage();
      }
    });
  }
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatAIResponseText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function generateVGSResponse(rawQuery) {
  const q = rawQuery.toLowerCase().trim();
  const userName = currentUser ? (currentUser.displayName || currentUser.username) : "Student";
  const userRole = currentUser ? currentUser.role : "Student";

  // 1. Greetings & Introductions
  if (
    q.includes("hi") ||
    q.includes("hello") ||
    q.includes("hey") ||
    q.includes("morning") ||
    q.includes("afternoon") ||
    q.includes("evening") ||
    q.includes("who are you") ||
    q.includes("your name")
  ) {
    return `Hello **${userName}**! 👋 I am **VGS AI**, your Vibgyor School & Academic Assistant.\n\nI am equipped to communicate and assist you with:\n• **Academic Subjects**: Science, Math, History, English, Physics, Chemistry, Computer Science, Biology, and Geography.\n• **Homework & Deadlines**: Reviewing pending tasks and due dates.\n• **Exams & Schedules**: Looking up timetables, exam dates, and study plans.\n• **Admin ERP & Hierarchy**: Navigation across Grades 1-12, Sections A-D, and academic modules.\n• **Study Techniques**: Flashcards, active recall, and time management.\n\nHow can I help you succeed today? 😊`;
  }

  // 2. Homework & Tasks
  if (
    q.includes("homework") ||
    q.includes("task") ||
    q.includes("assignment") ||
    q.includes("pending") ||
    q.includes("work")
  ) {
    const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => !t.completed) : [];
    if (pendingTasks.length === 0) {
      return `🎉 **Great news, ${userName}!** You currently have **0 pending homework tasks**.\n\nKeep up the excellent momentum! You can earn extra study points by reviewing upcoming subject resources or preparing for future exams. 📚`;
    }
    const taskListText = pendingTasks
      .slice(0, 5)
      .map((t, idx) => `${idx + 1}. **${t.title}** (${t.subject || "General"}) — Due: ${t.dueDate || "Soon"}`)
      .join("\n");
    return `📝 **Homework Overview for ${userName}**:\n\nYou currently have **${pendingTasks.length} pending task(s)**:\n\n${taskListText}\n\n💡 **Tip**: Completing each task earns **10 points** towards your streak badge!`;
  }

  // 3. Exams & Test Schedules
  if (
    q.includes("exam") ||
    q.includes("test") ||
    q.includes("assessment") ||
    q.includes("paper") ||
    q.includes("quiz")
  ) {
    if (!exams || !Array.isArray(exams) || exams.length === 0) {
      return `📅 **Exam Update**:\n\nThere are no upcoming scheduled exams in your current view. Be sure to check the **Examinations** module in Launchpad regularly for updated timetables and syllabus guidelines.`;
    }
    const examListText = exams
      .slice(0, 4)
      .map(e => `• **${e.name || e.subject}** (${e.subject}): Date **${e.date}** — ${e.studyDays || 3} study days remaining.`)
      .join("\n");
    return `📝 **Upcoming Examinations**:\n\n${examListText}\n\n💡 **Recommended Study Strategy**:\nUse **Active Recall** and test yourself with sample question papers from your section module!`;
  }

  // 4. Timetable & Schedule
  if (
    q.includes("timetable") ||
    q.includes("schedule") ||
    q.includes("routine") ||
    q.includes("class time") ||
    q.includes("period")
  ) {
    return `📅 **Timetable & Daily Schedule**:\n\nYour school timetable is structured across 6 daily periods:\n• **08:30 AM - 09:15 AM**: Mathematics\n• **09:20 AM - 10:05 AM**: Science / Physics\n• **10:10 AM - 10:55 AM**: English Language & Literature\n• **11:00 AM - 11:30 AM**: 🍎 Recess / Break\n• **11:35 AM - 12:20 PM**: Computer Science & AI\n• **12:25 PM - 01:10 PM**: Social Studies & Geography\n• **01:15 PM - 02:00 PM**: Physical Education / Electives\n\nYou can access the interactive grid anytime via the **Timetable** module!`;
  }

  // 5. Streak, Points & Gamification
  if (
    q.includes("streak") ||
    q.includes("point") ||
    q.includes("badge") ||
    q.includes("score") ||
    q.includes("level")
  ) {
    const currentPoints = stats ? stats.totalPoints || 0 : 0;
    const streakCount = stats ? stats.streakCount || 0 : 0;
    const badgeLabel = stats ? stats.badgeLabel || "Learner" : "Learner";
    return `🏆 **Gamification & Rewards Summary**:\n\n• **Current Streak**: 🔥 **${streakCount} day(s)**\n• **Total Points**: ⭐ **${currentPoints} pts**\n• **Badge Status**: 🏅 **${badgeLabel} Tier**\n\n💡 **How to earn more points**:\n- Complete daily homework tasks (+10 pts)\n- Maintain a multi-day streak (+15 to +80 bonus pts)\n- Participate in section learning outcomes`;
  }

  // 6. Admin ERP & School Hierarchy
  if (
    q.includes("academics") ||
    q.includes("grade") ||
    q.includes("section") ||
    q.includes("hierarchy") ||
    q.includes("structure")
  ) {
    return `🏫 **Vibgyor Admin ERP Hierarchy**:\n\nThe Vibgyor portal is organized into a dynamic 4-tier Admin ERP structure:\n\n1. **Top-Level Launchpad**: 13 Core Modules (*Academics, Students, Staff, Timetable, Examinations, Finance, Communication, Reports, VGS AI, Administration, Security, Documents, Settings*).\n2. **Academics**: Grades 1 to 12.\n3. **Grade Level**: Sections A, B, C, D.\n4. **Section Level**: 18 specialized modules (*Subjects, Lesson Plans, Teaching Aids, Worksheets, Question Papers, Assessments, Students, Teachers, Timetable, Academic Calendar, Syllabus, Learning Outcomes, Learning Resources, Projects, Student Portfolios, Analytics, Documents, Settings*).\n\nUse the **Launchpad** tab to navigate seamlessly!`;
  }

  // 7. Staff & Teachers Directory
  if (
    q.includes("teacher") ||
    q.includes("staff") ||
    q.includes("faculty") ||
    q.includes("principal") ||
    q.includes("who teaches") ||
    q.includes("smith") ||
    q.includes("sharma")
  ) {
    return `👩‍🏫 **Staff & Faculty Directory**:\n\n• **Principal Admin**: Principal Office (admin.schoolapp@org)\n• **Senior Math & Science Teacher**: Mr. Smith (teacher.schoolapp@org)\n• **Class Coordinator**: Mrs. Sharma\n\nFor direct parent-teacher communication, navigate to the **Communication** or **Staff** overlay module!`;
  }

  // 8. Academic Subjects & Concept Explanations
  if (
    q.includes("photosynthesis") ||
    q.includes("plant") ||
    q.includes("biology")
  ) {
    return `🌿 **Biology: Photosynthesis Explained**:\n\nPhotosynthesis is the chemical process by which green plants convert solar energy into biochemical energy:\n\n1. **Inputs**: Water (H₂O) from soil + Carbon Dioxide (CO₂) from air + Sunlight.\n2. **Chlorophyll**: Traps solar light inside the chloroplasts.\n3. **Outputs**: Glucose (C₆H₁₂O₆) for energy + Oxygen (O₂) released for breathing.\n\n**Chemical Equation**:\n6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂`;
  }

  if (
    q.includes("math") ||
    q.includes("algebra") ||
    q.includes("pythagoras") ||
    q.includes("geometry") ||
    q.includes("formula")
  ) {
    return `📐 **Mathematics Core Formulas & Concepts**:\n\n• **Pythagorean Theorem**: a² + b² = c² (in a right-angled triangle).\n• **Quadratic Formula**: x = (-b ± √(b² - 4ac)) / (2a)\n• **Area of Circle**: A = πr²\n• **Circumference**: C = 2πr\n\nIf you have a specific math problem, type the equation and I will walk you through the step-by-step solution!`;
  }

  if (
    q.includes("physics") ||
    q.includes("gravity") ||
    q.includes("motion") ||
    q.includes("newton") ||
    q.includes("speed")
  ) {
    return `⚛️ **Physics: Newton's Laws of Motion**:\n\n1. **First Law (Inertia)**: An object remains at rest or in uniform motion unless acted upon by a net external force.\n2. **Second Law (Force)**: F = m × a (Force = Mass × Acceleration).\n3. **Third Law (Action & Reaction)**: For every action, there is an equal and opposite reaction.\n\n**Key Formula**: v = u + at (Velocity equation).`;
  }

  if (
    q.includes("chemistry") ||
    q.includes("atom") ||
    q.includes("periodic table") ||
    q.includes("element")
  ) {
    return `🧪 **Chemistry Overview**:\n\n• **Atom Structure**: Protons (+), Neutrons (neutral) in the nucleus; Electrons (-) in outer shells.\n• **Periodic Table**: Elements arranged by atomic number (Z).\n• **pH Scale**: 0-6 (Acidic), 7 (Neutral), 8-14 (Basic/Alkaline).\n• **Water Molecule**: H₂O (Polar covalent bond).`;
  }

  if (
    q.includes("english") ||
    q.includes("essay") ||
    q.includes("grammar") ||
    q.includes("writing")
  ) {
    return `📝 **English Language & Writing Guidance**:\n\n• **Essay Structure**: Introduction (Hook + Thesis Statement) → Body Paragraphs (PEEL: Point, Evidence, Explanation, Link) → Conclusion.\n• **Grammar Tip**: Use active voice (*"The student completed the project"*) for clear, engaging writing.\n• **Literary Devices**: Metaphor, Simile, Personification, Alliteration, Imagery.`;
  }

  if (
    q.includes("computer") ||
    q.includes("code") ||
    q.includes("programming") ||
    q.includes("python") ||
    q.includes("javascript") ||
    q.includes("html")
  ) {
    return `💻 **Computer Science & Technology**:\n\n• **Core Languages**: HTML (Structure), CSS (Styling), JavaScript (Logic), Python (Data & AI).\n• **Variables & Logic**: Store values (\`let x = 10;\`) and make decisions with \`if/else\` conditionals.\n• **Algorithms**: Step-by-step instructions to solve computational problems efficiently.`;
  }

  if (
    q.includes("study tip") ||
    q.includes("how to study") ||
    q.includes("memorize") ||
    q.includes("concentration") ||
    q.includes("prep")
  ) {
    return `🧠 **Top 5 Evidence-Based Study Strategies**:\n\n1. **Pomodoro Technique**: 25 minutes of focused study, followed by a 5-minute break.\n2. **Active Recall**: Test your memory without looking at notes.\n3. **Spaced Repetition**: Review material at expanding intervals (1 day, 3 days, 1 week).\n4. **Feynman Technique**: Explain the topic in simple terms as if teaching a classmate.\n5. **Mind Mapping**: Connect concepts visually for deeper comprehension.`;
  }

  // 9. Portal Navigation Help
  if (
    q.includes("where") ||
    q.includes("navigate") ||
    q.includes("find") ||
    q.includes("how do i") ||
    q.includes("button")
  ) {
    return `🔍 **Portal Quick Navigation Guide**:\n\n• **Launchpad**: Click the 🎛️ Launchpad button in the top left header anytime.\n• **Switch Role / Login**: Use the top right user menu or demo login buttons.\n• **Admin Panel**: Click **Administration** or **Settings** in Launchpad.\n• **Exams & Marks**: Click **Examinations** in Launchpad.\n• **Timetable**: Click **Timetable** in Launchpad.`;
  }

  // 10. General Knowledge / General Questions
  if (
    q.includes("planet") ||
    q.includes("sun") ||
    q.includes("earth") ||
    q.includes("history") ||
    q.includes("capital") ||
    q.includes("geography") ||
    q.includes("ocean") ||
    q.includes("country")
  ) {
    return `🌍 **General Knowledge Overview**:\n\n• **Solar System**: 8 planets orbiting the Sun (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune).\n• **Earth**: 7 continents and 5 oceans; 71% covered by water.\n• **Science & History**: Feel free to ask about specific historical events, scientific discoveries, or geographical facts!`;
  }

  // 11. Irrelevant / Off-Topic / Nonsensical Fallback Handler
  const isGibberish = q.length < 2 || /^[^a-zA-Z0-9\s]+$/.test(q);

  if (isGibberish || q.includes("crypto") || q.includes("gambling") || q.includes("hack") || q.includes("car repair") || q.includes("recipe")) {
    return `🤖 **VGS AI Assistant Notice**:\n\nI am **VGS AI**, your dedicated School & Academic Assistant! 🎓\n\nWhile I focus on educational subjects, school administration, study guidance, timetables, and learning resources, I am happy to help you with any academic subject, exam prep, or portal question!\n\n💡 **Try asking me:**\n• *"Explain the concept of Photosynthesis"*\n• *"Show my pending homework tasks"*\n• *"What are effective study techniques for exams?"*\n• *"What is the formula for quadratic equations?"*`;
  }

  // 12. General Academic Answer Generator for Any Query
  return `💡 **VGS AI Academic Guide for "${escapeHTML(rawQuery)}"**:\n\nGreat question! Here is a structured summary regarding **${escapeHTML(rawQuery)}**:\n\n1. **Core Concept**: In an academic framework, **${escapeHTML(rawQuery)}** connects key principles of critical thinking, subject analysis, and structured problem-solving.\n2. **Key Practical Application**: Applying this concept helps build stronger analytical reasoning for coursework, research projects, and exam preparation.\n3. **Recommended Resource**: You can explore related lesson plans and worksheets under your grade's **Section Modules** in Launchpad!\n\nFeel free to ask a follow-up question or request specific exam prep strategies! 📚`;
}

// Initialize VGS AI Chat on load
initVGSAIChat();

// --- INNOVATIVE ROLE WORKS & COMPLETION HUB IMPLEMENTATION ---


function loadRoleWorks() {
  try {
    const data = localStorage.getItem(ROLE_WORKS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading role works", e);
  }
  saveRoleWorks(DEFAULT_ROLE_WORKS);
  return DEFAULT_ROLE_WORKS;
}

function saveRoleWorks(works) {
  try {
    localStorage.setItem(ROLE_WORKS_STORAGE_KEY, JSON.stringify(works));
  } catch (e) {
    console.error("Error saving role works", e);
  }
}

function loadRoleActivityFeed() {
  try {
    const data = localStorage.getItem(ROLE_WORKS_FEED_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading activity feed", e);
  }
  saveRoleActivityFeed(DEFAULT_ACTIVITY_FEED);
  return DEFAULT_ACTIVITY_FEED;
}

function saveRoleActivityFeed(feed) {
  try {
    localStorage.setItem(ROLE_WORKS_FEED_KEY, JSON.stringify(feed));
  } catch (e) {
    console.error("Error saving activity feed", e);
  }
}

function initRoleWorksHub() {
  const sidebar = document.getElementById("roleWorksSidebar");
  if (!sidebar) return;

  const roleTabBtns = document.querySelectorAll("#worksRoleTabs .works-tab-btn");
  roleTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      roleTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeRoleWorksFilter = btn.dataset.role || "all";
      renderRoleWorks();
    });
  });

  const toggleDrawerBtn = document.getElementById("toggleAddWorkBtn");
  const modal = document.getElementById("newWorkModal");

  function openWorkModal() {
    const titleInput = document.getElementById("newWorkTitleInput");
    if (titleInput) titleInput.value = "";
    if (modal) {
      const dialog = document.getElementById("newWorkDialog");

      // --- Compute transform-origin relative to the dialog card ---
      // The dialog is centred on screen (via flexbox). We want the scale
      // animation to originate from wherever the trigger button lives.
      if (dialog && toggleDrawerBtn) {
        const btnRect   = toggleDrawerBtn.getBoundingClientRect();
        const btnCx     = btnRect.left + btnRect.width  / 2;   // button centre X
        const btnCy     = btnRect.top  + btnRect.height / 2;   // button centre Y

        // Viewport centre (where the dialog will land)
        const vpCx = window.innerWidth  / 2;
        const vpCy = window.innerHeight / 2;

        // Dialog's rendered half-sizes (use CSS min(460px,92vw) approx)
        const dW = Math.min(460, window.innerWidth  * 0.92);
        const dH = dialog.offsetHeight || 360;  // rough fallback

        // Origin expressed as % offset within the dialog element
        // (dialog top-left = vpCx - dW/2, vpCy - dH/2)
        const oxPx = btnCx - (vpCx - dW / 2);
        const oyPx = btnCy - (vpCy - dH / 2);

        dialog.style.setProperty("--nw-ox", `${oxPx}px`);
        dialog.style.setProperty("--nw-oy", `${oyPx}px`);
      }

      modal.classList.add("nw-open");
      setTimeout(() => { if (titleInput) titleInput.focus(); }, 160);
    }
  }

  function closeWorkModal() {
    if (modal) modal.classList.remove("nw-open");
  }

  if (toggleDrawerBtn) {
    toggleDrawerBtn.addEventListener("click", openWorkModal);
  }

  const closeModalBtn = document.getElementById("closeWorkModalBtn");
  const cancelModalBtn = document.getElementById("cancelWorkModalBtn");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeWorkModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeWorkModal);

  if (modal) {
    modal.addEventListener("click", (e) => { if (e.target === modal) closeWorkModal(); });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("nw-open")) closeWorkModal();
  });

  const submitWorkBtn = document.getElementById("submitNewWorkBtn");
  if (submitWorkBtn) {
    submitWorkBtn.addEventListener("click", () => {
      handleCreateNewWork();
      closeWorkModal();
    });
  }

  renderRoleWorks();
}

function renderRoleWorks() {
  const listEl = document.getElementById("worksTaskList");
  const activeRoleLabel = document.getElementById("activeRoleLabel");
  const progressPercentEl = document.getElementById("worksProgressPercent");
  const progressCircle = document.getElementById("worksProgressCircle");
  const totalCountEl = document.getElementById("worksTotalCount");
  const completedCountEl = document.getElementById("worksCompletedCount");
  const pendingCountEl = document.getElementById("worksPendingCount");

  if (!listEl) return;

  const works = loadRoleWorks();
  const filtered = activeRoleWorksFilter === "all"
    ? works
    : works.filter(w => w.role.toLowerCase() === activeRoleWorksFilter.toLowerCase());

  if (activeRoleLabel) {
    activeRoleLabel.textContent = activeRoleWorksFilter === "all" ? "All Roles" : `${activeRoleWorksFilter} Works`;
  }

  // Calculate Metrics
  const total = filtered.length;
  const completed = filtered.filter(w => w.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (totalCountEl) totalCountEl.textContent = total;
  if (completedCountEl) completedCountEl.textContent = completed;
  if (pendingCountEl) pendingCountEl.textContent = pending;
  if (progressPercentEl) progressPercentEl.textContent = `${percentage}%`;

  if (progressCircle) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius; // ~251.2
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${offset}`;
  }

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#94a3b8; font-size:0.8rem;">No works found for this role.</div>`;
    return;
  }

  filtered.forEach(work => {
    const item = document.createElement("div");
    item.className = `works-task-item ${work.completed ? "completed" : ""}`;
    
    let roleBadgeClass = "role-badge-student";
    let roleEmoji = "🎓";
    if (work.role === "Admin" || work.role === "Principal") { roleBadgeClass = "role-badge-admin"; roleEmoji = "👑"; }
    else if (work.role === "Staff") { roleBadgeClass = "role-badge-admin"; roleEmoji = "💼"; }
    else if (work.role === "Teacher") { roleBadgeClass = "role-badge-teacher"; roleEmoji = "👩‍🏫"; }
    else if (work.role === "Parent") { roleBadgeClass = "role-badge-parent"; roleEmoji = "👨‍👩‍👧"; }

    item.innerHTML = `
      <input type="checkbox" class="work-checkbox" ${work.completed ? "checked" : ""} aria-label="Toggle work completion" />
      <div class="work-task-content">
        <div class="work-task-header-row">
          <span class="work-role-badge ${roleBadgeClass}">${roleEmoji} ${work.role}</span>
          ${work.priority === "High" ? `<span class="work-priority-badge">High</span>` : ""}
        </div>
        <span class="work-task-title">${escapeHTML(work.title)}</span>
      </div>
      <button type="button" class="delete-work-btn" aria-label="Delete work">&times;</button>
    `;

    const checkbox = item.querySelector(".work-checkbox");
    checkbox.addEventListener("change", () => {
      toggleWorkStatus(work.id);
    });

    const delBtn = item.querySelector(".delete-work-btn");
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteWorkItem(work.id);
    });

    listEl.appendChild(item);
  });

  renderActivityFeed();
}

function toggleWorkStatus(workId) {
  const works = loadRoleWorks();
  const target = works.find(w => w.id === workId);
  if (!target) return;

  target.completed = !target.completed;
  saveRoleWorks(works);

  if (target.completed) {
    let icon = "🎓";
    if (target.role === "Admin" || target.role === "Principal") icon = "👑";
    if (target.role === "Staff") icon = "💼";
    if (target.role === "Teacher") icon = "👩‍🏫";
    if (target.role === "Parent") icon = "👨‍👩‍👧";

    addActivityFeedItem(icon, `${target.role} completed: "${target.title.slice(0, 32)}${target.title.length > 32 ? '...' : ''}"`, "Just now");
  }

  renderRoleWorks();
}

function deleteWorkItem(workId) {
  let works = loadRoleWorks();
  works = works.filter(w => w.id !== workId);
  saveRoleWorks(works);
  renderRoleWorks();
}

function handleCreateNewWork() {
  const input = document.getElementById("newWorkTitleInput");
  const roleSelect = document.getElementById("newWorkRoleSelect");
  const prioritySelect = document.getElementById("newWorkPrioritySelect");
  const drawer = document.getElementById("quickWorkDrawer");

  if (!input || !input.value.trim()) return;

  const title = input.value.trim();
  const role = roleSelect ? roleSelect.value : "Student";
  const priority = prioritySelect ? prioritySelect.value : "Normal";

  const works = loadRoleWorks();
  const newWork = {
    id: "w_" + Date.now(),
    role: role,
    title: title,
    priority: priority,
    completed: false,
    timestamp: "Just now"
  };

  works.unshift(newWork);
  saveRoleWorks(works);

  input.value = "";
  if (drawer) drawer.classList.add("hidden");

  let icon = "🎓";
  if (role === "Admin" || role === "Principal") icon = "👑";
  if (role === "Staff") icon = "💼";
  if (role === "Teacher") icon = "👩‍🏫";
  if (role === "Parent") icon = "👨‍👩‍👧";

  addActivityFeedItem(icon, `New ${role} work assigned: "${title.slice(0, 30)}"`, "Just now");

  renderRoleWorks();
}

function addActivityFeedItem(icon, text, time) {
  const feed = loadRoleActivityFeed();
  feed.unshift({ icon, text, time });
  if (feed.length > 8) feed.pop();
  saveRoleActivityFeed(feed);
}

function renderActivityFeed() {
  const feedEl = document.getElementById("worksActivityFeed");
  if (!feedEl) return;

  const feed = loadRoleActivityFeed();
  feedEl.innerHTML = "";

  feed.forEach(item => {
    const div = document.createElement("div");
    div.className = "activity-item";
    div.innerHTML = `
      <span class="icon">${item.icon}</span>
      <span>${escapeHTML(item.text)}</span>
      <time>${item.time}</time>
    `;
    feedEl.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════════════════
   VIBGYOR RAINBOW ANIMATION + SCHOOL INFO POPUP
   Triggered when the user clicks the "VIBGYOR GROUP OF SCHOOLS"
   brand button in the launchpad navigation bar.
═══════════════════════════════════════════════════════════════ */
(function initVibgyorRainbowPopup() {
  const VIBGYOR_COLORS = ["#FF0000","#FF7F00","#FFFF00","#00C800","#0000FF","#4B0082","#8B00FF"];
  const ANIM_DURATION_IN  = 700;  // ms until popup shows (after bars sweep)
  const ANIM_DURATION_OUT = 400;  // ms for overlay to clear after popup closes

  const brandBtn  = document.getElementById("vibgyorBrandBtn");
  const overlay   = document.getElementById("vibgyorRainbowOverlay");
  const barsWrap  = document.getElementById("rainbowBarsWrap");
  const popup     = document.getElementById("vibgyorSchoolPopup");
  const closeBtn  = document.getElementById("schoolPopupClose");
  const backdrop  = document.getElementById("vibgyorBlurBackdrop");

  if (!brandBtn || !overlay || !barsWrap || !popup || !closeBtn || !backdrop) return;

  // ── Build the 7 rainbow bar elements ──
  VIBGYOR_COLORS.forEach((_color, i) => {
    const bar = document.createElement("div");
    bar.className = "rainbow-bar";
    bar.setAttribute("aria-hidden", "true");
    bar.dataset.index = i;
    barsWrap.appendChild(bar);
  });

  let animTimer = null;
  let isOpen    = false;

  // ── Open sequence ──
  function openPopup() {
    if (isOpen) return;
    isOpen = true;

    // Clear any lingering exit states
    overlay.classList.remove("vro-exit");
    popup.classList.remove("vsp-exit");
    backdrop.classList.remove("vbb-exit");

    // 1. Sweep rainbow bars across the screen
    overlay.classList.add("vro-active");

    // 2. After bars are fully visible: show blur backdrop + popup together
    clearTimeout(animTimer);
    animTimer = setTimeout(() => {
      backdrop.classList.add("vbb-active");
      popup.classList.add("vsp-active");
      closeBtn.focus();
    }, ANIM_DURATION_IN);
  }

  // ── Close sequence ──
  function closePopup() {
    if (!isOpen) return;
    isOpen = false;

    // 1. Start popup exit
    popup.classList.remove("vsp-active");
    popup.classList.add("vsp-exit");

    // 2. Fade out backdrop & rainbow overlay simultaneously
    clearTimeout(animTimer);
    animTimer = setTimeout(() => {
      backdrop.classList.remove("vbb-active");
      backdrop.classList.add("vbb-exit");

      overlay.classList.remove("vro-active");
      overlay.classList.add("vro-exit");

      // 3. Fully reset after fade completes
      animTimer = setTimeout(() => {
        overlay.classList.remove("vro-exit");
        backdrop.classList.remove("vbb-exit");
        popup.classList.remove("vsp-exit");
        brandBtn.focus();
      }, ANIM_DURATION_OUT);
    }, 150);
  }

  // ── Event listeners ──
  brandBtn.addEventListener("click", openPopup);
  closeBtn.addEventListener("click", closePopup);

  // Close on Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && isOpen) closePopup();
  });

  // Close when clicking the blur backdrop (outside the popup card)
  backdrop.addEventListener("click", closePopup);
})();

/* ==========================================
/* ==========================================
   FEES & FINANCE - HIERARCHICAL MANAGEMENT
   ========================================== */

const ALL_GRADES = [
  { id: "Nursery", name: "Nursery", label: "Grade Nursery", icon: "🌱" },
  { id: "LKG", name: "LKG", label: "Grade LKG", icon: "🎨" },
  { id: "UKG", name: "UKG", label: "Grade UKG", icon: "✏️" },
  { id: "Grade1", name: "Grade 1", label: "Grade 1", icon: "📚" },
  { id: "Grade2", name: "Grade 2", label: "Grade 2", icon: "📖" },
  { id: "Grade3", name: "Grade 3", label: "Grade 3", icon: "📝" },
  { id: "Grade4", name: "Grade 4", label: "Grade 4", icon: "🔬" },
  { id: "Grade5", name: "Grade 5", label: "Grade 5", icon: "🧮" },
  { id: "Grade6", name: "Grade 6", label: "Grade 6", icon: "📐" },
  { id: "Grade7", name: "Grade 7", label: "Grade 7", icon: "🌐" },
  { id: "Grade8", name: "Grade 8", label: "Grade 8", icon: "⚛️" },
  { id: "Grade9", name: "Grade 9", label: "Grade 9", icon: "🧪" },
  { id: "Grade10", name: "Grade 10", label: "Grade 10", icon: "🎓" },
  { id: "Grade11", name: "Grade 11", label: "Grade 11", icon: "🏛️" },
  { id: "Grade12", name: "Grade 12", label: "Grade 12", icon: "🏆" }
];

const ALL_SECTIONS = ["Section A", "Section B", "Section C"];

let adminFeesState = {
  selectedGrade: null,    // e.g. "Grade 8"
  selectedSection: null,  // e.g. "Section A"
  filter: "all"
};

function loadFeesData() {
  try {
    const raw = localStorage.getItem(FEES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultHierarchicalFeesData();
  } catch {
    return getDefaultHierarchicalFeesData();
  }
}

function saveFeesData(data) {
  try {
    localStorage.setItem(FEES_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving fees data", e);
  }
}

function getDefaultHierarchicalFeesData() {
  const records = [];
  const sampleStudents = [
    { name: "Aarav Sharma", roll: "101", studentId: "student-001" },
    { name: "Ananya Sharma", roll: "102", studentId: "student-002" },
    { name: "Rohan Gupta", roll: "103", studentId: "student-003" },
    { name: "Priya Patel", roll: "104" },
    { name: "Kabir Singh", roll: "105" }
  ];

  ALL_GRADES.forEach(gradeObj => {
    ALL_SECTIONS.forEach(sec => {
      sampleStudents.forEach((st, idx) => {
        // Keep demo student IDs only on their real Grade 8 sections
        let studentId = st.studentId || null;
        if (studentId === "student-001" || studentId === "student-002") {
          if (!(gradeObj.name === "Grade 8" && sec === "Section A")) studentId = null;
        }
        if (studentId === "student-003") {
          if (!(gradeObj.name === "Grade 8" && sec === "Section B")) studentId = null;
        }
        records.push({
          id: `fee_${gradeObj.id}_${sec.replace(/\s+/g, '')}_${idx + 1}`,
          grade: gradeObj.name,
          section: sec,
          studentName: `${st.name} (Roll #${st.roll})`,
          studentId,
          category: idx % 2 === 0 ? "Tuition Fee" : "Transport Fee",
          title: idx % 2 === 0 ? "Term 1 Tuition Fee" : "Quarterly Transport Fee",
          amount: idx % 2 === 0 ? 25000 : 4500,
          paidAmount: idx % 3 === 0 ? (idx % 2 === 0 ? 25000 : 4500) : 0,
          status: idx % 3 === 0 ? "paid" : "pending",
          dueDate: "2026-09-15",
          session: "2026-2027"
        });
      });
    });
  });

  return records;
}

let feesList = loadFeesData();

function showFeesGradesView() {
  adminFeesState.selectedGrade = null;
  adminFeesState.selectedSection = null;
  renderFees();
  const el = document.getElementById("feesGradesView");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function showFeesSectionsView() {
  if (!adminFeesState.selectedGrade) {
    adminFeesState.selectedGrade = "Grade 8";
  }
  adminFeesState.selectedSection = null;
  renderFees();
  const el = document.getElementById("feesSectionsView");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function showFeesStudentsViewAll() {
  if (!adminFeesState.selectedGrade) adminFeesState.selectedGrade = "Grade 8";
  if (!adminFeesState.selectedSection) adminFeesState.selectedSection = "Section A";
  adminFeesState.filter = "all";
  renderFees();
  const el = document.getElementById("feesStudentsView");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function showFeesByFilter(filterStatus) {
  if (!adminFeesState.selectedGrade) adminFeesState.selectedGrade = "Grade 8";
  if (!adminFeesState.selectedSection) adminFeesState.selectedSection = "Section A";
  adminFeesState.filter = filterStatus;
  renderFees();
  const el = document.getElementById("feesStudentsView");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function renderFees() {
  const isAdmin = currentRole === "Principal" || currentRole === "Staff" || currentRole === "Admin";
  const isParent = currentRole === "Parent";

  const adminContainer = document.getElementById("adminFeesContainer");
  const parentContainer = document.getElementById("parentFeesContainer");
  const openAddBtn = document.getElementById("openAddStudentFeeBtn");

  if (openAddBtn) {
    openAddBtn.style.display = isAdmin ? "inline-flex" : "none";
  }

  // Update Top Metric Stat Cards
  const todayISO = new Date().toISOString().split("T")[0];
  const totalVal = feesList.reduce((s, f) => s + (f.amount || 0), 0);
  const paidVal = feesList.filter(f => f.status === "paid").reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const pendingVal = totalVal - paidVal;
  const overdueVal = feesList
    .filter((f) => f.status !== "paid" && f.dueDate && f.dueDate < todayISO)
    .reduce((s, f) => s + Math.max(0, (f.amount || 0) - (f.paidAmount || 0)), 0);

  const totalEl = document.getElementById("feesStatTotal");
  const paidEl = document.getElementById("feesStatPaid");
  const pendingEl = document.getElementById("feesStatPending");
  const overdueEl = document.getElementById("feesStatOverdue");

  if (totalEl) totalEl.textContent = `₹${totalVal.toLocaleString("en-IN")}`;
  if (paidEl) paidEl.textContent = `₹${paidVal.toLocaleString("en-IN")}`;
  if (pendingEl) pendingEl.textContent = `₹${pendingVal.toLocaleString("en-IN")}`;
  if (overdueEl) overdueEl.textContent = `₹${overdueVal.toLocaleString("en-IN")}`;

  if (isParent) {
    if (adminContainer) adminContainer.classList.add("hidden");
    if (parentContainer) parentContainer.classList.remove("hidden");
    renderParentFees();
    return;
  }

  if (adminContainer) adminContainer.classList.remove("hidden");
  if (parentContainer) parentContainer.classList.add("hidden");

  // Render Admin View according to state level
  renderAdminFeesHierarchy();
}

function renderAdminFeesHierarchy() {
  const gradesView = document.getElementById("feesGradesView");
  const sectionsView = document.getElementById("feesSectionsView");
  const studentsView = document.getElementById("feesStudentsView");

  const backBtn = document.getElementById("feesBackBtn");
  const crumbGrade = document.getElementById("crumbGrade");
  const crumbSection = document.getElementById("crumbSection");

  // Reset view displays
  if (gradesView) gradesView.classList.add("hidden");
  if (sectionsView) sectionsView.classList.add("hidden");
  if (studentsView) studentsView.classList.add("hidden");

  if (adminFeesState.selectedGrade === null) {
    // LEVEL 1: GRADES GRID
    if (gradesView) gradesView.classList.remove("hidden");
    if (backBtn) backBtn.classList.add("hidden");
    if (crumbGrade) crumbGrade.classList.add("hidden");
    if (crumbSection) crumbSection.classList.add("hidden");

    renderGradesGrid();
  } else if (adminFeesState.selectedSection === null) {
    // LEVEL 2: SECTIONS VIEW
    if (sectionsView) sectionsView.classList.remove("hidden");
    if (backBtn) backBtn.classList.remove("hidden");

    if (crumbGrade) {
      crumbGrade.classList.remove("hidden");
      crumbGrade.textContent = adminFeesState.selectedGrade;
      crumbGrade.classList.add("active");
    }
    if (crumbSection) crumbSection.classList.add("hidden");

    renderSectionsGrid();
  } else {
    // LEVEL 3: STUDENTS & FEES PAGE
    if (studentsView) studentsView.classList.remove("hidden");
    if (backBtn) backBtn.classList.remove("hidden");

    if (crumbGrade) {
      crumbGrade.classList.remove("hidden");
      crumbGrade.textContent = adminFeesState.selectedGrade;
      crumbGrade.classList.remove("active");
    }
    if (crumbSection) {
      crumbSection.classList.remove("hidden");
      crumbSection.textContent = adminFeesState.selectedSection;
      crumbSection.classList.add("active");
    }

    renderSectionStudentsPage();
  }
}

// LEVEL 1: RENDER GRADES
function renderGradesGrid() {
  const gridEl = document.getElementById("feesGradesGrid");
  if (!gridEl) return;
  gridEl.innerHTML = "";

  ALL_GRADES.forEach((g) => {
    const card = document.createElement("div");
    card.className = "fees-grade-card";
    card.onclick = () => selectFeesGrade(g.name);

    const gradeFees = feesList.filter((f) => f.grade === g.name);
    const totalCount = gradeFees.length;
    const paidCount = gradeFees.filter((f) => f.status === "paid").length;

    card.innerHTML = `
      <div class="grade-card-icon">${g.icon}</div>
      <h4 class="grade-card-title">${g.label}</h4>
      <div class="grade-card-meta">
        <span>3 Sections (A, B, C)</span>
        <span>${totalCount} Fee Records • ${paidCount} Paid</span>
      </div>
      <div class="grade-card-btn">
        View Sections &rarr;
      </div>
    `;
    gridEl.appendChild(card);
  });
}

function selectFeesGrade(gradeName) {
  adminFeesState.selectedGrade = gradeName;
  adminFeesState.selectedSection = null;
  renderFees();
}

// LEVEL 2: RENDER SECTIONS
function renderSectionsGrid() {
  const gridEl = document.getElementById("feesSectionsGrid");
  const titleEl = document.getElementById("feesSelectedGradeTitle");
  if (!gridEl) return;
  gridEl.innerHTML = "";

  if (titleEl) titleEl.textContent = `${adminFeesState.selectedGrade} — Sections`;

  ALL_SECTIONS.forEach((sec) => {
    const card = document.createElement("div");
    card.className = "fees-section-card";
    card.onclick = () => selectFeesSection(sec);

    const secFees = feesList.filter(
      (f) => f.grade === adminFeesState.selectedGrade && f.section === sec
    );
    const totalCount = secFees.length;
    const paidCount = secFees.filter((f) => f.status === "paid").length;
    const pendingCount = totalCount - paidCount;

    card.innerHTML = `
      <div class="sec-card-header">
        <h4 class="sec-card-title">${sec}</h4>
        <span class="sec-card-badge">${adminFeesState.selectedGrade}</span>
      </div>
      <div class="sec-card-stats">
        <span>Enrolled: <strong>5</strong></span>
        <span>Paid: <strong style="color:#10b981;">${paidCount}</strong></span>
        <span>Pending: <strong style="color:#f59e0b;">${pendingCount}</strong></span>
      </div>
      <div class="grade-card-btn">
        Manage Fees &rarr;
      </div>
    `;
    gridEl.appendChild(card);
  });
}

function selectFeesSection(secName) {
  adminFeesState.selectedSection = secName;
  renderFees();
}

// LEVEL 3: RENDER STUDENTS & FEES
function renderSectionStudentsPage() {
  const badgeEl = document.getElementById("feesSectionBadge");
  const titleEl = document.getElementById("feesSectionTitle");
  const countEl = document.getElementById("feesSecStudentCount");
  const paidEl = document.getElementById("feesSecPaidCount");
  const pendingEl = document.getElementById("feesSecPendingCount");

  const grade = adminFeesState.selectedGrade;
  const section = adminFeesState.selectedSection;

  if (badgeEl) badgeEl.textContent = `${grade} • ${section}`;
  if (titleEl) titleEl.textContent = `${grade} ${section} — Student Fees`;

  const secFees = feesList.filter((f) => f.grade === grade && f.section === section);
  const paidCount = secFees.filter((f) => f.status === "paid").length;
  const pendingCount = secFees.filter((f) => f.status === "pending" || f.status === "overdue").length;

  if (countEl) countEl.textContent = String(secFees.length);
  if (paidEl) paidEl.textContent = String(paidCount);
  if (pendingEl) pendingEl.textContent = String(pendingCount);

  renderSectionStudentsTable();
}

function filterSectionStudents(filterType, btn) {
  adminFeesState.filter = filterType;
  const buttons = document.querySelectorAll(".fees-filter-toolbar .fees-filter-btn");
  buttons.forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderSectionStudentsTable();
}

function renderSectionStudentsTable() {
  const tbody = document.getElementById("feesStudentsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const grade = adminFeesState.selectedGrade;
  const section = adminFeesState.selectedSection;
  const searchInput = document.getElementById("feesStudentSearch");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  let secFees = feesList.filter((f) => f.grade === grade && f.section === section);

  if (adminFeesState.filter === "pending") {
    secFees = secFees.filter((f) => f.status === "pending" || f.status === "overdue");
  } else if (adminFeesState.filter === "paid") {
    secFees = secFees.filter((f) => f.status === "paid");
  }

  if (query) {
    secFees = secFees.filter(
      (f) =>
        f.studentName.toLowerCase().includes(query) ||
        f.title.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
    );
  }

  if (!secFees.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2rem; color: #64748b;">No student fee records found for this section. Click "+ Add Student Fee" to create one.</td></tr>`;
    return;
  }

  secFees.forEach((fee, idx) => {
    const tr = document.createElement("tr");
    const dueAmount = fee.status === "paid" ? 0 : fee.amount - (fee.paidAmount || 0);

    tr.innerHTML = `
      <td><strong>${idx + 101}</strong></td>
      <td><strong>${fee.studentName}</strong></td>
      <td><span class="sec-card-badge">${fee.category}</span></td>
      <td>${fee.title}</td>
      <td class="col-num">₹${(fee.amount || 0).toLocaleString("en-IN")}</td>
      <td class="col-num" style="color: #10b981;">₹${(fee.paidAmount || (fee.status === "paid" ? fee.amount : 0)).toLocaleString("en-IN")}</td>
      <td class="col-num" style="color: #ef4444; font-weight: 700;">₹${dueAmount.toLocaleString("en-IN")}</td>
      <td>
        <span class="badge-pill-${fee.status === "paid" ? "green" : fee.status === "overdue" ? "orange" : "purple"}">
          ${fee.status.toUpperCase()}
        </span>
      </td>
      <td style="text-align: right;">
        ${
          fee.status !== "paid"
            ? `<button type="button" class="fees-btn-pay-pending" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;" onclick="markFeeAsPaid('${fee.id}')">Record Paid</button>`
            : `<span style="font-size: 0.75rem; color: #10b981; font-weight: 700;">✓ Paid</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function markFeeAsPaid(feeId) {
  const item = feesList.find((f) => f.id === feeId);
  if (item) {
    item.status = "paid";
    item.paidAmount = item.amount;
    item.paidDate = new Date().toISOString().split("T")[0];
    saveFeesData(feesList);
    renderFees();
    openReceiptModal(feeId);
  }
}

function closePayFeeModal() {
  document.getElementById("payFeeModal")?.classList.add("hidden");
}

function openPayFeeModal(feeId) {
  const fee = feesList.find((f) => f.id === feeId);
  if (!fee) return;
  const modal = document.getElementById("payFeeModal");
  const titleEl = document.getElementById("payFeeTitle");
  const termEl = document.getElementById("payFeeTerm");
  const dueEl = document.getElementById("payFeeDueDate");
  const amountEl = document.getElementById("payFeeAmount");
  const btnAmountEl = document.getElementById("payBtnAmountText");
  const amountText = `₹${Number(fee.amount || 0).toLocaleString("en-IN")}`;

  if (titleEl) titleEl.textContent = fee.title || fee.category || "Fee";
  if (termEl) termEl.textContent = fee.session || "2026-2027";
  if (dueEl) dueEl.textContent = fee.dueDate || "—";
  if (amountEl) amountEl.textContent = amountText;
  if (btnAmountEl) btnAmountEl.textContent = amountText;

  const confirmBtn = document.getElementById("confirmPayFeeBtn");
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      markFeeAsPaid(feeId);
      closePayFeeModal();
    };
  }

  if (modal) modal.classList.remove("hidden");
}

function closeReceiptModal() {
  document.getElementById("receiptModal")?.classList.add("hidden");
}

function openReceiptModal(feeId) {
  const fee = feesList.find((f) => f.id === feeId);
  if (!fee) return;
  const modal = document.getElementById("receiptModal");
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  const amountText = `₹${Number(fee.paidAmount || fee.amount || 0).toLocaleString("en-IN")}`;
  setText("receiptNoText", `REC-2026-${String(fee.id).slice(-4).toUpperCase()}`);
  setText("receiptDateText", fee.paidDate || new Date().toLocaleDateString("en-IN"));
  setText("receiptStudentName", String(fee.studentName || "").replace(/\s*\(Roll.*$/, ""));
  setText("receiptStudentClass", `${fee.grade || ""} - ${fee.section || ""}`.replace(/^ - | - $/g, "") || "—");
  setText("receiptSessionText", fee.session || "2026-2027");
  setText("receiptPaymentMode", "UPI / QR Code");
  setText("receiptFeeDesc", fee.title || fee.category || "Fee");
  setText("receiptFeeTerm", fee.session || "Term");
  setText("receiptFeeAmount", amountText);
  setText("receiptTotalAmount", amountText);
  if (modal) modal.classList.remove("hidden");
}

function closeFeeManageModal() {
  document.getElementById("feeManageModal")?.classList.add("hidden");
}

function openFeeManageModal(feeId) {
  const modal = document.getElementById("feeManageModal");
  const fee = feeId ? feesList.find((f) => f.id === feeId) : null;
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };
  setVal("manageFeeId", fee?.id || "");
  setVal("manageFeeTitle", fee?.title || "");
  setVal("manageFeeSubType", fee?.subType || "Instalment 1");
  setVal("manageFeeCategory", fee?.category || "Tuition");
  setVal("manageFeeSubCategory", fee?.subCategory || "NA");
  setVal("manageFeePeriod", fee?.period || "Quarter 1");
  setVal("manageFeeDueDate", fee?.dueDate || "");
  setVal("manageFeeAmount", fee?.amount ?? "");
  setVal("manageFeeAdjusted", fee?.adjusted ?? 0);
  setVal("manageFeeCollected", fee?.paidAmount ?? 0);
  setVal("manageFeeStatus", fee?.status || "pending");
  setVal("manageFeeSession", fee?.session || "2026-2027");
  const titleEl = document.getElementById("feeManageModalTitle");
  if (titleEl) titleEl.textContent = fee ? "✏️ Edit Fee Record" : "➕ Add Fee Record";
  if (modal) modal.classList.remove("hidden");
}

function handleSaveFeeRecord(event) {
  event.preventDefault();
  const id = document.getElementById("manageFeeId")?.value || "";
  const title = document.getElementById("manageFeeTitle")?.value.trim() || "Fee";
  const amount = Number(document.getElementById("manageFeeAmount")?.value) || 0;
  const collected = Number(document.getElementById("manageFeeCollected")?.value) || 0;
  const status = document.getElementById("manageFeeStatus")?.value || "pending";
  const dueDate = document.getElementById("manageFeeDueDate")?.value || "";
  const session = document.getElementById("manageFeeSession")?.value || "2026-2027";
  const category = document.getElementById("manageFeeCategory")?.value || "Tuition";

  if (id) {
    const item = feesList.find((f) => f.id === id);
    if (item) {
      item.title = title;
      item.amount = amount;
      item.paidAmount = collected;
      item.status = status;
      item.dueDate = dueDate;
      item.session = session;
      item.category = category;
    }
  } else {
    feesList.unshift({
      id: `fee_${Date.now()}`,
      grade: adminFeesState.selectedGrade || "Grade 8",
      section: adminFeesState.selectedSection || "Section A",
      studentName: "Student",
      category,
      title,
      amount,
      paidAmount: collected,
      status,
      dueDate,
      session,
    });
  }
  saveFeesData(feesList);
  closeFeeManageModal();
  renderFees();
}

// Expose fee modal helpers for inline HTML onclick handlers
window.closePayFeeModal = closePayFeeModal;
window.openPayFeeModal = openPayFeeModal;
window.closeReceiptModal = closeReceiptModal;
window.openReceiptModal = openReceiptModal;
window.closeFeeManageModal = closeFeeManageModal;
window.openFeeManageModal = openFeeManageModal;
window.handleSaveFeeRecord = handleSaveFeeRecord;
window.markFeeAsPaid = markFeeAsPaid;

// BACK & RESET NAVIGATION
function navigateFeesBack() {
  if (adminFeesState.selectedSection !== null) {
    adminFeesState.selectedSection = null;
  } else if (adminFeesState.selectedGrade !== null) {
    adminFeesState.selectedGrade = null;
  }
  renderFees();
}

function resetFeesNav() {
  adminFeesState.selectedGrade = null;
  adminFeesState.selectedSection = null;
  renderFees();
}

// PARENT FEES VIEW
function getFeesForParentChildren() {
  const children = getChildrenForParent(currentUser);
  if (!children.length) return [];

  const childIds = new Set(children.map((c) => c.id));
  const childNames = children.map((c) => String(c.displayName || c.username || "").toLowerCase()).filter(Boolean);
  const childClasses = children
    .map((c) => parseClassSection(c.classSection) || { grade: c.grade, section: c.section })
    .filter((cc) => cc && cc.grade && cc.section);

  return feesList.filter((f) => {
    if (f.studentId && childIds.has(f.studentId)) {
      return childClasses.some((cc) => cc.grade === f.grade && cc.section === f.section) || childClasses.length === 0;
    }
    const feeName = String(f.studentName || "").toLowerCase();
    const nameMatch = childNames.some((n) => n && feeName.includes(n));
    if (!nameMatch) return false;
    if (!childClasses.length) return true;
    return childClasses.some((cc) => cc.grade === f.grade && cc.section === f.section);
  });
}

function renderParentFees() {
  const totalEl = document.getElementById("parentFeesTotal");
  const paidEl = document.getElementById("parentFeesPaid");
  const pendingEl = document.getElementById("parentFeesPending");
  const receiptsEl = document.getElementById("parentFeesReceipts");

  const studentFees = getFeesForParentChildren();
  const total = studentFees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid = studentFees.filter((f) => f.status === "paid").reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const pending = total - paid;
  const paidCount = studentFees.filter((f) => f.status === "paid").length;

  if (totalEl) totalEl.textContent = `₹${total.toLocaleString("en-IN")}`;
  if (paidEl) paidEl.textContent = `₹${paid.toLocaleString("en-IN")}`;
  if (pendingEl) pendingEl.textContent = `₹${pending.toLocaleString("en-IN")}`;
  if (receiptsEl) receiptsEl.textContent = `${paidCount} Issued`;

  const tbody = document.getElementById("parentFeesTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!studentFees.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:1.25rem;">No fee records found for your linked children.</td></tr>`;
    return;
  }

  studentFees.forEach((fee) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${fee.title}</strong></td>
      <td><span class="sec-card-badge">${fee.category}</span></td>
      <td>Instalment 1</td>
      <td class="col-num">₹${fee.amount.toLocaleString("en-IN")}</td>
      <td>${fee.dueDate}</td>
      <td><span class="badge-pill-${fee.status === "paid" ? "green" : "orange"}">${fee.status.toUpperCase()}</span></td>
      <td style="text-align: right;">
        ${
          fee.status !== "paid"
            ? `<button type="button" class="fees-btn-pay-pending" onclick="openPayFeeModal('${fee.id}')">Pay Now</button>`
            : `<button type="button" class="fees-btn-pay-pending" style="background:#10b981;" onclick="openReceiptModal('${fee.id}')">Receipt #${fee.id.slice(-4)}</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// MODAL FOR ADDING STUDENT FEES
function openAddStudentFeeModal() {
  const modal = document.getElementById("addStudentFeeModal");
  const gradeSelect = document.getElementById("feeModalGrade");

  if (gradeSelect) {
    gradeSelect.innerHTML = ALL_GRADES.map(
      (g) => `<option value="${g.name}" ${g.name === adminFeesState.selectedGrade ? "selected" : ""}>${g.label}</option>`
    ).join("");
  }

  if (modal) modal.classList.remove("hidden");
}

function closeAddStudentFeeModal() {
  const modal = document.getElementById("addStudentFeeModal");
  if (modal) modal.classList.add("hidden");
}

function updateModalSections() {
  const grade = document.getElementById("feeModalGrade")?.value;
  const sectionSelect = document.getElementById("feeModalSection");
  if (!sectionSelect) return;
  const defaultSections = ["Section A", "Section B", "Section C"];
  sectionSelect.innerHTML = defaultSections.map(s => `<option value="${s}">${s}</option>`).join("");
}

function handleSaveStudentFee(event) {
  event.preventDefault();
  const grade = document.getElementById("feeModalGrade")?.value || "Grade 8";
  const section = document.getElementById("feeModalSection")?.value || "Section A";
  const studentName = document.getElementById("feeModalStudentName")?.value.trim() || "Student";
  const category = document.getElementById("feeModalCategory")?.value || "Tuition Fee";
  const title = document.getElementById("feeModalTitle")?.value.trim() || "Academic Fee";
  const amount = Number(document.getElementById("feeModalAmount")?.value) || 10000;
  const dueDate = document.getElementById("feeModalDueDate")?.value || new Date().toISOString().split("T")[0];
  const status = document.getElementById("feeModalStatus")?.value || "pending";

  const newRecord = {
    id: `fee_${Date.now()}`,
    grade,
    section,
    studentName,
    category,
    title,
    amount,
    paidAmount: status === "paid" ? amount : 0,
    status,
    dueDate,
    session: "2026-2027"
  };

  feesList.unshift(newRecord);
  saveFeesData(feesList);
  closeAddStudentFeeModal();

  // Auto navigate to the grade/section where fee was added
  adminFeesState.selectedGrade = grade;
  adminFeesState.selectedSection = section;
  renderFees();
}



/* ═══════════════════════════════════════════════════════════════
   ATTENDANCE DASHBOARD – 3-Step Drilldown (Grades → Sections → Mark)
   ═══════════════════════════════════════════════════════════════ */

let attCurrentStep = 1; // 1: Grades, 2: Sections, 3: Mark
let attSelectedGrade = null;
let attSelectedSection = null;
let attShowAll = false;
let attCurrentDate = new Date(2026, 5, 4); // 4 June 2026
const ATT_VISIBLE_LIMIT = 5;

const attState = {};

const ATT_GRADES_LIST = [
  { name: 'Grade 6', icon: '📐', sectionsCount: 3, totalStudents: 85, pct: 95.1 },
  { name: 'Grade 7', icon: '🌐', sectionsCount: 3, totalStudents: 88, pct: 96.4 },
  { name: 'Grade 8', icon: '⚛️', sectionsCount: 3, totalStudents: 92, pct: 94.7 },
  { name: 'Grade 9', icon: '🧪', sectionsCount: 3, totalStudents: 90, pct: 93.8 },
  { name: 'Grade 10', icon: '🎓', sectionsCount: 3, totalStudents: 94, pct: 96.0 },
  { name: 'Grade 11', icon: '🏛️', sectionsCount: 3, totalStudents: 82, pct: 92.5 },
  { name: 'Grade 12', icon: '🏆', sectionsCount: 3, totalStudents: 80, pct: 95.8 },
];

const ATT_STUDENT_NAMES_POOL = [
  'Aarav Sharma', 'Diya Patel', 'Kabir Singh', 'Myra Iyer', 'Rohan Mehta',
  'Priya Nair', 'Arjun Gupta', 'Ananya Krishnan', 'Vihaan Joshi', 'Riya Desai',
  'Aditya Kumar', 'Sneha Pillai', 'Ishaan Verma', 'Pooja Rao', 'Dev Malhotra',
  'Kavya Joshi', 'Yash Patel', 'Tara Sen', 'Ahaan Reddy', 'Saanvi Bhat'
];

function attFormatDate(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function attGetClassKey() {
  return `${attSelectedGrade || 'Grade 8'}_${attSelectedSection || 'Section A'}`;
}

/* ═══════════════════════════════════════════════════════════════
   ATTENDANCE & GRADES MODULE (MATCHING DESIGN SPECIFICATION)
   ═══════════════════════════════════════════════════════════════ */

let attGradesState = {
  mode: 'grades', // 'attendance' or 'grades'
  selectedClass: 'Grade 8 - Section A',
  selectedDate: '2026-10-01',
  searchQuery: '',
  students: [
    { id: 1, name: "Aarav Sharma", initials: "AS", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A+", "Mathematics": "A", "Science": "A+", "Social Science": "B+", "Hindi": "A" } },
    { id: 2, name: "Aditi Rao", initials: "AR", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A", "Mathematics": "A+", "Science": "A", "Social Science": "A-", "Hindi": "A+" } },
    { id: 3, name: "Ananya Singh", initials: "AS", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A+", "Mathematics": "A", "Science": "A", "Social Science": "B+", "Hindi": "A" } },
    { id: 4, name: "Arjun Patel", initials: "AP", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "B+", "Mathematics": "A-", "Science": "B+", "Social Science": "A-", "Hindi": "B+" } },
    { id: 5, name: "Diya Nair", initials: "DN", bg: "#dbeafe", color: "#1d4ed8", status: "Absent", grades: { "English": "A", "Mathematics": "A+", "Science": "A-", "Social Science": "B+", "Hindi": "A" } },
    { id: 6, name: "Ethan Thomas", initials: "ET", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A-", "Mathematics": "B+", "Science": "A", "Social Science": "A-", "Hindi": "B+" } },
    { id: 7, name: "Ishaan Verma", initials: "IV", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A+", "Mathematics": "A", "Science": "A+", "Social Science": "B+", "Hindi": "A" } },
    { id: 8, name: "Kiara Bhatia", initials: "KB", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A", "Mathematics": "A-", "Science": "A", "Social Science": "A-", "Hindi": "A+" } },
    { id: 9, name: "Rohan Mehta", initials: "RM", bg: "#dbeafe", color: "#1d4ed8", status: "Late", grades: { "English": "B+", "Mathematics": "B+", "Science": "A-", "Social Science": "B+", "Hindi": "B+" } },
    { id: 10, name: "Saanvi Iyer", initials: "SI", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A+", "Mathematics": "A", "Science": "A+", "Social Science": "A", "Hindi": "A" } },
    { id: 11, name: "Vivaan Kapoor", initials: "VK", bg: "#dbeafe", color: "#1d4ed8", status: "Present", grades: { "English": "A", "Mathematics": "B+", "Science": "A-", "Social Science": "B+", "Hindi": "A-" } },
    { id: 12, name: "Zara Khan", initials: "ZK", bg: "#dbeafe", color: "#1d4ed8", status: "Absent", grades: { "English": "A-", "Mathematics": "A", "Science": "A", "Social Science": "A-", "Hindi": "A+" } }
  ]
};

function setAttGradesMode(mode) {
  attGradesState.mode = mode;
  const attBtn = document.getElementById("attModeAttendanceBtn");
  const gradesBtn = document.getElementById("attModeGradesBtn");

  if (attBtn && gradesBtn) {
    if (mode === "attendance") {
      attBtn.style.background = "#2563eb";
      attBtn.style.color = "#ffffff";
      attBtn.style.boxShadow = "0 2px 6px rgba(37,99,235,0.25)";

      gradesBtn.style.background = "transparent";
      gradesBtn.style.color = "#64748b";
      gradesBtn.style.boxShadow = "none";
    } else {
      gradesBtn.style.background = "#2563eb";
      gradesBtn.style.color = "#ffffff";
      gradesBtn.style.boxShadow = "0 2px 6px rgba(37,99,235,0.25)";

      attBtn.style.background = "transparent";
      attBtn.style.color = "#64748b";
      attBtn.style.boxShadow = "none";
    }
  }

  renderAttGradesRoster();
}

function attGradesOnClassChange(val) {
  attGradesState.selectedClass = val;
  const header = document.getElementById("attGradesClassHeader");
  if (header) header.textContent = val.replace("Section ", "");
  renderAttGradesRoster();
}

function attGradesOnDateChange(val) {
  attGradesState.selectedDate = val;
  renderAttGradesRoster();
}

function attGradesFilterStudents(query) {
  attGradesState.searchQuery = query.toLowerCase().trim();
  renderAttGradesRoster();
}

function updateStudentGrade(studentId, subject, val) {
  const student = attGradesState.students.find(s => s.id === studentId);
  if (student) {
    student.grades[subject] = val;
  }
}

function updateStudentAttendance(studentId, status) {
  const student = attGradesState.students.find(s => s.id === studentId);
  if (student) {
    student.status = status;
    updateAttGradesSummary();
    renderAttGradesRoster();
  }
}

function updateAttGradesSummary() {
  const total = attGradesState.students.length;
  const present = attGradesState.students.filter(s => s.status === "Present").length;
  const absent = attGradesState.students.filter(s => s.status === "Absent").length;
  const late = attGradesState.students.filter(s => s.status === "Late").length;

  const pPct = total ? ((present / total) * 100).toFixed(1) : 0;
  const aPct = total ? ((absent / total) * 100).toFixed(1) : 0;
  const lPct = total ? ((late / total) * 100).toFixed(1) : 0;

  const totalEl = document.getElementById("summaryTotalCount");
  const presentEl = document.getElementById("summaryPresentCount");
  const absentEl = document.getElementById("summaryAbsentCount");
  const lateEl = document.getElementById("summaryLateCount");
  const countText = document.getElementById("attGradesTotalStudentsText");

  if (totalEl) totalEl.textContent = String(total);
  if (countText) countText.textContent = `Total Students: ${total}`;
  if (presentEl) presentEl.innerHTML = `${present} <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">(${pPct}%)</span>`;
  if (absentEl) absentEl.innerHTML = `${absent} <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">(${aPct}%)</span>`;
  if (lateEl) lateEl.innerHTML = `${late} <span style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">(${lPct}%)</span>`;
}

function renderAttGradesRoster() {
  const thead = document.getElementById("attGradesTableHead");
  const tbody = document.getElementById("attGradesTableBody");
  if (!thead || !tbody) return;

  const filtered = attGradesState.students.filter(s =>
    s.name.toLowerCase().includes(attGradesState.searchQuery)
  );

  updateAttGradesSummary();

  const subjects = [
    { name: "English", bg: "#eff6ff", color: "#2563eb" },
    { name: "Mathematics", bg: "#f0fdf4", color: "#16a34a" },
    { name: "Science", bg: "#faf5ff", color: "#9333ea" },
    { name: "Social Science", bg: "#fff7ed", color: "#c2410c" },
    { name: "Hindi", bg: "#fef2f2", color: "#dc2626" }
  ];

  const gradeOptions = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "F"];

  if (attGradesState.mode === "grades") {
    thead.innerHTML = `
      <tr>
        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; width: 40px;">#</th>
        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; width: 200px;">Student Name</th>
        ${subjects.map(s => `
          <th style="padding: 10px 12px; text-align: center; background: ${s.bg}; color: ${s.color}; font-weight: 700; border-radius: 8px 8px 0 0; border-bottom: 2px solid #e2e8f0;">
            ${s.name} <div style="font-size: 0.72rem; font-weight: 500; opacity: 0.8;">(100)</div>
          </th>
        `).join("")}
      </tr>
    `;

    tbody.innerHTML = filtered.map((s, index) => `
      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <td style="padding: 10px 12px; color: #64748b; font-weight: 600;">${index + 1}</td>
        <td style="padding: 10px 12px;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${s.bg}; color: ${s.color}; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800; flex-shrink: 0;">
              ${s.initials}
            </div>
            <span style="font-weight: 700; color: #1e293b; font-size: 0.88rem;">${s.name}</span>
          </div>
        </td>
        ${subjects.map(sub => `
          <td style="padding: 8px 10px; text-align: center;">
            <select onchange="updateStudentGrade(${s.id}, '${sub.name}', this.value)" style="padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #334155; font-size: 0.85rem; background: #ffffff; cursor: pointer; outline: none; width: 75px; text-align: center;">
              ${gradeOptions.map(g => `<option value="${g}" ${s.grades[sub.name] === g ? "selected" : ""}>${g}</option>`).join("")}
            </select>
          </td>
        `).join("")}
      </tr>
    `).join("");

  } else {
    thead.innerHTML = `
      <tr>
        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; width: 40px;">#</th>
        <th style="padding: 10px 12px; text-align: left; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0;">Student Name</th>
        <th style="padding: 10px 12px; text-align: center; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; width: 280px;">Attendance Status</th>
      </tr>
    `;

    tbody.innerHTML = filtered.map((s, index) => `
      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <td style="padding: 10px 12px; color: #64748b; font-weight: 600;">${index + 1}</td>
        <td style="padding: 10px 12px;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${s.bg}; color: ${s.color}; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800; flex-shrink: 0;">
              ${s.initials}
            </div>
            <span style="font-weight: 700; color: #1e293b; font-size: 0.88rem;">${s.name}</span>
          </div>
        </td>
        <td style="padding: 8px 10px; text-align: center;">
          <div style="display: inline-flex; background: #f1f5f9; padding: 3px; border-radius: 10px; gap: 4px;">
            <button type="button" onclick="updateStudentAttendance(${s.id}, 'Present')" style="padding: 0.3rem 0.75rem; border-radius: 7px; font-size: 0.78rem; font-weight: 700; border: none; cursor: pointer; ${s.status === 'Present' ? 'background: #22c55e; color: #fff;' : 'background: transparent; color: #64748b;'}">Present</button>
            <button type="button" onclick="updateStudentAttendance(${s.id}, 'Absent')" style="padding: 0.3rem 0.75rem; border-radius: 7px; font-size: 0.78rem; font-weight: 700; border: none; cursor: pointer; ${s.status === 'Absent' ? 'background: #ef4444; color: #fff;' : 'background: transparent; color: #64748b;'}">Absent</button>
            <button type="button" onclick="updateStudentAttendance(${s.id}, 'Late')" style="padding: 0.3rem 0.75rem; border-radius: 7px; font-size: 0.78rem; font-weight: 700; border: none; cursor: pointer; ${s.status === 'Late' ? 'background: #a855f7; color: #fff;' : 'background: transparent; color: #64748b;'}">Late</button>
          </div>
        </td>
      </tr>
    `).join("");
  }
}

function viewAttGradesReport() {
  alert(`Report generated for ${attGradesState.selectedClass} on ${attGradesState.selectedDate}.`);
}

function downloadAttGradesReport() {
  alert(`Downloading attendance & grades report for ${attGradesState.selectedClass}...`);
}

// Auto render roster on tab navigation
document.addEventListener("DOMContentLoaded", () => {
  renderAttGradesRoster();
  renderHomeworkRoster();

/* ═══════════════════════════════════════════════════════════════
   HOMEWORK MODULE CONTROLLER (MATCHING DESIGN SPECIFICATION)
   ═══════════════════════════════════════════════════════════════ */

let hwControllerState = {
  classFilter: 'All Classes',
  searchQuery: '',
  items: [
    {
      id: 1,
      className: "Grade 7 - B",
      classPillBg: "#ede9fe",
      classPillColor: "#6d28d9",
      subject: "Computer Science",
      subjectIcon: "💻",
      subjectBg: "#eff6ff",
      subjectBorder: "#dbeafe",
      subjectColor: "#2563eb",
      topic: "Introduction to Python",
      description: "Complete the coding exercise given in the notebook.",
      dueDate: "07 Oct 2026",
      dueDay: "Wed",
      completed: false
    },
    {
      id: 2,
      className: "Grade 8 - A",
      classPillBg: "#f3e8ff",
      classPillColor: "#7e22ce",
      subject: "Physics",
      subjectIcon: "🧪",
      subjectBg: "#f0fdf4",
      subjectBorder: "#bbf7d0",
      subjectColor: "#16a34a",
      topic: "Laws of Motion",
      description: "Solve numerical problems 1 to 10 in chapter end exercises.",
      dueDate: "08 Oct 2026",
      dueDay: "Thu",
      completed: false
    },
    {
      id: 3,
      className: "Grade 8 - B",
      classPillBg: "#dbeafe",
      classPillColor: "#1d4ed8",
      subject: "Chemistry",
      subjectIcon: "🧪",
      subjectBg: "#faf5ff",
      subjectBorder: "#e9d5ff",
      subjectColor: "#9333ea",
      topic: "Synthetic Fibres and Plastics",
      description: "Draw flowcharts comparing thermoplastics vs thermosetting plastics.",
      dueDate: "09 Oct 2026",
      dueDay: "Fri",
      completed: true
    },
    {
      id: 4,
      className: "Grade 7 - A",
      classPillBg: "#dcfce7",
      classPillColor: "#15803d",
      subject: "Mathematics",
      subjectIcon: "Σ",
      subjectBg: "#fff7ed",
      subjectBorder: "#fed7aa",
      subjectColor: "#ea580c",
      topic: "Algebraic Expressions",
      description: "Complete Exercise 12.2 questions 1 through 8.",
      dueDate: "10 Oct 2026",
      dueDay: "Sat",
      completed: false
    },
    {
      id: 5,
      className: "Grade 6 - B",
      classPillBg: "#ffe4e6",
      classPillColor: "#be123c",
      subject: "English",
      subjectIcon: "📖",
      subjectBg: "#fdf2f8",
      subjectBorder: "#fbcfe8",
      subjectColor: "#db2777",
      topic: "A Different Kind of School",
      description: "Write a 150-word reflection paragraph on empathy and inclusion.",
      dueDate: "11 Oct 2026",
      dueDay: "Sun",
      completed: false
    },
    {
      id: 6,
      className: "Grade 8 - A",
      classPillBg: "#f3e8ff",
      classPillColor: "#7e22ce",
      subject: "Geography",
      subjectIcon: "🌐",
      subjectBg: "#ecfeff",
      subjectBorder: "#a5f3fc",
      subjectColor: "#0891b2",
      topic: "Land, Soil & Water Resources",
      description: "Map Work: Mark major soil classification zones in India.",
      dueDate: "12 Oct 2026",
      dueDay: "Mon",
      completed: true
    },
    {
      id: 7,
      className: "Grade 8 - B",
      classPillBg: "#dbeafe",
      classPillColor: "#1d4ed8",
      subject: "History",
      subjectIcon: "🏛️",
      subjectBg: "#faf5ff",
      subjectBorder: "#e9d5ff",
      subjectColor: "#7c3aed",
      topic: "New Kings & Kingdoms",
      description: "Write detailed notes on Chola administration and temple architecture.",
      dueDate: "13 Oct 2026",
      dueDay: "Tue",
      completed: false
    },
    {
      id: 8,
      className: "Grade 8 - B",
      classPillBg: "#dbeafe",
      classPillColor: "#1d4ed8",
      subject: "Biology",
      subjectIcon: "🍃",
      subjectBg: "#f0fdf4",
      subjectBorder: "#bbf7d0",
      subjectColor: "#16a34a",
      topic: "Cell – Structure & Functions",
      description: "Draw neat labelled diagrams of Plant Cell vs Animal Cell in lab record.",
      dueDate: "14 Oct 2026",
      dueDay: "Wed",
      completed: false
    },
    {
      id: 9,
      className: "Grade 6 - B",
      classPillBg: "#ffe4e6",
      classPillColor: "#be123c",
      subject: "Sanskrit",
      subjectIcon: "📄",
      subjectBg: "#eef2ff",
      subjectBorder: "#c7d2fe",
      subjectColor: "#4f46e5",
      topic: "पाठ 3 – शब्द परिचयः",
      description: "प्रश्न उत्तर लिखें (1–5).",
      dueDate: "15 Oct 2026",
      dueDay: "Thu",
      completed: false
    },
    {
      id: 10,
      className: "Grade 8 - A",
      classPillBg: "#f3e8ff",
      classPillColor: "#7e22ce",
      subject: "Mathematics",
      subjectIcon: "Σ",
      subjectBg: "#eff6ff",
      subjectBorder: "#dbeafe",
      subjectColor: "#2563eb",
      topic: "Chapter 6 – Linear Equations",
      description: "Solve the given worksheet (pages 45–47).",
      dueDate: "16 Oct 2026",
      dueDay: "Fri",
      completed: true
    },
    {
      id: 11,
      className: "Grade 8 - B",
      classPillBg: "#dbeafe",
      classPillColor: "#1d4ed8",
      subject: "Science",
      subjectIcon: "🧪",
      subjectBg: "#f0fdf4",
      subjectBorder: "#bbf7d0",
      subjectColor: "#16a34a",
      topic: "Force and Pressure",
      description: "Write short notes and answer the questions.",
      dueDate: "17 Oct 2026",
      dueDay: "Sat",
      completed: false
    },
    {
      id: 12,
      className: "Grade 7 - A",
      classPillBg: "#dcfce7",
      classPillColor: "#15803d",
      subject: "English",
      subjectIcon: "📖",
      subjectBg: "#faf5ff",
      subjectBorder: "#e9d5ff",
      subjectColor: "#9333ea",
      topic: "The Last Leaf",
      description: "Read the chapter and complete exercises 1–5.",
      dueDate: "18 Oct 2026",
      dueDay: "Sun",
      completed: false
    },
    {
      id: 13,
      className: "Grade 6 - B",
      classPillBg: "#ffe4e6",
      classPillColor: "#be123c",
      subject: "Social Science",
      subjectIcon: "🍃",
      subjectBg: "#f0fdf4",
      subjectBorder: "#bbf7d0",
      subjectColor: "#16a34a",
      topic: "Our Environment",
      description: "Prepare a chart on renewable and non-renewable resources.",
      dueDate: "19 Oct 2026",
      dueDay: "Mon",
      completed: true
    },
    {
      id: 14,
      className: "Grade 8 - A",
      classPillBg: "#f3e8ff",
      classPillColor: "#7e22ce",
      subject: "Hindi",
      subjectIcon: "💻",
      subjectBg: "#eff6ff",
      subjectBorder: "#dbeafe",
      subjectColor: "#2563eb",
      topic: "पाठ 5 – बस की यात्रा",
      description: "प्रश्न उत्तर लिखें (1–5).",
      dueDate: "20 Oct 2026",
      dueDay: "Tue",
      completed: false
    },
    {
      id: 15,
      className: "Grade 7 - A",
      classPillBg: "#dcfce7",
      classPillColor: "#15803d",
      subject: "Civics",
      subjectIcon: "🍃",
      subjectBg: "#f0fdf4",
      subjectBorder: "#bbf7d0",
      subjectColor: "#16a34a",
      topic: "Understanding Media",
      description: "Collect newspaper clippings demonstrating public awareness campaigns.",
      dueDate: "21 Oct 2026",
      dueDay: "Wed",
      completed: true
    }
  ]
};

function hwOnClassFilterChange(val) {
  hwControllerState.classFilter = val;
  renderHomeworkRoster();
}

function hwOnSearchInput(val) {
  hwControllerState.searchQuery = val.toLowerCase().trim();
  renderHomeworkRoster();
}

function toggleHomeworkStatus(id) {
  const item = hwControllerState.items.find(i => i.id === id);
  if (item) {
    item.completed = !item.completed;
    renderHomeworkRoster();
  }
}

function deleteHomework(id) {
  hwControllerState.items = hwControllerState.items.filter(i => i.id !== id);
  renderHomeworkRoster();
}

function openCreateHomeworkModal() {
  const modal = document.getElementById("createHomeworkModal");
  if (modal) modal.classList.remove("hidden");
}

function closeCreateHomeworkModal() {
  const modal = document.getElementById("createHomeworkModal");
  if (modal) modal.classList.add("hidden");
}

function handleSaveNewHomework(e) {
  e.preventDefault();
  const className = document.getElementById("hwModalClass")?.value || "Grade 8 - A";
  const subject = document.getElementById("hwModalSubject")?.value || "Mathematics";
  const topic = document.getElementById("hwModalTopic")?.value.trim() || "New Assignment";
  const description = document.getElementById("hwModalDescription")?.value.trim() || "Complete the assignment.";
  const rawDate = document.getElementById("hwModalDueDate")?.value || "2026-10-08";

  const dateObj = new Date(rawDate);
  const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  const dayName = dateObj.toLocaleDateString("en-GB", { weekday: 'short' });

  const classPills = {
    "Grade 8 - A": { bg: "#f3e8ff", color: "#7e22ce" },
    "Grade 8 - B": { bg: "#dbeafe", color: "#1d4ed8" },
    "Grade 7 - A": { bg: "#dcfce7", color: "#15803d" },
    "Grade 6 - B": { bg: "#ffe4e6", color: "#be123c" },
    "Grade 7 - B": { bg: "#ede9fe", color: "#6d28d9" },
  };

  const pillInfo = classPills[className] || { bg: "#f1f5f9", color: "#475569" };

  const newItem = {
    id: Date.now(),
    className,
    classPillBg: pillInfo.bg,
    classPillColor: pillInfo.color,
    subject,
    subjectIcon: subject.includes("Science") ? "🧪" : (subject.includes("Math") ? "Σ" : "📖"),
    subjectBg: "#eff6ff",
    subjectBorder: "#dbeafe",
    subjectColor: "#2563eb",
    topic,
    description,
    dueDate: formattedDate,
    dueDay: dayName,
    completed: false
  };

  hwControllerState.items.unshift(newItem);
  closeCreateHomeworkModal();
  renderHomeworkRoster();
}

function updateHomeworkMetrics() {
  const thisWeekItems = hwControllerState.items.slice(0, 6);
  const total = thisWeekItems.length;
  const completed = thisWeekItems.filter(i => i.completed).length;
  const pending = total - completed;

  const cPct = total ? Math.round((completed / total) * 100) : 0;
  const pPct = total ? Math.round((pending / total) * 100) : 0;

  const totalEl = document.getElementById("hwMetricTotal");
  const completedEl = document.getElementById("hwMetricCompleted");
  const pendingEl = document.getElementById("hwMetricPending");

  if (totalEl) totalEl.textContent = String(total);
  if (completedEl) completedEl.innerHTML = `${completed} <span style="font-size: 0.8rem; font-weight: 700; color: #16a34a;">(${cPct}%)</span>`;
  if (pendingEl) pendingEl.innerHTML = `${pending} <span style="font-size: 0.8rem; font-weight: 700; color: #ea580c;">(${pPct}%)</span>`;
}

function getSubjectSvg(subject) {
  const s = (subject || "").toLowerCase();
  if (s.includes("computer")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
  }
  if (s.includes("physics")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.69 17.5A2 2 0 0 0 6.36 21h11.28a2 2 0 0 0 1.67-3.5L14 9.31V2"></path><line x1="8" y1="2" x2="16" y2="2"></line><line x1="8.5" y1="14" x2="15.5" y2="14"></line></svg>`;
  }
  if (s.includes("chemistry")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.69 17.5A2 2 0 0 0 6.36 21h11.28a2 2 0 0 0 1.67-3.5L14 9.31V2"></path><line x1="8" y1="2" x2="16" y2="2"></line><circle cx="10" cy="16" r="1" fill="currentColor"></circle><circle cx="14" cy="14" r="1" fill="currentColor"></circle></svg>`;
  }
  if (s.includes("math")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4H6l7 8-7 8h12"></path></svg>`;
  }
  if (s.includes("english")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
  }
  if (s.includes("geography")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  }
  if (s.includes("history")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="22" x2="22" y2="22"></line><line x1="4" y1="6" x2="20" y2="6"></line><polygon points="12 2 20 6 4 6 12 2"></polygon><line x1="6" y1="10" x2="6" y2="18"></line><line x1="10" y1="10" x2="10" y2="18"></line><line x1="14" y1="10" x2="14" y2="18"></line><line x1="18" y1="10" x2="18" y2="18"></line></svg>`;
  }
  if (s.includes("bio") || s.includes("environ")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>`;
  }
  if (s.includes("sanskrit") || s.includes("hindi") || s.includes("language")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
  }
  if (s.includes("science")) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.69 17.5A2 2 0 0 0 6.36 21h11.28a2 2 0 0 0 1.67-3.5L14 9.31V2"></path><line x1="8" y1="2" x2="16" y2="2"></line></svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
}

function renderHomeworkRoster() {
  const tbody = document.getElementById("hwRosterTableBody");
  const paginationText = document.getElementById("hwPaginationText");
  if (!tbody) return;

  updateHomeworkMetrics();

  let filtered = hwControllerState.items;

  if (hwControllerState.classFilter !== "All Classes") {
    filtered = filtered.filter(i => i.className === hwControllerState.classFilter);
  }

  if (hwControllerState.searchQuery) {
    filtered = filtered.filter(i =>
      i.topic.toLowerCase().includes(hwControllerState.searchQuery) ||
      i.description.toLowerCase().includes(hwControllerState.searchQuery) ||
      i.subject.toLowerCase().includes(hwControllerState.searchQuery) ||
      i.className.toLowerCase().includes(hwControllerState.searchQuery)
    );
  }

  if (paginationText) {
    paginationText.textContent = `Showing 1 - ${filtered.length} of ${filtered.length} homework`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 3.5rem 1.5rem;">
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem;">
            <div style="width:64px; height:64px; border-radius:50%; background:#eff6ff; display:flex; align-items:center; justify-content:center; color:#2563eb; border:1px solid #dbeafe;">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0;">No homework found</h3>
            <p style="font-size:0.85rem; color:#64748b; margin:0 0 0.5rem 0; max-width:340px; line-height:1.5;">There are no homework assignments matching your selected criteria. Create one to get started.</p>
            <button type="button" onclick="openCreateHomeworkModal()" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.55rem 1.25rem; background:#2563eb; color:#ffffff; font-weight:700; font-size:0.88rem; border-radius:10px; border:none; cursor:pointer; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Create Homework</span>
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((item, index) => {
    const isEven = index % 2 === 0;
    const rowBg = isEven ? "#ffffff" : "#fcfcfd";

    const sIconSvg = getSubjectSvg(item.subject);
    const sBg = item.subjectBg || "#eff6ff";
    const sBorder = item.subjectBorder || "#dbeafe";
    const sColor = item.subjectColor || "#2563eb";

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; background: ${rowBg}; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${rowBg}'">
        <td style="padding: 16px; color: #64748b; font-weight: 700; font-size: 0.9rem;">${index + 1}</td>
        <td style="padding: 16px;">
          <span style="display: inline-block; padding: 0.35rem 0.75rem; border-radius: 99px; background: ${item.classPillBg}; color: ${item.classPillColor}; font-weight: 700; font-size: 0.8rem;">
            ${item.className}
          </span>
        </td>
        <td style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${sBg}; color: ${sColor}; border: 1px solid ${sBorder}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${sIconSvg}
            </div>
            <span style="font-weight: 700; color: #334155; font-size: 0.88rem;">${item.subject}</span>
          </div>
        </td>
        <td style="padding: 16px;">
          <div style="font-weight: 800; color: #0f172a; font-size: 0.92rem; margin-bottom: 3px;">${item.topic}</div>
          <div style="font-size: 0.82rem; color: #64748b; line-height: 1.4;">${item.description}</div>
        </td>
        <td style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 0.55rem; color: #334155;">
            <div style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid #cbd5e1; background: #ffffff; display: flex; align-items: center; justify-content: center; color: #2563eb; flex-shrink: 0;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div>
              <div style="font-weight: 700; color: #334155; font-size: 0.85rem; line-height: 1.2;">${item.dueDate}</div>
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 500;">(${item.dueDay})</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

});

function attSelectGrade(gradeName) {
  attSelectedGrade = gradeName;
  attGoStep(2);
}

function attRenderGrades() {
  const grid = document.getElementById('attGradeGrid');
  if (!grid) return;

  grid.innerHTML = ATT_GRADES_LIST.map(g => `
    <div class="att-card att-grade-card" onclick="attSelectGrade('${g.name}')">
      <div class="att-card-icon">${g.icon}</div>
      <div class="att-card-body">
        <h4 class="att-card-title">${g.name}</h4>
        <div class="att-card-meta">${g.sectionsCount} Sections • ${g.totalStudents} Students</div>
      </div>
      <div class="att-card-badge">${g.pct}% Present</div>
      <div class="att-card-arrow">→</div>
    </div>
  `).join('');
}

function attSelectSection(secName) {
  attSelectedSection = secName;
  attGoStep(3);
}

function attRenderSections() {
  const grid = document.getElementById('attSectionGrid');
  if (!grid) return;

  const sectionData = [
    { name: 'Section A', teacher: 'Mrs. Sharma', students: 30, pct: '96.2%', status: 'Marked' },
    { name: 'Section B', teacher: 'Mr. Verma', students: 31, pct: '93.5%', status: 'Pending' },
    { name: 'Section C', teacher: 'Ms. Kapoor', students: 29, pct: '94.4%', status: 'Marked' },
  ];

  grid.innerHTML = sectionData.map(sec => `
    <div class="att-card att-section-card" onclick="attSelectSection('${sec.name}')">
      <div class="att-section-card-top">
        <div class="att-section-badge ${sec.status === 'Marked' ? 'status-marked' : 'status-pending'}">
          ${sec.status}
        </div>
        <div class="att-section-pct">${sec.pct}</div>
      </div>
      <h4 class="att-card-title">${sec.name}</h4>
      <div class="att-card-meta">Class Teacher: ${sec.teacher}</div>
      <div class="att-card-footer">
        <span>${sec.students} Students</span>
        <span class="att-action-link">Open Attendance →</span>
      </div>
    </div>
  `).join('');
}

function attGetStudentsForCurrentSelection() {
  const key = attGetClassKey();
  const currentGrade = attSelectedGrade || 'Grade 8';
  const currentSection = attSelectedSection || 'Section A';

  const baseStudents = ATT_STUDENT_NAMES_POOL.map((name, i) => ({
    id: `${key}_std_${i + 1}`,
    name,
    roll: i + 1,
    initials: name.split(' ').map(p => p[0]).join(''),
  }));

  try {
    const allUsers = typeof loadAllUsers === 'function' ? loadAllUsers() : [];
    const addedStudents = allUsers.filter(u => {
      if (u.role !== 'Student') return false;
      const parsed = parseClassSection(u.classSection);
      const studentGrade = u.grade || parsed?.grade;
      const studentSection = u.section || parsed?.section;
      // Require an explicit class match — do not treat missing grade/section as "all classes"
      if (!studentGrade || !studentSection) return false;
      return studentGrade === currentGrade && studentSection === currentSection;
    });

    let rollCounter = baseStudents.length + 1;
    addedStudents.forEach(st => {
      const stName = st.displayName || st.username;
      const exists = baseStudents.some(b => b.name.toLowerCase() === stName.toLowerCase());
      if (!exists) {
        baseStudents.push({
          id: st.id,
          name: stName,
          roll: rollCounter++,
          initials: stName.split(' ').map(p => p[0]).join(''),
        });
      }
    });
  } catch (err) {
    console.error("Error syncing custom students into attendance:", err);
  }

  return baseStudents;
}

function attInitStateForCurrentSelection() {
  const key = attGetClassKey();
  if (!attState[key]) {
    attState[key] = {};
    const students = attGetStudentsForCurrentSelection();
    students.forEach((s, i) => {
      attState[key][s.id] = (i === 1 || i === 7) ? 'Absent' : (i === 4 ? 'Late' : 'Present');
    });
  }
}

function attInitMarkPanel() {
  attInitStateForCurrentSelection();
  attShowAll = false;
  const search = document.getElementById('attSearchInput');
  if (search) search.value = '';
  const label = document.getElementById('attDateLabel');
  if (label) label.textContent = attFormatDate(attCurrentDate);
  attRenderStudents();
}

function attRenderStudents(filter = '') {
  const list = document.getElementById('attStudentList');
  const showMore = document.getElementById('attShowMore');
  const showMoreText = document.getElementById('attShowMoreText');
  if (!list) return;

  const key = attGetClassKey();
  attInitStateForCurrentSelection();
  const students = attGetStudentsForCurrentSelection();
  const filtered = filter
    ? students.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()))
    : students;

  list.innerHTML = filtered.map((s, i) => {
    const status = attState[key][s.id] || 'Present';
    const isHidden = !attShowAll && i >= ATT_VISIBLE_LIMIT;
    return `
      <div class="att-student-row${isHidden ? ' hidden-row' : ''}" data-student-id="${s.id}">
        <span class="att-student-num">${s.roll}.</span>
        <div class="att-student-avatar">${s.initials}</div>
        <span class="att-student-name">${s.name}</span>
        <div class="att-student-btns">
          <button class="att-status-btn att-btn-present ${status === 'Present' ? 'active-status' : ''}"
                  onclick="attSetStatus('${s.id}','Present',this)">Present</button>
          <button class="att-status-btn att-btn-absent ${status === 'Absent' ? 'active-status' : ''}"
                  onclick="attSetStatus('${s.id}','Absent',this)">Absent</button>
          <button class="att-status-btn att-btn-late ${status === 'Late' ? 'active-status' : ''}"
                  onclick="attSetStatus('${s.id}','Late',this)">Late</button>
        </div>
        <button class="att-btn-note" title="Add note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');

  const hasMore = filtered.length > ATT_VISIBLE_LIMIT && !filter;
  if (showMore) showMore.style.display = hasMore ? 'block' : 'none';
  if (showMoreText) {
    showMoreText.textContent = attShowAll ? 'Show fewer students' : 'Show more students';
  }
  attUpdateCounts();
}

function attSetStatus(studentId, status, btn) {
  const key = attGetClassKey();
  if (!attState[key]) attState[key] = {};
  attState[key][studentId] = status;

  const row = btn.closest('.att-student-row');
  if (row) {
    row.querySelectorAll('.att-status-btn').forEach(b => b.classList.remove('active-status'));
    btn.classList.add('active-status');
  }
  attUpdateCounts();
}

function attUpdateCounts() {
  const key = attGetClassKey();
  if (!attState[key]) return;
  const statusMap = attState[key];
  const students = attGetStudentsForCurrentSelection();
  let p = 0, a = 0, l = 0;
  students.forEach(s => {
    const st = statusMap[s.id] || 'Present';
    if (st === 'Present') p++;
    else if (st === 'Absent') a++;
    else if (st === 'Late') l++;
  });
  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl('attCountPresent', p);
  setEl('attCountAbsent', a);
  setEl('attCountLate', l);
  setEl('attCountTotal', students.length);
}

function attFilterStudents(val) {
  attRenderStudents(val);
}

function attToggleShowMore() {
  attShowAll = !attShowAll;
  attRenderStudents();
}

function attToggleBulkMenu() {
  const menu = document.getElementById('attBulkMenu');
  if (menu) menu.classList.toggle('hidden');
}

function attBulkAction(status) {
  const key = attGetClassKey();
  attInitStateForCurrentSelection();
  const students = attGetStudentsForCurrentSelection();
  students.forEach(s => { attState[key][s.id] = status; });
  const menu = document.getElementById('attBulkMenu');
  if (menu) menu.classList.add('hidden');
  attRenderStudents();
}

function attChangeDate(delta) {
  attCurrentDate = new Date(attCurrentDate.getTime() + delta * 86400000);
  const label = document.getElementById('attDateLabel');
  if (label) label.textContent = attFormatDate(attCurrentDate);
}

function attSaveAttendance() {
  const btn = document.querySelector('.att-save-btn');
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✓ Saved!';
  btn.style.background = '#10b981';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
  }, 2000);
}

function attInit() {
  attGoStep(1);
}

// Close bulk menu when clicking outside
document.addEventListener('click', e => {
  const menu = document.getElementById('attBulkMenu');
  if (menu && !menu.classList.contains('hidden') && !e.target.closest('.att-bulk-wrap')) {
    menu.classList.add('hidden');
  }
});

// Hook into existing tab navigation
(function patchAttendanceNav() {
  const orig = window.showSection;
  if (typeof orig === 'function') {
    window.showSection = function(id, ...args) {
      orig.call(this, id, ...args);
      if (id === 'attendanceSection') {
        setTimeout(attInit, 50);
      }
    };
  }
  document.querySelectorAll('[data-section="attendanceSection"], [onclick*="attendanceSection"]').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(attInit, 100));
  });
})();

// ==========================================
// ACADEMIC REPORTS MODULE & SECURITY ENGINE
// ==========================================

let currentReportStudentId = null;
let currentReportTerm = "Term 1";

const DEFAULT_ACADEMIC_REPORTS = {
  "student-001": {
    studentId: "student-001",
    studentName: "Aarav Sharma",
    rollNo: "VIB-2026-8801",
    classSection: "8A",
    academicYear: "2025 - 2026",
    terms: {
      "Term 1": {
        termName: "Term 1 Examination",
        issueDate: "October 15, 2025",
        attendancePercentage: 96,
        conduct: "Excellent",
        classTeacherRemarks: "Aarav has shown outstanding academic commitment throughout Term 1. Demonstrates strong analytical thinking in Mathematics and Science.",
        headmasterRemarks: "Promoted to Term 2 with High Distinction.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 95, percentage: 95, grade: "A+", remarks: "Outstanding problem solver" },
          { subject: "Physics", maxMarks: 100, marksObtained: 89, percentage: 89, grade: "A", remarks: "Excellent grasp of concepts" },
          { subject: "Chemistry", maxMarks: 100, marksObtained: 84, percentage: 84, grade: "B+", remarks: "Consistent performer in lab" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 91, percentage: 91, grade: "A+", remarks: "Strong vocabulary and essay skills" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Thorough understanding of history" },
          { subject: "Computer Science", maxMarks: 100, marksObtained: 97, percentage: 97, grade: "A+", remarks: "Top scorer in practical coding" }
        ]
      },
      "Term 2": {
        termName: "Term 2 Progress Report",
        issueDate: "February 20, 2026",
        attendancePercentage: 98,
        conduct: "Excellent",
        classTeacherRemarks: "Aarav continues to perform at an exemplary level. Participated actively in the Science Exhibition.",
        headmasterRemarks: "Sustained high academic standards.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 98, percentage: 98, grade: "A+", remarks: "Perfect logical accuracy" },
          { subject: "Physics", maxMarks: 100, marksObtained: 92, percentage: 92, grade: "A+", remarks: "Great improvement in numericals" },
          { subject: "Chemistry", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Very good experimental analysis" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 90, percentage: 90, grade: "A+", remarks: "Creative writing skills" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 87, percentage: 87, grade: "A", remarks: "Well structured answers" },
          { subject: "Computer Science", maxMarks: 100, marksObtained: 99, percentage: 99, grade: "A+", remarks: "Exceptional logic" }
        ]
      },
      "Annual Term": {
        termName: "Annual Consolidated Report",
        issueDate: "March 30, 2026",
        attendancePercentage: 97,
        conduct: "Exemplary",
        classTeacherRemarks: "Overall brilliant performance across all subjects. Highly recommended for Advanced STEM Cohort.",
        headmasterRemarks: "Promoted to Grade 9 with Grade A+ Distinction.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 96, percentage: 96, grade: "A+", remarks: "Exemplary performance" },
          { subject: "Physics", maxMarks: 100, marksObtained: 90, percentage: 90, grade: "A+", remarks: "Distinction score" },
          { subject: "Chemistry", maxMarks: 100, marksObtained: 86, percentage: 86, grade: "A", remarks: "Solid foundation" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 90, percentage: 90, grade: "A+", remarks: "High commendation" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Consistent" },
          { subject: "Computer Science", maxMarks: 100, marksObtained: 98, percentage: 98, grade: "A+", remarks: "Class topper" }
        ]
      }
    }
  },
  "student-002": {
    studentId: "student-002",
    studentName: "Ananya Sharma",
    rollNo: "VIB-2026-8802",
    classSection: "8A",
    academicYear: "2025 - 2026",
    terms: {
      "Term 1": {
        termName: "Term 1 Examination",
        issueDate: "October 15, 2025",
        attendancePercentage: 95,
        conduct: "Excellent",
        classTeacherRemarks: "Ananya is a highly focused and creative student. Excels in languages and biological sciences.",
        headmasterRemarks: "Promoted to Term 2 with Distinction.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Good conceptual understanding" },
          { subject: "Physics", maxMarks: 100, marksObtained: 85, percentage: 85, grade: "A", remarks: "Punctual with lab records" },
          { subject: "Biology", maxMarks: 100, marksObtained: 96, percentage: 96, grade: "A+", remarks: "Top scorer in Botany & Zoology" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 94, percentage: 94, grade: "A+", remarks: "Outstanding expression and speech" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 92, percentage: 92, grade: "A+", remarks: "Excellent mapwork and history skills" },
          { subject: "Computer Science", maxMarks: 100, marksObtained: 90, percentage: 90, grade: "A+", remarks: "Proficient in web concepts" }
        ]
      },
      "Term 2": {
        termName: "Term 2 Progress Report",
        issueDate: "February 20, 2026",
        attendancePercentage: 97,
        conduct: "Excellent",
        classTeacherRemarks: "Ananya has displayed consistent enthusiasm in all classroom discussions.",
        headmasterRemarks: "Excellent academic effort.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 90, percentage: 90, grade: "A+", remarks: "Improved problem speed" },
          { subject: "Physics", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Very good physics project" },
          { subject: "Biology", maxMarks: 100, marksObtained: 98, percentage: 98, grade: "A+", remarks: "Class topper in Biology" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 95, percentage: 95, grade: "A+", remarks: "Winner of Debate competition" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 93, percentage: 93, grade: "A+", remarks: "Detailed project work" },
          { subject: "Computer Science", maxMarks: 100, marksObtained: 92, percentage: 92, grade: "A+", remarks: "Great design aptitude" }
        ]
      },
      "Annual Term": {
        termName: "Annual Consolidated Report",
        issueDate: "March 30, 2026",
        attendancePercentage: 96,
        conduct: "Exemplary",
        classTeacherRemarks: "Ananya has maintained a stellar academic record. A role model for peer collaboration.",
        headmasterRemarks: "Promoted to Grade 9 with Distinction.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 89, percentage: 89, grade: "A", remarks: "Solid effort" },
          { subject: "Physics", maxMarks: 100, marksObtained: 86, percentage: 86, grade: "A", remarks: "Very good" },
          { subject: "Biology", maxMarks: 100, marksObtained: 97, percentage: 97, grade: "A+", remarks: "Outstanding" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 95, percentage: 95, grade: "A+", remarks: "Top honors" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 93, percentage: 93, grade: "A+", remarks: "Distinction" },
          { subject: "Computer Science", maxMarks: 100, marksObtained: 91, percentage: 91, grade: "A+", remarks: "Very good" }
        ]
      }
    }
  },
  "student-003": {
    studentId: "student-003",
    studentName: "Rohan Gupta",
    rollNo: "VIB-2026-8803",
    classSection: "8B",
    academicYear: "2025 - 2026",
    terms: {
      "Term 1": {
        termName: "Term 1 Examination",
        issueDate: "October 15, 2025",
        attendancePercentage: 94,
        conduct: "Very Good",
        classTeacherRemarks: "Rohan is an energetic student with keen interest in sports and practical science activities.",
        headmasterRemarks: "Promoted to Term 2.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 82, percentage: 82, grade: "B+", remarks: "Needs practice in algebra" },
          { subject: "Physics", maxMarks: 100, marksObtained: 86, percentage: 86, grade: "A", remarks: "Good practical skills" },
          { subject: "Chemistry", maxMarks: 100, marksObtained: 80, percentage: 80, grade: "B+", remarks: "Satisfactory performance" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 85, percentage: 85, grade: "A", remarks: "Good comprehension skills" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 83, percentage: 83, grade: "B+", remarks: "Good effort" },
          { subject: "Physical Education", maxMarks: 100, marksObtained: 96, percentage: 96, grade: "A+", remarks: "School athletics team captain" }
        ]
      },
      "Term 2": {
        termName: "Term 2 Progress Report",
        issueDate: "February 20, 2026",
        attendancePercentage: 95,
        conduct: "Very Good",
        classTeacherRemarks: "Rohan has shown good progress in mathematics algebra topics after additional guidance.",
        headmasterRemarks: "Good progress maintained.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 86, percentage: 86, grade: "A", remarks: "Noticeable improvement" },
          { subject: "Physics", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Active lab worker" },
          { subject: "Chemistry", maxMarks: 100, marksObtained: 83, percentage: 83, grade: "B+", remarks: "Steady" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 87, percentage: 87, grade: "A", remarks: "Good fluency" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 85, percentage: 85, grade: "A", remarks: "Satisfactory" },
          { subject: "Physical Education", maxMarks: 100, marksObtained: 98, percentage: 98, grade: "A+", remarks: "Outstanding performance" }
        ]
      },
      "Annual Term": {
        termName: "Annual Consolidated Report",
        issueDate: "March 30, 2026",
        attendancePercentage: 95,
        conduct: "Very Good",
        classTeacherRemarks: "Rohan ends the academic year on a strong note. Well done!",
        headmasterRemarks: "Promoted to Grade 9.",
        subjects: [
          { subject: "Mathematics", maxMarks: 100, marksObtained: 84, percentage: 84, grade: "B+", remarks: "Good effort" },
          { subject: "Physics", maxMarks: 100, marksObtained: 87, percentage: 87, grade: "A", remarks: "Very good" },
          { subject: "Chemistry", maxMarks: 100, marksObtained: 82, percentage: 82, grade: "B+", remarks: "Consistent" },
          { subject: "English Literature", maxMarks: 100, marksObtained: 86, percentage: 86, grade: "A", remarks: "Good" },
          { subject: "Social Studies", maxMarks: 100, marksObtained: 84, percentage: 84, grade: "B+", remarks: "Good work" },
          { subject: "Physical Education", maxMarks: 100, marksObtained: 97, percentage: 97, grade: "A+", remarks: "Exemplary" }
        ]
      }
    }
  }
};

function loadAllAcademicReports() {
  try {
    const raw = localStorage.getItem(ACADEMIC_REPORTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
      return parsed;
    }
  } catch {
    // ignore
  }
  saveAllAcademicReports(DEFAULT_ACADEMIC_REPORTS);
  return DEFAULT_ACADEMIC_REPORTS;
}

function saveAllAcademicReports(reports) {
  try {
    localStorage.setItem(ACADEMIC_REPORTS_KEY, JSON.stringify(reports));
  } catch {
    // ignore
  }
}

// Backend / API Security Access Controller
function fetchAcademicReportData(requestingUser, requestedStudentId, term = "Term 1") {
  if (!requestingUser) {
    return { error: "Authentication required.", code: 401 };
  }

  const reports = loadAllAcademicReports();
  const allUsers = loadAllUsers();
  let authorizedStudentId = null;

  if (requestingUser.role === "Student") {
    // SECURITY RESTRICTION: Student can ONLY view their own report.
    // Overrides any URL, parameter, or DevTools input.
    authorizedStudentId = requestingUser.id;
  } else if (requestingUser.role === "Parent") {
    // SECURITY RESTRICTION: Parent can ONLY view their linked children.
    const linkedIds = Array.isArray(requestingUser.linkedStudentIds) && requestingUser.linkedStudentIds.length > 0
      ? requestingUser.linkedStudentIds
      : (requestingUser.linkedStudentId ? [requestingUser.linkedStudentId] : []);

    if (linkedIds.length === 0) {
      return { error: "No student records linked to this parent account.", code: 403 };
    }

    if (requestedStudentId && linkedIds.includes(requestedStudentId)) {
      authorizedStudentId = requestedStudentId;
    } else {
      authorizedStudentId = linkedIds[0];
    }
  } else if (requestingUser.role === "Teacher") {
    // SECURITY RESTRICTION: Teacher can access students in assigned classes
    const assignedClasses = Array.isArray(requestingUser.assignedClasses) ? requestingUser.assignedClasses : [];
    const validStudents = allUsers.filter(u => u.role === "Student" && (assignedClasses.length === 0 || assignedClasses.some(ac => classesEqual(ac, u.classSection))));
    const validIds = validStudents.map(s => s.id);

    if (requestedStudentId && validIds.includes(requestedStudentId)) {
      authorizedStudentId = requestedStudentId;
    } else {
      authorizedStudentId = validIds[0] || (validStudents[0] ? validStudents[0].id : null);
    }
  } else {
    // Principal / Staff / Admin
    const studentUsers = allUsers.filter(u => u.role === "Student");
    if (requestedStudentId && studentUsers.some(s => s.id === requestedStudentId)) {
      authorizedStudentId = requestedStudentId;
    } else {
      authorizedStudentId = studentUsers[0] ? studentUsers[0].id : "student-001";
    }
  }

  if (!authorizedStudentId) {
    return { error: "No student report found.", code: 404 };
  }

  const studentObj = allUsers.find(u => u.id === authorizedStudentId);
  const studentReports = reports[authorizedStudentId];

  if (!studentReports) {
    return {
      studentId: authorizedStudentId,
      studentName: studentObj ? studentObj.displayName || studentObj.username : "Student",
      rollNo: `VIB-2026-${authorizedStudentId.slice(-4)}`,
      classSection: studentObj ? studentObj.classSection || "8A" : "8A",
      academicYear: "2025 - 2026",
      termName: term,
      term: term,
      attendancePercentage: 95,
      conduct: "Good",
      classTeacherRemarks: "Consistent academic effort and active class participation.",
      headmasterRemarks: "Satisfactory progress.",
      subjects: [
        { subject: "Mathematics", maxMarks: 100, marksObtained: 85, percentage: 85, grade: "A", remarks: "Good analytical skills" },
        { subject: "Physics", maxMarks: 100, marksObtained: 88, percentage: 88, grade: "A", remarks: "Punctual in lab" },
        { subject: "Chemistry", maxMarks: 100, marksObtained: 82, percentage: 82, grade: "B+", remarks: "Good effort" },
        { subject: "English", maxMarks: 100, marksObtained: 90, percentage: 90, grade: "A+", remarks: "Strong comprehension" }
      ]
    };
  }

  const selectedTermData = studentReports.terms[term] || studentReports.terms["Term 1"] || Object.values(studentReports.terms)[0];

  return {
    studentId: authorizedStudentId,
    studentName: studentObj ? studentObj.displayName || studentObj.username : studentReports.studentName,
    rollNo: studentReports.rollNo || `VIB-2026-${authorizedStudentId.slice(-4)}`,
    classSection: studentObj ? studentObj.classSection || studentReports.classSection : studentReports.classSection,
    academicYear: studentReports.academicYear || "2025 - 2026",
    term: term,
    ...selectedTermData
  };
}

function getSubjectIcon(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("math")) return "📐";
  if (n.includes("physical education") || n.includes("phys ed") || /\bpe\b/.test(n) || n.includes("sport")) return "🏆";
  if (n.includes("physic")) return "⚡";
  if (n.includes("chem")) return "🧪";
  if (n.includes("biolog") || n.includes("scienc")) return "🧬";
  if (n.includes("eng")) return "📚";
  if (n.includes("social") || n.includes("histor")) return "🌍";
  if (n.includes("comput") || n.includes("cod")) return "💻";
  return "📖";
}

function renderReports(targetStudentId, term) {
  if (term) currentReportTerm = term;
  if (targetStudentId) currentReportStudentId = targetStudentId;
  if (!currentReportTerm) currentReportTerm = "Term 1";

  const user = currentUser || loadCurrentUser();
  if (!user) return;

  // Security authorization enforcement
  const reportData = fetchAcademicReportData(user, currentReportStudentId, currentReportTerm);

  if (reportData.error) {
    console.error("Report Access Error:", reportData.error);
    const noticeEl = document.getElementById("reportAccessNoticeText");
    if (noticeEl) noticeEl.textContent = `Error: ${reportData.error}`;
    return;
  }

  currentReportStudentId = reportData.studentId;

  // Controls UI setup
  const noticeTextEl = document.getElementById("reportAccessNoticeText");
  const parentSelectorContainer = document.getElementById("reportParentChildSelectorContainer");
  const parentChildPills = document.getElementById("reportParentChildPills");
  const adminControls = document.getElementById("reportAdminControls");
  const classFilterSelect = document.getElementById("reportClassFilterSelect");
  const studentSelect = document.getElementById("reportStudentSelect");

  const isStudent = user.role === "Student";
  const isParent = user.role === "Parent";
  const isTeacher = user.role === "Teacher";
  const isAdmin = user.role === "Principal" || user.role === "Staff";

  if (isStudent) {
    if (noticeTextEl) {
      noticeTextEl.textContent = `Student Term Progress Report: ${reportData.studentName} (Class ${reportData.classSection})`;
    }
    if (parentSelectorContainer) parentSelectorContainer.classList.add("hidden");
    if (adminControls) adminControls.classList.add("hidden");
  } else if (isParent) {
    const linkedChildren = getChildrenForParent(user);
    if (linkedChildren.length <= 1) {
      if (noticeTextEl) {
        noticeTextEl.textContent = `Child Progress Report: ${reportData.studentName} (Class ${reportData.classSection})`;
      }
      if (parentSelectorContainer) parentSelectorContainer.classList.add("hidden");
    } else {
      if (noticeTextEl) {
        noticeTextEl.textContent = `Viewing Linked Child Report: ${reportData.studentName}`;
      }
      if (parentSelectorContainer) {
        parentSelectorContainer.classList.remove("hidden");
        if (parentChildPills) {
          parentChildPills.innerHTML = linkedChildren.map(child => `
            <button type="button" class="child-pill-btn ${child.id === currentReportStudentId ? 'active' : ''}" onclick="renderReports('${child.id}', '${currentReportTerm}')">
              👦 ${child.displayName || child.username} (${child.classSection})
            </button>
          `).join("");
        }
      }
    }
    if (adminControls) adminControls.classList.add("hidden");
  } else {
    // Admin / Staff / Teacher
    if (noticeTextEl) {
      noticeTextEl.textContent = `Academic Management Mode (${user.role})`;
    }
    if (parentSelectorContainer) parentSelectorContainer.classList.add("hidden");
    if (adminControls) {
      adminControls.classList.remove("hidden");
      
      const allUsers = loadAllUsers();
      let students = allUsers.filter(u => u.role === "Student");
      if (isTeacher) {
        const assigned = user.assignedClasses || ["8A", "8B"];
        students = students.filter(s => assigned.some(ac => classesEqual(ac, s.classSection)));
      }

      const selectedClass = classFilterSelect ? classFilterSelect.value : "All";
      if (selectedClass && selectedClass !== "All") {
        students = students.filter(s => s.classSection === selectedClass);
      }

      if (studentSelect) {
        studentSelect.innerHTML = students.map(s => `
          <option value="${s.id}" ${s.id === currentReportStudentId ? 'selected' : ''}>
            ${s.displayName || s.username} - Class ${s.classSection}
          </option>
        `).join("");
      }
    }
  }

  // Update Term Tabs UI
  document.querySelectorAll(".report-term-tab").forEach(tabBtn => {
    tabBtn.classList.toggle("active", tabBtn.dataset.term === currentReportTerm);
  });

  // Populate Header Banner
  const studentNameEl = document.getElementById("reportStudentName");
  const studentClassEl = document.getElementById("reportStudentClass");
  const studentRollEl = document.getElementById("reportStudentRoll");
  const academicYearEl = document.getElementById("reportAcademicYear");
  const issueDateEl = document.getElementById("reportIssueDate");
  const termBadgeEl = document.getElementById("reportTermBadge");
  const avatarEl = document.getElementById("reportStudentAvatar");

  if (studentNameEl) studentNameEl.textContent = reportData.studentName;
  if (studentClassEl) {
    const parsed = parseClassSection(reportData.classSection);
    studentClassEl.textContent = parsed && parsed.short !== "All"
      ? `${parsed.grade} - ${parsed.section}`
      : (reportData.classSection || "N/A");
  }
  if (studentRollEl) studentRollEl.textContent = reportData.rollNo;
  if (academicYearEl) academicYearEl.textContent = reportData.academicYear;
  if (issueDateEl) issueDateEl.textContent = reportData.issueDate;
  if (termBadgeEl) termBadgeEl.textContent = reportData.term;
  if (avatarEl) {
    const initials = reportData.studentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    avatarEl.textContent = initials || "ST";
  }

  // Calculate Metrics
  const subjects = reportData.subjects || [];
  let totalMax = 0;
  let totalObtained = 0;
  subjects.forEach(s => {
    totalMax += Number(s.maxMarks || 100);
    totalObtained += Number(s.marksObtained || 0);
  });

  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
  let overallGrade = "A+";
  let statusText = "Distinction";

  if (overallPct >= 90) { overallGrade = "A+"; statusText = "High Distinction"; }
  else if (overallPct >= 85) { overallGrade = "A"; statusText = "Distinction"; }
  else if (overallPct >= 80) { overallGrade = "B+"; statusText = "Merit"; }
  else if (overallPct >= 70) { overallGrade = "B"; statusText = "Satisfactory"; }
  else { overallGrade = "C"; statusText = "Needs Improvement"; }

  const pctEl = document.getElementById("reportOverallPercentage");
  const progressBarEl = document.getElementById("reportOverallProgressBar");
  const gradeEl = document.getElementById("reportOverallGrade");
  const statusEl = document.getElementById("reportPerformanceStatus");
  const attendanceEl = document.getElementById("reportAttendanceRate");
  const conductEl = document.getElementById("reportConduct");

  if (pctEl) pctEl.textContent = `${overallPct}%`;
  if (progressBarEl) progressBarEl.style.width = `${Math.min(100, overallPct)}%`;
  if (gradeEl) gradeEl.textContent = overallGrade;
  if (statusEl) statusEl.textContent = statusText;
  if (attendanceEl) attendanceEl.textContent = `${reportData.attendancePercentage || 95}%`;
  if (conductEl) conductEl.textContent = reportData.conduct || "Excellent";

  // Populate Table Body
  const tbody = document.getElementById("reportSubjectsBody");
  if (tbody) {
    if (subjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 2rem;">No evaluation subjects recorded for this term.</td></tr>`;
    } else {
      tbody.innerHTML = subjects.map(s => {
        let badgeClass = "badge-a";
        if (s.grade === "A+" || s.grade === "A") badgeClass = "badge-a";
        else if (s.grade === "B+" || s.grade === "B") badgeClass = "badge-b";
        else badgeClass = "badge-c";

        const subjectIcon = getSubjectIcon(s.subject);

        return `
          <tr>
            <td>
              <div class="subject-name-box">
                <span class="subject-icon">${subjectIcon}</span>
                <strong>${s.subject}</strong>
              </div>
            </td>
            <td>${s.maxMarks}</td>
            <td><strong>${s.marksObtained}</strong></td>
            <td>
              <div class="pct-chip">
                <span>${s.percentage}%</span>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width: ${s.percentage}%;"></div></div>
              </div>
            </td>
            <td><span class="grade-pill ${badgeClass}">${s.grade}</span></td>
            <td class="muted-text">${s.remarks || 'Good progress'}</td>
          </tr>
        `;
      }).join("");
    }
  }

  // Populate Remarks Cards
  const teacherRemarksEl = document.getElementById("reportTeacherRemarks");
  const headmasterRemarksEl = document.getElementById("reportHeadmasterRemarks");

  if (teacherRemarksEl) teacherRemarksEl.textContent = `"${reportData.classTeacherRemarks || 'Consistent academic progress demonstrated.'}"`;
  if (headmasterRemarksEl) headmasterRemarksEl.textContent = `"${reportData.headmasterRemarks || 'Promoted with distinction.'}"`;
}

function initAcademicReportListeners() {
  const termTabs = document.getElementById("reportTermTabs");
  if (termTabs) {
    termTabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".report-term-tab");
      if (btn && btn.dataset.term) {
        renderReports(currentReportStudentId, btn.dataset.term);
      }
    });
  }

  const classSelect = document.getElementById("reportClassFilterSelect");
  if (classSelect) {
    classSelect.addEventListener("change", () => {
      renderReports(null, currentReportTerm);
    });
  }

  const studentSelect = document.getElementById("reportStudentSelect");
  if (studentSelect) {
    studentSelect.addEventListener("change", (e) => {
      renderReports(e.target.value, currentReportTerm);
    });
  }
}


