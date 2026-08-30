/**
 * ==========================================================================
 * Lógica de la Aplicación: Mis Proyectos de GitHub
 * ==========================================================================
 */

// CONFIGURACIÓN DE USUARIO
const GITHUB_USER = 'rodrigoquezadab';

// LENGUAJES COLOR MAP (Colores Oficiales de GitHub)
const LANGUAGE_COLORS = {
    'javascript': '#f1e05a',
    'typescript': '#3178c6',
    'html': '#e34c26',
    'css': '#563d7c',
    'python': '#3572A5',
    'ruby': '#701516',
    'go': '#00ADD8',
    'c': '#555555',
    'c++': '#f34b7d',
    'c#': '#178600',
    'java': '#b07219',
    'php': '#4F5D95',
    'shell': '#89e051',
    'rust': '#dea584',
    'swift': '#F05138',
    'kotlin': '#A97BFF',
    'vue': '#41b883',
    'react': '#61dafb',
    'sass': '#a53b70',
    'dockerfile': '#384d54',
    'jupyter notebook': '#da5b0b',
    'r': '#198ce7'
};

// Variables de estado
let projects = [];
let profileInfo = {};

// Auxiliares para token de GitHub en localStorage
const getToken = () => localStorage.getItem('github_token') || '';
const setToken = (val) => localStorage.setItem('github_token', val);
const removeToken = () => localStorage.removeItem('github_token');

// Configuración de cabeceras seguras para peticiones de GitHub API
function getHeaders() {
    const token = getToken();
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }
    return headers;
}

// --------------------------------------------------------------------------
// MODAL DE CONFIGURACIÓN DE API
// --------------------------------------------------------------------------
const settingsModal = document.getElementById('settings-modal');
const tokenInput = document.getElementById('token-input');

function openSettings() {
    if (tokenInput) tokenInput.value = getToken();
    if (settingsModal) settingsModal.classList.remove('hidden');
}

function closeSettings() {
    if (settingsModal) settingsModal.classList.add('hidden');
}

