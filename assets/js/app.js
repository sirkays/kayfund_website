/* ==========================================================================
   Kayfund International School - Shared Application Logic (Demo / LocalStorage)
   ========================================================================== */

const DB_KEY = 'KAYFUND_SYSTEM_DB';
const SESSION_KEY = 'KAYFUND_SESSION';
const ADMIN_AUTH_KEY = 'KAYFUND-ADMIN';

const DEFAULT_DB = {
    students: [
        {
            name: 'Amara Okafor',
            email: 'student@kayfund.edu.ng',
            classLevel: 'SS 2',
            phone: '2348032457019',
            pass: 'student123',
            grades: [
                { subject: 'Mathematics', score: 88 },
                { subject: 'English Language', score: 84 },
                { subject: 'Physics', score: 79 },
                { subject: 'Computer Science', score: 92 }
            ],
            comment: 'Excellent analytical skills and consistent class participation.'
        },
        {
            name: 'David Adeyemi',
            email: 'david@kayfund.edu.ng',
            classLevel: 'JSS 3',
            phone: '2348012345678',
            pass: 'student123',
            grades: [
                { subject: 'Mathematics', score: 75 },
                { subject: 'English Language', score: 81 },
                { subject: 'Basic Science', score: 86 }
            ],
            comment: 'Very diligent student with strong leadership potential.'
        }
    ],
    teachers: [
        {
            name: 'Head Teacher / Admin',
            email: 'admin@kayfund.edu.ng',
            pass: 'admin123'
        }
    ],
    messages: [
        {
            sender: 'School Administration',
            text: 'Welcome to the new term at Kayfund International School! CBT assessments and e-learning video modules are now live on the student portal.',
            date: '2026-11-18'
        },
        {
            sender: 'Academic Office',
            text: 'Parents can now receive instant terminal report cards directly via WhatsApp from the Result Checker and Teacher Portal.',
            date: '2026-11-19'
        }
    ],
    videos: [
        {
            title: 'Mathematics: Algebraic Expressions & Equations',
            url: 'https://www.youtube.com/embed/LwCRRUa8yTU'
        },
        {
            title: 'English Language: Parts of Speech Mastery',
            url: 'https://www.youtube.com/embed/v9reS1s70xU'
        },
        {
            title: 'Science: Introduction to Cell Biology',
            url: 'https://www.youtube.com/embed/URUJD5NEXC8'
        }
    ],
    scholarships: []
};

function loadDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
        localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
        return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
    try {
        const parsed = JSON.parse(raw);
        if (!parsed.teachers) parsed.teachers = DEFAULT_DB.teachers;
        if (!parsed.scholarships) parsed.scholarships = [];
        return parsed;
    } catch {
        localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
        return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/* ==========================================================================
   Toast Notifications & Navigation
   ========================================================================== */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3600);
}

function initNavigation() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    const session = getSession();
    const portalCta = document.getElementById('nav-portal-cta');
    if (portalCta && session) {
        portalCta.textContent = session.role === 'teacher' ? 'Admin Portal' : 'My Portal';
        portalCta.href = 'portal.html';
    }
}

/* ==========================================================================
   Authentication (Login & Register)
   ========================================================================== */
function registerStudentForm(event) {
    event.preventDefault();
    const db = loadDB();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const classLevel = document.getElementById('reg-class') ? document.getElementById('reg-class').value : 'JSS 1';
    const phone = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const roleSelect = document.getElementById('reg-role');
    const role = roleSelect ? roleSelect.value : 'student';

    if (!name || !email || !pass) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (role === 'teacher') {
        const keyInput = document.getElementById('reg-admin-key');
        const keyVal = keyInput ? keyInput.value.trim() : '';
        if (keyVal !== ADMIN_AUTH_KEY) {
            showToast(`Invalid Teacher Key. Use "${ADMIN_AUTH_KEY}" for demo.`, 'error');
            return;
        }
        if (db.teachers.some(t => t.email === email)) {
            showToast('A teacher account with this email already exists.', 'error');
            return;
        }
        const newTeacher = { name, email, pass };
        db.teachers.push(newTeacher);
        saveDB(db);
        setSession({ role: 'teacher', email: newTeacher.email, name: newTeacher.name });
        showToast('Teacher account created! Redirecting to portal...', 'success');
        setTimeout(() => { window.location.href = 'portal.html'; }, 800);
        return;
    }

    if (db.students.some(s => s.email === email)) {
        showToast('Student email is already registered!', 'error');
        return;
    }

    const newStudent = {
        name,
        email,
        classLevel,
        phone,
        pass,
        grades: [],
        comment: 'Newly enrolled student.'
    };
    db.students.push(newStudent);
    saveDB(db);
    setSession({ role: 'student', email: newStudent.email, name: newStudent.name });
    showToast('Registration successful! Welcome to Kayfund.', 'success');
    setTimeout(() => { window.location.href = 'portal.html'; }, 800);
}

