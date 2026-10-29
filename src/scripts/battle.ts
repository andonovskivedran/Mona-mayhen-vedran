import { contributionDays, FALLBACK_COLORS, longestStreak, readHistory, shareText, USERNAME_PATTERN, winnerOf, type BattleRecord, type ContributionData } from '../lib/battle';
import { isContributionData } from '../lib/contributions';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>('battle-form');
const inputs = [$<HTMLInputElement>('player-one'), $<HTMLInputElement>('player-two')];
const button = $<HTMLButtonElement>('battle-button');
const status = $('battle-status');
const results = $('results');
const banner = $('winner-banner');
const overlay = $('countdown');
const shareButton = $<HTMLButtonElement>('share-button');
const soundButton = $<HTMLButtonElement>('sound-button');
const themeButton = $<HTMLButtonElement>('theme-button');
const historyList = $('history-list');
const historyKey = 'mona-mayhem:battles:v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let currentBattle: BattleRecord | null = null;
let busy = false;
let audio: AudioContext | null = null;
let muted = true;
let history: BattleRecord[] = [];
try { history = readHistory(localStorage.getItem(historyKey)); muted = localStorage.getItem('mona-mayhem:sound') !== 'on'; } catch { /* Storage can be unavailable in private browsers. */ }

function announce(message: string, error = false) {
  status.textContent = message;
  status.toggleAttribute('data-error', error);
  if (error) { status.classList.remove('shake'); void status.offsetWidth; status.classList.add('shake'); }
}
function sound(kind: 'coin' | 'power' | 'error') {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    void audio.resume().catch(() => {});
    const notes = kind === 'coin' ? [880, 1760] : kind === 'power' ? [523, 659, 784, 1047] : [180, 110, 55];
    notes.forEach((frequency, index) => {
      const oscillator = audio!.createOscillator();
      const gain = audio!.createGain();
      const start = audio!.currentTime + index * 0.09;
      oscillator.type = kind === 'error' ? 'sawtooth' : 'square';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.035, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      oscillator.connect(gain); gain.connect(audio!.destination);
      oscillator.start(start); oscillator.stop(start + 0.15);
    });
  } catch { /* Audio is optional. */ }
}
function updateSound() { soundButton.textContent = muted ? 'Sound: OFF' : 'Sound: ON'; soundButton.setAttribute('aria-pressed', String(!muted)); }
updateSound();
soundButton.addEventListener('click', () => {
  muted = !muted; updateSound();
  try { localStorage.setItem('mona-mayhem:sound', muted ? 'off' : 'on'); } catch { /* Optional preference. */ }
  sound('coin');
});
themeButton.addEventListener('click', () => {
  const alternate = document.documentElement.dataset.theme !== 'electric';
  document.documentElement.dataset.theme = alternate ? 'electric' : '';
  themeButton.setAttribute('aria-pressed', String(alternate));
  themeButton.textContent = alternate ? 'Theme: ELECTRIC' : 'Theme: CLASSIC';
});

