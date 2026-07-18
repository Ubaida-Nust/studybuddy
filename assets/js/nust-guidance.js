const state = {
  sortConfig: { key: 'aggregate', direction: 'desc' }
};

function normalizeCategory(value) {
  return String(value || '').trim();
}

function getEligiblePrograms(aggregate, categoryFilter = 'All') {
  return nustMeritData2025
    .filter(item => Number(aggregate) >= Number(item.aggregate))
    .filter(item => categoryFilter === 'All' || normalizeCategory(item.category) === categoryFilter)
    .sort((a, b) => Number(b.aggregate) - Number(a.aggregate) || Number(a.closingMP) - Number(b.closingMP));
}

function renderResults() {
  const aggregateInput = document.getElementById('aggregateInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const resultsSummary = document.getElementById('resultsSummary');
  const resultsList = document.getElementById('resultsList');

  if (!aggregateInput || !resultsSummary || !resultsList) return;

  const aggregate = Number(aggregateInput.value);
  if (!aggregateInput.value || Number.isNaN(aggregate) || aggregate < 0 || aggregate > 100) {
    resultsSummary.textContent = 'Enter a valid aggregate between 0 and 100 to see your matching programs.';
    resultsList.innerHTML = '';
    return;
  }

  const matches = getEligiblePrograms(aggregate, categoryFilter.value);

  if (!matches.length) {
    resultsSummary.textContent = 'No programs matched last year\'s closing merit exactly, but merit varies every year — check back after each merit list update.';
    resultsList.innerHTML = '';
    return;
  }

  resultsSummary.textContent = `${matches.length} program${matches.length > 1 ? 's' : ''} met or exceeded your aggregate.`;
  resultsList.innerHTML = matches.map(item => `
    <article class="result-card">
      <h3>${item.program}</h3>
      <p class="result-meta">${item.school} · ${item.category}</p>
      <p class="result-meta">NET Marks: ${item.netMarks} · Aggregate: ${item.aggregate.toFixed(2)}%</p>
      <p class="result-meta">Closing Merit Position: ${item.closingMP.toLocaleString()}</p>
      ${item.program.includes('*') ? '<span class="badge">Newly introduced in NUST UG Admissions 2025</span>' : ''}
    </article>
  `).join('');
}

function renderTable() {
  const tableBody = document.querySelector('#meritTable tbody');
  const searchInput = document.getElementById('tableSearch');
  const categoryFilter = document.getElementById('tableCategoryFilter');
  if (!tableBody) return;

  const filtered = nustMeritData2025.filter(item => {
    const search = (searchInput?.value || '').toLowerCase();
    const matchesSearch = !search || item.program.toLowerCase().includes(search) || item.school.toLowerCase().includes(search);
    const matchesCategory = categoryFilter?.value === 'All' || item.category === categoryFilter?.value;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    const key = state.sortConfig.key;
    const direction = state.sortConfig.direction === 'desc' ? -1 : 1;
    const aValue = a[key];
    const bValue = b[key];
    if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction;
    return String(aValue).localeCompare(String(bValue)) * direction;
  });

  tableBody.innerHTML = sorted.map(item => `
    <tr>
      <td>${item.program}${item.program.includes('*') ? ' *' : ''}</td>
      <td>${item.school}</td>
      <td>${item.netMarks}</td>
      <td>${item.aggregate.toFixed(2)}%</td>
      <td>${item.closingMP.toLocaleString()}</td>
    </tr>
  `).join('');
}

function attachTableSorting() {
  document.querySelectorAll('#meritTable th[data-sort]').forEach(header => {
    header.addEventListener('click', () => {
      const key = header.getAttribute('data-sort');
      if (state.sortConfig.key === key) {
        state.sortConfig.direction = state.sortConfig.direction === 'desc' ? 'asc' : 'desc';
      } else {
        state.sortConfig.key = key;
        state.sortConfig.direction = 'desc';
      }
      renderTable();
    });
  });
}

function setupFaqAccordion() {
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  if (!faqItems.length) return;

  faqItems.forEach((item, index) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;

    const answerId = `faq-answer-${index + 1}`;
    button.setAttribute('aria-controls', answerId);
    answer.id = answerId;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('is-open');
        const otherButton = otherItem.querySelector('.faq-question');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        otherButton?.setAttribute('aria-expanded', 'false');
        otherAnswer?.setAttribute('hidden', '');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const trigger = document.querySelector('.merit-figure');
  const closeButton = document.getElementById('lightboxClose');
  if (!lightbox || !lightboxImage || !trigger) return;

  const openLightbox = () => {
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  trigger.addEventListener('click', openLightbox);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox();
    }
  });

  closeButton?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const predictorForm = document.getElementById('predictorForm');
  const aggregateInput = document.getElementById('aggregateInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const tableSearch = document.getElementById('tableSearch');
  const tableCategoryFilter = document.getElementById('tableCategoryFilter');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (predictorForm) {
    predictorForm.addEventListener('submit', (event) => {
      event.preventDefault();
      renderResults();
    });
  }

  [aggregateInput, categoryFilter].forEach(control => {
    control?.addEventListener('input', renderResults);
    control?.addEventListener('change', renderResults);
  });

  [tableSearch, tableCategoryFilter].forEach(control => {
    control?.addEventListener('input', renderTable);
    control?.addEventListener('change', renderTable);
  });

  attachTableSorting();
  renderResults();
  renderTable();
  setupFaqAccordion();
  setupLightbox();

  hamburger?.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(isActive));
  });
});