function loginForm(event) {
    event.preventDefault();
    const db = loadDB();
    const email = document.getElementById('log-email').value.trim().toLowerCase();
    const pass = document.getElementById('log-pass').value;

    const teacher = db.teachers.find(t => t.email === email && t.pass === pass);
    if (teacher) {
        setSession({ role: 'teacher', email: teacher.email, name: teacher.name });
        showToast('Signed in as Teacher/Admin!', 'success');
        setTimeout(() => { window.location.href = 'portal.html'; }, 600);
        return;
    }

    const student = db.students.find(s => s.email === email && s.pass === pass);
    if (student) {
        setSession({ role: 'student', email: student.email, name: student.name });
        showToast(`Welcome back, ${student.name}!`, 'success');
        setTimeout(() => { window.location.href = 'portal.html'; }, 600);
        return;
    }

    showToast('Invalid email or password. Try the demo credentials below.', 'error');
}

function fillDemoCredentials(type) {
    const emailEl = document.getElementById('log-email');
    const passEl = document.getElementById('log-pass');
    if (!emailEl || !passEl) return;

    if (type === 'teacher') {
        emailEl.value = 'admin@kayfund.edu.ng';
        passEl.value = 'admin123';
    } else {
        emailEl.value = 'student@kayfund.edu.ng';
        passEl.value = 'student123';
    }
    showToast('Demo credentials filled! Click Sign In.', 'info');
}

function logoutUser() {
    clearSession();
    window.location.href = 'login.html';
}

/* ==========================================================================
   Public Forms (Contact & Scholarship & Result Checker)
   ========================================================================== */
function sendPublicMessage(event) {
    event.preventDefault();
    const sender = document.getElementById('msg-sender').value.trim();
    const text = document.getElementById('msg-text').value.trim();
    if (!sender || !text) {
        showToast('Please enter your name and message.', 'error');
        return;
    }
    const db = loadDB();
    db.messages.unshift({
        sender,
        text,
        date: new Date().toLocaleDateString()
    });
    saveDB(db);
    event.target.reset();
    showToast('Message sent to School Administration!', 'success');
}

function submitScholarship(event) {
    event.preventDefault();
    const name = document.getElementById('sch-name').value.trim();
    const email = document.getElementById('sch-email').value.trim();
    const level = document.getElementById('sch-level').value;
    const reason = document.getElementById('sch-reason').value.trim();

    const db = loadDB();
    db.scholarships.unshift({
        name,
        email,
        level,
        reason,
        date: new Date().toLocaleDateString()
    });
    saveDB(db);
    event.target.reset();
    showToast('Scholarship application submitted successfully!', 'success');
}

