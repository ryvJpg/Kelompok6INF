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
    "jembut", "kimak", "puki", "anying",  "anj", "any", "ppq", "mmk", "ciple", "cableung", "cameuh", "jokowi", "asu", "sinting",
    "agus", "tt", "lolot"

];

// Fungsi untuk sanitasi input (mencegah XSS)
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Fungsi untuk mendeteksi kata kasar
function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return profanityWords.some(word => {
        // Deteksi kata kasar sebagai kata utuh (bukan substring)
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerText);
    });
}

// Fungsi untuk mendapatkan data dari localStorage
function getStorageData() {
    const data = localStorage.getItem('ratingMessages');
    return data ? JSON.parse(data) : {};
}

// Fungsi untuk menyimpan data ke localStorage
function saveStorageData(data) {
    localStorage.setItem('ratingMessages', JSON.stringify(data));
}

// Fungsi untuk mendapatkan data rating dan pesan untuk seseorang
function getPersonData(personId) {
    const allData = getStorageData();
    return allData[personId] || { ratings: [], messages: [] };
}

// Fungsi untuk menyimpan rating dan pesan
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

// Fungsi untuk menghitung rating rata-rata
function calculateAverageRating(ratings) {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
}

// Fungsi untuk menampilkan daftar orang
function displayPeople() {
    const peopleList = document.getElementById('peopleList');
    peopleList.innerHTML = '';
    
    people.forEach(person => {
        const personData = getPersonData(person.id);
        const avgRating = calculateAverageRating(personData.ratings);
        const messageCount = personData.messages.length;
        
        const personCard = document.createElement('div');
        personCard.className = 'person-card';
        personCard.innerHTML = `
            <div class="person-avatar">
                <img src="${person.avatar}" alt="${person.name}" />
            </div>
            <div class="person-info">
                <h3>${person.name}</h3>
                <p class="person-stats">
                    ${avgRating > 0 ? `⭐ ${avgRating}` : 'Belum ada rating'} | 
                    ${messageCount} pesan
                </p>
            </div>
            <div class="person-actions">
                <button class="btn btn-primary" onclick="openRatingModal(${person.id})">
                    Nilai dan Beri Pesan
                </button>
                <button class="btn btn-secondary" onclick="openProfileModal(${person.id})">
                    Lihat Profil
                </button>
            </div>
        `;
        peopleList.appendChild(personCard);
    });
}

// Fungsi untuk membuka modal rating
let currentPersonId = null;
function openRatingModal(personId) {
    currentPersonId = personId;
    const person = people.find(p => p.id === personId);
    const modal = document.getElementById('ratingModal');
    const modalPersonName = document.getElementById('modalPersonName');
    
    modalPersonName.textContent = `Nilai dan Beri Pesan untuk ${person.name}`;
    modal.style.display = 'block';
    
    // Reset form
    document.getElementById('messageInput').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('warningMessage').textContent = '';
    document.getElementById('warningMessage').classList.remove('show');
    document.getElementById('ratingText').textContent = 'Pilih rating';
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => {
        star.textContent = '☆';
        star.classList.remove('active');
    });
    
    selectedRating = 0;
}

// Fungsi untuk menutup modal rating
function closeRatingModal() {
    document.getElementById('ratingModal').style.display = 'none';
    currentPersonId = null;
}

// Fungsi untuk membuka modal profil
function openProfileModal(personId) {
    const person = people.find(p => p.id === personId);
    const personData = getPersonData(personId);
    const modal = document.getElementById('profileModal');
    const profilePersonName = document.getElementById('profilePersonName');
    const averageRating = document.getElementById('averageRating');
    const messagesList = document.getElementById('messagesList');
    
    profilePersonName.textContent = `Profil ${person.name}`;
    
    // Tampilkan rating rata-rata
    const avgRating = calculateAverageRating(personData.ratings);
    if (avgRating > 0) {
        const stars = '⭐'.repeat(Math.round(parseFloat(avgRating)));
        averageRating.innerHTML = `<div class="rating-display">${stars} <span>${avgRating}/5.0</span></div>`;
    } else {
        averageRating.innerHTML = '<p>Belum ada rating</p>';
    }
    
    // Tampilkan pesan
    messagesList.innerHTML = '';
    if (personData.messages.length === 0) {
        messagesList.innerHTML = '<p class="no-messages">Belum ada pesan</p>';
    } else {
        personData.messages.forEach((msg, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-item';
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
}

// Fungsi untuk menutup modal profil
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Event listener untuk tombol close
document.getElementById('closeModal').addEventListener('click', closeRatingModal);
document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);
document.getElementById('cancelBtn').addEventListener('click', closeRatingModal);

// Tutup modal saat klik di luar
window.addEventListener('click', (e) => {
    const ratingModal = document.getElementById('ratingModal');
    const profileModal = document.getElementById('profileModal');
    if (e.target === ratingModal) {
        closeRatingModal();
    }
    if (e.target === profileModal) {
        closeProfileModal();
    }
});

// Sistem rating bintang
let selectedRating = 0;
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

document.getElementById('starRating').addEventListener('mouseleave', () => {
    updateStarDisplay(selectedRating);
});

function updateStarDisplay(rating) {
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

// Event listener untuk input pesan
const messageInput = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');
const warningMessage = document.getElementById('warningMessage');

messageInput.addEventListener('input', (e) => {
    const text = e.target.value;
    charCount.textContent = text.length;
    
    // Cek kata kasar
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

// Event listener untuk submit
document.getElementById('submitBtn').addEventListener('click', () => {
    const message = messageInput.value.trim();
    const rating = selectedRating;
    
    // Validasi
    if (rating === 0) {
        alert('Silakan pilih rating terlebih dahulu!');
        return;
    }
    
    if (message.length === 0) {
        alert('Silakan ketik pesan terlebih dahulu!');
        return;
    }
    
    if (containsProfanity(message)) {
        alert('Pesan mengandung kata-kata kasar. Silakan perbaiki pesan Anda.');
        return;
    }
    
    // Simpan data
    saveRatingAndMessage(currentPersonId, rating, message);
    
    // Tampilkan konfirmasi
    alert('Rating dan pesan berhasil dikirim!');
    
    // Tutup modal dan refresh daftar
    closeRatingModal();
    displayPeople();
});

// Fungsi untuk scroll ke section people
function scrollToPeople() {
    document.getElementById('peopleSection').scrollIntoView({ behavior: 'smooth' });
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    displayPeople();
});
