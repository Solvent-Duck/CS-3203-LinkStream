const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  });
});

const teams = {
  design: {
    label: 'DESIGN', title: 'Keep creativity moving.',
    description: 'Give your team a single, easy path to the files, feedback, and inspiration behind great work.',
    links: [['◈', 'go/design-system', 'Components & patterns'], ['▥', 'go/brand', 'Brand guidelines'], ['▦', 'go/assets', 'Creative library']]
  },
  engineering: {
    label: 'ENGINEERING', title: 'Build without the bottlenecks.',
    description: 'Keep docs, dashboards, and deploy details within reach so your team can stay focused on shipping.',
    links: [['⌘', 'go/docs', 'Technical documentation'], ['▥', 'go/sprint', 'Current sprint'], ['◈', 'go/deploys', 'Release dashboard']]
  },
  people: {
    label: 'PEOPLE', title: 'Make everyone feel at home.',
    description: 'Help new teammates and old hands find the policies, perks, and people they need.',
    links: [['✳', 'go/onboarding', 'New hire guide'], ['▥', 'go/benefits', 'Benefits hub'], ['◈', 'go/handbook', 'Team handbook']]
  },
  marketing: {
    label: 'MARKETING', title: 'Keep every launch in sync.',
    description: 'Put campaign plans, creative assets, and reporting in one easy-to-share stream.',
    links: [['▦', 'go/campaigns', 'Campaign calendar'], ['◈', 'go/assets', 'Creative assets'], ['▥', 'go/reports', 'Performance reports']]
  }
};

const teamTabs = document.querySelectorAll('.team-tab');
teamTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const team = teams[tab.dataset.team];
    teamTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    document.querySelector('#team-label').textContent = team.label;
    document.querySelector('#team-title').textContent = team.title;
    document.querySelector('#team-description').textContent = team.description;
    document.querySelector('#team-links').replaceChildren(...team.links.map(([icon, name, description], index) => {
      const row = document.createElement('div');
      row.className = 'team-link';
      const iconElement = document.createElement('span');
      iconElement.className = `team-link-icon ${index === 1 ? 'peach' : index === 2 ? 'blue' : ''}`;
      iconElement.textContent = icon;
      const text = document.createElement('span');
      const nameElement = document.createElement('b');
      nameElement.textContent = name;
      const descriptionElement = document.createElement('small');
      descriptionElement.textContent = description;
      text.append(nameElement, descriptionElement);
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      row.append(iconElement, text, arrow);
      return row;
    }));
  });
  tab.addEventListener('keydown', (event) => {
    const current = Array.from(teamTabs).indexOf(tab);
    const next = event.key === 'ArrowRight' ? (current + 1) % teamTabs.length
      : event.key === 'ArrowLeft' ? (current - 1 + teamTabs.length) % teamTabs.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? teamTabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    teamTabs[next].focus();
    teamTabs[next].click();
  });
});

const linkForm = document.querySelector('#link-form');
const previewResult = document.querySelector('#preview-result');
const resultLink = document.querySelector('#result-link');
const copyButton = document.querySelector('#copy-button');

linkForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!linkForm.reportValidity()) return;
  const destination = document.querySelector('#destination');
  const keyword = document.querySelector('#keyword');
  try {
    resultLink.textContent = createPreviewLink(destination.value, keyword.value);
  } catch (error) {
    const field = error.message.startsWith('Use 1–32') ? keyword : destination;
    field.setCustomValidity(error.message);
    field.reportValidity();
    return;
  }
  previewResult.hidden = false;
  copyButton.textContent = 'Copy';
});

document.querySelector('#destination').addEventListener('input', (event) => event.target.setCustomValidity(''));
document.querySelector('#keyword').addEventListener('input', (event) => event.target.setCustomValidity(''));

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultLink.textContent);
    copyButton.textContent = 'Copied!';
  } catch {
    copyButton.textContent = 'Select to copy';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(resultLink);
    selection.removeAllRanges();
    selection.addRange(range);
  }
});
import { createPreviewLink } from './preview.js';