function buildReportCardHTML(student) {
    const grades = student.grades || [];
    const total = grades.reduce((acc, g) => acc + Number(g.score), 0);
    const avg = grades.length > 0 ? (total / grades.length).toFixed(1) : '0.0';

    const rows = grades.length > 0
        ? grades.map(g => {
            const sc = Number(g.score);
            const grade = sc >= 70 ? 'A' : sc >= 60 ? 'B' : sc >= 50 ? 'C' : sc >= 45 ? 'D' : 'F';
            const remark = sc >= 70 ? 'Distinction' : sc >= 60 ? 'Very Good' : sc >= 50 ? 'Credit' : sc >= 45 ? 'Pass' : 'Needs Effort';
            return `
                <tr>
                    <td style="text-align:left; font-weight:600;">${g.subject}</td>
                    <td>${sc}</td>
                    <td><strong>${grade}</strong></td>
                    <td>${remark}</td>
                </tr>
            `;
        }).join('')
        : '<tr><td colspan="4">No academic subject records uploaded yet.</td></tr>';

    return `
        <div class="report-sheet">
            <div class="report-header">
                <img src="assets/images/logo.png" alt="Kayfund International School Logo">
                <div>
                    <h2 style="margin:0; font-size:1.45rem; color:var(--navy);">KAYFUND INTERNATIONAL SCHOOL</h2>
                    <p style="margin:2px 0; font-size:0.82rem; color:#475569;">Impacting Lives, Shaping the Future | info@kayfund.edu.ng</p>
                    <h4 style="margin:8px 0 0; text-decoration:underline; color:var(--royal);">STUDENT TERMINAL ACADEMIC REPORT</h4>
                </div>
            </div>
            <div class="report-grid">
                <div><strong>Student Name:</strong> ${student.name}</div>
                <div><strong>Class Level:</strong> ${student.classLevel || 'N/A'}</div>
                <div><strong>Email:</strong> ${student.email}</div>
                <div><strong>Parent Phone:</strong> ${student.phone || 'N/A'}</div>
                <div><strong>Total Subjects:</strong> ${grades.length}</div>
                <div><strong>Term Average:</strong> <span style="color:var(--royal); font-weight:700;">${avg}%</span></div>
            </div>
            <div class="table-wrap">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th style="text-align:left;">Subject</th>
                            <th>Score (100%)</th>
                            <th>Grade</th>
                            <th>Remark</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div style="margin-top:20px; border-top:1px dashed #64748b; padding-top:12px;">
                <strong>Principal / Class Teacher Remarks:</strong>
                <p style="margin:6px 0 0; font-style:italic; color:#334155;">${student.comment || 'Satisfactory overall performance.'}</p>
            </div>
        </div>
    `;
}

function quickDeployWhatsApp(email) {
    const db = loadDB();
    const student = db.students.find(s => s.email === email);
    if (!student) {
        showToast('Student record not found.', 'error');
        return;
    }

    let msg = `*KAYFUND INTERNATIONAL SCHOOL - TERMINAL REPORT*\n`;
    msg += `Student: ${student.name} (${student.classLevel || 'Student'})\n\n`;
    msg += `*SCORES:*\n`;

    if (student.grades && student.grades.length > 0) {
        student.grades.forEach(g => {
            msg += `- ${g.subject}: ${g.score}%\n`;
        });
    } else {
        msg += `No grades recorded yet.\n`;
    }

    msg += `\n*Remarks:* ${student.comment || 'Good performance.'}`;

    const phone = student.phone ? student.phone.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
}

function directCheckResult(event) {
    event.preventDefault();
    const db = loadDB();
    const email = document.getElementById('chk-email').value.trim().toLowerCase();
    const pass = document.getElementById('chk-pass').value;
    const view = document.getElementById('quick-result-view');

    const student = db.students.find(s => s.email === email && s.pass === pass);
    if (!student) {
        showToast('Invalid student email or password!', 'error');
        view.innerHTML = '';
        return;
    }

    view.innerHTML = `
        <div style="margin-top:24px;">
            ${buildReportCardHTML(student)}
            <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:16px;">
                <button class="btn btn-whatsapp" onclick="quickDeployWhatsApp('${student.email}')">📲 Send to Parent WhatsApp</button>
                <button class="btn btn-outline-dark" onclick="window.print()">🖨️ Print Report</button>
            </div>
        </div>
    `;
    showToast('Result loaded successfully!', 'success');
}

/* ==========================================================================
   Portal Dashboard Logic (portal.html)
   ========================================================================== */
