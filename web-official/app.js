/**
 * Valora Film Official Landing Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navbar scroll effect
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all items
      faqItems.forEach(faq => faq.classList.remove('active'));

      // If clicked item wasn't active, open it
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 3. Showcase Tabs
  const showcaseTabs = {
    cinema: {
      title: 'Player Sinematik Berkecepatan Tinggi',
      desc: 'Didukung engine ExoPlayer mutakhir dengan akselerasi hardware penuh, gesture kontrol swipe volume & kecerahan, serta fitur Picture-in-Picture (PiP) bawaan.',
      items: [
        'Dukungan resolusi adaptif hingga 4K UHD dan 1080p 60FPS',
        'Buffer mulai putar dipercepat ke 800ms',
        'Multi-audio track dan auto-sync subtitle eksternal'
      ],
      chips: ['HLS Stream', 'Subtitle Sync', 'PiP Mode']
    },
    library: {
      title: 'Katalog Cerdas & Watchlist Pribadi',
      desc: 'Kelola tontonan favoritmu dengan penandaan otomatis riwayat tontonan, riwayat episode terakhir, dan sinkronisasi preferensi lokal berkecepatan tinggi.',
      items: [
        'Riwayat putar tersimpan otomatis hingga detik terakhir',
        'Katalog terintegrasi TMDB dengan rating dan sinopsis lengkap',
        'Offline disk caching untuk poster film tanpa sedot kuota ulang'
      ],
      chips: ['Watchlist', 'Auto Resume', 'TMDB Sync']
    },
    settings: {
      title: 'Kustomisasi Antarmuka & Ekstensi',
      desc: 'Pengaturan terpadu dengan desain Material 3 bertema gelap OLED, logo vektor transparan baru, dan Provider Manager yang fleksibel.',
      items: [
        'Provider Manager untuk pasang & kelola scraper film',
        'Subtitle Styler (ukuran, warna, background teks)',
        'Tampilan dark mode OLED elegan dan hemat daya baterai'
      ],
      chips: ['Extension Hub', 'Subtitle Style', 'OLED Dark']
    }
  };

  const tabButtons = document.querySelectorAll('.tab-btn');
  const showcaseTitle = document.getElementById('showcaseTitle');
  const showcaseDesc = document.getElementById('showcaseDesc');
  const showcaseList = document.getElementById('showcaseList');
  const chipContainer = document.querySelector('.preview-chip-row');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab');
      const data = showcaseTabs[tabKey];
      if (!data) return;

      // Active state
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content
      showcaseTitle.textContent = data.title;
      showcaseDesc.textContent = data.desc;

      // Update list
      showcaseList.innerHTML = data.items.map(item => `
        <li class="checklist-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${item}</span>
        </li>
      `).join('');

      // Update chips
      if (chipContainer) {
        chipContainer.innerHTML = data.chips.map(chip => `
          <div class="preview-chip">${chip}</div>
        `).join('');
      }
    });
  });

  // 4. Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.position = 'absolute';
        navLinks.style.top = '76px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = '#0a0c12';
        navLinks.style.flexDirection = 'column';
        navLinks.style.padding = '24px';
        navLinks.style.gap = '20px';
        navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      }
    });
  }

  // 5. Fetch Live GitHub Release stats
  async function fetchReleaseStats() {
    try {
      const res = await fetch('https://api.github.com/repos/B7ByteMe/valorafilm/releases/latest');
      if (res.ok) {
        const data = await res.json();
        const asset = data.assets?.find(a => a.name.includes('.apk'));
        if (asset && asset.download_count > 0) {
          console.log('Live download count:', asset.download_count);
        }
      }
    } catch (e) {
      // Graceful fallback to static data
    }
  }
  fetchReleaseStats();
});
