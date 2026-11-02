const GALLERY_KEY = 'maya-portfolio-gallery';
const STORIES_KEY = 'maya-portfolio-stories';
const PROFILE_KEY = 'maya-portfolio-profile';
const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80';

function generatePlaceholder(label, colors) {
  const [from, to] = colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#g)"/>
      <circle cx="520" cy="230" r="170" fill="rgba(255,255,255,0.28)"/>
      <path d="M180 760C270 640 362 580 485 580C590 580 660 620 720 760V1000H180z" fill="rgba(18,26,25,0.22)"/>
      <path d="M328 310C390 222 510 206 590 280C664 349 672 470 596 532C536 581 445 592 382 560C300 517 292 377 328 310Z" fill="rgba(255,255,255,0.2)"/>
      <text x="50%" y="77%" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="52" font-family="Segoe UI, sans-serif" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadGallery() {
  try {
    const stored = JSON.parse(localStorage.getItem(GALLERY_KEY));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch (error) {
    console.warn('Could not load gallery from localStorage', error);
  }

  return [
    { id: uid('gallery'), src: generatePlaceholder('Lake Light', ['#1d3c4d', '#d8b89e']) },
    { id: uid('gallery'), src: generatePlaceholder('Warm Days', ['#ecb38e', '#6c8575']) },
    { id: uid('gallery'), src: generatePlaceholder('City Glow', ['#5a4d68', '#e8a77b']) }
  ];
}

function saveGallery(items) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

function loadStories() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORIES_KEY));
    if (Array.isArray(stored)) return stored;
  } catch (error) {
    console.warn('Could not load stories from localStorage', error);
  }

  return [
    {
      id: uid('story'),
      title: 'A quiet morning by the river',
      date: '2026-10-18',
      mood: 'Reflective',
      content: 'I woke before the city started moving. The river looked gold under the early light, and all I wanted was to sit there a little longer and notice everything.',
      image: generatePlaceholder('River Morning', ['#6e8d91', '#d6b38b'])
    },
    {
      id: uid('story'),
      title: 'Finding my rhythm again',
      date: '2026-10-09',
      mood: 'Hopeful',
      content: 'Some days you don’t need a plan. You just need to step outside, breathe deeply, and trust that your pace still matters even when it feels slower than everyone else’s.',
      image: generatePlaceholder('New Rhythm', ['#c57a74', '#f1dcb9'])
    }
  ];
}

function saveStories(items) {
  localStorage.setItem(STORIES_KEY, JSON.stringify(items));
}

function loadProfileImage() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored || DEFAULT_PROFILE_IMAGE;
  } catch (error) {
    console.warn('Could not load profile image from localStorage', error);
    return DEFAULT_PROFILE_IMAGE;
  }
}

function saveProfileImage(src) {
  localStorage.setItem(PROFILE_KEY, src);
}

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;

  const images = loadGallery();
  galleryGrid.innerHTML = '';

  if (!images.length) {
    galleryGrid.innerHTML = '<div class="empty-state">Upload your first photo here.</div>';
    return;
  }

  images.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item';

    const image = document.createElement('img');
    image.src = item.src;
    image.alt = 'Portfolio photo';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'gallery-delete';
    deleteBtn.setAttribute('aria-label', 'Delete photo');
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => {
      const remaining = loadGallery().filter((photo) => photo.id !== item.id);
      saveGallery(remaining);
      renderGallery();
    });

    wrapper.append(image, deleteBtn);
    galleryGrid.appendChild(wrapper);
  });
}