const CBT_BANKS = {
    math: {
        title: 'General Mathematics Assessment',
        subjectName: 'CBT Mathematics',
        questions: [
            { q: 'Solve for x: 2x + 6 = 14', options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'], answer: 1 },
            { q: 'What is 15% of 200?', options: ['20', '25', '30', '35'], answer: 2 },
            { q: 'If a triangle has angles 60° and 70°, what is the third angle?', options: ['40°', '50°', '60°', '90°'], answer: 1 },
            { q: 'Simplify: 3(a + 4) - 2a', options: ['a + 12', '5a + 12', 'a + 4', '6a + 4'], answer: 0 }
        ]
    },
    english: {
        title: 'English & General Studies',
        subjectName: 'CBT English & General Studies',
        questions: [
            { q: 'Choose the correct synonym for "Diligent":', options: ['Lazy', 'Hardworking', 'Careless', 'Timid'], answer: 1 },
            { q: 'What is the capital city of Nigeria?', options: ['Lagos', 'Kano', 'Abuja', 'Ibadan'], answer: 2 },
            { q: 'Identify the verb in: "The students studied quietly."', options: ['students', 'studied', 'quietly', 'The'], answer: 1 }
        ]
    },
    science: {
        title: 'Basic Science & ICT',
        subjectName: 'CBT Basic Science & ICT',
        questions: [
            { q: 'Which element is essential for human respiration?', options: ['Carbon', 'Oxygen', 'Nitrogen', 'Hydrogen'], answer: 1 },
            { q: 'What does CPU stand for in computing?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Power Unit'], answer: 0 },
            { q: 'Water boils at what temperature under standard atmospheric pressure?', options: ['50°C', '80°C', '100°C', '120°C'], answer: 2 }
        ]
    }
};

let activeCBT = null;
let currentQIndex = 0;
let userAnswers = [];
let cbtScore = 0;
let cbtTimerId = null;
let cbtSecondsLeft = 600;

