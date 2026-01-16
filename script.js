// Data orang yang bisa dinilai
const people = [
    { id: 1, name: "Jihan", avatar: "images/avatars/avatar-1.png" },
    { id: 2, name: "Ahmad", avatar: "images/avatars/avatar-2.png" },
    { id: 3, name: "Syifa", avatar: "images/avatars/avatar-3.png" },
    { id: 4, name: "Bima", avatar: "images/avatars/avatar-4.png" },
    { id: 5, name: "Azkel", avatar: "images/avatars/avatar-5.png" },
    { id: 6, name: "Ryu", avatar: "images/hero-character-removebg-preview.png" }
];

// Daftar kata kasar (Indonesia & Inggris)
const profanityWords = [
    // Bahasa Indonesia
    "anjing", "bangsat", "bajingan", "bego", "tolol", "bodoh", "goblok", "kontol", "memek",
    "jancok", "jancuk", "asu", "babi", "setan", "iblis", "sialan", "brengsek", "kampret",
    // Bahasa Inggris
    "fuck", "shit", "damn", "bitch", "asshole", "bastard", "crap", "piss", "dick", "cock",
    "pussy", "whore", "slut", "motherfucker", "fucking", "shitty", "damned", "ayam", "pepek", "ngentot", "dongo", "gila",
    "jembut", "kimak", "puki", "anying", "anj", "any", "ppq", "mmk", "ciple", "cableung", "cameuh", "jokowi", "asu", "sinting",
    "agus", "tt", "lolot"
];

// ==================== THEME TOGGLE ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Mode ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' 
               : type === 'error' ? 'times-circle' 
               : type === 'warning' ? 'exclamation-triangle' 
               : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== UTILITY FUNCTIONS ====================
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return profanityWords.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerText);
    });
}

// ==================== STORAGE FUNCTIONS ====================
function getStorageData() {
    const data = localStorage.getItem('ratingMessages');
    return data ? JSON.parse(data) : {};
}

function saveStorageData(data) {
    localStorage.setItem('ratingMessages', JSON.stringify(data));
}

function getPersonData(personId) {
    const allData = getStorageData();
    return allData[personId] || { ratings: [], messages: [] };
}

function saveRatingAndMessage(personId, rating, message) {
    const allData = getStorageData();
    if (!allData[personId]) {
        allData[personId] = { ratings: [], messages: [] };
    }
    
    const timestamp = new Date().toISOString();
    allData[personId].ratings.push(rating);
    allData[personId].messages.push({
        message: sanitizeInput(message),
        rating: rating,
        timestamp: timestamp
    });
    
    saveStorageData(allData);
}

function calculateAverageRating(ratings) {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
}

// ==================== STATS FUNCTIONS ====================
function updateStats() {
    const allData = getStorageData();
    let totalRatings = 0;
    let totalMessages = 0;
    
    Object.values(allData).forEach(personData => {
        totalRatings += personData.ratings.length;
        totalMessages += personData.messages.length;
    });
    
    const totalPeopleEl = document.getElementById('totalPeople');
    const totalRatingsEl = document.getElementById('totalRatings');
    const totalMessagesEl = document.getElementById('totalMessages');
    
    if (totalPeopleEl) totalPeopleEl.textContent = people.length;
    if (totalRatingsEl) animateNumber(totalRatingsEl, totalRatings);
    if (totalMessagesEl) animateNumber(totalMessagesEl, totalMessages);
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = target > current ? 1 : -1;
    const duration = 500;
    const steps = Math.abs(target - current);
    const stepDuration = duration / steps;
    
    if (steps === 0) return;
    
    let count = current;
    const timer = setInterval(() => {
        count += increment;
        element.textContent = count;
        if (count === target) clearInterval(timer);
    }, stepDuration);
}