function safeColor(colors: string[], level: number) {
  const color = colors[level];
  return typeof color === 'string' && /^#[\da-f]{6}$/i.test(color) ? color : FALLBACK_COLORS[level] ?? FALLBACK_COLORS[0];
}
function element(tag: string, className: string, text?: string) {
  const node = document.createElement(tag); node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function renderPlayer(id: string, username: string, data: ContributionData, bestStreak: number) {
  const card = $(id);
  const top = element('div', 'card-heading');
  const identity = element('a', 'player-link', `@${username}`) as HTMLAnchorElement;
  identity.href = `https://github.com/${encodeURIComponent(username)}`; identity.target = '_blank'; identity.rel = 'noreferrer';
  top.append(element('h2', '', username), identity);
  const total = element('p', 'contribution-total', data.total_contributions.toLocaleString());
  const label = element('p', 'eyebrow', 'CONTRIBUTIONS / LAST YEAR');
  const range = element('p', 'result-meta', `${data.from} → ${data.to}`);
  const grid = element('div', 'contribution-grid');
  grid.tabIndex = 0; grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', `${username}'s contribution calendar. Scroll horizontally to explore days.`);
  const tooltip = element('p', 'day-detail', 'Hover or tap a square to explore activity.');
  tooltip.id = `${id}-detail`;
  const days = contributionDays(data);
  days.forEach((day, index) => {
    const cell = element('span', 'contribution-day');
    cell.style.backgroundColor = safeColor(data.colors_full, day.level);
    cell.style.color = safeColor(data.colors_full, day.level);
    cell.style.gridRow = String(day.weekday + 1);
    cell.style.gridColumn = String(Math.floor((index + (days[0]?.weekday ?? 0)) / 7) + 1);
    cell.title = `${day.count} contributions on ${day.date}`;
    cell.setAttribute('aria-label', cell.title);
    cell.addEventListener('pointerenter', () => { tooltip.textContent = cell.title; });
    cell.addEventListener('click', () => { tooltip.textContent = cell.title; });
    grid.append(cell);
  });
  let activeDay = days.length - 1;
  grid.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    activeDay = event.key === 'Home' ? 0 : event.key === 'End' ? days.length - 1 : Math.max(0, Math.min(days.length - 1, activeDay + ({ArrowLeft:-7, ArrowRight:7, ArrowUp:-1, ArrowDown:1}[event.key] ?? 0)));
    const cell = grid.children[activeDay] as HTMLElement | undefined;
    if (cell) { tooltip.textContent = cell.title; cell.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  });
  grid.setAttribute('aria-describedby', tooltip.id);
  const legend = element('div', 'legend'); legend.setAttribute('aria-label', 'Contribution intensity: less to more');
  legend.append(element('span', '', 'Less'));
  for (let level = 0; level < 5; level++) { const swatch = element('span', 'contribution-day'); swatch.style.backgroundColor = safeColor(data.colors_full, level); legend.append(swatch); }
  legend.append(element('span', '', 'More'));
  const streak = longestStreak(data);
  const streakLabel = element('p', 'streak', `🔥 Longest streak: ${streak} ${streak === 1 ? 'day' : 'days'}${streak > 0 && streak === bestStreak ? ' · STREAK LEADER' : ''}`);
  card.replaceChildren(top, total, label, range, grid, tooltip, legend, streakLabel);
}

function renderHistory() {
  historyList.replaceChildren();
  $('clear-history').hidden = history.length === 0;
  if (!history.length) { historyList.append(element('p', 'empty-history', 'No battles yet. Your first matchup starts above.')); return; }
  history.forEach(record => {
    const row = element('li', 'history-row');
    const replay = element('button', 'history-replay', `${record.players[0]}  vs  ${record.players[1]}`) as HTMLButtonElement;
    replay.type = 'button'; replay.title = 'Load this matchup';
    replay.addEventListener('click', () => { if (busy) return; inputs.forEach((input, i) => { input.value = record.players[i]; }); form.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }); inputs[0].focus({ preventScroll: true }); announce('Matchup loaded. Press Battle to play again.'); });
    const time = element('time', 'history-time', new Date(record.timestamp).toLocaleString());
    time.setAttribute('datetime', new Date(record.timestamp).toISOString());
    row.append(replay, element('span', 'history-score', `${record.totals[0].toLocaleString()} : ${record.totals[1].toLocaleString()}`), element('span', 'history-winner', record.winner ? `${record.winner} wins` : 'Tie game'), time);
    historyList.append(row);
  });
}
renderHistory();
$('clear-history').addEventListener('click', () => { history = []; try { localStorage.removeItem(historyKey); } catch { /* Keep in-memory controls usable. */ } renderHistory(); announce('Battle history cleared.'); });

async function fetchPlayer(username: string, signal: AbortSignal): Promise<ContributionData> {
  const response = await fetch(`/api/contributions/${encodeURIComponent(username)}`, { signal });
  const body = await response.json();
  if (!response.ok) throw new Error(`${username}: ${typeof body.error === 'string' ? body.error : 'Unable to load contribution data.'}`);
  if (!isContributionData(body)) throw new Error('The contribution response could not be read. Please try again.');
  return body;
}
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function countdown() {
  if (reducedMotion.matches) return;
  overlay.hidden = false;
  for (const text of ['3', '2', '1', '⚡ FIGHT!']) { $('countdown-text').textContent = text; await pause(text.includes('FIGHT') ? 450 : 750); }
  overlay.hidden = true;
}
inputs.forEach(input => input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }));
form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  const players = inputs.map(input => input.value.trim()) as [string, string];
  let invalid = -1;
  inputs.forEach((input, index) => {
    const valid = USERNAME_PATTERN.test(players[index]);
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) { input.setAttribute('aria-describedby', 'battle-status'); if (invalid === -1) invalid = index; }
    else input.removeAttribute('aria-describedby');
  });
  if (invalid !== -1) { announce(players[invalid] ? `Player ${invalid + 1}: use a valid GitHub username (letters, numbers and single hyphens; up to 39 characters).` : `Enter a GitHub username for Player ${invalid + 1}.`, true); inputs[invalid].focus(); sound('error'); return; }
  busy = true; button.disabled = true; button.textContent = 'Loading…';
  form.setAttribute('aria-busy', 'true'); status.setAttribute('data-loading', '');
  results.hidden = true; banner.hidden = true; shareButton.hidden = true;
  $('share-fallback').hidden = true;
  announce('Connecting to GitHub. Preparing your battle…'); sound('coin');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const data = await Promise.all(players.map(player => fetchPlayer(player, controller.signal)));
    clearTimeout(timeout);
    await countdown();
    const bestStreak = Math.max(...data.map(longestStreak));
    renderPlayer('player-one-result', players[0], data[0], bestStreak);
    renderPlayer('player-two-result', players[1], data[1], bestStreak);
    const totals = data.map(item => item.total_contributions) as [number, number];
    const winner = winnerOf(players, totals);
    currentBattle = { players, totals, winner, timestamp: Date.now() };
    banner.textContent = winner ? `🏆 ${winner} WINS! 🏆` : "🤝 IT'S A TIE! 🤝";
    banner.hidden = false; results.hidden = false; shareButton.hidden = false;
    shareButton.textContent = 'Share Results';
    $('player-one-result').classList.toggle('is-winner', winner !== null && totals[0] > totals[1]);
    $('player-two-result').classList.toggle('is-winner', winner !== null && totals[1] > totals[0]);
    history = [currentBattle, ...history].slice(0, 10);
    try { localStorage.setItem(historyKey, JSON.stringify(history)); } catch { /* Results still work without storage. */ }
    renderHistory(); announce(winner ? `Battle complete. ${winner} wins!` : 'Battle complete. It’s a tie!'); sound('power');
  } catch (error) {
    controller.abort();
    announce(error instanceof Error && error.name !== 'AbortError' ? error.message : 'The request timed out. Please try your battle again.', true); sound('error');
  } finally {
    clearTimeout(timeout); overlay.hidden = true; busy = false; button.disabled = false; button.textContent = '⚡ Battle!';
    form.removeAttribute('aria-busy'); status.removeAttribute('data-loading');
  }
});
shareButton.addEventListener('click', async () => {
  if (!currentBattle) return;
  const text = `${shareText(currentBattle)}\n${location.origin}${location.pathname}`;
  try { await navigator.clipboard.writeText(text); shareButton.textContent = 'Copied!'; announce('Battle results copied to clipboard.'); }
  catch { $('share-fallback').hidden = false; const fallback = $<HTMLTextAreaElement>('share-text'); fallback.value = text; fallback.focus(); fallback.select(); announce('Copy the selected battle summary to share it.'); }
});
$('demo-button').addEventListener('click', () => { if (busy) return; inputs[0].value = 'octocat'; inputs[1].value = 'torvalds'; form.requestSubmit(); });