function initPortal() {
    const session = getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const db = loadDB();
    const isTeacher = session.role === 'teacher';
    const userTitle = document.getElementById('portal-user-name');
    const userRoleBadge = document.getElementById('portal-user-role');
    const welcomeTitle = document.getElementById('user-title');

    if (userTitle) userTitle.textContent = session.name;
    if (userRoleBadge) userRoleBadge.textContent = isTeacher ? 'Teacher / Admin' : 'Student Portal';
    if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${session.name}`;

    const teacherNav = document.getElementById('nav-teacher');
    const videoAdmin = document.getElementById('video-admin-controls');
    if (isTeacher) {
        if (teacherNav) teacherNav.classList.remove('hidden');
        if (videoAdmin) videoAdmin.classList.remove('hidden');
        renderStudentDirectory();
        renderScholarshipList();
    } else {
        if (teacherNav) teacherNav.classList.add('hidden');
        if (videoAdmin) videoAdmin.classList.add('hidden');
    }

    updateDashboardStats(db, session);
    renderMessages();
    renderVideos();
    if (!isTeacher) {
        const student = db.students.find(s => s.email === session.email);
        if (student) renderPortalReport(student);
    }

    const sidebarToggle = document.getElementById('portal-sidebar-toggle');
    const sidebar = document.getElementById('portal-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

function updateDashboardStats(db, session) {
    const statVideos = document.getElementById('stat-videos');
    const statMessages = document.getElementById('stat-messages');
    const statSubjects = document.getElementById('stat-subjects');

    if (statVideos) statVideos.textContent = db.videos.length;
    if (statMessages) statMessages.textContent = db.messages.length;

    if (statSubjects) {
        if (session.role === 'teacher') {
            statSubjects.textContent = db.students.length;
            const label = document.getElementById('stat-subjects-label');
            if (label) label.textContent = 'Registered Students';
        } else {
            const student = db.students.find(s => s.email === session.email);
            statSubjects.textContent = student && student.grades ? student.grades.length : 0;
        }
    }
}

function showSec(secId, el) {
    document.querySelectorAll('.portal-content > section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById('sec-' + secId);
    if (target) target.classList.remove('hidden');

    if (el) {
        document.querySelectorAll('.portal-nav-link').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }

    const sidebar = document.getElementById('portal-sidebar');
    if (sidebar) sidebar.classList.remove('open');

    if (secId === 'messages') renderMessages();
    if (secId === 'videos') renderVideos();
    if (secId === 'records') {
        const session = getSession();
        const db = loadDB();
        const student = db.students.find(s => s.email === session.email) || db.students[0];
        if (student) renderPortalReport(student);
    }
    if (secId === 'teacher-tool') {
        renderStudentDirectory();
        renderScholarshipList();
    }
}

function startCBT() {
    const bankKey = document.getElementById('cbt-subject-select').value;
    activeCBT = CBT_BANKS[bankKey];
    currentQIndex = 0;
    userAnswers = [];
    cbtSecondsLeft = 600;

    document.getElementById('cbt-start-card').classList.add('hidden');
    document.getElementById('cbt-result-card').classList.add('hidden');
    document.getElementById('cbt-exam-card').classList.remove('hidden');

    clearInterval(cbtTimerId);
    updateCBTTimerUI();
    cbtTimerId = setInterval(() => {
        cbtSecondsLeft--;
        updateCBTTimerUI();
        if (cbtSecondsLeft <= 0) {
            clearInterval(cbtTimerId);
            finishCBT();
        }
    }, 1000);

    loadCBTQuestion();
}

function updateCBTTimerUI() {
    const mins = String(Math.floor(cbtSecondsLeft / 60)).padStart(2, '0');
    const secs = String(cbtSecondsLeft % 60).padStart(2, '0');
    const el = document.getElementById('cbt-timer');
    if (el) el.textContent = `Time: ${mins}:${secs}`;
}

function loadCBTQuestion() {
    const q = activeCBT.questions[currentQIndex];
    document.getElementById('cbt-q-number').textContent = `${activeCBT.title} — Question ${currentQIndex + 1} of ${activeCBT.questions.length}`;
    document.getElementById('cbt-q-text').textContent = q.q;

    const opts = document.getElementById('cbt-options-container');
    opts.innerHTML = q.options.map((opt, idx) => `
        <label class="cbt-option">
            <input type="radio" name="cbt_opt" value="${idx}"> <span>${opt}</span>
        </label>
    `).join('');

    document.getElementById('cbt-next-btn').textContent =
        currentQIndex === activeCBT.questions.length - 1 ? 'Submit Examination' : 'Next Question';
}

function nextCBTQuestion() {
    const selected = document.querySelector('input[name="cbt_opt"]:checked');
    if (!selected) {
        showToast('Please select an answer before proceeding.', 'error');
        return;
    }
    userAnswers.push(parseInt(selected.value, 10));

    if (currentQIndex < activeCBT.questions.length - 1) {
        currentQIndex++;
        loadCBTQuestion();
    } else {
        finishCBT();
    }
}

function finishCBT() {
    clearInterval(cbtTimerId);
    let correct = 0;
    activeCBT.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) correct++;
    });

    cbtScore = Math.round((correct / activeCBT.questions.length) * 100);
    document.getElementById('cbt-exam-card').classList.add('hidden');
    document.getElementById('cbt-result-card').classList.remove('hidden');
    document.getElementById('cbt-score-display').textContent = `${cbtScore}%`;
    document.getElementById('cbt-feedback').textContent =
        cbtScore >= 50
            ? `Congratulations! You scored ${correct} out of ${activeCBT.questions.length} correctly.`
            : `You scored ${correct} out of ${activeCBT.questions.length}. Keep studying and try again!`;
}

function resetCBT() {
    clearInterval(cbtTimerId);
    document.getElementById('cbt-result-card').classList.add('hidden');
    document.getElementById('cbt-start-card').classList.remove('hidden');
}

function saveCBTToReport() {
    const session = getSession();
    if (!session || session.role === 'teacher') {
        showToast('Only signed-in students can save CBT scores to a report card.', 'error');
        return;
    }
    const db = loadDB();
    const target = db.students.find(s => s.email === session.email);
    if (target) {
        target.grades.push({ subject: activeCBT.subjectName, score: cbtScore });
        saveDB(db);
        showToast('CBT Score saved to your report card!', 'success');
        updateDashboardStats(db, session);
        showSec('records');
    }
}

function addVideoLesson() {
    const title = document.getElementById('v-title').value.trim();
    let url = document.getElementById('v-url').value.trim();
    if (!title || !url) {
        showToast('Provide both a video title and YouTube URL/ID.', 'error');
        return;
    }
    if (!url.includes('embed') && url.includes('v=')) {
        const id = url.split('v=')[1].split('&')[0];
        url = `https://www.youtube.com/embed/${id}`;
    } else if (!url.startsWith('http')) {
        url = `https://www.youtube.com/embed/${url}`;
    }

    const db = loadDB();
    db.videos.unshift({ title, url });
    saveDB(db);
    renderVideos();
    document.getElementById('v-title').value = '';
    document.getElementById('v-url').value = '';
    showToast('Video lesson added!', 'success');
}

function renderVideos() {
    const grid = document.getElementById('video-grid');
    if (!grid) return;
    const db = loadDB();
    grid.innerHTML = db.videos.map(v => `
        <div class="card">
            <h3 style="margin-bottom:12px;">${v.title}</h3>
            <div class="video-container">
                <iframe src="${v.url}" allowfullscreen title="${v.title}"></iframe>
            </div>
        </div>
    `).join('');
}