// ==================== LEADERBOARD ====================
function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;
    
    const peopleWithRatings = people.map(person => {
        const personData = getPersonData(person.id);
        const avgRating = parseFloat(calculateAverageRating(personData.ratings)) || 0;
        const totalRatings = personData.ratings.length;
        return { ...person, avgRating, totalRatings };
    });
    
    // Sort by average rating (descending), then by total ratings
    peopleWithRatings.sort((a, b) => {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.totalRatings - a.totalRatings;
    });
    
    leaderboardList.innerHTML = '';
    
    peopleWithRatings.forEach((person, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const starsHtml = person.avgRating > 0 ? '<i class="fas fa-star" style="color: var(--gold);"></i>'.repeat(Math.round(person.avgRating)) : '-';
        
        const item = document.createElement('div');
        item.className = `leaderboard-item ${rankClass}`;
        item.innerHTML = `
            <div class="rank-badge">${index + 1}</div>
            <div class="leaderboard-avatar">
                <img src="${person.avatar}" alt="${person.name}">
            </div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${person.name}</div>
                <div class="leaderboard-stats">
                    <span><i class="fas fa-star" style="color: var(--gold);"></i> ${person.totalRatings} rating</span>
                </div>
            </div>
            <div class="leaderboard-rating">
                <span class="rating-stars">${starsHtml}</span>
                <span class="rating-number">${person.avgRating > 0 ? person.avgRating : '-'}</span>
            </div>
        `;
        leaderboardList.appendChild(item);
    });
}

// ==================== PEOPLE LIST ====================
function displayPeople(filter = '') {
    const peopleList = document.getElementById('peopleList');
    const noResults = document.getElementById('noResults');
    
    if (!peopleList) return;
    
    const filteredPeople = filter 
        ? people.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        : people;
    
    peopleList.innerHTML = '';
    
    if (filteredPeople.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    filteredPeople.forEach((person, index) => {
        const personData = getPersonData(person.id);
        const avgRating = calculateAverageRating(personData.ratings);
        const messageCount = personData.messages.length;
        
        const personCard = document.createElement('div');
        personCard.className = 'person-card';
        personCard.style.animationDelay = `${index * 0.1}s`;
        personCard.innerHTML = `
            <div class="person-avatar">
                <img src="${person.avatar}" alt="${person.name}" />
            </div>
            <div class="person-info">
                <h3>${person.name}</h3>
                <div class="person-stats">
                    <span>${avgRating > 0 ? `<i class="fas fa-star" style="color: var(--gold);"></i> ${avgRating}` : 'Belum ada rating'}</span>
                    <span><i class="fas fa-comment"></i> ${messageCount}</span>
                </div>
            </div>
            <div class="person-actions">
                <button class="btn btn-primary" onclick="openRatingModal(${person.id})">
                    <i class="fas fa-star"></i> Nilai & Pesan
                </button>
                <button class="btn btn-secondary" onclick="openProfileModal(${person.id})">
                    <i class="fas fa-user"></i> Lihat Profil
                </button>
            </div>
        `;
        peopleList.appendChild(personCard);
    });
}

// ==================== SEARCH FUNCTIONALITY ====================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const filter = e.target.value.trim();
            displayPeople(filter);
        });
    }
}

// ==================== MODAL: RATING ====================
let currentPersonId = null;
let selectedRating = 0;

function openRatingModal(personId) {
    currentPersonId = personId;
    const person = people.find(p => p.id === personId);
    const modal = document.getElementById('ratingModal');
    const modalPersonName = document.getElementById('modalPersonName');
    
    if (!modal || !modalPersonName) return;
    
    modalPersonName.textContent = `Nilai dan Beri Pesan untuk ${person.name}`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('messageInput').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('warningMessage').textContent = '';
    document.getElementById('warningMessage').classList.remove('show');
    document.getElementById('ratingText').textContent = 'Pilih rating';
    document.getElementById('submitBtn').disabled = false;
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.textContent = '☆';
        star.classList.remove('active');
    });
    
    selectedRating = 0;
}