function renderStories() {
  const storyList = document.getElementById('storyList');
  if (!storyList) return;

  const stories = loadStories().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  storyList.innerHTML = '';

  if (!stories.length) {
    storyList.innerHTML = '<div class="empty-state">No stories yet. Start with your first journal entry.</div>';
    return;
  }

  stories.forEach((story) => {
    const card = document.createElement('article');
    card.className = 'story-card';

    if (story.image) {
      const image = document.createElement('img');
      image.src = story.image;
      image.alt = story.title;
      card.appendChild(image);
    }

    const body = document.createElement('div');
    body.className = 'story-body';

    const topLine = document.createElement('div');
    topLine.className = 'story-topline';

    const date = document.createElement('span');
    date.className = 'story-date';
    date.textContent = new Date(story.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const actions = document.createElement('div');
    actions.className = 'story-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'story-action';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => populateStoryForm(story));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'story-action delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (!window.confirm('Delete this story?')) return;
      const updated = loadStories().filter((item) => item.id !== story.id);
      saveStories(updated);
      renderStories();
    });

    actions.append(editBtn, deleteBtn);
    topLine.append(date, actions);

    const title = document.createElement('h3');
    title.textContent = story.title;

    const mood = document.createElement('span');
    mood.className = 'story-mood';
    mood.textContent = story.mood || 'Personal';

    const content = document.createElement('p');
    content.className = 'story-content';
    content.textContent = story.content;

    body.append(topLine, title, mood, content);
    card.appendChild(body);
    storyList.appendChild(card);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read photo'));
    reader.readAsDataURL(file);
  });
}

async function handleGalleryUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const current = loadGallery();
  const previewItems = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const src = await readFileAsDataUrl(file);
    previewItems.push({ id: uid('gallery'), src });
  }

  saveGallery([...current, ...previewItems]);
  renderGallery();
  event.target.value = '';
}

async function handleProfileImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const src = await readFileAsDataUrl(file);
  const profileImage = document.getElementById('profileImage');
  if (profileImage) profileImage.src = src;
  saveProfileImage(src);
  event.target.value = '';
}

function populateStoryForm(story) {
  const form = document.getElementById('storyForm');
  if (!form) return;

  document.getElementById('storyTitle').value = story.title || '';
  document.getElementById('storyDate').value = story.date || '';
  document.getElementById('storyMood').value = story.mood || '';
  document.getElementById('storyContent').value = story.content || '';
  form.dataset.editId = story.id;
  document.getElementById('saveStoryBtn').textContent = 'Update story';
  document.getElementById('storyTitle').focus();
}

function resetStoryForm() {
  const form = document.getElementById('storyForm');
  if (!form) return;

  form.reset();
  delete form.dataset.editId;
  document.getElementById('saveStoryBtn').textContent = 'Publish story';
  document.getElementById('storyImageInput').value = '';
}

function handleStorySubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const title = document.getElementById('storyTitle').value.trim();
  const date = document.getElementById('storyDate').value;
  const mood = document.getElementById('storyMood').value.trim();
  const content = document.getElementById('storyContent').value.trim();
  const imageInput = document.getElementById('storyImageInput');
  const imageFile = imageInput.files && imageInput.files[0];
  const editId = form.dataset.editId;

  if (!title || !date || !content) {
    window.alert('Please complete the title, date, and story details.');
    return;
  }

  const saveStory = async () => {
    const existing = loadStories();
    const storyImage = imageFile ? await readFileAsDataUrl(imageFile) : existing.find((story) => story.id === editId)?.image || '';

    if (editId) {
      const updated = existing.map((story) =>
        story.id === editId ? { ...story, title, date, mood, content, image: storyImage } : story
      );
      saveStories(updated);
    } else {
      existing.push({ id: uid('story'), title, date, mood, content, image: storyImage });
      saveStories(existing);
    }

    resetStoryForm();
    renderStories();
  };

  saveStory();
}

document.addEventListener('DOMContentLoaded', () => {
  const profileImage = document.getElementById('profileImage');
  const profileUpload = document.getElementById('profileImageUpload');

  if (profileImage) {
    profileImage.src = loadProfileImage();
    profileImage.addEventListener('click', () => profileUpload && profileUpload.click());
  }

  if (profileUpload) {
    profileUpload.addEventListener('change', handleProfileImageUpload);
  }

  renderGallery();
  renderStories();

  const galleryUpload = document.getElementById('galleryUpload');
  if (galleryUpload) galleryUpload.addEventListener('change', handleGalleryUpload);

  const storyForm = document.getElementById('storyForm');
  if (storyForm) storyForm.addEventListener('submit', handleStorySubmit);
});