function sendDashMessage() {
    const input = document.getElementById('dash-msg-input');
    const text = input.value.trim();
    if (!text) {
        showToast('Message cannot be empty.', 'error');
        return;
    }
    const session = getSession();
    const db = loadDB();
    db.messages.unshift({
        sender: session ? session.name : 'Portal User',
        text,
        date: new Date().toLocaleDateString()
    });
    saveDB(db);
    input.value = '';
    renderMessages();
    updateDashboardStats(db, session);
    showToast('Message sent to School Admin.', 'success');
}

function renderMessages() {
    const container = document.getElementById('message-container');
    if (!container) return;
    const db = loadDB();
    if (db.messages.length === 0) {
        container.innerHTML = '<p>No recent messages found.</p>';
        return;
    }
    container.innerHTML = db.messages.map(m => `
        <div class="msg-box">
            <strong>${m.sender}</strong>
            <p style="margin:6px 0 0;">${m.text}</p>
            <div class="msg-meta"><span>Date: ${m.date}</span></div>
        </div>
    `).join('');
}

function renderStudentDirectory() {
    const body = document.getElementById('student-table-body');
    const select = document.getElementById('student-selector');
    if (!body || !select) return;
    const db = loadDB();

    body.innerHTML = db.students.map(s => `
        <tr>
            <td><strong>${s.name}</strong><br><small style="color:var(--text-muted);">${s.classLevel || 'Student'}</small></td>
            <td>${s.email}</td>
            <td>${s.phone || 'N/A'}</td>
            <td>${s.grades ? s.grades.length : 0} Subjects</td>
            <td>
                <button class="btn btn-whatsapp" style="padding:6px 12px; font-size:0.8rem;" onclick="quickDeployWhatsApp('${s.email}')">📲 Deploy</button>
            </td>
        </tr>
    `).join('');

    select.innerHTML = db.students.map((s, idx) =>
        `<option value="${idx}">${s.name} (${s.email})</option>`
    ).join('');
}

function renderScholarshipList() {
    const container = document.getElementById('scholarship-admin-list');
    if (!container) return;
    const db = loadDB();
    if (!db.scholarships || db.scholarships.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);">No scholarship applications submitted yet.</p>';
        return;
    }
    container.innerHTML = db.scholarships.map(s => `
        <div class="msg-box">
            <strong>${s.name}</strong> (${s.level}) — <small>${s.email}</small>
            <p style="margin:6px 0 0;">${s.reason}</p>
            <div class="msg-meta"><span>Applied: ${s.date}</span></div>
        </div>
    `).join('');
}

function saveGradeAndComment() {
    const idx = document.getElementById('student-selector').value;
    const sub = document.getElementById('sub-name').value.trim();
    const score = document.getElementById('sub-score').value;
    const comment = document.getElementById('teacher-comment').value.trim();

    if (idx === '' || !sub || score === '') {
        showToast('Select a student and enter subject & score.', 'error');
        return;
    }

    const db = loadDB();
    const student = db.students[idx];
    student.grades.push({ subject: sub, score: Math.min(100, Math.max(0, parseInt(score, 10))) });
    if (comment) student.comment = comment;

    saveDB(db);
    renderStudentDirectory();
    document.getElementById('sub-name').value = '';
    document.getElementById('sub-score').value = '';
    showToast(`Updated academic record for ${student.name}.`, 'success');
}

function deploySelectedStudentReport() {
    const idx = document.getElementById('student-selector').value;
    const db = loadDB();
    if (idx === '' || !db.students[idx]) {
        showToast('Select a student first.', 'error');
        return;
    }
    quickDeployWhatsApp(db.students[idx].email);
}

function renderPortalReport(student) {
    const container = document.getElementById('report-card-container');
    if (!container) return;
    container.innerHTML = buildReportCardHTML(student);
}

function deployCurrentStudentReport() {
    const session = getSession();
    const db = loadDB();
    const student = db.students.find(s => s.email === session.email) || db.students[0];
    if (student) quickDeployWhatsApp(student.email);
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    if (document.getElementById('portal-shell')) {
        initPortal();
    }
});