function closeRatingModal() {
    document.getElementById('ratingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentPersonId = null;
}

// ==================== MODAL: PROFILE ====================
function openProfileModal(personId) {
    const person = people.find(p => p.id === personId);
    const personData = getPersonData(personId);
    const modal = document.getElementById('profileModal');
    const profilePersonName = document.getElementById('profilePersonName');
    const averageRating = document.getElementById('averageRating');
    const messagesList = document.getElementById('messagesList');
    
    if (!modal) return;
    
    profilePersonName.textContent = `Profil ${person.name}`;
    
    // Tampilkan rating rata-rata
    const avgRating = calculateAverageRating(personData.ratings);
    if (avgRating > 0) {
        const stars = '⭐'.repeat(Math.round(parseFloat(avgRating)));
        averageRating.innerHTML = `<div class="rating-display">${stars} <span>${avgRating}/5.0</span></div>`;
    } else {
        averageRating.innerHTML = '<p style="color: var(--text-muted);">Belum ada rating</p>';
    }
    
    // Tampilkan pesan
    messagesList.innerHTML = '';
    if (personData.messages.length === 0) {
        messagesList.innerHTML = '<p class="no-messages">Belum ada pesan</p>';
    } else {
        // Show messages in reverse order (newest first)
        [...personData.messages].reverse().forEach((msg, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-item';
            messageDiv.style.animationDelay = `${index * 0.1}s`;
            const date = new Date(msg.timestamp).toLocaleString('id-ID');
            const stars = '⭐'.repeat(msg.rating);
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-rating">${stars}</span>
                    <span class="message-date">${date}</span>
                </div>
                <div class="message-content">${msg.message}</div>
            `;
            messagesList.appendChild(messageDiv);
        });
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ==================== SCROLL FUNCTIONS ====================
function scrollToPeople() {
    document.getElementById('peopleSection').scrollIntoView({ behavior: 'smooth' });
}

function scrollToLeaderboard() {
    document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth' });
}

// ==================== NAVIGATION ====================
function initNavigation() {
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Update active nav link on scroll
    const sections = ['home', 'leaderboard', 'peopleSection'];
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop - 150;
                if (window.scrollY >= sectionTop) {
                    current = sectionId;
                }
            }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + current || (href === '#' && current === 'home')) {
                link.classList.add('active');
            }
        });
    });
}

// ==================== STAR RATING SYSTEM ====================
function initStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStarDisplay(selectedRating);
            document.getElementById('ratingText').textContent = `Rating: ${selectedRating}/5`;
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            updateStarDisplay(rating);
        });
    });
    
    const starRating = document.getElementById('starRating');
    if (starRating) {
        starRating.addEventListener('mouseleave', () => {
            updateStarDisplay(selectedRating);
        });
    }
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

// ==================== MESSAGE INPUT ====================
function initMessageInput() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    const warningMessage = document.getElementById('warningMessage');
    
    if (messageInput) {
        messageInput.addEventListener('input', (e) => {
            const text = e.target.value;
            charCount.textContent = text.length;
            
            if (containsProfanity(text)) {
                warningMessage.textContent = 'Larangan: Kata-kata kasar tidak diperbolehkan. Silakan gunakan bahasa yang sopan.';
                warningMessage.classList.add('show');
                document.getElementById('submitBtn').disabled = true;
            } else {
                warningMessage.textContent = '';
                warningMessage.classList.remove('show');
                document.getElementById('submitBtn').disabled = false;
            }
        });
    }
}

// ==================== SUBMIT HANDLER ====================
function initSubmitHandler() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            const rating = selectedRating;
            
            if (rating === 0) {
                showToast('Silakan pilih rating terlebih dahulu!', 'warning');
                return;
            }
            
            if (message.length === 0) {
                showToast('Silakan ketik pesan terlebih dahulu!', 'warning');
                return;
            }
            
            if (containsProfanity(message)) {
                showToast('Pesan mengandung kata-kata kasar. Silakan perbaiki pesan Anda.', 'error');
                return;
            }
            
            // Simpan data
            saveRatingAndMessage(currentPersonId, rating, message);
            
            // Tampilkan konfirmasi
            showToast('Rating dan pesan berhasil dikirim!', 'success');
            
            // Tutup modal dan refresh
            closeRatingModal();
            displayPeople();
            displayLeaderboard();
            updateStats();
        });
    }
}

// ==================== MODAL EVENT LISTENERS ====================
function initModalListeners() {
    const closeModal = document.getElementById('closeModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModal');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (closeModal) closeModal.addEventListener('click', closeRatingModal);
    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', closeProfileModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeRatingModal);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const ratingModal = document.getElementById('ratingModal');
        const profileModal = document.getElementById('profileModal');
        if (e.target === ratingModal) closeRatingModal();
        if (e.target === profileModal) closeProfileModal();
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRatingModal();
            closeProfileModal();
        }
    });
}

// ==================== THEME TOGGLE LISTENER ====================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Initialize all components
    initThemeToggle();
    initNavigation();
    initSearch();
    initStarRating();
    initMessageInput();
    initSubmitHandler();
    initModalListeners();
    
    // Display content
    displayPeople();
    displayLeaderboard();
    updateStats();
});
