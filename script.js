document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const container = document.querySelector('.container');
    const sections = document.querySelectorAll('.full-screen');
    const scrollPrompt = document.querySelector('.scroll-prompt');
    const specialButton = document.getElementById('special-button');
    const bookCover = document.querySelector('.book-cover');
    const bgMusic = document.getElementById('bg-music');

    // Variables
    let currentSection = 0;
    let isScrolling = false;
    let countdownStarted = false;
    let touchStartY = 0;


    // Jangan langsung play di sini, karena belum ada interaksi user
    document.body.addEventListener('click', startMusicOnce);

    function startMusicOnce() {
        console.log('Start music triggered');
        bgMusic.volume = 0.3;
        bgMusic.play().then(() => {
            console.log('Music is playing');
        }).catch(e => console.log("Audio play failed:", e));
        document.body.removeEventListener('click', startMusicOnce);
    }


    // Initialize the page
    init();

    function init() {
        // Load cake animation
        fetch('birthday-cake.html')
            .then(response => response.text())
            .then(html => {
                document.querySelector('.cake-animation').innerHTML = html;
            });

        // Set up scroll events (for both mouse and touch)
        window.addEventListener('wheel', handleScroll);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Button click event
        specialButton.addEventListener('click', handleSpecialButtonClick);

        // Background music
        document.body.addEventListener('click', startMusicOnce);
    }

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;

        // Minimum swipe distance to trigger
        if (Math.abs(diffY) > 50) {
            const direction = diffY > 0 ? 'down' : 'up';
            handleScroll({ deltaY: direction === 'down' ? 1 : -1 });
        }
    }

    function handleScroll(e) {
        if (isScrolling) return;

        const direction = e.deltaY > 0 ? 'down' : 'up';

        if (direction === 'down' && currentSection < sections.length - 1) {
            goToSection(currentSection + 1);
        } else if (direction === 'up' && currentSection > 0) {
            goToSection(currentSection - 1);
        }
    }

    function goToSection(index) {
        isScrolling = true;
        currentSection = index;

        scrollToSection(index);

        // Trigger effects
        if (index === 1 && !countdownStarted) {
            startCountdown();
            countdownStarted = true;
        }
        if (index === 2) {
            triggerConfetti();
        }
    }

    function handleSpecialButtonClick() {
        // Pastikan countdown jalan jika belum
        if (!countdownStarted) {
            startCountdown();
            countdownStarted = true;
        }

        // Scroll ke birthday message section (index 2)
        goToSection(3);

        // Buka buku setelah delay
        setTimeout(openBook, 1000);
    }

    function scrollToSection(index) {
        // Untuk mobile, gunakan scroll biasa
        if (isMobile()) {
            sections[index].scrollIntoView({ behavior: 'smooth' });
        } else {
            // Untuk desktop, gunakan transform
            sections.forEach((section, i) => {
                section.style.transform = `translateY(-${index * 100}%)`;
            });
        }

        // Hide scroll prompt
        if (index > 0) {
            scrollPrompt.style.opacity = '0';
            scrollPrompt.style.transition = 'opacity 0.5s ease';
        }

        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function startCountdown() {
        const elements = {
            year: document.getElementById('countdown-year'),
            month: document.getElementById('countdown-month'),
            day: document.getElementById('countdown-day')
        };

        const currentDate = new Date();
        const targetDate = new Date(2004, 4, 7); // May 7, 2004

        // Hitung waktu untuk animasi terpanjang (tahun biasanya paling lama)
        const longestDuration = 5000; // 2 detik

        animateValue(elements.year, currentDate.getFullYear(), targetDate.getFullYear(), false, longestDuration);
        animateValue(elements.month, currentDate.getMonth() + 1, targetDate.getMonth() + 1, true, longestDuration * 0.7);
        animateValue(elements.day, currentDate.getDate(), targetDate.getDate(), true, longestDuration * 0.5, () => {
            // Callback ketika animasi hari selesai (yang terakhir)
            setTimeout(() => {
                goToSection(2); // Scroll ke birthday message section
                // Jika ingin langsung ke bible book ganti dengan goToSection(3)
            }, 3000); // Tunggu 0.5 detik setelah animasi selesai
        });
    }

    function animateValue(element, start, end, pad = true, duration = 2000, callback = null) {
        let current = start;
        const startTime = Date.now();
        const range = end - start;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            current = Math.floor(start + range * progress);
            element.textContent = pad ? current.toString().padStart(2, '0') : current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }


    function openBook() {
        bookCover.style.transform = 'rotateY(-160deg)';

        const pages = document.querySelectorAll('.page');
        pages.forEach((page, i) => {
            page.style.transform = `rotateY(${i === 0 ? -20 : 10}deg)`;
            page.style.transformOrigin = i === 0 ? 'right' : 'left';
            page.style.transition = `transform 1s ${i * 0.2}s ease`;
        });

        triggerConfetti();
    }

    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff85a2', '#ffd6e0', '#e2d1f9', '#d1f0ff', '#fff6d1']
        });
    }
});