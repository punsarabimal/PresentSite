/**
 * ==========================================================================
 * INTERNATIONAL DAY OF PEACE - PRESENTATION SYSTEM
 * Pure Vanilla JavaScript (ES6+) Production Engine
 * ==========================================================================
 */

(function () {
  'use strict';

  // --- Constants & Defaults ---
  const STORAGE_KEY = 'peacePresentationData';
  const MAX_PERSIST_BYTES = 2.5 * 1024 * 1024; // 2.5MB safety threshold for LocalStorage

  const DEFAULT_SLIDES = [
    {
      id: 'slide-01-religious',
      title: 'Religious Observances',
      content: 'Inauguration and multi-faith religious observances.\n\nA solemn dedication invoking blessings of peace, compassion, and shared humanity across all cultural and spiritual traditions represented within our community.',
      image: { type: 'none', src: '', alt: 'Religious Observances' },
      audio: { type: 'none', src: '', title: 'Blessings Audio' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-02-national-anthem',
      title: 'National Anthem',
      content: 'Ceremonial rendition of the National Anthem.\n\nStanding in solidarity to honor our national heritage, unity in diversity, and the enduring collective pursuit of peace and civic harmony.',
      image: { type: 'none', src: '', alt: 'National Anthem' },
      audio: { type: 'none', src: '', title: 'National Anthem Recording' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-03-thought-day',
      title: 'Thought of the Day',
      content: '"Peace cannot be kept by force; it can only be achieved by understanding." — Albert Einstein\n\nA moment of communal contemplation on non-violence, active empathy, and building resilient bridges across communities.',
      image: { type: 'none', src: '', alt: 'Thought of the Day' },
      audio: { type: 'none', src: '', title: '' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-04-sinhala-speech',
      title: 'Sinhala Speech',
      content: 'Keynote address delivered in Sinhala.\n\nReflecting on mutual respect, social responsibility, and the timeless principles of coexistence cultivated through generational wisdom and peaceful dialogue.',
      image: { type: 'none', src: '', alt: 'Sinhala Speech' },
      audio: { type: 'none', src: '', title: 'Speech Audio' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-05-tamil-speech',
      title: 'Tamil Speech',
      content: 'Keynote address delivered in Tamil.\n\nHighlighting equality, cultural preservation, and youth stewardship in pioneering sustainable reconciliation and equitable development.',
      image: { type: 'none', src: '', alt: 'Tamil Speech' },
      audio: { type: 'none', src: '', title: 'Speech Audio' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-06-english-speech',
      title: 'English Speech',
      content: 'International perspective address delivered in English.\n\nExploring global peace frameworks, multilateral collaboration, the role of education in dismantling prejudice, and empowering local changemakers.',
      image: { type: 'none', src: '', alt: 'English Speech' },
      audio: { type: 'none', src: '', title: 'Speech Audio' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-07-song-reflection',
      title: 'Song & Reflection',
      content: 'Artistic presentation and musical interlude.\n\nA harmonious symphony celebrating human fraternity, peace through artistic expression, and honoring peacebuilders worldwide.',
      image: { type: 'none', src: '', alt: 'Song & Reflection' },
      audio: { type: 'none', src: '', title: 'Reflection Track' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-08-lecturer-speech',
      title: "Lecturer's Speech",
      content: 'Academic lecture and scholarly discourse.\n\nAnalytical evaluation of conflict resolution theories, civic dialogue mechanisms, human rights education, and systemic peace strategies.',
      image: { type: 'none', src: '', alt: "Lecturer's Speech" },
      audio: { type: 'none', src: '', title: 'Lecture Recording' },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-09-president-speech',
      title: "President's Speech",
      content: 'Presidential Address to the Assembly.\n\nSetting forth institutional commitments, strategic peace initiatives, youth empowerment milestones, and our pledge towards an inclusive future.',
      image: { type: 'none', src: '', alt: "President's Speech" },
      audio: { type: 'none', src: '', title: "President's Address" },
      video: { type: 'none', src: '' }
    },
    {
      id: 'slide-10-college-anthem',
      title: 'Inter College Anthem',
      content: 'The official Inter College Anthem.\n\nA celebratory closing anthem symbolizing institutional camaraderie, shared aspirations, and perpetual bonds of fellowship.',
      image: { type: 'none', src: '', alt: 'Inter College Anthem' },
      audio: { type: 'none', src: '', title: 'Anthem Audio' },
      video: { type: 'none', src: '' }
    }
  ];

  const DEFAULT_STATE = {
    title: 'International Day of Peace',
    subtitle: '07.10.2026',
    slides: DEFAULT_SLIDES
  };

  // --- Application State ---
  let appState = {
    title: DEFAULT_STATE.title,
    subtitle: DEFAULT_STATE.subtitle,
    slides: JSON.parse(JSON.stringify(DEFAULT_SLIDES))
  };

  let currentView = 'home'; // 'home' | 'slide'
  let currentSlideIndex = 0;
  let adminSelectedSlideId = null;
  let confirmCallback = null;

  // --- Audio Player State ---
  let audioElement = null;
  let isAudioPlaying = false;

  // --- Utility Functions ---
  function generateId(prefix = 'slide') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <svg class="icon-svg" viewBox="0 0 24 24">
        ${isError 
          ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' 
          : '<polyline points="20 6 9 17 4 12"></polyline>'}
      </svg>
      <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- Storage Management ---
  function loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        saveState(DEFAULT_STATE, false);
        return DEFAULT_STATE;
      }

      const parsed = JSON.parse(serialized);

      // Defensive validation
      if (!parsed || typeof parsed !== 'object') throw new Error('Root state invalid');
      if (typeof parsed.title !== 'string') parsed.title = DEFAULT_STATE.title;
      if (typeof parsed.subtitle !== 'string') parsed.subtitle = DEFAULT_STATE.subtitle;

      if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        parsed.slides = JSON.parse(JSON.stringify(DEFAULT_SLIDES));
      } else {
        // Validate individual slides
        parsed.slides = parsed.slides.map((slide, idx) => ({
          id: slide.id || generateId(`slide-${idx + 1}`),
          title: slide.title || `Slide ${idx + 1}`,
          content: typeof slide.content === 'string' ? slide.content : '',
          image: slide.image && typeof slide.image === 'object' ? slide.image : { type: 'none', src: '', alt: '' },
          audio: slide.audio && typeof slide.audio === 'object' ? slide.audio : { type: 'none', src: '', title: '' },
          video: slide.video && typeof slide.video === 'object' ? slide.video : { type: 'none', src: '' }
        }));
      }

      return parsed;
    } catch (err) {
      console.warn('LocalStorage data recovery triggered:', err);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function saveState(stateToSave = appState, notify = true) {
    try {
      const serialized = JSON.stringify(stateToSave);
      localStorage.setItem(STORAGE_KEY, serialized);
      if (notify) showToast('Changes saved locally');
      return true;
    } catch (err) {
      console.error('Failed to save to LocalStorage:', err);
      showToast('Storage quota reached. Large media may not persist.', true);
      return false;
    }
  }

  // --- DOM Elements Cache ---
  let dom = {};

  function cacheDOMElements() {
    dom = {
      // Views
      homeView: document.getElementById('home-view'),
      slideView: document.getElementById('slide-view'),
      
      // Header text
      mainTitle: document.getElementById('main-title'),
      mainSubtitle: document.getElementById('main-subtitle'),
      
      // Menu grid
      menuGrid: document.getElementById('menu-grid'),
      
      // Slide view components
      slideCurrentBadge: document.getElementById('slide-current-badge'),
      slideCurrentTitle: document.getElementById('slide-current-title'),
      slideContentText: document.getElementById('slide-content-text'),
      slideMediaGallery: document.getElementById('slide-media-gallery'),
      slideNavDots: document.getElementById('slide-nav-dots'),
      btnPrevSlide: document.getElementById('btn-prev-slide'),
      btnNextSlide: document.getElementById('btn-next-slide'),
      btnBackHome: document.getElementById('btn-back-home'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      btnSlideFullscreen: document.getElementById('btn-slide-fullscreen'),
      
      // Admin Modal
      btnOpenAdmin: document.getElementById('btn-open-admin'),
      btnSlideAdmin: document.getElementById('btn-slide-admin'),
      adminModal: document.getElementById('admin-modal'),
      btnCloseAdmin: document.getElementById('btn-close-admin'),
      adminMainTitleInput: document.getElementById('admin-main-title'),
      adminSubtitleInput: document.getElementById('admin-subtitle'),
      adminSlideList: document.getElementById('admin-slide-list'),
      btnAddSlide: document.getElementById('btn-add-slide'),
      btnResetDefaults: document.getElementById('btn-reset-defaults'),
      
      // Slide Editor Section
      editorContainer: document.getElementById('editor-container'),
      editSlideTitle: document.getElementById('edit-slide-title'),
      editSlideContent: document.getElementById('edit-slide-content'),
      editImageUrl: document.getElementById('edit-image-url'),
      editImageFile: document.getElementById('edit-image-file'),
      btnRemoveImage: document.getElementById('btn-remove-image'),
      imagePreviewBox: document.getElementById('image-preview-box'),
      
      editAudioUrl: document.getElementById('edit-audio-url'),
      editAudioFile: document.getElementById('edit-audio-file'),
      btnRemoveAudio: document.getElementById('btn-remove-audio'),
      audioPreviewBox: document.getElementById('audio-preview-box'),
      
      editVideoUrl: document.getElementById('edit-video-url'),
      editVideoFile: document.getElementById('edit-video-file'),
      btnRemoveVideo: document.getElementById('btn-remove-video'),
      videoPreviewBox: document.getElementById('video-preview-box'),
      
      // Confirmation Dialog
      confirmModal: document.getElementById('confirm-modal'),
      confirmTitle: document.getElementById('confirm-title'),
      confirmMessage: document.getElementById('confirm-message'),
      btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
      btnConfirmAction: document.getElementById('btn-confirm-action')
    };
  }

  // --- Rendering Functions ---
  function renderHeader() {
    if (dom.mainTitle) dom.mainTitle.textContent = appState.title;
    if (dom.mainSubtitle) dom.mainSubtitle.textContent = appState.subtitle;
    document.title = `${appState.title} | ${appState.subtitle}`;
  }

  function renderHomeMenu() {
    if (!dom.menuGrid) return;
    dom.menuGrid.innerHTML = '';

    appState.slides.forEach((slide, index) => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Slide ${index + 1}: ${slide.title}`);

      // Media indicators
      let mediaBadges = '';
      if (slide.image && slide.image.src) {
        mediaBadges += '<span class="media-tag-icon" title="Image attached">📷</span>';
      }
      if (slide.audio && slide.audio.src) {
        mediaBadges += '<span class="media-tag-icon" title="Audio attached">🎵</span>';
      }
      if (slide.video && slide.video.src) {
        mediaBadges += '<span class="media-tag-icon" title="Video attached">🎬</span>';
      }

      const formattedNumber = (index + 1) < 10 ? `0${index + 1}` : `${index + 1}`;

      card.innerHTML = `
        <div class="card-top">
          <span class="card-number">${formattedNumber}</span>
          <div class="card-indicator">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
        <div>
          <h2 class="card-title">${escapeHTML(slide.title)}</h2>
          <div class="card-media-tags">${mediaBadges}</div>
        </div>
      `;

      card.addEventListener('click', () => openSlide(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSlide(index);
        }
      });

      dom.menuGrid.appendChild(card);
    });
  }

  function openSlide(index) {
    if (index < 0 || index >= appState.slides.length) return;
    stopAudio();

    currentSlideIndex = index;
    currentView = 'slide';

    dom.homeView.classList.add('view-hidden');
    dom.slideView.classList.remove('view-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    renderCurrentSlide();
  }

  function backToHome() {
    stopAudio();
    currentView = 'home';
    dom.slideView.classList.add('view-hidden');
    dom.homeView.classList.remove('view-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderCurrentSlide() {
    const slide = appState.slides[currentSlideIndex];
    if (!slide) return;

    const total = appState.slides.length;
    const formattedNum = (currentSlideIndex + 1) < 10 ? `0${currentSlideIndex + 1}` : `${currentSlideIndex + 1}`;
    const formattedTotal = total < 10 ? `0${total}` : `${total}`;

    // Update header & badges
    if (dom.slideCurrentBadge) {
      dom.slideCurrentBadge.textContent = `Slide ${formattedNum} / ${formattedTotal}`;
    }
    if (dom.slideCurrentTitle) {
      dom.slideCurrentTitle.textContent = slide.title;
    }

    // Render content paragraphs safely
    if (dom.slideContentText) {
      dom.slideContentText.innerHTML = '';
      const paragraphs = slide.content.split('\n\n');
      paragraphs.forEach(pText => {
        if (pText.trim()) {
          const p = document.createElement('p');
          p.textContent = pText.trim();
          dom.slideContentText.appendChild(p);
        }
      });
      if (!paragraphs.some(p => p.trim())) {
        const p = document.createElement('p');
        p.className = 'text-muted';
        p.textContent = 'Content for this slide can be added from the Admin Panel.';
        dom.slideContentText.appendChild(p);
      }
    }

    // Render Media Gallery
    renderSlideMedia(slide);

    // Render Navigation state
    if (dom.btnPrevSlide) {
      dom.btnPrevSlide.disabled = (currentSlideIndex === 0);
    }
    if (dom.btnNextSlide) {
      dom.btnNextSlide.disabled = (currentSlideIndex === total - 1);
    }

    // Render Dots
    if (dom.slideNavDots) {
      dom.slideNavDots.innerHTML = '';
      appState.slides.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `nav-dot ${idx === currentSlideIndex ? 'active' : ''}`;
        dot.title = `Go to Slide ${idx + 1}`;
        dot.addEventListener('click', () => openSlide(idx));
        dom.slideNavDots.appendChild(dot);
      });
    }
  }

  function renderSlideMedia(slide) {
    if (!dom.slideMediaGallery) return;
    dom.slideMediaGallery.innerHTML = '';

    // 1. Image
    if (slide.image && slide.image.src) {
      const imgBox = document.createElement('div');
      imgBox.className = 'slide-image-box';
      const img = document.createElement('img');
      img.src = slide.image.src;
      img.alt = slide.image.alt || slide.title;
      img.loading = 'lazy';
      img.onerror = () => {
        imgBox.innerHTML = `
          <div class="media-error-state">
            <svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Unable to load image resource (${escapeHTML(slide.image.src.substring(0, 40))}...)</span>
          </div>
        `;
      };
      imgBox.appendChild(img);
      dom.slideMediaGallery.appendChild(imgBox);
    }

    // 2. Custom Audio Player
    if (slide.audio && slide.audio.src) {
      const audioWrapper = createCustomAudioPlayer(slide.audio.src, slide.audio.title || 'Slide Audio Track');
      dom.slideMediaGallery.appendChild(audioWrapper);
    }

    // 3. Video Player
    if (slide.video && slide.video.src) {
      const vidBox = document.createElement('div');
      vidBox.className = 'slide-video-box';
      const vid = document.createElement('video');
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = 'metadata';
      vid.src = slide.video.src;
      vid.onerror = () => {
        vidBox.innerHTML = `
          <div class="media-error-state">
            <svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Unable to load video playback resource</span>
          </div>
        `;
      };
      vidBox.appendChild(vid);
      dom.slideMediaGallery.appendChild(vidBox);
    }
  }

  // --- Custom Audio Player Component ---
  function createCustomAudioPlayer(src, trackTitle) {
    const playerCard = document.createElement('div');
    playerCard.className = 'custom-audio-player';

    playerCard.innerHTML = `
      <div class="audio-header">
        <div class="audio-title">
          <svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          <span>${escapeHTML(trackTitle)}</span>
        </div>
        <span class="audio-badge">Built-in Audio</span>
      </div>
      <div class="audio-controls-row">
        <button type="button" class="audio-play-btn" aria-label="Play/Pause Audio">
          <svg class="icon-svg play-icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <div class="audio-progress-container">
          <span class="audio-time current-time">0:00</span>
          <input type="range" class="custom-range progress-slider" min="0" max="100" value="0" aria-label="Seek track">
          <span class="audio-time duration-time">0:00</span>
        </div>
        <div class="audio-volume-container">
          <button type="button" class="volume-btn" aria-label="Mute Audio">
            <svg class="icon-svg volume-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
          <input type="range" class="custom-range volume-slider" min="0" max="1" step="0.05" value="1" aria-label="Volume">
        </div>
      </div>
    `;

    // Instantiate native HTML5 audio
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'metadata';
    audioElement = audio;

    const playBtn = playerCard.querySelector('.audio-play-btn');
    const playIcon = playerCard.querySelector('.play-icon');
    const progressSlider = playerCard.querySelector('.progress-slider');
    const currentTimeSpan = playerCard.querySelector('.current-time');
    const durationSpan = playerCard.querySelector('.duration-time');
    const volumeBtn = playerCard.querySelector('.volume-btn');
    const volumeSlider = playerCard.querySelector('.volume-slider');

    let isSeeking = false;

    // Play / Pause Toggle
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          isAudioPlaying = true;
          updatePlayIcon(true);
        }).catch(err => {
          console.warn('Audio playback hindered:', err);
          showToast('Audio playback could not be started', true);
        });
      } else {
        audio.pause();
        isAudioPlaying = false;
        updatePlayIcon(false);
      }
    });

    function updatePlayIcon(playing) {
      if (playing) {
        playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
      } else {
        playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      }
    }

    // Audio Metadata Loaded
    audio.addEventListener('loadedmetadata', () => {
      durationSpan.textContent = formatTime(audio.duration);
    });

    // Audio Time Update
    audio.addEventListener('timeupdate', () => {
      if (!isSeeking && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressSlider.value = pct;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
      }
    });

    // Seeking handlers
    progressSlider.addEventListener('input', () => {
      isSeeking = true;
      if (audio.duration) {
        const seekTime = (progressSlider.value / 100) * audio.duration;
        currentTimeSpan.textContent = formatTime(seekTime);
      }
    });

    progressSlider.addEventListener('change', () => {
      if (audio.duration) {
        audio.currentTime = (progressSlider.value / 100) * audio.duration;
      }
      isSeeking = false;
    });

    // Track End
    audio.addEventListener('ended', () => {
      updatePlayIcon(false);
      progressSlider.value = 0;
      currentTimeSpan.textContent = '0:00';
    });

    // Volume handling
    volumeSlider.addEventListener('input', () => {
      audio.volume = parseFloat(volumeSlider.value);
      audio.muted = (audio.volume === 0);
    });

    volumeBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      if (audio.muted) {
        volumeSlider.value = 0;
      } else {
        volumeSlider.value = audio.volume || 1;
      }
    });

    return playerCard;
  }

  function stopAudio() {
    if (audioElement) {
      try {
        audioElement.pause();
        audioElement.currentTime = 0;
      } catch (e) {}
      audioElement = null;
      isAudioPlaying = false;
    }
  }

  // --- Slide Navigation ---
  function nextSlide() {
    if (currentSlideIndex < appState.slides.length - 1) {
      openSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      openSlide(currentSlideIndex - 1);
    }
  }

  // --- Fullscreen API Handling ---
  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function toggleFullscreen() {
    const docEl = document.documentElement;
    if (!isFullscreen()) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  function updateFullscreenButtons() {
    const fsActive = isFullscreen();
    const label = fsActive ? 'Exit Fullscreen' : 'Enter Fullscreen';
    
    [dom.btnFullscreen, dom.btnSlideFullscreen].forEach(btn => {
      if (btn) {
        const textSpan = btn.querySelector('.btn-label');
        if (textSpan) textSpan.textContent = label;
      }
    });
  }

  // --- Confirmation Dialog ---
  function requestConfirmation(title, message, onConfirm) {
    if (!dom.confirmModal) return;
    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    confirmCallback = onConfirm;
    dom.confirmModal.classList.add('active');
  }

  function closeConfirmation() {
    if (!dom.confirmModal) return;
    dom.confirmModal.classList.remove('active');
    confirmCallback = null;
  }

  // --- Admin Panel CMS ---
  function openAdmin() {
    if (!dom.adminModal) return;
    // Sync current title & subtitle
    dom.adminMainTitleInput.value = appState.title;
    dom.adminSubtitleInput.value = appState.subtitle;

    // Pick selected slide
    if (!adminSelectedSlideId || !appState.slides.some(s => s.id === adminSelectedSlideId)) {
      adminSelectedSlideId = appState.slides[0] ? appState.slides[0].id : null;
    }

    renderAdminSlideList();
    renderSlideEditor();

    dom.adminModal.classList.add('active');
    dom.adminModal.setAttribute('aria-hidden', 'false');
  }

  function closeAdmin() {
    if (!dom.adminModal) return;
    dom.adminModal.classList.remove('active');
    dom.adminModal.setAttribute('aria-hidden', 'true');
  }

  function renderAdminSlideList() {
    if (!dom.adminSlideList) return;
    dom.adminSlideList.innerHTML = '';

    appState.slides.forEach((slide, index) => {
      const row = document.createElement('div');
      row.className = `admin-slide-row ${slide.id === adminSelectedSlideId ? 'selected' : ''}`;

      const numStr = (index + 1) < 10 ? `0${index + 1}` : `${index + 1}`;

      row.innerHTML = `
        <div class="slide-row-info" title="${escapeHTML(slide.title)}">
          <span class="slide-row-index">${numStr}</span>
          <span class="slide-row-title">${escapeHTML(slide.title)}</span>
        </div>
        <div class="slide-row-actions">
          <button type="button" class="btn-mini btn-move-up" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn-mini btn-move-down" title="Move Down" ${index === appState.slides.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn-mini btn-edit-slide" title="Edit Content">Edit</button>
          <button type="button" class="btn-mini btn-mini-danger btn-delete-slide" title="Delete Slide">✕</button>
        </div>
      `;

      // Select row for editing
      row.querySelector('.slide-row-info').addEventListener('click', () => {
        adminSelectedSlideId = slide.id;
        renderAdminSlideList();
        renderSlideEditor();
      });

      row.querySelector('.btn-edit-slide').addEventListener('click', () => {
        adminSelectedSlideId = slide.id;
        renderAdminSlideList();
        renderSlideEditor();
      });

      // Move Up
      row.querySelector('.btn-move-up').addEventListener('click', (e) => {
        e.stopPropagation();
        moveSlide(index, -1);
      });

      // Move Down
      row.querySelector('.btn-move-down').addEventListener('click', (e) => {
        e.stopPropagation();
        moveSlide(index, 1);
      });

      // Delete Slide
      row.querySelector('.btn-delete-slide').addEventListener('click', (e) => {
        e.stopPropagation();
        requestConfirmation(
          'Delete Presentation Slide?',
          `Are you sure you want to permanently delete "${slide.title}"?`,
          () => deleteSlide(slide.id)
        );
      });

      dom.adminSlideList.appendChild(row);
    });
  }

  function moveSlide(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= appState.slides.length) return;

    const [moved] = appState.slides.splice(index, 1);
    appState.slides.splice(targetIdx, 0, moved);

    saveState();
    renderAdminSlideList();
    renderHomeMenu();
    if (currentView === 'slide') renderCurrentSlide();
  }

  function deleteSlide(slideId) {
    if (appState.slides.length <= 1) {
      showToast('Cannot delete the only remaining slide', true);
      return;
    }

    const idx = appState.slides.findIndex(s => s.id === slideId);
    if (idx !== -1) {
      appState.slides.splice(idx, 1);
      if (adminSelectedSlideId === slideId) {
        adminSelectedSlideId = appState.slides[0] ? appState.slides[0].id : null;
      }
      if (currentSlideIndex >= appState.slides.length) {
        currentSlideIndex = appState.slides.length - 1;
      }
      saveState();
      renderAdminSlideList();
      renderSlideEditor();
      renderHomeMenu();
      if (currentView === 'slide') renderCurrentSlide();
      showToast('Slide deleted');
    }
  }

  function addNewSlide() {
    const newIndex = appState.slides.length + 1;
    const newSlide = {
      id: generateId('slide'),
      title: `Slide ${newIndex}: New Presentation Topic`,
      content: 'Enter the presentation narrative, speaker notes, or reflective prose for this slide from the Admin Panel.',
      image: { type: 'none', src: '', alt: '' },
      audio: { type: 'none', src: '', title: '' },
      video: { type: 'none', src: '' }
    };

    appState.slides.push(newSlide);
    adminSelectedSlideId = newSlide.id;

    saveState();
    renderAdminSlideList();
    renderSlideEditor();
    renderHomeMenu();
    showToast(`Added Slide: ${newSlide.title}`);
  }

  function renderSlideEditor() {
    if (!dom.editorContainer) return;
    const slide = appState.slides.find(s => s.id === adminSelectedSlideId);

    if (!slide) {
      dom.editorContainer.innerHTML = '<p class="text-secondary">Select a slide above to edit its content and media attachments.</p>';
      return;
    }

    // Populate Fields
    dom.editSlideTitle.value = slide.title;
    dom.editSlideContent.value = slide.content;

    // Image preview
    dom.editImageUrl.value = (slide.image && slide.image.type === 'url') ? slide.image.src : '';
    renderImagePreview(slide);

    // Audio preview
    dom.editAudioUrl.value = (slide.audio && slide.audio.type === 'url') ? slide.audio.src : '';
    renderAudioPreview(slide);

    // Video preview
    dom.editVideoUrl.value = (slide.video && slide.video.type === 'url') ? slide.video.src : '';
    renderVideoPreview(slide);
  }

  function renderImagePreview(slide) {
    if (!dom.imagePreviewBox) return;
    if (slide.image && slide.image.src) {
      dom.imagePreviewBox.style.display = 'flex';
      dom.imagePreviewBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <img src="${slide.image.src}" alt="Preview" class="media-preview-thumb">
          <span>Active image attached</span>
        </div>
      `;
      dom.btnRemoveImage.style.display = 'inline-flex';
    } else {
      dom.imagePreviewBox.style.display = 'none';
      dom.imagePreviewBox.innerHTML = '';
      dom.btnRemoveImage.style.display = 'none';
    }
  }

  function renderAudioPreview(slide) {
    if (!dom.audioPreviewBox) return;
    if (slide.audio && slide.audio.src) {
      dom.audioPreviewBox.style.display = 'flex';
      dom.audioPreviewBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <span>🎵 Active audio attached</span>
        </div>
      `;
      dom.btnRemoveAudio.style.display = 'inline-flex';
    } else {
      dom.audioPreviewBox.style.display = 'none';
      dom.audioPreviewBox.innerHTML = '';
      dom.btnRemoveAudio.style.display = 'none';
    }
  }

  function renderVideoPreview(slide) {
    if (!dom.videoPreviewBox) return;
    if (slide.video && slide.video.src) {
      dom.videoPreviewBox.style.display = 'flex';
      dom.videoPreviewBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <span>🎬 Active video attached</span>
        </div>
      `;
      dom.btnRemoveVideo.style.display = 'inline-flex';
    } else {
      dom.videoPreviewBox.style.display = 'none';
      dom.videoPreviewBox.innerHTML = '';
      dom.btnRemoveVideo.style.display = 'none';
    }
  }

  // --- Reset to Original Defaults ---
  function resetToOriginalDefaults() {
    requestConfirmation(
      'Reset All Presentation Defaults?',
      'This will restore the original title, date, and default 10 presentation slides. All custom slide text and media will be reverted to factory defaults.',
      () => {
        appState = {
          title: DEFAULT_STATE.title,
          subtitle: DEFAULT_STATE.subtitle,
          slides: JSON.parse(JSON.stringify(DEFAULT_SLIDES))
        };
        saveState();
        currentSlideIndex = 0;
        adminSelectedSlideId = appState.slides[0].id;

        renderHeader();
        renderHomeMenu();
        backToHome();
        closeAdmin();
        showToast('Presentation restored to original defaults');
      }
    );
  }

  // --- File Reader Helpers for Media ---
  function handleLocalMediaFile(file, type, callback) {
    if (!file) return;

    if (file.size > MAX_PERSIST_BYTES) {
      // Create session Object URL and warn about LocalStorage threshold
      const objectUrl = URL.createObjectURL(file);
      showToast(`${type.toUpperCase()} exceeds 2.5MB. Usable in current session, but won't persist across refresh.`, true);
      callback(objectUrl, 'session');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      callback(dataUrl, 'data');
    };
    reader.onerror = () => {
      showToast(`Error reading local ${type} file`, true);
    };
    reader.readAsDataURL(file);
  }

  // --- Ambient Canvas Particles ---
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 45;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Create celestial stars/dust
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 211, 252, ${p.alpha})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- Keyboard Presentation Navigation ---
  function initKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      // Never intercept when user is typing inside an input/textarea
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) {
        return;
      }

      // Close modals on Escape
      if (e.key === 'Escape') {
        if (dom.confirmModal && dom.confirmModal.classList.contains('active')) {
          closeConfirmation();
          return;
        }
        if (dom.adminModal && dom.adminModal.classList.contains('active')) {
          closeAdmin();
          return;
        }
        if (currentView === 'slide') {
          backToHome();
          return;
        }
      }

      // Home key
      if (e.key === 'Home') {
        e.preventDefault();
        backToHome();
        return;
      }

      // F key -> Toggle Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Slide Navigation
      if (currentView === 'slide') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          prevSlide();
        }
      }
    });
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Navigation Buttons
    if (dom.btnBackHome) dom.btnBackHome.addEventListener('click', backToHome);
    if (dom.btnPrevSlide) dom.btnPrevSlide.addEventListener('click', prevSlide);
    if (dom.btnNextSlide) dom.btnNextSlide.addEventListener('click', nextSlide);

    // Fullscreen Toggles
    if (dom.btnFullscreen) dom.btnFullscreen.addEventListener('click', toggleFullscreen);
    if (dom.btnSlideFullscreen) dom.btnSlideFullscreen.addEventListener('click', toggleFullscreen);

    document.addEventListener('fullscreenchange', updateFullscreenButtons);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);

    // Admin Toggle
    if (dom.btnOpenAdmin) dom.btnOpenAdmin.addEventListener('click', openAdmin);
    if (dom.btnSlideAdmin) dom.btnSlideAdmin.addEventListener('click', openAdmin);
    if (dom.btnCloseAdmin) dom.btnCloseAdmin.addEventListener('click', closeAdmin);
    if (dom.adminModal) {
      dom.adminModal.addEventListener('click', (e) => {
        if (e.target === dom.adminModal) closeAdmin();
      });
    }

    // Live Title & Subtitle editing
    if (dom.adminMainTitleInput) {
      dom.adminMainTitleInput.addEventListener('input', (e) => {
        appState.title = e.target.value.trim() || DEFAULT_STATE.title;
        renderHeader();
        saveState();
      });
    }

    if (dom.adminSubtitleInput) {
      dom.adminSubtitleInput.addEventListener('input', (e) => {
        appState.subtitle = e.target.value.trim() || DEFAULT_STATE.subtitle;
        renderHeader();
        saveState();
      });
    }

    // Add Slide Button
    if (dom.btnAddSlide) dom.btnAddSlide.addEventListener('click', addNewSlide);

    // Reset Defaults
    if (dom.btnResetDefaults) dom.btnResetDefaults.addEventListener('click', resetToOriginalDefaults);

    // Slide Editor Content Listeners
    if (dom.editSlideTitle) {
      dom.editSlideTitle.addEventListener('input', (e) => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          slide.title = e.target.value;
          renderAdminSlideList();
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
        }
      });
    }

    if (dom.editSlideContent) {
      dom.editSlideContent.addEventListener('input', (e) => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          slide.content = e.target.value;
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
        }
      });
    }

    // Image Handlers
    if (dom.editImageUrl) {
      dom.editImageUrl.addEventListener('input', (e) => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          const val = e.target.value.trim();
          slide.image = val ? { type: 'url', src: val, alt: slide.title } : { type: 'none', src: '', alt: '' };
          renderImagePreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
        }
      });
    }

    if (dom.editImageFile) {
      dom.editImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (!slide) return;

        handleLocalMediaFile(file, 'image', (dataSrc, type) => {
          slide.image = { type, src: dataSrc, alt: file.name };
          renderImagePreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
          e.target.value = '';
        });
      });
    }

    if (dom.btnRemoveImage) {
      dom.btnRemoveImage.addEventListener('click', () => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          slide.image = { type: 'none', src: '', alt: '' };
          dom.editImageUrl.value = '';
          renderImagePreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
          showToast('Image removed');
        }
      });
    }

    // Audio Handlers
    if (dom.editAudioUrl) {
      dom.editAudioUrl.addEventListener('input', (e) => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          const val = e.target.value.trim();
          slide.audio = val ? { type: 'url', src: val, title: `${slide.title} Audio` } : { type: 'none', src: '', title: '' };
          renderAudioPreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
        }
      });
    }

    if (dom.editAudioFile) {
      dom.editAudioFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (!slide) return;

        handleLocalMediaFile(file, 'audio', (dataSrc, type) => {
          slide.audio = { type, src: dataSrc, title: file.name };
          renderAudioPreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
          e.target.value = '';
        });
      });
    }

    if (dom.btnRemoveAudio) {
      dom.btnRemoveAudio.addEventListener('click', () => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          slide.audio = { type: 'none', src: '', title: '' };
          dom.editAudioUrl.value = '';
          renderAudioPreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
          showToast('Audio removed');
        }
      });
    }

    // Video Handlers
    if (dom.editVideoUrl) {
      dom.editVideoUrl.addEventListener('input', (e) => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          const val = e.target.value.trim();
          slide.video = val ? { type: 'url', src: val } : { type: 'none', src: '' };
          renderVideoPreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
        }
      });
    }

    if (dom.editVideoFile) {
      dom.editVideoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (!slide) return;

        handleLocalMediaFile(file, 'video', (dataSrc, type) => {
          slide.video = { type, src: dataSrc };
          renderVideoPreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
          e.target.value = '';
        });
      });
    }

    if (dom.btnRemoveVideo) {
      dom.btnRemoveVideo.addEventListener('click', () => {
        const slide = appState.slides.find(s => s.id === adminSelectedSlideId);
        if (slide) {
          slide.video = { type: 'none', src: '' };
          dom.editVideoUrl.value = '';
          renderVideoPreview(slide);
          renderHomeMenu();
          if (currentView === 'slide' && appState.slides[currentSlideIndex].id === slide.id) {
            renderCurrentSlide();
          }
          saveState();
          showToast('Video removed');
        }
      });
    }

    // Confirmation Modal Actions
    if (dom.btnConfirmCancel) dom.btnConfirmCancel.addEventListener('click', closeConfirmation);
    if (dom.btnConfirmAction) {
      dom.btnConfirmAction.addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
          confirmCallback();
        }
        closeConfirmation();
      });
    }
  }

  // --- Initialization Lifecycle ---
  function init() {
    cacheDOMElements();
    appState = loadState();
    renderHeader();
    renderHomeMenu();
    initAmbientCanvas();
    initKeyboardControls();
    setupEventListeners();
    updateFullscreenButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
