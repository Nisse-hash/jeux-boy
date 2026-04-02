// ===== DATA =====
const FACE_TYPES = {
    physique: { label: 'Physique', icon: '⚔', color: '#e08040' },
    feu: { label: 'Feu', icon: '🔥', color: '#e05040' },
    poison: { label: 'Poison', icon: '☠', color: '#50c050' },
    gel: { label: 'Gel', icon: '❄', color: '#50b0e0' },
    defense: { label: 'Défense', icon: '🛡', color: '#6090d0' },
    soin: { label: 'Soin', icon: '❤', color: '#e06080' },
    electrique: { label: 'Elec', icon: '⚡', color: '#e0d040' },
    ombre: { label: 'Ombre', icon: '👁', color: '#8060a0' },
    magique: { label: 'Magique', icon: '✦', color: '#b060e0' },
    invocation: { label: 'Invoc', icon: '⊛', color: '#d09040' },
};

const RANGE_LABELS = { 1: 'Mélée', 2: 'Mixte', 3: 'Distance' };

// --- Rat Géant (from Airtable) ---
const RAT_TEMPLATE = {
    name: 'Rat Géant',
    type: 'Bête',
    description: 'Rongeur infâme des égouts, ses dents rongent jusqu\'à l\'os. Ils attaquent en meute, visant les chevilles et les tendons.',
    range: 1,
    maxHp: 4,
    armor: 0,
    emoji: '🐀',
    dice: [{
        label: 'Dé 1',
        faces: [
            { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
            { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
            { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
            { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
            { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
            { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
        ]
    }]
};

// --- Hero: Guerrier (improvised) ---
const HERO_TEMPLATE = {
    name: 'Aldric',
    type: 'Guerrier',
    description: 'Vétéran des guerres du Nord, sa lame ne connaît pas la pitié. Chaque cicatrice est une leçon apprise dans le sang.',
    range: 1,
    maxHp: 12,
    armor: 2,
    emoji: '⚔️',
    dice: [
        {
            label: 'Dé A',
            faces: [
                { name: 'Frappe', value: 4, type: 'physique', keywords: [] },
                { name: 'Frappe', value: 3, type: 'physique', keywords: [] },
                { name: 'Taille', value: 5, type: 'physique', keywords: ['couple'] },
                { name: 'Parade', value: 3, type: 'defense', keywords: [] },
                { name: 'Frappe', value: 3, type: 'physique', keywords: [] },
                { name: 'Frappe', value: 2, type: 'physique', keywords: [] },
            ]
        },
        {
            label: 'Dé B',
            faces: [
                { name: 'Estoc', value: 5, type: 'physique', keywords: [] },
                { name: 'Parade', value: 2, type: 'defense', keywords: [] },
                { name: 'Frappe', value: 3, type: 'physique', keywords: [] },
                { name: 'Soin', value: 3, type: 'soin', keywords: [] },
                { name: 'Charge', value: 4, type: 'physique', keywords: ['etourdissement'] },
                { name: 'Frappe', value: 4, type: 'physique', keywords: [] },
            ]
        }
    ]
};

// ===== STATE =====
let state = {
    turn: 0,
    phase: 'hero',
    enemies: [],
    heroes: [],
    diceResults: [],
    selectedDie: -1,
    selectedEntity: null,
    gameOver: false,
};

// ===== INIT =====
function initGame() {
    state = {
        turn: 1,
        phase: 'hero',
        enemies: [],
        heroes: [],
        diceResults: [],
        selectedDie: -1,
        selectedEntity: null,
        gameOver: false,
    };

    for (let i = 0; i < 5; i++) {
        state.enemies.push({
            ...JSON.parse(JSON.stringify(RAT_TEMPLATE)),
            id: 'e' + i,
            hp: RAT_TEMPLATE.maxHp,
            tempArmor: 0,
        });
    }

    state.heroes.push({
        ...JSON.parse(JSON.stringify(HERO_TEMPLATE)),
        id: 'h0',
        hp: HERO_TEMPLATE.maxHp,
        tempArmor: 0,
    });

    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('log-entries').innerHTML = '';

    spawnParticles();
    render();
    log('Rencontre : Les Egouts Sombres', 'turn');
    log('5 Rats Géants surgissent de l\'obscurité !', 'info');
    updateTopBar();
}

// ===== RENDER =====
function render() {
    renderMap();
    renderDice();
    renderDetail();
    updateButtons();
}

function renderMap() {
    const meleeSlots = document.getElementById('slots-melee');
    const mixteSlots = document.getElementById('slots-mixte');
    const distSlots = document.getElementById('slots-distance');
    const heroSlots = document.getElementById('slots-heroes');

    meleeSlots.innerHTML = '';
    mixteSlots.innerHTML = '';
    distSlots.innerHTML = '';
    heroSlots.innerHTML = '';

    // Place enemies in their range zone
    state.enemies.forEach(e => {
        const token = createToken(e, false);
        if (e.range === 1) meleeSlots.appendChild(token);
        else if (e.range === 2) mixteSlots.appendChild(token);
        else distSlots.appendChild(token);
    });

    // Place heroes
    state.heroes.forEach(h => {
        heroSlots.appendChild(createToken(h, true));
    });
}

function createToken(entity, isHero) {
    const t = document.createElement('div');
    t.className = `token ${isHero ? 'hero-token' : ''} ${entity.hp <= 0 ? 'dead' : ''}`;
    t.id = 'token-' + entity.id;

    if (state.selectedEntity && state.selectedEntity.id === entity.id) {
        t.classList.add('selected');
    }

    const armorVal = entity.tempArmor > 0 ? entity.tempArmor : entity.armor;

    t.innerHTML = `
        <span class="token-emoji">${entity.emoji}</span>
        <span class="token-name">${entity.name}</span>
        <div class="token-hp-bar">
            <div class="token-hp-fill" style="width: ${(entity.hp / entity.maxHp) * 100}%"></div>
        </div>
        <div class="token-armor ${armorVal > 0 ? '' : 'hidden'}">${armorVal}</div>
    `;

    if (entity.hp > 0) {
        t.onclick = (ev) => {
            ev.stopPropagation();
            onTokenClick(entity);
        };
    }

    return t;
}

function renderDetail() {
    const placeholder = document.getElementById('detail-placeholder');
    const content = document.getElementById('detail-content');

    if (!state.selectedEntity) {
        placeholder.classList.remove('hidden');
        content.classList.add('hidden');
        return;
    }

    placeholder.classList.add('hidden');
    content.classList.remove('hidden');

    const e = state.selectedEntity;
    const rangeLabel = RANGE_LABELS[e.range] || e.range;
    const armorDisplay = e.tempArmor > 0 ? `${e.armor} (+${e.tempArmor})` : e.armor;

    let heartsHTML = '';
    for (let i = 0; i < e.maxHp; i++) {
        heartsHTML += `<span class="detail-heart ${i < e.hp ? '' : 'empty'}">♥</span>`;
    }

    let diceHTML = '';
    e.dice.forEach(die => {
        diceHTML += `<div class="detail-dice-title">${die.label}</div><div class="detail-dice-grid">`;
        die.faces.forEach(f => {
            const ft = FACE_TYPES[f.type] || { icon: '?', color: '#fff' };
            const kw = f.keywords.length > 0 ? `\n[${f.keywords.join(', ')}]` : '';
            diceHTML += `
                <div class="detail-face type-${f.type}" title="${f.name} ${f.value} ${f.type}${kw}">
                    <span class="face-val">${ft.icon}${f.value}</span>
                    <span class="face-name">${f.name}</span>
                </div>`;
        });
        diceHTML += '</div>';
    });

    content.innerHTML = `
        <div class="detail-header">
            <span class="detail-emoji">${e.emoji}</span>
            <div>
                <div class="detail-title">${e.name}</div>
                <div class="detail-subtitle">${e.type} · ${rangeLabel}</div>
            </div>
        </div>
        <div class="detail-desc">${e.description}</div>
        <div class="detail-hearts">${heartsHTML}</div>
        <div class="detail-stats">
            <div class="stat-box">
                <div class="stat-label">PV</div>
                <div class="stat-value hp">${e.hp} / ${e.maxHp}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Armure</div>
                <div class="stat-value armor">${armorDisplay}</div>
            </div>
        </div>
        ${diceHTML}
    `;
}

function renderDice() {
    const tray = document.getElementById('dice-tray');
    tray.innerHTML = '';

    if (state.diceResults.length === 0) {
        tray.innerHTML = '<span class="empty-msg">Lancez les dés pour agir...</span>';
        return;
    }

    state.diceResults.forEach((r, idx) => {
        const d = document.createElement('div');
        const ft = FACE_TYPES[r.face.type] || { icon: '?', color: '#fff', label: '?' };
        d.className = `die ${r.used ? 'used' : ''} ${state.selectedDie === idx ? 'selected-die' : ''}`;

        d.innerHTML = `
            <div class="die-label-tag">${r.label}</div>
            <div class="die-val" style="color:${ft.color}">${r.face.value}</div>
            <div class="die-name">${r.face.name}</div>
            <div class="die-type">${ft.icon}</div>
        `;

        if (!r.used && state.phase === 'hero' && !state.gameOver) {
            d.onclick = () => selectDie(idx);
        }

        tray.appendChild(d);
    });
}

function updateButtons() {
    const rollBtn = document.getElementById('btn-roll');
    const endBtn = document.getElementById('btn-end-turn');
    const restartBtn = document.getElementById('btn-restart');

    if (state.gameOver) {
        rollBtn.style.display = 'none';
        endBtn.style.display = 'none';
        restartBtn.style.display = 'flex';
        return;
    }

    restartBtn.style.display = 'none';

    if (state.phase === 'hero') {
        if (state.diceResults.length === 0) {
            rollBtn.style.display = 'flex';
            endBtn.style.display = 'none';
        } else {
            rollBtn.style.display = 'none';
            endBtn.style.display = 'flex';
        }
    } else {
        rollBtn.style.display = 'none';
        endBtn.style.display = 'none';
    }
}

function updateTopBar() {
    document.getElementById('turn-badge').textContent = `Tour ${state.turn}`;
    const pb = document.getElementById('phase-badge');
    if (state.phase === 'hero') {
        pb.textContent = 'Phase Héros';
        pb.classList.remove('enemy-phase');
    } else {
        pb.textContent = 'Phase Ennemis';
        pb.classList.add('enemy-phase');
    }
}

// ===== LOG =====
function log(text, type = '') {
    const el = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = text;
    el.appendChild(entry);
    el.scrollTop = el.scrollHeight;
}

// ===== TOKEN CLICK =====
function onTokenClick(entity) {
    // If a die is selected, try to apply it
    if (state.selectedDie >= 0 && state.phase === 'hero') {
        const token = document.getElementById('token-' + entity.id);
        if (token && token.classList.contains('selectable-target')) {
            applyDie(entity);
            return;
        }
    }

    // Otherwise, just select to view details
    state.selectedEntity = entity;
    render();
}

// ===== DICE =====
function rollDice() {
    if (state.gameOver || state.phase !== 'hero') return;

    const hero = state.heroes[0];
    const overlay = document.getElementById('dice-overlay');
    const a1 = document.getElementById('dice-anim-1');
    const a2 = document.getElementById('dice-anim-2');

    overlay.classList.remove('hidden');
    a2.style.display = hero.dice.length > 1 ? 'flex' : 'none';

    const tick = setInterval(() => {
        a1.textContent = Math.floor(Math.random() * 6) + 1;
        if (hero.dice.length > 1) a2.textContent = Math.floor(Math.random() * 6) + 1;
    }, 70);

    setTimeout(() => {
        clearInterval(tick);

        state.diceResults = hero.dice.map((die, i) => {
            const fi = Math.floor(Math.random() * 6);
            return {
                dieIndex: i,
                faceIndex: fi,
                face: { ...die.faces[fi] },
                used: false,
                label: die.label,
            };
        });

        a1.textContent = state.diceResults[0].face.value;
        if (state.diceResults.length > 1) a2.textContent = state.diceResults[1].face.value;

        state.diceResults.forEach(r => {
            const ft = FACE_TYPES[r.face.type];
            log(`${r.label}: ${r.face.name} ${r.face.value} (${ft ? ft.label : r.face.type})`, 'info');
        });

        setTimeout(() => {
            overlay.classList.add('hidden');
            render();
        }, 500);
    }, 900);
}

function selectDie(idx) {
    if (state.diceResults[idx].used) return;

    state.selectedDie = idx;
    const face = state.diceResults[idx].face;

    // Clear all target highlights
    document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable-target'));

    // Highlight valid targets
    if (face.type === 'defense' || face.type === 'soin') {
        state.heroes.filter(h => h.hp > 0).forEach(h => {
            const el = document.getElementById('token-' + h.id);
            if (el) el.classList.add('selectable-target');
        });
    } else {
        state.enemies.filter(e => e.hp > 0).forEach(e => {
            const el = document.getElementById('token-' + e.id);
            if (el) el.classList.add('selectable-target');
        });
    }

    render();
    // Re-apply target highlights after render
    setTimeout(() => {
        if (face.type === 'defense' || face.type === 'soin') {
            state.heroes.filter(h => h.hp > 0).forEach(h => {
                const el = document.getElementById('token-' + h.id);
                if (el) el.classList.add('selectable-target');
            });
        } else {
            state.enemies.filter(e => e.hp > 0).forEach(e => {
                const el = document.getElementById('token-' + e.id);
                if (el) el.classList.add('selectable-target');
            });
        }
    }, 10);
}

// ===== APPLY DIE =====
function applyDie(target) {
    const idx = state.selectedDie;
    if (idx < 0) return;
    const r = state.diceResults[idx];
    if (r.used) return;

    const face = r.face;
    const token = document.getElementById('token-' + target.id);

    if (face.type === 'defense') {
        target.tempArmor += face.value;
        log(`${target.name} gagne +${face.value} défense !`, 'defense');
        floatText(token, `+${face.value} 🛡`, 'block');
        if (token) token.classList.add('healed');
    } else if (face.type === 'soin') {
        const healed = Math.min(face.value, target.maxHp - target.hp);
        target.hp += healed;
        log(`${target.name} récupère ${healed} PV !`, 'heal');
        floatText(token, `+${healed} ❤`, 'heal');
        if (token) token.classList.add('healed');
    } else {
        dealDamage(target, face.value, face, token);

        // Couple keyword
        if (face.keywords.includes('couple')) {
            const alive = state.enemies.filter(e => e.hp > 0);
            const tIdx = alive.indexOf(target);
            if (tIdx >= 0 && tIdx < alive.length - 1) {
                const adj = alive[tIdx + 1];
                const adjToken = document.getElementById('token-' + adj.id);
                dealDamage(adj, face.value, face, adjToken);
                log(`Couple ! ${adj.name} subit aussi les dégâts !`, 'damage');
            }
        }
    }

    r.used = true;
    state.selectedDie = -1;
    document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable-target'));

    // Select the target for detail view
    state.selectedEntity = target;
    render();

    // Remove animation classes
    setTimeout(() => {
        document.querySelectorAll('.token.hit, .token.healed').forEach(t => {
            t.classList.remove('hit', 'healed');
        });
    }, 500);

    checkEnd();
}

function dealDamage(target, rawDmg, face, tokenEl) {
    let dmg = rawDmg;
    let blocked = 0;

    if (target.tempArmor > 0) {
        const b = Math.min(target.tempArmor, dmg);
        target.tempArmor -= b;
        blocked += b;
        dmg -= b;
    }
    if (target.armor > 0 && dmg > 0) {
        const b = Math.min(target.armor, dmg);
        blocked += b;
        dmg -= b;
    }

    target.hp = Math.max(0, target.hp - dmg);

    const logMsg = blocked > 0
        ? `${face.name} ${rawDmg} → ${target.name}: ${dmg} dégâts (${blocked} bloqués)`
        : `${face.name} ${rawDmg} → ${target.name}: ${dmg} dégâts !`;
    log(logMsg, 'damage');

    floatText(tokenEl, dmg > 0 ? `-${dmg}` : 'Bloqué', dmg > 0 ? 'damage' : 'block');

    if (tokenEl) {
        tokenEl.classList.add('hit');
        if (dmg > 0) screenShake();
    }

    if (target.hp <= 0) {
        log(`☠ ${target.name} est vaincu !`, 'death');
    }
}

// ===== ENEMY TURN =====
function enemyTurn() {
    state.phase = 'enemy';
    updateTopBar();
    render();

    const alive = state.enemies.filter(e => e.hp > 0);
    const hero = state.heroes[0];
    if (alive.length === 0 || hero.hp <= 0) { checkEnd(); return; }

    log(`Tour ${state.turn} : Phase Ennemis`, 'turn');

    alive.forEach((enemy, i) => {
        setTimeout(() => {
            if (hero.hp <= 0 || state.gameOver) return;

            const die = enemy.dice[0];
            const face = die.faces[Math.floor(Math.random() * 6)];
            const enemyToken = document.getElementById('token-' + enemy.id);
            const heroToken = document.getElementById('token-' + hero.id);

            // Flash enemy
            if (enemyToken) {
                enemyToken.classList.add('selected');
                state.selectedEntity = enemy;
                renderDetail();
            }

            log(`${enemy.name} attaque : ${face.name} ${face.value}`, 'info');
            dealDamage(hero, face.value, face, heroToken);
            render();

            setTimeout(() => {
                if (enemyToken) enemyToken.classList.remove('selected');
                document.querySelectorAll('.token.hit').forEach(t => t.classList.remove('hit'));

                // Last enemy done?
                if (i === alive.length - 1) {
                    setTimeout(() => {
                        if (hero.hp <= 0) { checkEnd(); return; }
                        state.turn++;
                        state.phase = 'hero';
                        state.diceResults = [];
                        state.selectedDie = -1;
                        hero.tempArmor = 0;
                        state.selectedEntity = hero;
                        log(`Tour ${state.turn} : Phase Héros`, 'turn');
                        updateTopBar();
                        render();
                    }, 400);
                }
            }, 350);
        }, 600 * (i + 1));
    });
}

function endTurn() {
    const unused = state.diceResults.filter(d => !d.used);
    if (unused.length > 0) log(`${unused.length} dé(s) non utilisé(s).`, 'info');
    document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable-target'));
    enemyTurn();
}

// ===== GAME END =====
function checkEnd() {
    const hero = state.heroes[0];
    const alive = state.enemies.filter(e => e.hp > 0);

    if (alive.length === 0 && hero.hp > 0) {
        state.gameOver = true;
        log('VICTOIRE ! Tous les rats sont vaincus !', 'info');
        showGameOver('victory', 'Victoire !', `${hero.name} survit avec ${hero.hp} PV.`);
    } else if (hero.hp <= 0) {
        state.gameOver = true;
        log('DEFAITE... Le héros est tombé.', 'death');
        showGameOver('defeat', 'Défaite...', `${hero.name} a succombé aux rats.`);
    }
    render();
}

function showGameOver(type, title, sub) {
    const overlay = document.getElementById('game-over-overlay');
    const content = document.getElementById('game-over-content');
    overlay.classList.remove('hidden');
    content.className = type;
    content.innerHTML = `<h2>${title}</h2><p>${sub}</p>`;
}

function restartGame() {
    initGame();
}

// ===== FX =====
function floatText(tokenEl, text, type) {
    if (!tokenEl) return;
    const f = document.createElement('div');
    f.className = `dmg-float ${type}`;
    f.textContent = text;
    f.style.left = '50%';
    f.style.top = '0';
    f.style.transform = 'translateX(-50%)';
    tokenEl.style.position = 'relative';
    tokenEl.appendChild(f);
    setTimeout(() => f.remove(), 1200);
}

function screenShake() {
    const map = document.getElementById('tactical-map');
    map.classList.add('screen-shake');
    setTimeout(() => map.classList.remove('screen-shake'), 300);
}

function spawnParticles() {
    const container = document.getElementById('particles');
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (4 + Math.random() * 6) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.width = (1 + Math.random() * 2) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}

// ===== START =====
document.addEventListener('DOMContentLoaded', initGame);
