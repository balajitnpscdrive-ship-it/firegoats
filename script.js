/** 
 * HOUSE SYSTEM CORE LOGIC
 */
// --- STATE MANAGEMENT ---
const INITIAL_STATE = {
    houses: [
        { id: 1, name: 'Phoenix', color: '#ef4444', logo: null, points: 1540, annualPoints: 12450 },
        { id: 2, name: 'Dragon', color: '#3b82f6', logo: null, points: 1320, annualPoints: 11200 },
        { id: 3, name: 'Griffon', color: '#f59e0b', logo: null, points: 1210, annualPoints: 10500 },
        { id: 4, name: 'Unicorn', color: '#10b981', logo: null, points: 1420, annualPoints: 11800 }
    ],
    students: [
        { name: 'John Doe', department: 'Computer Science', house: 'Phoenix' },
        { name: 'Alice Smith', department: 'Engineering', house: 'Dragon' },
        { name: 'Bob Wilson', department: 'Commerce', house: 'Griffon' },
        { name: 'Charlie Brown', department: 'Arts', house: 'Unicorn' },
        { name: 'David Lee', department: 'Computer Science', house: 'Phoenix' },
        { name: 'Eva Garcia', department: 'Engineering', house: 'Dragon' }
    ],
    departments: ['Computer Science', 'Engineering', 'Commerce', 'Arts', 'Science'],
    categories: [
        { name: 'YouTube Contribution', icon: 'youtube' },
        { name: 'Assembly Contribution', icon: 'users' },
        { name: 'Academic Achievement', icon: 'book-open' },
        { name: 'Discipline', icon: 'shield-check' },
        { name: 'Proper Dress Code', icon: 'shirt' },
        { name: 'Attendance', icon: 'calendar-check' },
        { name: 'Late Coming', icon: 'clock' }
    ],
    logs: [],
    settings: {
        collegeName: 'Global Tech Institute',
        subTopic: 'House Points Championship',
        bgImage: null,
        founderPhoto: null
    }
};
let state = JSON.parse(localStorage.getItem('houseSystemState')) || INITIAL_STATE;
const saveState = async () => {
    localStorage.setItem('houseSystemState', JSON.stringify(state));
    
    // Sync to Firebase if available
    if (window.db) {
        try {
            const { doc, setDoc } = window.fbUtils;
            await setDoc(doc(window.db, "system", "state"), state);
            console.log("Synced to Firebase");
        } catch (e) {
            console.error("Firebase sync failed", e);
        }
    }
};
// --- FIREBASE SYNC ---
const initFirebaseSync = () => {
    if (!window.db) {
        console.warn("Firebase not loaded yet, using local state.");
        setTimeout(initFirebaseSync, 1000);
        return;
    }
    const { doc, onSnapshot } = window.fbUtils;
    onSnapshot(doc(window.db, "system", "state"), (docSnap) => {
        if (docSnap.exists()) {
            state = docSnap.data();
            console.log("State updated from Firebase", state);
            router.initView(router.current); // Refresh current view
        }
    });
};
// --- ROUTER ---
const router = {
    current: 'teacher',
    isAnnual: false,
    navigate(view) {
        this.current = view;
        const container = document.getElementById('view-container');
        const template = document.getElementById(`tmpl-${view}`);
        
        container.innerHTML = '';
        container.appendChild(template.content.cloneNode(true));
        
        // Hide nav on TV
        document.getElementById('main-nav').style.display = view === 'tv' ? 'none' : 'flex';
        
        lucide.createIcons();
        this.initView(view);
    },
    toggleAnnual() {
        this.isAnnual = !this.isAnnual;
        tvLogic.refresh();
        const btnW = document.getElementById('btn-weekly');
        const btnA = document.getElementById('btn-annual');
        if (btnW && btnA) {
            btnW.classList.toggle('text-emerald-400', !this.isAnnual);
            btnW.classList.toggle('border-emerald-500/30', !this.isAnnual);
            btnW.classList.toggle('text-slate-500', this.isAnnual);
            
            btnA.classList.toggle('text-emerald-400', this.isAnnual);
            btnA.classList.toggle('border-emerald-500/30', this.isAnnual);
            btnA.classList.toggle('text-slate-500', !this.isAnnual);
        }
    },
    initView(view) {
        if (view === 'teacher') teacherLogic.init();
        if (view === 'admin') adminLogic.init();
        if (view === 'tv') tvLogic.init();
    }
};
// --- TEACHER LOGIC ---
const teacherLogic = {
    selectedStudent: null,
    selectedCategory: null,
    pointsAwardedThisSession: 0,
    
    init() {
        const studentSearch = document.getElementById('student-search');
        studentSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        this.renderCategories();
        this.renderLogs();
        document.getElementById('teacher-points-counter').textContent = this.pointsAwardedThisSession;
    },
    
    renderCategories() {
        const container = document.getElementById('category-chips');
        container.innerHTML = state.categories.map(cat => `
            <div class="chip chip-inactive" onclick="teacherLogic.selectCategory('${cat.name}', this)">
                ${cat.name}
            </div>
        `).join('');
    },
    
    selectCategory(name, el) {
        document.querySelectorAll('.chip').forEach(c => c.classList.replace('chip-active', 'chip-inactive'));
        el.classList.replace('chip-inactive', 'chip-active');
        this.selectedCategory = name;
    },
    
    handleSearch(val) {
        const suggestions = document.getElementById('search-suggestions');
        if (val.length < 3) {
            suggestions.classList.add('hidden');
            return;
        }
        
        const matches = state.students.filter(s => s.name.toLowerCase().includes(val.toLowerCase()));
        if (matches.length > 0) {
            suggestions.innerHTML = matches.map(s => `
                <div class="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-700 last:border-0" onclick="teacherLogic.selectStudent('${s.name}')">
                    <div class="font-bold">${s.name}</div>
                    <div class="text-xs text-slate-400">${s.department} • ${s.house}</div>
                </div>
            `).join('');
            suggestions.classList.remove('hidden');
        } else {
            suggestions.classList.add('hidden');
        }
    },
    
    selectStudent(name) {
        const student = state.students.find(s => s.name === name);
        this.selectedStudent = student;
        document.getElementById('student-search').value = student.name;
        document.getElementById('manual-house').value = student.house;
        document.getElementById('manual-dept').value = student.department;
        document.getElementById('search-suggestions').classList.add('hidden');
    },
    
    renderLogs() {
        const container = document.getElementById('session-logs');
        container.innerHTML = state.logs.slice(-5).reverse().map(log => `
            <tr class="border-b border-slate-800/50">
                <td class="px-6 py-4 font-semibold">${log.student}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs px-2" style="background: ${this.getHouseColor(log.house)}20; color: ${this.getHouseColor(log.house)}">
                        ${log.house}
                    </span>
                </td>
                <td class="px-6 py-4 text-slate-400 text-sm">${log.category}</td>
                <td class="px-6 py-4 text-right font-bold ${log.points > 0 ? 'text-emerald-400' : 'text-rose-400'}">
                    ${log.points > 0 ? '+' : ''}${log.points}
                </td>
            </tr>
        `).join('');
        document.getElementById('log-count').textContent = `${state.logs.length} entries`;
    },
    
    getHouseColor(name) {
        return state.houses.find(h => h.name === name)?.color || '#6366f1';
    }
};
// --- POINTS LOGIC ---
const pointsLogic = {
    award(points, fromQr = false) {
        const student = teacherLogic.selectedStudent;
        const category = teacherLogic.selectedCategory || (fromQr ? 'QR Scan' : 'Manual Entry');
        
        if (!student) {
            alert('Please select a student first');
            return;
        }
        // Update state
        const house = state.houses.find(h => h.name === student.house);
        if (house) {
            house.points += points;
            house.annualPoints += points;
        }
        const logEntry = {
            student: student.name,
            house: student.house,
            department: student.department,
            category: category,
            points: points,
            timestamp: new Date().toISOString()
        };
        
        state.logs.push(logEntry);
        saveState();
        // UI Updates
        teacherLogic.pointsAwardedThisSession += points;
        document.getElementById('teacher-points-counter').textContent = teacherLogic.pointsAwardedThisSession;
        teacherLogic.renderLogs();
        // Animations
        const prestigious = [
            "Outstanding Achievement", "Exemplary Performance", "Prestigious Contribution", 
            "House Pride", "Academic Excellence", "Leadership Merit", "Stellar Participation"
        ];
        const randomWording = prestigious[Math.floor(Math.random() * prestigious.length)];
        if (points > 0) {
            animations.burstConfetti();
            animations.showPopup(student.name, student.house, points, randomWording);
        } else {
            animations.showSadFace();
            animations.showPopup(student.name, student.house, points, "Improvement Needed");
        }
        
        // Broadcast to TV if needed (in a real app, this would use WebSockets or Firebase)
        if (window.tvLogic) tvLogic.refresh();
    }
};
// --- ADMIN LOGIC ---
const adminLogic = {
    init() {
        this.renderHouses();
        this.renderDepts();
        this.loadSettings();
    },
    
    renderHouses() {
        const container = document.getElementById('house-list');
        container.innerHTML = state.houses.map(house => `
            <div class="glass-dark p-4 rounded-xl flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold" style="background: ${house.color}20; color: ${house.color}">
                    ${house.name[0]}
                </div>
                <div class="flex-grow">
                    <div class="font-bold">${house.name}</div>
                    <div class="flex items-center gap-2">
                         <input type="color" value="${house.color}" onchange="adminLogic.updateColor(${house.id}, this.value)" class="w-6 h-6 bg-transparent border-0 cursor-pointer">
                         <span class="text-xs text-slate-500 uppercase">${house.color}</span>
                    </div>
                </div>
                <button onclick="adminLogic.deleteHouse(${house.id})" class="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    },
    
    addHouse() {
        const name = prompt('Enter House Name');
        if (name) {
            state.houses.push({
                id: Date.now(),
                name: name,
                color: '#6366f1',
                points: 0,
                annualPoints: 0
            });
            saveState();
            this.renderHouses();
        }
    },
    
    updateColor(id, color) {
        const house = state.houses.find(h => h.id === id);
        if (house) house.color = color;
        saveState();
        this.renderHouses();
    },
    
    renderDepts() {
        const container = document.getElementById('dept-list');
        container.innerHTML = state.departments.map(dept => `
            <li class="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg group">
                ${dept}
                <button onclick="adminLogic.deleteDept('${dept}')" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-opacity">
                    <i data-lucide="x" class="w-3 h-3"></i>
                </button>
            </li>
        `).join('');
        lucide.createIcons();
    },
    
    addDept() {
        const input = document.getElementById('new-dept-name');
        if (input.value) {
            state.departments.push(input.value);
            input.value = '';
            saveState();
            this.renderDepts();
        }
    },
    
    loadSettings() {
        document.getElementById('tv-college-name').value = state.settings.collegeName;
        document.getElementById('tv-sub-topic').value = state.settings.subTopic;
    },
    
    sendAnnouncement() {
        const data = {
            student: document.getElementById('ann-student').value,
            house: document.getElementById('ann-house').value,
            achievement: document.getElementById('ann-achievement').value,
            message: document.getElementById('ann-message').value,
            photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400' // Mock photo
        };
        
        // In local demo, we just trigger it if TV is active
        if (router.current === 'tv') {
            tvLogic.showAnnouncement(data);
        } else {
            alert('Announcement saved. Switch to TV to see it appear.');
        }
    }
};
// --- TV LOGIC ---
const tvLogic = {
    init() {
        this.refresh();
        this.startTime();
        this.loadSettings();
    },
    
    refresh() {
        this.calculateStats();
        this.renderLeaderboard();
        this.renderWinners();
    },
    calculateStats() {
        const isAnnual = router.isAnnual;
        const pointKey = isAnnual ? 'annualPoints' : 'points';
        
        // Star Teacher (most points given)
        const teacherCounts = {};
        state.logs.forEach(log => {
            const t = log.teacher || 'Prof. Sarah Jenkins'; 
            teacherCounts[t] = (teacherCounts[t] || 0) + 1;
        });
        const starTeacher = Object.entries(teacherCounts).sort((a,b) => b[1] - a[1])[0] || ['Prof. Sarah Jenkins', 0];
        document.getElementById('tv-star-teacher').textContent = starTeacher[0];
        
        // Most Active Dept
        const deptCounts = {};
        state.logs.forEach(log => {
            deptCounts[log.department] = (deptCounts[log.department] || 0) + log[isAnnual ? 'annualPoints' : 'points'];
        });
        const starDept = Object.entries(deptCounts).sort((a,b) => b[1] - a[1])[0] || ['Engineering', 0];
        document.getElementById('tv-star-dept').textContent = starDept[0];
        // Top Students per Dept
        const studentPoints = {};
        state.logs.forEach(log => {
            const key = `${log.student}|${log.department}`;
            studentPoints[key] = (studentPoints[key] || 0) + (isAnnual ? log.points : log.points); // Logs usually store the point change
            // Actually, if we want annual, we should sum all logs.
        });
        
        const topStudents = Object.entries(studentPoints)
            .map(([key, pts]) => ({ name: key.split('|')[0], dept: key.split('|')[1], points: pts }))
            .sort((a,b) => b.points - a.points)
            .slice(0, 3);
        const ticker = document.querySelector('.ticker-content');
        if (ticker) {
            const modeText = isAnnual ? "ANNUAL" : "WEEKLY";
            const studentsText = topStudents.map(s => `${modeText} Top Student of ${s.dept}: ${s.name} (${s.points} pts)`).join(' • ');
            ticker.innerHTML = `
                <span>${studentsText}</span>
                <span>Reminder: Weekly Points Reset every Thursday.</span>
                <span>Current Leader: ${state.houses.sort((a,b) => b[pointKey] - a[pointKey])[0].name} House</span>
            `;
        }
    },
    
    loadSettings() {
        const titleEl = document.getElementById('tv-display-college-name');
        const subTitleEl = document.getElementById('tv-display-sub-topic');
        if (titleEl) titleEl.textContent = state.settings.collegeName;
        if (subTitleEl) subTitleEl.textContent = state.settings.subTopic;
        
        const bg = document.getElementById('tv-background');
        if (bg && state.settings.bgImage) {
            bg.style.backgroundImage = `url(${state.settings.bgImage})`;
            bg.style.opacity = '0.3';
        }
    },
    startTime() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('current-time').textContent = now.toLocaleTimeString();
        }, 1000);
    },
    
    renderLeaderboard() {
        const container = document.getElementById('tv-leaderboard-container');
        const pointKey = router.isAnnual ? 'annualPoints' : 'points';
        const sortedHouses = [...state.houses].sort((a, b) => b[pointKey] - a[pointKey]);
        const maxPoints = sortedHouses[0][pointKey] || 1;
        
        container.innerHTML = sortedHouses.map((house, idx) => {
            const width = (house[pointKey] / maxPoints) * 100;
            return `
                <div class="leaderboard-item glass-dark rounded-2xl overflow-hidden p-1 flex items-center relative gap-6">
                    <div class="w-16 h-16 flex items-center justify-center font-black text-3xl italic" style="color: ${house.color}">
                        0${idx + 1}
                    </div>
                    <div class="flex-grow py-4 space-y-2">
                        <div class="flex justify-between items-end pr-8">
                            <span class="text-2xl font-bold uppercase tracking-widest">${house.name} House</span>
                            <span class="text-4xl font-black italic tabular-nums">${house[pointKey]} <span class="text-xs text-slate-500 uppercase not-italic tracking-normal">Points</span></span>
                        </div>
                        <div class="h-4 bg-slate-900/50 rounded-full overflow-hidden mr-6">
                            <div class="h-full rounded-full transition-all duration-1000" style="width: ${width}%; background: linear-gradient(90deg, ${house.color}44, ${house.color})"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderWinners() {
        const pointKey = router.isAnnual ? 'annualPoints' : 'points';
        const sorted = [...state.houses].sort((a, b) => b[pointKey] - a[pointKey]);
        const labels = ['Winner', 'Runner', 'Second Runner'];
        const container = document.getElementById('tv-winners-list');
        
        container.innerHTML = sorted.slice(0, 3).map((h, i) => `
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500' : 'bg-slate-700'}">
                    ${i + 1}
                </div>
                <div>
                    <div class="font-bold">${h.name}</div>
                    <div class="text-[10px] text-slate-400 uppercase font-black">${labels[i]}</div>
                </div>
                <div class="ml-auto font-bold text-indigo-400">${h[pointKey]}</div>
            </div>
        `).join('');
    },
    
    showAnnouncement(data) {
        const slide = document.getElementById('tv-announcement-slide');
        document.getElementById('ann-slide-photo').src = data.photo || 'https://via.placeholder.com/400x500';
        document.getElementById('ann-slide-house-tag').textContent = `${data.house} House`;
        document.getElementById('ann-slide-house-tag').style.background = state.houses.find(h => h.name === data.house)?.color || '#6366f1';
        document.getElementById('ann-slide-title').textContent = data.achievement;
        document.getElementById('ann-slide-student').textContent = data.student;
        document.getElementById('ann-slide-message').textContent = `"${data.message}"`;
        
        slide.classList.remove('hidden');
        gsap.fromTo(slide, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' });
        
        setTimeout(() => {
            gsap.to(slide, { opacity: 0, scale: 1.1, duration: 0.5, onComplete: () => slide.classList.add('hidden') });
        }, 8000);
    }
};
// --- SCANNER LOGIC ---
const scanner = {
    html5QrCode: null,
    
    async start() {
        this.html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        try {
            await this.html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
                this.handleScan(decodedText);
            });
        } catch (err) {
            console.error(err);
            alert("Camera failed to start");
        }
    },
    
    stop() {
        if (this.html5QrCode) {
            this.html5QrCode.stop().then(() => {
                document.getElementById('reader').innerHTML = '';
            });
        }
    },
    
    handleScan(text) {
        // Teacher Bypass Logic: if "TEACHER_BYPASS" token is present
        if (text === "TEACHER_BYPASS_TOKEN_AX7") {
            alert("Bypass Successful: logged in as Teacher");
            // In a real app, this would set a session cookie or state
            state.currentUser = "Teacher";
            return;
        }
        // Security check: simple signature check or format validation
        if (!text.includes('|') || text.split('|').length < 3) {
            alert('Security Error: Invalid or tampered QR code');
            return;
        }
        const parts = text.split('|').map(s => s.trim());
        const studentName = parts[0];
        
        // Auto-fetch and award
        teacherLogic.selectStudent(studentName);
        pointsLogic.award(10, true);
        this.stop();
    }
};
// --- SECURITY & HELPERS ---
const security = {
    // In a real app, we would use a hash or JWT
    generateToken(data) {
        return btoa(data); // Simple base64 for demo
    },
    verifyToken(token) {
        try { return atob(token); } catch(e) { return null; }
    }
};
// --- AUTOMATION ---
const automation = {
    checkWeeklyReset() {
        const today = new Date();
        const day = today.getDay(); // 4 = Thursday
        if (day === 4 && !state.resetDoneThisWeek) {
            this.resetWeeklyPoints();
        }
    },
    resetWeeklyPoints() {
        state.houses.forEach(h => {
            h.points = 0;
        });
        state.resetDoneThisWeek = true;
        saveState();
        alert('Weekly Points Reset - It is Thursday!');
    }
};
// --- INITIALIZATION ---
window.onload = () => {
    router.navigate('teacher');
    initFirebaseSync();
};
