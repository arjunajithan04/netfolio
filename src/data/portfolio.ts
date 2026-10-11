/**
 * Central portfolio data for Arjun Ajithan Nadukandiyil.
 * Personal links and portrait supplied by Arjun.
 */
export type Palette = { from: string; via: string; to: string; accent: string };
const crimson: Palette = { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' };
const amber: Palette = { from: '#1c1003', via: '#6b3c06', to: '#0a0806', accent: '#ffb547' };
const ocean: Palette = { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' };
const violet: Palette = { from: '#120822', via: '#3d1a6e', to: '#07060c', accent: '#b98bff' };
const jade: Palette = { from: '#0b0a1c', via: '#28204f', to: '#07070c', accent: '#9a8cff' };

export const profile = {
  fullName: 'Arjun Ajithan Nadukandiyil',
  displayName: 'Arjun Ajithan',
  firstName: 'ARJUN AJITHAN',
  seriesTag: 'THE SERIES',
  originalLabel: 'AN ARJUN AJITHAN ORIGINAL',
  role: 'MCA Student • AI with Python Intern',
  tagline: ['AI with Python Intern', 'Software Developer', 'Emerging Technologies'],
  intro: 'Motivated and technology-driven MCA student with a strong passion for software development, web technologies, and continuous learning. Currently interning at Hope Foundation in Bengaluru as an AI with Python Intern, developing RepoPulse.',
  location: 'Bengaluru, India',
  email: 'arjunajithan04@gmail.com',
  links: { github: 'https://github.com/arjunajithan04', linkedin: 'https://linkedin.com/in/arjunajithan', instagram: 'https://www.instagram.com/arjunajithan/', email: 'mailto:arjunajithan04@gmail.com' },
  resumePdf: '',
  portrait: {
    src: '/assets/portrait-720.webp',
    srcSet: '/assets/portrait-420.webp 420w, /assets/portrait-720.webp 720w, /assets/portrait-1100.webp 1100w',
    alt: 'Portrait of Arjun Ajithan',
  },
  interests: ['Developer Tools', 'Frontend Engineering', 'Automation', 'Data Visualisation'],
};

export const education = [
  { school: 'Presidency College', place: 'Bangalore, India', degree: 'Master of Computer Applications (MCA)', period: 'Pursuing', score: 'Postgraduate' },
  { school: 'Christ University', place: 'Bangalore, India', degree: 'Bachelor of Computer Applications (BCA)', period: '2022–2025', score: 'Percentage: 59.01%' },
  { school: 'MES Indian School', place: 'Doha, Qatar', degree: 'CBSE Class XII (PCM CS)', period: '2022', score: 'Score: 77%' },
  { school: 'MES Indian School', place: 'Doha, Qatar', degree: 'CBSE Class X', period: '2020', score: 'Score: 87%' },
];
export const careerObjective = 'Motivated and technology-driven MCA student with a strong passion for software development, web technologies, and continuous learning. Seeking opportunities to apply and enhance technical skills in a dynamic and innovative environment to contribute to developing practical solutions, gain real-world experience, and grow as a software professional while staying at the forefront of emerging technologies.';
export const experience = [
  { company: 'Hope Foundation', role: 'AI with Python Intern', place: 'Bengaluru, India', period: 'Current', points: [
    'Currently developing RepoPulse, a repository analytics and productivity tool using Python.',
    'Applying Python and AI concepts to build useful features for code analysis and repository insights.',
    'Collaborating on feature development and improving the overall user experience.',
  ] },
  { company: 'Mannai Corporation', role: 'Networking Intern', place: 'Doha, Qatar', period: 'Jul 2025 – Sep 2025', points: [
    'Gained hands-on exposure to enterprise networking infrastructure, supporting configuration and maintenance of network systems.',
    'Collaborated with IT teams to monitor network performance and assist in troubleshooting connectivity issues.',
  ] },
  { company: 'Prodigy InfoTech', role: 'Web Development Intern', place: 'Bangalore, India', period: 'Aug 2024 – Sep 2024', points: [
    'Completed an intensive online web development internship, building functional applications under industry mentorship.',
    'Developed a Tic-Tac-Toe game using HTML, CSS, and JavaScript.',
    'Built a personal portfolio website showcasing projects and skills.',
  ] },
];

export type Metric = { value: string; label: string };
export type Project = { id: string; title: string; year: string; genre: string; logline: string; stack: string[]; build: string[]; features: string[]; metrics: Metric[]; github?: string; palette: Palette; motif: 'shield' | 'flow' | 'tenants' };
export const projects: Project[] = [
  {
    id: 'repopulse', title: 'RepoPulse', year: 'Developing', genre: 'Developer Tools • GitHub • Productivity',
    logline: 'A repository-first workspace built to make project review and development workflows feel more focused.',
    stack: ['React', 'TypeScript', 'Vite', 'GitHub'],
    build: ['Designing a focused workspace around repository context and project review.', 'Refining responsive layouts, interaction states, and a dark cinematic visual system while preserving existing project workflows.'],
    features: ['Repository-first workspace flow', 'Workspace lock / unlock interaction', 'Project review workflow', 'Dark, animation-led interface'],
    metrics: [{ value: 'GitHub', label: 'source of truth' }, { value: 'UI', label: 'design-led iteration' }],
    github: 'https://github.com/arjunajithan04/repopulse', palette: { from: '#090b16', via: '#26244f', to: '#07070c', accent: '#9a8cff' }, motif: 'tenants',
  },
  {
    id: 'ecommerce-category-tree', title: 'E-Commerce Category Tree Manager', year: 'Apr 2026', genre: 'Web Development • E-Commerce',
    logline: 'A dynamic category-tree management interface for an e-commerce platform.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    build: ['Developed a dynamic category tree management interface for an e-commerce platform.', 'Implemented UI components to add, edit, and delete category nodes.'],
    features: ['Dynamic category tree', 'Add, edit, and delete nodes', 'Interactive management interface'],
    metrics: [{ value: 'CRUD', label: 'category operations' }, { value: 'Web', label: 'management UI' }],
    github: 'https://github.com/ashfaqhyder/Mini-Project-E-Commerce-Category-Tree-Manager-Using-Flask', palette: { from: '#090b16', via: '#26244f', to: '#07070c', accent: '#9a8cff' }, motif: 'flow',
  },
  {
    id: 'taxsmart', title: 'TaxSmart – Tax-Saving Information Portal', year: 'Nov 2024 – Mar 2025', genre: 'Web Technologies • Information Portal',
    logline: 'An information portal designed to make tax-saving instruments easier to understand.',
    stack: ['HTML', 'CSS', 'JavaScript', 'Web Technologies'],
    build: ['Built an information portal for tax-saving instruments.', 'Delivered a user-friendly interface for complex financial information.'],
    features: ['Tax-saving information', 'Accessible content presentation', 'User-friendly interface'],
    metrics: [{ value: 'Information', label: 'portal' }, { value: 'UX', label: 'clear presentation' }],
    github: 'https://github.com/arjunajithan04/TaxSmart', palette: { from: '#1d090b', via: '#64202a', to: '#08070a', accent: '#ff6678' }, motif: 'shield',
  },
  {
    id: 'dule', title: 'Dule – Offline & Online Messaging via BLE', year: 'Aug 2024 – Oct 2024', genre: 'Bluetooth Low Energy • Messaging',
    logline: 'A hybrid messaging concept using Bluetooth Low Energy for communication in low-connectivity areas.',
    stack: ['Bluetooth Low Energy (BLE)', 'Web Technologies', 'Python'],
    build: ['Engineered a hybrid messaging system using BLE.', 'Enabled communication in low-connectivity areas.'],
    features: ['Offline messaging concept', 'BLE-based communication', 'Low-connectivity support'],
    metrics: [{ value: 'BLE', label: 'communication' }, { value: 'Hybrid', label: 'messaging approach' }],
    github: 'https://github.com/balajidnz/Dule', palette: { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' }, motif: 'tenants',
  },
];

export type Achievement = { id: string; title: string; org: string; detail: string; laurel: string; link?: string };
export const achievements: Achievement[] = [
  { id: 'repopulse-milestone', title: 'RepoPulse', org: 'Developer tooling', detail: 'An ongoing project focused on repository-aware workflows, workspace management, and interface refinement.', laurel: 'In development', link: 'https://github.com/arjunajithan04/repopulse' },
  { id: 'cozybot-milestone', title: 'CozyBot', org: 'Smart-home automation', detail: 'A project concept spanning device management, scheduling, user profiles, and connected-home controls.', laurel: 'Project work' },
  { id: 'data-viz-milestone', title: 'Data storytelling', org: 'Python • Streamlit', detail: 'Exploring structured entertainment data through interactive dashboards and visualisation.', laurel: 'Project work' },
];
export type Certification = { issuer: string; name: string; link: string };
export const certifications: Certification[] = [
  { issuer: 'Google Cloud', name: 'Cloud DevOps Engineering (Jan 2026)', link: 'https://www.coursera.org/account/accomplishments/professional-cert/UEFC298DLFB2' },
  { issuer: 'NPTEL', name: 'Psychology of Health, Stress and Well-Being (May 2025)', link: '' },
  { issuer: 'Infosys Springboard', name: 'Agile Scrum Certification (Mar 2024)', link: 'https://infyspringboard.onwingspan.com/public-assets/infosysheadstart/cert/lex_auth_013551574832529408472_shared/1-b142b07f-f62b-4c52-895c-ef9f44c08a96.pdf' },
];
export const extraCurricularActivities = [
  { title: 'Core Team Member, Google Developer Student Clubs', org: 'Christ University', period: 'Aug 2022 – Apr 2023' },
];

export type Skill = { name: string; mono: string; note?: string };
export type SkillCategory = { id: string; title: string; subtitle: string; skills: Skill[] };
export const skillCategories: SkillCategory[] = [
  { id: 'languages', title: 'Languages', subtitle: 'Building blocks for applications', skills: [{ name: 'Python', mono: 'Py' }, { name: 'Java', mono: 'Jv' }, { name: 'C', mono: 'C' }, { name: 'HTML', mono: 'Ht' }, { name: 'CSS', mono: 'Cs' }, { name: 'JavaScript', mono: 'Js' }] },
  { id: 'frontend', title: 'Frontend', subtitle: 'Interfaces and interaction', skills: [{ name: 'React', mono: 'Re' }, { name: 'TypeScript', mono: 'Ts' }, { name: 'HTML', mono: 'Ht' }, { name: 'CSS', mono: 'Cs' }, { name: 'Flutter', mono: 'Fl' }] },
  { id: 'backend', title: 'Backend', subtitle: 'Application logic and integration', skills: [{ name: 'PHP', mono: 'Ph' }, { name: 'Flask', mono: 'Fk' }, { name: 'REST APIs', mono: 'Ap' }, { name: 'Streamlit', mono: 'St' }] },
  { id: 'databases', title: 'Databases', subtitle: 'Persisting and querying data', skills: [{ name: 'MySQL', mono: 'My' }, { name: 'SQLite', mono: 'Sq' }] },
  { id: 'tools', title: 'Tools', subtitle: 'Build, debug, and ship', skills: [{ name: 'Git / GitHub', mono: 'Gt' }, { name: 'VS Code', mono: 'Vs' }, { name: 'Android Studio', mono: 'As' }, { name: 'Figma', mono: 'Fg' }] },
  { id: 'interests', title: 'Additional Skills', subtitle: 'Design and collaboration', skills: [{ name: 'Google Cloud Platform', mono: 'Gc' }, { name: 'Machine Learning Basics', mono: 'Ml' }, { name: 'Wireframing', mono: 'Wf' }, { name: 'User-Centered Design', mono: 'Ux' }, { name: 'Team Collaboration', mono: 'Tc' }, { name: 'Problem-Solving', mono: 'Ps' }, { name: 'Communication', mono: 'Co' }] },
];
export const skillEvidence: Record<string, string[]> = {
  Python: ['Netflix IMDb Explorer'], Streamlit: ['Netflix IMDb Explorer'], Pandas: ['Netflix IMDb Explorer'], SQLite: ['Netflix IMDb Explorer'],
  React: ['RepoPulse'], TypeScript: ['RepoPulse'], 'Git / GitHub': ['RepoPulse'], PHP: ['CozyBot'], MySQL: ['CozyBot'], HTML: ['CozyBot', 'Life At Christ'], CSS: ['CozyBot', 'Life At Christ'], JavaScript: ['CozyBot', 'Life At Christ'],
};
export type Episode = { code: string; title: string; description: string; tags: string[]; runtime: string; palette: Palette; image: string };
export type Season = { number: number; title: string; period: string; synopsis: string; episodes: Episode[] };
export const seasons: Season[] = [
  { number: 1, title: 'The Foundations', period: 'MCA • Pursuing', synopsis: 'Building a grounding in computer applications, programming, and practical software development.', episodes: [
    { code: 'S01 E01', title: 'The Student', description: 'Pursuing a Master of Computer Applications at Presidency College after completing a BCA at Christ University.', tags: ['MCA', 'BCA', 'Computer Science'], runtime: 'In progress', palette: violet, image: '/assets/journey-episodes/s01-the-student.webp' },
    { code: 'S01 E02', title: 'The Builder', description: 'Learning by building interfaces, database-backed applications, and small tools.', tags: ['Web', 'Python', 'Databases'], runtime: 'Ongoing', palette: amber, image: '/assets/journey-episodes/s01-the-builder.webp' },
  ] },
  { number: 2, title: 'Products in Progress', period: '2025–2026', synopsis: 'Turning ideas into projects across developer tooling, smart homes, and data exploration.', episodes: [
    { code: 'S02 E01', title: 'The Workspace', description: 'RepoPulse explores repository-first project review and workspace management.', tags: ['React', 'TypeScript', 'GitHub'], runtime: 'Ongoing', palette: ocean, image: '/assets/journey-episodes/s02-the-workspace.webp' },
    { code: 'S02 E02', title: 'The Connected Home', description: 'CozyBot explores smart-home controls, user profiles, and device scheduling.', tags: ['Automation', 'PHP', 'MySQL'], runtime: 'Project concept', palette: jade, image: '/assets/journey-episodes/s02-connected-home.webp' },
    { code: 'S02 E03', title: 'The Data Explorer', description: 'A Streamlit dashboard for exploring Netflix-related movie and series data with IMDb context.', tags: ['Python', 'Streamlit', 'Plotly'], runtime: 'Project work', palette: crimson, image: '/assets/journey-episodes/s02-data-explorer.webp' },
  ] },
  { number: 3, title: 'The Next Chapter', period: 'Now streaming', synopsis: 'A continuing arc of learning, experimenting, and polishing the details that make software useful.', episodes: [
    { code: 'S03 E01', title: 'Polish the Product', description: 'Improve reliability, responsiveness, accessibility, and the quality of the overall user experience.', tags: ['UI / UX', 'Testing', 'Iteration'], runtime: 'In progress', palette: violet, image: '/assets/journey-episodes/s03-polish-product.webp' },
    { code: 'S03 E02', title: 'Build What Matters', description: 'Keep exploring practical tools and products through hands-on development.', tags: ['Projects', 'Learning', 'Experimentation'], runtime: 'To be continued', palette: amber, image: '/assets/journey-episodes/s03-build-matters.webp' },
  ] },
];
export type TopPick = { label: string; title: string; detail: string; palette: Palette; image: string };
export const topPicks: TopPick[] = [
  { label: 'Current flagship', title: 'RepoPulse', detail: 'Repository-first developer workspace', palette: violet, image: '/assets/top-picks/01-repopulse.webp' },
  { label: 'Smart-home concept', title: 'CozyBot', detail: 'Device management and automation', palette: jade, image: '/assets/top-picks/02-cozybot.webp' },
  { label: 'Data project', title: 'Netflix IMDb Explorer', detail: 'Streamlit and interactive visualisation', palette: crimson, image: '/assets/top-picks/03-netflix-imdb.webp' },
  { label: 'Campus story', title: 'Life At Christ', detail: 'Student-viewpoint web concept', palette: amber, image: '/assets/top-picks/04-life-at-christ.webp' },
  { label: 'Core focus', title: 'Frontend craft', detail: 'Responsive layouts and interaction design', palette: ocean, image: '/assets/top-picks/05-frontend-craft.webp' },
  { label: 'Learning mode', title: 'Build by doing', detail: 'Projects as a way to learn systems end-to-end', palette: violet, image: '/assets/top-picks/06-build-by-doing.webp' },
  { label: 'Toolbox', title: 'Python', detail: 'Data apps, scripts, and prototypes', palette: amber, image: '/assets/top-picks/07-python.webp' },
  { label: 'Product mindset', title: 'Workflow clarity', detail: 'Useful interactions over decoration alone', palette: jade, image: '/assets/top-picks/08-workflow-clarity.webp' },
  { label: 'Design direction', title: 'Cinematic UI', detail: 'Motion, depth, and restrained dark palettes', palette: crimson, image: '/assets/top-picks/09-cinematic-ui.webp' },
  { label: 'Next up', title: 'Keep shipping', detail: 'Iterate, test, and improve', palette: ocean, image: '/assets/top-picks/10-keep-shipping.webp' },
];
export type IntroSlide = {
  kicker: string;
  title: string;
  lines: string[];
  chips?: string[];
  image: string;
  imageFit?: 'cover' | 'contain';
  position?: string;
  glow?: string;
  accent: string;
};
export const introSlides: IntroSlide[] = [
  {
    kicker: 'The opening', title: 'Arjun Ajithan',
    lines: ['MCA student at Presidency College, Bengaluru.', 'AI with Python Intern at Hope Foundation, developing RepoPulse.'],
    chips: ['MCA', 'AI with Python', 'Software Development'],
    image: '/assets/episode-covers/01_about_me.png', position: 'center 35%', glow: '72% 28%', accent: '#8e35e8',
  },
  {
    kicker: 'The foundation', title: 'Where it started',
    lines: ['A Bachelor of Computer Applications at Christ University, completed in 2025.', 'Now pursuing a Master of Computer Applications at Presidency College.'],
    chips: ['BCA · 2022–2025', 'MCA · Pursuing'],
    image: '/assets/episode-covers/02_my_journey.png', position: 'center 38%', glow: '68% 38%', accent: '#d99a42',
  },
  {
    kicker: 'The builder', title: 'Learning by building',
    lines: ['Turning concepts into working interfaces, useful tools, and data-driven experiences.', 'From web development to networking and software projects.'],
    chips: ['Web', 'Python', 'Product Thinking'],
    image: '/assets/project-art/ecommerce-category-tree-detail.webp', position: 'center', glow: '70% 30%', accent: '#cf354f',
  },
  {
    kicker: 'The flagship', title: 'RepoPulse',
    lines: ['A repository-first workspace built to make project review and development workflows feel more focused.', 'Currently developing the project during an AI with Python internship at Hope Foundation, Bengaluru.'],
    chips: ['Python', 'GitHub', 'Repository Analytics'],
    image: '/assets/project-art/repopulse-detail.webp', position: 'center', glow: '72% 28%', accent: '#8c78ff',
  },
  {
    kicker: 'Beyond the build', title: 'FC Barcelona. Football. Always.',
    lines: ['A place in the heart for Barça, and a love for the beautiful game beyond any one club.', 'Because some passions live outside the screen — in the atmosphere, the tactics, and every moment of the match.'],
    chips: ['FC Barcelona', 'The beautiful game', 'More than a game'],
    image: '/assets/project-art/cozybot-detail.webp', position: 'center', glow: '75% 30%', accent: '#7a1535',
  },
  {
    kicker: 'The toolkit', title: 'Built on curiosity',
    lines: ['Python, Java, C, HTML, CSS, and JavaScript form part of the technical foundation.', 'Web interfaces, databases, cloud fundamentals, and machine-learning concepts keep the learning moving.'],
    chips: ['Programming', 'Frontend', 'Databases', 'ML Fundamentals'],
    image: '/assets/episode-covers/05_my_skills.png', position: 'center 38%', glow: '74% 30%', accent: '#18c9b8',
  },
  {
    kicker: 'The next episode', title: 'Still learning. Still building.',
    lines: ['Currently focused on developing RepoPulse and growing through practical software work.', 'The next chapter is still being written.'],
    chips: ['Hope Foundation · Bengaluru', 'RepoPulse', 'What comes next'],
    image: '/assets/episode-covers/07_the_full_story.png', position: 'center 40%', glow: '70% 35%', accent: '#9b4bff',
  },
];
export type ProfileId = 'arjun' | 'recruiter' | 'developer' | 'creative';
export type SectionId = 'about' | 'journey' | 'originals' | 'picks' | 'skills' | 'moments' | 'story';
export const viewerProfiles: { id: ProfileId; name: string; blurb: string; color: string; order: SectionId[] }[] = [
  { id: 'arjun', name: 'Arjun', blurb: 'The full series, in order', color: '#9a8cff', order: ['about', 'journey', 'originals', 'picks', 'skills', 'moments', 'story'] },
  { id: 'recruiter', name: 'Recruiter', blurb: 'Projects, skills & background first', color: '#4cc9ff', order: ['story', 'moments', 'skills', 'originals', 'about', 'journey', 'picks'] },
  { id: 'developer', name: 'Developer', blurb: 'Projects and stack first', color: '#9a8cff', order: ['originals', 'skills', 'journey', 'moments', 'about', 'picks', 'story'] },
  { id: 'creative', name: 'Creative', blurb: 'The story arc and visual work first', color: '#ffb547', order: ['journey', 'picks', 'originals', 'moments', 'about', 'skills', 'story'] },
];
export const sectionMeta: Record<SectionId, { nav: string; card: string; meta: string; palette: Palette }> = {
  about: { nav: 'About', card: 'About Me', meta: 'The Pilot • Education & interests', palette: violet },
  journey: { nav: 'Journey', card: 'My Journey', meta: `${seasons.length} Seasons • ${seasons.reduce((n, s) => n + s.episodes.length, 0)} Episodes`, palette: amber },
  originals: { nav: 'Originals', card: 'My Projects', meta: `${projects.length} Originals • Projects in progress`, palette: crimson },
  picks: { nav: 'Top Picks', card: 'Top Picks', meta: 'Selected projects and interests', palette: jade },
  skills: { nav: 'Skills', card: 'My Skills', meta: `${skillCategories.length} Categories`, palette: ocean },
  moments: { nav: 'Moments', card: 'Milestones', meta: `${achievements.length} Project milestones`, palette: crimson },
  story: { nav: 'Profile', card: 'The Full Story', meta: 'Background • Skills • Projects', palette: violet },
};