// --------------------------------------------------------------------------
// SKELETON LOADERS
// --------------------------------------------------------------------------
function renderSkeletons() {
    const gridEl = document.getElementById('projects-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        card.className = "glass rounded-2xl p-5 sm:p-6 flex flex-col justify-between animate-pulse pointer-events-none";
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between gap-3 mb-4">
                    <div class="h-5 bg-slate-800/80 rounded-lg w-2/3"></div>
                    <div class="h-5 bg-slate-800/80 rounded-full w-14 flex-shrink-0"></div>
                </div>
                <div class="h-3.5 bg-slate-800/60 rounded-lg w-full mb-2"></div>
                <div class="h-3.5 bg-slate-800/60 rounded-lg w-11/12 mb-2"></div>
                <div class="h-3.5 bg-slate-800/60 rounded-lg w-3/4 mb-5"></div>
            </div>
            <div>
                <div class="flex gap-4 mb-4">
                    <div class="h-3.5 bg-slate-800/65 rounded-lg w-10"></div>
                    <div class="h-3.5 bg-slate-800/65 rounded-lg w-10"></div>
                </div>
                <div class="flex gap-2 pt-3.5 border-t border-slate-900">
                    <div class="h-9 bg-slate-800/80 rounded-xl flex-1"></div>
                    <div class="h-9 bg-slate-800/80 rounded-xl flex-1"></div>
                </div>
            </div>
        `;
        gridEl.appendChild(card);
    }
}

// --------------------------------------------------------------------------
// CONSULTA PRINCIPAL A LA API DE GITHUB
// --------------------------------------------------------------------------
async function fetchGitHubData() {
    const errorEl = document.getElementById('error-message');
    const emptyEl = document.getElementById('empty-state');
    const gridEl = document.getElementById('projects-grid');

    if (errorEl) errorEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (gridEl) gridEl.classList.remove('hidden');
    
    renderSkeletons();

    try {
        const [profileRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers: getHeaders() }),
            fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, { headers: getHeaders() })
        ]);

        if (profileRes.status === 403 || reposRes.status === 403) {
            const profileRemaining = profileRes.headers.get('x-ratelimit-remaining');
            const reposRemaining = reposRes.headers.get('x-ratelimit-remaining');
            if (profileRemaining === '0' || reposRemaining === '0') {
                throw new Error('RATE_LIMIT');
            }
        }

        if (!profileRes.ok || !reposRes.ok) {
            throw new Error('API_ERROR');
        }

        profileInfo = await profileRes.json();
        projects = await reposRes.json();

        updateProfileUI();
        populateLanguageFilter();
        filterAndRender();

    } catch (err) {
        console.error("Error al obtener datos de GitHub:", err);
        showErrorState(err.message);
    }
}

// --------------------------------------------------------------------------
// ACTUALIZACIÓN DE UI DEL PERFIL
// --------------------------------------------------------------------------
function updateProfileUI() {
    const avatarEl = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-name');
    const usernameEl = document.getElementById('profile-username');
    const bioEl = document.getElementById('profile-bio');
    const locationEl = document.getElementById('location-text');
    const followersEl = document.getElementById('followers-count');
    const githubLinkEl = document.getElementById('profile-github-link');
    const statReposEl = document.getElementById('stat-repos');
    const statStarsEl = document.getElementById('stat-stars');
    const statForksEl = document.getElementById('stat-forks');
    const statLangEl = document.getElementById('stat-lang');

    if (avatarEl) avatarEl.src = profileInfo.avatar_url;
    if (nameEl) nameEl.innerText = profileInfo.name || GITHUB_USER;
    if (usernameEl) usernameEl.innerText = `@${profileInfo.login}`;
    if (bioEl) bioEl.innerText = profileInfo.bio || 'Desarrollador de software apasionado.';
    if (locationEl) locationEl.innerText = profileInfo.location || 'Chile';
    if (followersEl) followersEl.innerText = `${profileInfo.followers} seguidores`;
    if (githubLinkEl) githubLinkEl.href = profileInfo.html_url;

    if (statReposEl) statReposEl.innerText = profileInfo.public_repos;

    let totalStars = 0;
    let totalForks = 0;
    const langCounts = {};

    projects.forEach(p => {
        totalStars += p.stargazers_count;
        totalForks += p.forks_count;
        if (p.language) {
            langCounts[p.language] = (langCounts[p.language] || 0) + 1;
        }
    });

    if (statStarsEl) statStarsEl.innerText = totalStars;
    if (statForksEl) statForksEl.innerText = totalForks;

    let mainLang = 'Ninguno';
    let maxCount = 0;
    for (const [lang, count] of Object.entries(langCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mainLang = lang;
        }
    }
    if (statLangEl) statLangEl.innerText = mainLang;
}

// --------------------------------------------------------------------------
// FILTRO DE LENGUAJES
// --------------------------------------------------------------------------
function populateLanguageFilter() {
    const filterSelect = document.getElementById('language-filter');
    if (!filterSelect) return;
    
    filterSelect.innerHTML = '<option value="all">Todos los lenguajes</option>';

    const languages = new Set();
    projects.forEach(p => {
        if (p.language) {
            languages.add(p.language);
        }
    });

    Array.from(languages).sort().forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.innerText = lang;
        filterSelect.appendChild(option);
    });
}

// --------------------------------------------------------------------------
// ESTADO DE ERROR Y LÍMITE DE API
// --------------------------------------------------------------------------
function showErrorState(type) {
    const errorEl = document.getElementById('error-message');
    const errorTitle = document.getElementById('error-title');
    const errorDesc = document.getElementById('error-description');
    const errorActions = document.getElementById('error-actions');
    const gridEl = document.getElementById('projects-grid');

    if (gridEl) gridEl.classList.add('hidden');
    if (errorEl) errorEl.classList.remove('hidden');

    if (type === 'RATE_LIMIT') {
        if (errorTitle) errorTitle.innerText = "Límite de API alcanzado";
        if (errorDesc) errorDesc.innerHTML = "Se ha superado el límite de consultas públicas de GitHub. Esto ocurre tras muchas recargas en una misma red. Puedes esperar un momento o registrar un <strong>Personal Access Token</strong> para solucionar el bloqueo inmediatamente.";
        if (errorActions) errorActions.classList.remove('hidden');
    } else {
        if (errorTitle) errorTitle.innerText = "Error al conectar";
        if (errorDesc) errorDesc.innerText = "Ocurrió un error al cargar la información de repositorios desde GitHub. Revisa tu conexión a internet o asegúrate de que el token es correcto.";
        if (errorActions) errorActions.classList.remove('hidden');
    }
}

// --------------------------------------------------------------------------
// FILTRADO, ORDENACIÓN Y RENDERIZADO DE PROYECTOS
// --------------------------------------------------------------------------
function filterAndRender() {
    const searchVal = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const selectedLang = document.getElementById('language-filter')?.value || 'all';
    const sortVal = document.getElementById('sort-select')?.value || 'updated';
    const onlyDemos = document.getElementById('demo-filter')?.checked || false;
    const includeForks = document.getElementById('fork-filter')?.checked || false;

    const gridEl = document.getElementById('projects-grid');
    const emptyEl = document.getElementById('empty-state');
    if (!gridEl || !emptyEl) return;

    let filtered = projects.filter(repo => {
        if (repo.fork && !includeForks) return false;

        const matchesSearch = repo.name.toLowerCase().includes(searchVal) ||
                             (repo.description && repo.description.toLowerCase().includes(searchVal));
        
        const matchesLang = selectedLang === 'all' || repo.language === selectedLang;
        const hasDemo = (repo.homepage && repo.homepage.trim() !== '') || repo.has_pages;
        const matchesDemo = !onlyDemos || hasDemo;

        return matchesSearch && matchesLang && matchesDemo;
    });

    filtered.sort((a, b) => {
        if (sortVal === 'stars') {
            return b.stargazers_count - a.stargazers_count;
        } else if (sortVal === 'forks') {
            return b.forks_count - a.forks_count;
        } else if (sortVal === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
    });

    gridEl.innerHTML = '';
    
    if (filtered.length === 0) {
        gridEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        return;
    }

    gridEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');

    filtered.forEach(repo => {
        const card = document.createElement('div');
        card.className = "glass glass-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between group";

        const demoUrl = repo.homepage || `https://${GITHUB_USER}.github.io/${repo.name}/`;
        const hasDemo = (repo.homepage && repo.homepage.trim() !== '') || repo.has_pages;

        const lastUpdated = new Date(repo.updated_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const langColor = LANGUAGE_COLORS[(repo.language || '').toLowerCase()] || '#94a3b8';

        card.innerHTML = `
            <div>
                <div class="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <h3 class="font-bold text-base sm:text-lg text-white group-hover:text-indigo-400 transition-colors truncate" title="${repo.name}">
                        ${repo.name}
                    </h3>
                    ${repo.language ? `
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 select-none flex-shrink-0">
                            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${langColor}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                </div>
                <p class="text-xs sm:text-sm text-slate-400 line-clamp-3 mb-4 sm:mb-5 leading-relaxed min-h-[3.5rem] sm:min-h-[4rem]">
                    ${repo.description || 'Sin descripción disponible en este repositorio.'}
                </p>
            </div>
            
            <div>
                <!-- Repo Stats -->
                <div class="flex items-center gap-3 text-xs text-slate-500 mb-3.5 sm:mb-4 select-none">
                    <span class="flex items-center gap-1" title="Estrellas">
                        <svg class="w-3.5 h-3.5 text-yellow-500/80" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        ${repo.stargazers_count}
                    </span>
                    <span class="flex items-center gap-1" title="Forks">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                        ${repo.forks_count}
                    </span>
                    ${repo.fork ? `
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20" title="Bifurcación">
                            Fork
                        </span>
                    ` : ''}
                    <span class="ml-auto text-[10px] text-slate-500">
                        Act. ${lastUpdated}
                    </span>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center gap-2 pt-3.5 sm:pt-4 border-t border-slate-900">
                    <!-- Code Source Link -->
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors py-2.5 rounded-xl active:scale-[0.98]">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                        </svg>
                        Código
                    </a>

                    <!-- Stats & Traffic Button -->
                    <button onclick="openStatsModal('${repo.name}')" class="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors py-2.5 px-3 rounded-xl active:scale-[0.98]" title="Estadísticas y tráfico de ${repo.name}">
                        <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span>Stats</span>
                    </button>

                    <!-- Demo App / Site Link -->
                    ${hasDemo ? `
                        <a href="${demoUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all py-2.5 rounded-xl active:scale-[0.98]">
                            Ver Demo
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                        </a>
                    ` : `
                        <button disabled class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-900/40 border border-slate-900 text-slate-600 py-2.5 rounded-xl cursor-not-allowed select-none">
                            Sin Demo
                        </button>
                    `}
                </div>
            </div>
        `;
        gridEl.appendChild(card);
    });
}

// --------------------------------------------------------------------------
// MODAL DE ESTADÍSTICAS Y TRÁFICO DEL REPOSITORIO
// --------------------------------------------------------------------------
const statsModal = document.getElementById('stats-modal');
const statsContent = document.getElementById('stats-modal-content');

function closeStatsModal() {
    if (statsModal) statsModal.classList.add('hidden');
}

async function openStatsModal(repoName) {
    const repo = projects.find(p => p.name === repoName) || { name: repoName };
    
    if (!statsModal || !statsContent) return;

    statsModal.classList.remove('hidden');
    statsContent.innerHTML = `
        <div class="animate-pulse space-y-6">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-800 rounded-xl"></div>
                <div class="space-y-2 flex-1">
                    <div class="h-6 bg-slate-800 rounded-lg w-1/3"></div>
                    <div class="h-4 bg-slate-800/60 rounded-lg w-2/3"></div>
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="h-20 bg-slate-800/60 rounded-xl"></div>
                <div class="h-20 bg-slate-800/60 rounded-xl"></div>
                <div class="h-20 bg-slate-800/60 rounded-xl"></div>
                <div class="h-20 bg-slate-800/60 rounded-xl"></div>
            </div>
            <div class="h-28 bg-slate-800/50 rounded-2xl"></div>
            <div class="h-32 bg-slate-800/50 rounded-2xl"></div>
        </div>
    `;

    try {
        const [viewsRes, clonesRes, referrersRes, pagesRes, langsRes, commitsRes] = await Promise.allSettled([
            fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/traffic/views`, { headers: getHeaders() }),
            fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/traffic/clones`, { headers: getHeaders() }),
            fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/traffic/popular/referrers`, { headers: getHeaders() }),
            fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/pages`, { headers: getHeaders() }),
            fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/languages`, { headers: getHeaders() }),
            fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/commits?per_page=1`, { headers: getHeaders() })
        ]);

        let trafficViews = null;
        let hasTrafficAccess = false;
        if (viewsRes.status === 'fulfilled' && viewsRes.value.ok) {
            trafficViews = await viewsRes.value.json();
            hasTrafficAccess = true;
        }

        let trafficClones = null;
        if (clonesRes.status === 'fulfilled' && clonesRes.value.ok) {
            trafficClones = await clonesRes.value.json();
        }

        let referrers = [];
        if (referrersRes.status === 'fulfilled' && referrersRes.value.ok) {
            referrers = await referrersRes.value.json();
        }

        let pagesInfo = null;
        if (pagesRes.status === 'fulfilled' && pagesRes.value.ok) {
            pagesInfo = await pagesRes.value.json();
        }

        let languagesData = {};
        if (langsRes.status === 'fulfilled' && langsRes.value.ok) {
            languagesData = await langsRes.value.json();
        }

        let latestCommit = null;
        if (commitsRes.status === 'fulfilled' && commitsRes.value.ok) {
            const commits = await commitsRes.value.json();
            if (Array.isArray(commits) && commits.length > 0) {
                latestCommit = commits[0];
            }
        }

        const totalBytes = Object.values(languagesData).reduce((acc, curr) => acc + curr, 0);
        const languageBreakdown = Object.entries(languagesData).map(([lang, bytes]) => ({
            lang,
            bytes,
            percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : 0,
            color: LANGUAGE_COLORS[lang.toLowerCase()] || '#94a3b8'
        })).sort((a, b) => b.bytes - a.bytes);

        const sizeFormatted = repo.size ? (repo.size > 1024 ? `${(repo.size / 1024).toFixed(1)} MB` : `${repo.size} KB`) : 'N/D';
        const createdDate = repo.created_at ? new Date(repo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/D';
        const pushedDate = repo.pushed_at ? new Date(repo.pushed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/D';

        const demoUrl = repo.homepage || `https://${GITHUB_USER}.github.io/${repo.name}/`;
        const hasDemo = (repo.homepage && repo.homepage.trim() !== '') || repo.has_pages || pagesInfo !== null;

        statsContent.innerHTML = `
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80 pr-8">
                <div>
                    <div class="flex items-center gap-2.5 flex-wrap">
                        <h3 class="text-xl sm:text-2xl font-black text-white">${repo.name}</h3>
                        ${repo.fork ? `<span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">Fork</span>` : ''}
                        ${repo.archived ? `<span class="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20">Archivado</span>` : ''}
                    </div>
                    <p class="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-xl">
                        ${repo.description || 'Sin descripción disponible.'}
                    </p>
                </div>
            </div>

            <div class="space-y-6 pt-4">

                <!-- SECCIÓN 1: TRÁFICO Y AUDIENCIA (14 DÍAS) -->
                <div>
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            Tráfico del Repositorio (Últimos 14 días)
                        </h4>
                        ${hasTrafficAccess ? `<span class="text-[10px] text-emerald-400 font-semibold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Datos en vivo</span>` : ''}
                    </div>

                    ${hasTrafficAccess ? `
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                            <div class="bg-slate-900/60 border border-slate-800/70 p-3 sm:p-4 rounded-xl">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vistas Totales</span>
                                <span class="text-xl sm:text-2xl font-black text-white block mt-0.5">${trafficViews?.count ?? 0}</span>
                                <span class="text-[10px] text-slate-500 mt-0.5 block">${trafficViews?.uniques ?? 0} visitantes únicos</span>
                            </div>
                            <div class="bg-slate-900/60 border border-slate-800/70 p-3 sm:p-4 rounded-xl">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clones Totales</span>
                                <span class="text-xl sm:text-2xl font-black text-white block mt-0.5">${trafficClones?.count ?? 0}</span>
                                <span class="text-[10px] text-slate-500 mt-0.5 block">${trafficClones?.uniques ?? 0} clonadores únicos</span>
                            </div>
                            <div class="bg-slate-900/60 border border-slate-800/70 p-3 sm:p-4 rounded-xl">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estrellas ⭐</span>
                                <span class="text-xl sm:text-2xl font-black text-white block mt-0.5">${repo.stargazers_count ?? 0}</span>
                                <span class="text-[10px] text-slate-500 mt-0.5 block">${repo.watchers_count ?? 0} observadores</span>
                            </div>
                            <div class="bg-slate-900/60 border border-slate-800/70 p-3 sm:p-4 rounded-xl">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Forks 🍴</span>
                                <span class="text-xl sm:text-2xl font-black text-white block mt-0.5">${repo.forks_count ?? 0}</span>
                                <span class="text-[10px] text-slate-500 mt-0.5 block">${repo.open_issues_count ?? 0} issues abiertas</span>
                            </div>
                        </div>

                        ${referrers.length > 0 ? `
                            <div class="mt-3 bg-slate-900/40 border border-slate-800/60 rounded-xl p-3">
                                <span class="text-[11px] font-bold text-slate-300 block mb-2">Fuentes de tráfico principales:</span>
                                <div class="flex flex-wrap gap-2">
                                    ${referrers.map(r => `
                                        <span class="text-xs bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
                                            <span class="font-medium text-white">${r.referrer}</span>
                                            <span class="text-[10px] text-indigo-400">(${r.count} vistas · ${r.uniques} únicos)</span>
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    ` : `
                        <div class="bg-slate-900/40 border border-indigo-500/20 rounded-2xl p-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="space-y-1">
                                <p class="text-xs font-semibold text-slate-200">
                                    🔒 Analítica de Tráfico Privada de GitHub
                                </p>
                                <p class="text-[11px] text-slate-400 leading-relaxed max-w-md">
                                    La API de GitHub restringe el conteo exacto de visitas y clones a propietarios autenticados. Configura tu Token con alcance <code class="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">repo</code> para desbloquear analítica en vivo.
                                </p>
                            </div>
                            <button onclick="closeStatsModal(); openSettings();" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex-shrink-0">
                                Configurar Token
                            </button>
                        </div>
                    `}
                </div>

                <!-- SECCIÓN 2: ESTADO DE GITHUB PAGES / WEB APP -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-3">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                        Estado de Despliegue Web / Pages
                    </h4>
                    <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full ${hasDemo ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
                                <span class="text-xs font-bold text-white">
                                    ${hasDemo ? 'Página Web / Demo Activa' : 'Sin despliegue web registrado'}
                                </span>
                                ${pagesInfo?.status ? `<span class="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-300">Build: ${pagesInfo.status}</span>` : ''}
                            </div>
                            ${hasDemo ? `
                                <a href="${demoUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-400 hover:text-indigo-300 underline break-all mt-1.5 inline-block">
                                    ${demoUrl}
                                </a>
                            ` : `
                                <p class="text-[11px] text-slate-500 mt-1">Este repositorio no tiene un sitio configurado en GitHub Pages ni homepage registrada.</p>
                            `}
                        </div>
                        ${hasDemo ? `
                            <a href="${demoUrl}" target="_blank" rel="noopener noreferrer" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors text-center whitespace-nowrap">
                                Abrir Demo 🚀
                            </a>
                        ` : ''}
                    </div>
                </div>

                <!-- SECCIÓN 3: COMPOSICIÓN DE LENGUAJES DE PROGRAMACIÓN -->
                ${languageBreakdown.length > 0 ? `
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                            </svg>
                            Composición de Lenguajes
                        </h4>
                        <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4">
                            <!-- Progress Bar -->
                            <div class="h-2.5 w-full bg-slate-800 rounded-full flex overflow-hidden mb-3">
                                ${languageBreakdown.map(l => `
                                    <div style="width: ${l.percentage}%; background-color: ${l.color};" title="${l.lang}: ${l.percentage}%" class="h-full"></div>
                                `).join('')}
                            </div>
                            <!-- Legend list -->
                            <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                ${languageBreakdown.map(l => `
                                    <span class="flex items-center gap-1.5 text-slate-300">
                                        <span class="w-2 h-2 rounded-full" style="background-color: ${l.color}"></span>
                                        <span class="font-medium">${l.lang}</span>
                                        <span class="text-slate-500 text-[11px]">${l.percentage}%</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- SECCIÓN 4: DETALLES Y ACTIVIDAD TÉCNICA -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-3">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Detalles Técnicos y Actividad
                    </h4>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                        <div class="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl">
                            <span class="text-slate-500 text-[10px] block">Tamaño del Código</span>
                            <span class="font-semibold text-slate-200">${sizeFormatted}</span>
                        </div>
                        <div class="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl">
                            <span class="text-slate-500 text-[10px] block">Rama Principal</span>
                            <span class="font-semibold text-slate-200">${repo.default_branch || 'main'}</span>
                        </div>
                        <div class="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl">
                            <span class="text-slate-500 text-[10px] block">Licencia</span>
                            <span class="font-semibold text-slate-200">${repo.license ? repo.license.name : 'No especificada'}</span>
                        </div>
                        <div class="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl">
                            <span class="text-slate-500 text-[10px] block">Fecha de Creación</span>
                            <span class="font-semibold text-slate-200">${createdDate}</span>
                        </div>
                        <div class="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl col-span-1 sm:col-span-2">
                            <span class="text-slate-500 text-[10px] block">Último Push</span>
                            <span class="font-semibold text-slate-200">${pushedDate}</span>
                        </div>
                    </div>

                    ${latestCommit ? `
                        <div class="mt-3 bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-400">
                            <svg class="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div class="min-w-0">
                                <span class="text-slate-300 font-medium block truncate">
                                    "${latestCommit.commit?.message || 'Última confirmación'}"
                                </span>
                                <span class="text-[11px] text-slate-500">
                                    Por ${latestCommit.commit?.author?.name || 'Autor'} · ${new Date(latestCommit.commit?.author?.date).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors">
                        Ver en GitHub &rarr;
                    </a>
                    <button onclick="closeStatsModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-colors">
                        Cerrar
                    </button>
                </div>

            </div>
        `;

    } catch (err) {
        console.error("Error cargando estadísticas detalladas:", err);
        statsContent.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h4 class="text-base font-bold text-white mb-1">No se pudieron cargar las estadísticas completas</h4>
                <p class="text-xs text-slate-400 mb-4 max-w-sm mx-auto">Comprueba tu conexión o si has alcanzado el límite de peticiones de GitHub.</p>
                <button onclick="closeStatsModal()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl transition-colors">
                    Cerrar
                </button>
            </div>
        `;
    }
}

// --------------------------------------------------------------------------
// REGISTRO DE EVENTOS (EVENT LISTENERS)
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Disparar la primera carga
    fetchGitHubData();

    // Inputs de filtrado
    document.getElementById('search-input')?.addEventListener('input', filterAndRender);
    document.getElementById('language-filter')?.addEventListener('change', filterAndRender);
    document.getElementById('sort-select')?.addEventListener('change', filterAndRender);
    document.getElementById('demo-filter')?.addEventListener('change', filterAndRender);
    document.getElementById('fork-filter')?.addEventListener('change', filterAndRender);

    // Control de Settings/Token
    document.getElementById('settings-btn')?.addEventListener('click', openSettings);
    document.getElementById('close-settings-btn')?.addEventListener('click', closeSettings);

    // Control de Modal de Estadísticas
    document.getElementById('close-stats-btn')?.addEventListener('click', closeStatsModal);
    
    // Cerrar modales al hacer clic afuera
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
        if (e.target === statsModal) {
            closeStatsModal();
        }
    });

    // Cerrar modales con tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSettings();
            closeStatsModal();
        }
    });

    // Acciones del modal de token
    document.getElementById('save-token-btn')?.addEventListener('click', () => {
        const tokenVal = tokenInput ? tokenInput.value.trim() : '';
        if (tokenVal) {
            setToken(tokenVal);
        } else {
            removeToken();
        }
        closeSettings();
        fetchGitHubData();
    });

    document.getElementById('clear-token-btn')?.addEventListener('click', () => {
        removeToken();
        if (tokenInput) tokenInput.value = '';
        closeSettings();
        fetchGitHubData();
    });
});
