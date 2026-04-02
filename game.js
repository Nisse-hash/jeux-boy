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

// --- Rat Géant (Airtable) ---
const RAT = {
    name: 'Rat Géant', type: 'Bête', range: 1, maxHp: 4, armor: 0,
    description: 'Rongeur infâme des égouts, ses dents rongent jusqu\'à l\'os.',
    sprite: 'sprites/rat.png',
    dice: [{ label: 'Dé 1', faces: Array(6).fill({ name: 'Morsure', value: 3, type: 'physique', keywords: [] }) }]
};

// --- 4 Heroes (improvised for demo) ---
const HEROES = [
    {
        name: 'Aldric', type: 'Guerrier', range: 1, maxHp: 12, armor: 2,
        description: 'Vétéran des guerres du Nord, sa lame ne connaît pas la pitié.',
        sprite: 'sprites/warrior.png',
        dice: [
            { label: 'Dé A', faces: [
                { name: 'Frappe', value: 4, type: 'physique', keywords: [] },
                { name: 'Frappe', value: 3, type: 'physique', keywords: [] },
                { name: 'Taille', value: 5, type: 'physique', keywords: ['couple'] },
                { name: 'Parade', value: 3, type: 'defense', keywords: [] },
                { name: 'Frappe', value: 3, type: 'physique', keywords: [] },
                { name: 'Frappe', value: 2, type: 'physique', keywords: [] },
            ]},
            { label: 'Dé B', faces: [
                { name: 'Estoc', value: 5, type: 'physique', keywords: [] },
                { name: 'Parade', value: 2, type: 'defense', keywords: [] },
                { name: 'Frappe', value: 3, type: 'physique', keywords: [] },
                { name: 'Soin', value: 3, type: 'soin', keywords: [] },
                { name: 'Charge', value: 4, type: 'physique', keywords: ['etourdissement'] },
                { name: 'Frappe', value: 4, type: 'physique', keywords: [] },
            ]},
        ]
    },
    {
        name: 'Lyra', type: 'Mage', range: 3, maxHp: 8, armor: 0,
        description: 'Arcaniste errante, ses mains tissent la foudre et le gel.',
        sprite: 'sprites/mage.png',
        dice: [
            { label: 'Dé A', faces: [
                { name: 'Eclair', value: 4, type: 'electrique', keywords: [] },
                { name: 'Givre', value: 3, type: 'gel', keywords: [] },
                { name: 'Eclair', value: 3, type: 'electrique', keywords: [] },
                { name: 'Bouclier', value: 2, type: 'defense', keywords: [] },
                { name: 'Flamme', value: 5, type: 'feu', keywords: [] },
                { name: 'Givre', value: 2, type: 'gel', keywords: ['couple'] },
            ]},
            { label: 'Dé B', faces: [
                { name: 'Flamme', value: 4, type: 'feu', keywords: [] },
                { name: 'Soin', value: 3, type: 'soin', keywords: [] },
                { name: 'Eclair', value: 3, type: 'electrique', keywords: [] },
                { name: 'Flamme', value: 3, type: 'feu', keywords: [] },
                { name: 'Givre', value: 4, type: 'gel', keywords: [] },
                { name: 'Eclair', value: 2, type: 'electrique', keywords: [] },
            ]},
        ]
    },
    {
        name: 'Vex', type: 'Roublard', range: 2, maxHp: 8, armor: 1,
        description: 'Ombre parmi les ombres, son poignard frappe toujours dans le dos.',
        sprite: 'sprites/rogue.png',
        dice: [
            { label: 'Dé A', faces: [
                { name: 'Dague', value: 3, type: 'physique', keywords: [] },
                { name: 'Dague', value: 4, type: 'physique', keywords: ['cruel'] },
                { name: 'Poison', value: 3, type: 'poison', keywords: [] },
                { name: 'Esquive', value: 3, type: 'defense', keywords: [] },
                { name: 'Dague', value: 2, type: 'physique', keywords: [] },
                { name: 'Dague', value: 5, type: 'physique', keywords: [] },
            ]},
            { label: 'Dé B', faces: [
                { name: 'Poison', value: 4, type: 'poison', keywords: [] },
                { name: 'Dague', value: 3, type: 'physique', keywords: [] },
                { name: 'Esquive', value: 2, type: 'defense', keywords: [] },
                { name: 'Dague', value: 4, type: 'physique', keywords: [] },
                { name: 'Soin', value: 2, type: 'soin', keywords: [] },
                { name: 'Dague', value: 3, type: 'physique', keywords: ['couple'] },
            ]},
        ]
    },
    {
        name: 'Seraphine', type: 'Prêtre', range: 2, maxHp: 10, armor: 1,
        description: 'Servante de la lumière, ses prières repoussent les ténèbres.',
        sprite: 'sprites/priest.png',
        dice: [
            { label: 'Dé A', faces: [
                { name: 'Lumière', value: 3, type: 'magique', keywords: [] },
                { name: 'Soin', value: 4, type: 'soin', keywords: [] },
                { name: 'Lumière', value: 2, type: 'magique', keywords: [] },
                { name: 'Bouclier', value: 3, type: 'defense', keywords: [] },
                { name: 'Soin', value: 3, type: 'soin', keywords: [] },
                { name: 'Lumière', value: 4, type: 'magique', keywords: [] },
            ]},
            { label: 'Dé B', faces: [
                { name: 'Soin', value: 5, type: 'soin', keywords: [] },
                { name: 'Lumière', value: 3, type: 'magique', keywords: [] },
                { name: 'Bouclier', value: 2, type: 'defense', keywords: ['amis'] },
                { name: 'Soin', value: 2, type: 'soin', keywords: [] },
                { name: 'Lumière', value: 3, type: 'magique', keywords: [] },
                { name: 'Soin', value: 3, type: 'soin', keywords: [] },
            ]},
        ]
    }
];

// ===== STATE =====
let state = {
    turn: 0, phase: 'hero', activeHeroIdx: 0,
    enemies: [], heroes: [],
    diceResults: [], selectedDie: -1,
    selectedEntity: null, gameOver: false,
};

// ===== INIT =====
function initGame() {
    state = {
        turn: 1, phase: 'hero', activeHeroIdx: 0,
        enemies: [], heroes: [],
        diceResults: [], selectedDie: -1,
        selectedEntity: null, gameOver: false,
    };

    for (let i = 0; i < 5; i++) {
        state.enemies.push({ ...JSON.parse(JSON.stringify(RAT)), id: 'e' + i, hp: RAT.maxHp, tempArmor: 0, sprite: RAT.sprite });
    }

    HEROES.forEach((h, i) => {
        state.heroes.push({ ...JSON.parse(JSON.stringify(h)), id: 'h' + i, hp: h.maxHp, tempArmor: 0, sprite: h.sprite });
    });

    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('log-entries').innerHTML = '';

    spawnParticles();
    placeDecorations();
    render();
    log('Rencontre : Les Egouts Sombres', 'turn');
    log('5 Rats Géants surgissent de l\'obscurité !', 'info');
    updateTopBar();
}

// ===== RENDER =====
function render() {
    renderMap();
    renderDice();
    updateButtons();
    updateTopBar();
}

function renderMap() {
    ['slots-melee', 'slots-mixte', 'slots-distance', 'slots-heroes'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });

    state.enemies.forEach(e => {
        const slot = e.range === 1 ? 'slots-melee' : e.range === 2 ? 'slots-mixte' : 'slots-distance';
        document.getElementById(slot).appendChild(createToken(e, false));
    });

    state.heroes.forEach((h, i) => {
        const token = createToken(h, true);
        if (i === state.activeHeroIdx && state.phase === 'hero' && !state.gameOver) {
            token.classList.add('active-hero');
        }
        document.getElementById('slots-heroes').appendChild(token);
    });
}

function createToken(entity, isHero) {
    const t = document.createElement('div');
    t.className = `token ${isHero ? 'hero-token' : ''} ${entity.hp <= 0 ? 'dead' : ''}`;
    t.id = 'token-' + entity.id;

    if (state.selectedEntity && state.selectedEntity.id === entity.id) t.classList.add('selected');

    const armorVal = entity.tempArmor > 0 ? entity.tempArmor + entity.armor : entity.armor;
    t.innerHTML = `
        <img class="token-sprite" src="${entity.sprite}" alt="${entity.name}" draggable="false">
        <span class="token-name">${entity.name}</span>
        <div class="token-hp-bar"><div class="token-hp-fill" style="width:${(entity.hp/entity.maxHp)*100}%"></div></div>
        <div class="token-armor ${armorVal > 0 ? '' : 'hidden'}">${armorVal}</div>
    `;

    if (entity.hp > 0) {
        t.onclick = (ev) => { ev.stopPropagation(); onTokenClick(entity); };
    }
    t.addEventListener('mouseenter', (ev) => showHoverCard(entity, ev));
    t.addEventListener('mousemove', (ev) => moveHoverCard(ev));
    t.addEventListener('mouseleave', hideHoverCard);

    return t;
}

function renderDice() {
    const tray = document.getElementById('dice-tray');
    const phaseLabel = document.getElementById('dice-phase-label');
    tray.innerHTML = '';

    if (state.gameOver) {
        phaseLabel.textContent = 'Terminé';
        tray.innerHTML = '<span class="empty-msg">Combat terminé</span>';
        return;
    }

    if (state.phase === 'enemy') {
        phaseLabel.textContent = 'Ennemis...';
        tray.innerHTML = '<span class="empty-msg">Les ennemis attaquent...</span>';
        return;
    }

    const hero = state.heroes[state.activeHeroIdx];
    phaseLabel.textContent = hero ? hero.name : '';

    if (state.diceResults.length === 0) {
        tray.innerHTML = `<span class="empty-msg">🎲 ${hero ? hero.name : ''} - Lancez !</span>`;
        return;
    }

    state.diceResults.forEach((r, idx) => {
        const ft = FACE_TYPES[r.face.type] || { icon: '?', color: '#fff', label: '?' };
        const d = document.createElement('div');
        d.className = `die ${r.used ? 'used' : ''} ${state.selectedDie === idx ? 'selected-die' : ''}`;
        d.innerHTML = `
            <div class="die-label-tag">${r.label}</div>
            <div class="die-val" style="color:${ft.color}">${r.face.value}</div>
            <div class="die-name">${r.face.name}</div>
            <div class="die-type">${ft.icon}</div>
        `;
        if (!r.used && !state.gameOver) d.onclick = () => selectDie(idx);
        tray.appendChild(d);
    });
}

function updateButtons() {
    const rollBtn = document.getElementById('btn-roll');
    const endBtn = document.getElementById('btn-end-turn');
    const restartBtn = document.getElementById('btn-restart');

    if (state.gameOver) {
        rollBtn.style.display = 'none'; endBtn.style.display = 'none'; restartBtn.style.display = 'flex';
        return;
    }
    restartBtn.style.display = 'none';

    if (state.phase === 'hero') {
        if (state.diceResults.length === 0) {
            rollBtn.style.display = 'flex'; endBtn.style.display = 'none';
        } else {
            rollBtn.style.display = 'none'; endBtn.style.display = 'flex';
        }
    } else {
        rollBtn.style.display = 'none'; endBtn.style.display = 'none';
    }
}

function updateTopBar() {
    document.getElementById('turn-badge').textContent = `Tour ${state.turn}`;
    const pb = document.getElementById('phase-badge');
    if (state.phase === 'hero') {
        const h = state.heroes[state.activeHeroIdx];
        pb.textContent = h ? `${h.name} (${h.type})` : 'Phase Héros';
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
    if (state.selectedDie >= 0 && state.phase === 'hero') {
        const token = document.getElementById('token-' + entity.id);
        if (token && token.classList.contains('selectable-target')) {
            applyDie(entity);
            return;
        }
    }
    state.selectedEntity = entity;
    renderMap();
    renderDice();
}

// ===== DICE =====
function rollDice() {
    if (state.gameOver || state.phase !== 'hero') return;
    const hero = state.heroes[state.activeHeroIdx];
    if (!hero || hero.hp <= 0) { nextHero(); return; }

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
            return { dieIndex: i, faceIndex: fi, face: { ...die.faces[fi] }, used: false, label: die.label };
        });
        a1.textContent = state.diceResults[0].face.value;
        if (state.diceResults.length > 1) a2.textContent = state.diceResults[1].face.value;

        state.diceResults.forEach(r => {
            const ft = FACE_TYPES[r.face.type];
            log(`${hero.name} - ${r.label}: ${r.face.name} ${r.face.value} (${ft ? ft.label : r.face.type})`, 'info');
        });

        setTimeout(() => { overlay.classList.add('hidden'); render(); }, 500);
    }, 800);
}

function selectDie(idx) {
    if (state.diceResults[idx].used) return;
    state.selectedDie = idx;
    const face = state.diceResults[idx].face;

    document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable-target'));

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
    // Re-highlight after render
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

// ===== ATTACK ANIMATION =====
function animateAttack(attackerEl, targetEl, callback) {
    if (!attackerEl || !targetEl) { callback(); return; }

    const aRect = attackerEl.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();
    const dx = tRect.left - aRect.left;
    const dy = tRect.top - aRect.top;

    // Lunge toward target
    attackerEl.style.transition = 'transform 0.15s ease-in';
    attackerEl.style.transform = `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1.1)`;
    attackerEl.style.zIndex = '20';

    setTimeout(() => {
        // Snap back
        attackerEl.style.transition = 'transform 0.2s ease-out';
        attackerEl.style.transform = '';
        attackerEl.style.zIndex = '';
        callback();
    }, 180);
}

// ===== APPLY DIE =====
function applyDie(target) {
    const idx = state.selectedDie;
    if (idx < 0) return;
    const r = state.diceResults[idx];
    if (r.used) return;

    const face = r.face;
    const hero = state.heroes[state.activeHeroIdx];
    const heroToken = document.getElementById('token-' + hero.id);
    const targetToken = document.getElementById('token-' + target.id);

    const doApply = () => {
        if (face.type === 'defense') {
            target.tempArmor += face.value;
            log(`${target.name} gagne +${face.value} défense !`, 'defense');
            floatText(targetToken, `+${face.value} 🛡`, 'block');
            if (targetToken) targetToken.classList.add('healed');
        } else if (face.type === 'soin') {
            const healed = Math.min(face.value, target.maxHp - target.hp);
            target.hp += healed;
            log(`${target.name} récupère ${healed} PV !`, 'heal');
            floatText(targetToken, `+${healed} ❤`, 'heal');
            if (targetToken) targetToken.classList.add('healed');
        } else {
            dealDamage(target, face.value, face, targetToken);
            if (face.keywords.includes('couple')) {
                const alive = state.enemies.filter(e => e.hp > 0);
                const ti = alive.indexOf(target);
                if (ti >= 0 && ti < alive.length - 1) {
                    const adj = alive[ti + 1];
                    const adjToken = document.getElementById('token-' + adj.id);
                    dealDamage(adj, face.value, face, adjToken);
                    log(`Couple ! ${adj.name} subit aussi les dégâts !`, 'damage');
                }
            }
        }

        r.used = true;
        state.selectedDie = -1;
        document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable-target'));
        state.selectedEntity = target;
        render();
        setTimeout(() => {
            document.querySelectorAll('.token.hit, .token.healed').forEach(t => { t.classList.remove('hit', 'healed'); });
        }, 500);
        checkEnd();
    };

    // Attack animation for damage types
    if (face.type !== 'defense' && face.type !== 'soin') {
        animateAttack(heroToken, targetToken, doApply);
    } else {
        doApply();
    }
}

function dealDamage(target, rawDmg, face, tokenEl) {
    let dmg = rawDmg, blocked = 0;

    if (target.tempArmor > 0) {
        const b = Math.min(target.tempArmor, dmg); target.tempArmor -= b; blocked += b; dmg -= b;
    }
    if (target.armor > 0 && dmg > 0) {
        const b = Math.min(target.armor, dmg); blocked += b; dmg -= b;
    }
    target.hp = Math.max(0, target.hp - dmg);

    const msg = blocked > 0
        ? `${face.name} ${rawDmg} → ${target.name}: ${dmg} dégâts (${blocked} bloqués)`
        : `${face.name} ${rawDmg} → ${target.name}: ${dmg} dégâts !`;
    log(msg, 'damage');
    floatText(tokenEl, dmg > 0 ? `-${dmg}` : 'Bloqué', dmg > 0 ? 'damage' : 'block');
    if (tokenEl) { tokenEl.classList.add('hit'); if (dmg > 0) screenShake(); }
    if (target.hp <= 0) log(`☠ ${target.name} est vaincu !`, 'death');
}

// ===== HERO TURN FLOW =====
function endTurn() {
    const unused = state.diceResults.filter(d => !d.used);
    if (unused.length > 0) log(`${unused.length} dé(s) non utilisé(s).`, 'info');
    document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable-target'));
    nextHero();
}

function nextHero() {
    state.diceResults = [];
    state.selectedDie = -1;

    // Find next alive hero
    let next = state.activeHeroIdx + 1;
    while (next < state.heroes.length && state.heroes[next].hp <= 0) next++;

    if (next < state.heroes.length) {
        state.activeHeroIdx = next;
        log(`${state.heroes[next].name} se prépare...`, 'info');
        render();
    } else {
        // All heroes done, enemy turn
        enemyTurn();
    }
}

// ===== ENEMY TURN =====
function enemyTurn() {
    state.phase = 'enemy';
    render();

    const alive = state.enemies.filter(e => e.hp > 0);
    const aliveHeroes = state.heroes.filter(h => h.hp > 0);
    if (alive.length === 0 || aliveHeroes.length === 0) { checkEnd(); return; }

    log(`Tour ${state.turn} : Phase Ennemis`, 'turn');

    alive.forEach((enemy, i) => {
        setTimeout(() => {
            if (state.gameOver) return;
            const aliveH = state.heroes.filter(h => h.hp > 0);
            if (aliveH.length === 0) { checkEnd(); return; }

            // Pick random hero to attack
            const target = aliveH[Math.floor(Math.random() * aliveH.length)];
            const face = enemy.dice[0].faces[Math.floor(Math.random() * 6)];
            const enemyToken = document.getElementById('token-' + enemy.id);
            const heroToken = document.getElementById('token-' + target.id);

            if (enemyToken) enemyToken.classList.add('selected');
            state.selectedEntity = enemy;
            renderMap();

            log(`${enemy.name} attaque ${target.name} : ${face.name} ${face.value}`, 'info');

            animateAttack(enemyToken, heroToken, () => {
                dealDamage(target, face.value, face, heroToken);
                render();
            });

            setTimeout(() => {
                if (enemyToken) enemyToken.classList.remove('selected');
                document.querySelectorAll('.token.hit').forEach(t => t.classList.remove('hit'));

                if (i === alive.length - 1) {
                    setTimeout(() => {
                        if (state.heroes.every(h => h.hp <= 0)) { checkEnd(); return; }
                        // Next round
                        state.turn++;
                        state.phase = 'hero';
                        state.diceResults = [];
                        state.selectedDie = -1;
                        // Reset temp armor and find first alive hero
                        state.heroes.forEach(h => { h.tempArmor = 0; });
                        state.activeHeroIdx = state.heroes.findIndex(h => h.hp > 0);
                        if (state.activeHeroIdx < 0) { checkEnd(); return; }
                        log(`Tour ${state.turn} : Phase Héros`, 'turn');
                        render();
                    }, 400);
                }
            }, 400);
        }, 700 * (i + 1));
    });
}

// ===== GAME END =====
function checkEnd() {
    const aliveHeroes = state.heroes.filter(h => h.hp > 0);
    const aliveEnemies = state.enemies.filter(e => e.hp > 0);

    if (aliveEnemies.length === 0 && aliveHeroes.length > 0) {
        state.gameOver = true;
        log('VICTOIRE ! Tous les rats sont vaincus !', 'info');
        showGameOver('victory', 'Victoire !', `${aliveHeroes.length} héros survivent.`);
    } else if (aliveHeroes.length === 0) {
        state.gameOver = true;
        log('DEFAITE... Tous les héros sont tombés.', 'death');
        showGameOver('defeat', 'Défaite...', 'Le groupe a succombé aux rats.');
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

function restartGame() { initGame(); }

// ===== FX =====
function floatText(el, text, type) {
    if (!el) return;
    const f = document.createElement('div');
    f.className = `dmg-float ${type}`;
    f.textContent = text;
    f.style.left = '50%'; f.style.top = '0'; f.style.transform = 'translateX(-50%)';
    el.style.position = 'relative';
    el.appendChild(f);
    setTimeout(() => f.remove(), 1200);
}

function screenShake() {
    const map = document.getElementById('tactical-map');
    map.classList.add('screen-shake');
    setTimeout(() => map.classList.remove('screen-shake'), 300);
}

function spawnParticles() {
    const c = document.getElementById('particles');
    c.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (5 + Math.random() * 7) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        const s = (1 + Math.random() * 2) + 'px';
        p.style.width = s; p.style.height = s;
        c.appendChild(p);
    }
}

function placeDecorations() {
    const decor = document.getElementById('map-decor');
    decor.innerHTML = '';

    // Place torches on the walls
    const torchPositions = [
        { x: '5%', y: '8%' }, { x: '92%', y: '8%' },
        { x: '5%', y: '45%' }, { x: '92%', y: '45%' },
        { x: '5%', y: '75%' }, { x: '92%', y: '75%' },
    ];
    torchPositions.forEach(pos => {
        const img = document.createElement('img');
        img.src = 'sprites/torch.png';
        img.className = 'decor-sprite';
        img.style.left = pos.x; img.style.top = pos.y;
        img.style.width = '32px'; img.style.height = '32px';
        img.style.opacity = '0.7';
        img.style.filter = 'brightness(1.3)';
        decor.appendChild(img);
    });
}

// ===== HOVER CARD =====
let hoverCardEl = null;

function buildCardHTML(e) {
    const rl = RANGE_LABELS[e.range] || e.range;
    const arm = e.tempArmor > 0 ? `${e.armor}+${e.tempArmor}` : e.armor;
    let hearts = '';
    for (let i = 0; i < e.maxHp; i++) hearts += `<span class="hc-heart ${i < e.hp ? '' : 'empty'}">♥</span>`;

    let dice = '';
    e.dice.forEach(die => {
        dice += `<div class="hc-dice-label">${die.label}</div><div class="hc-dice-grid">`;
        die.faces.forEach(f => {
            const ft = FACE_TYPES[f.type] || { icon: '?', color: '#fff' };
            dice += `<div class="hc-face type-${f.type}"><span class="hc-face-val">${ft.icon}${f.value}</span><span class="hc-face-name">${f.name}</span></div>`;
        });
        dice += '</div>';
    });

    return `
        <div class="hc-header">
            <img class="hc-sprite" src="${e.sprite}" alt="${e.name}">
            <div><div class="hc-title">${e.name}</div><div class="hc-subtitle">${e.type} · ${rl}</div></div>
        </div>
        <div class="hc-desc">${e.description}</div>
        <div class="hc-hearts">${hearts}</div>
        <div class="hc-stats">
            <div class="hc-stat"><span class="hc-stat-label">PV</span><span class="hc-stat-val hp">${e.hp}/${e.maxHp}</span></div>
            <div class="hc-stat"><span class="hc-stat-label">Armure</span><span class="hc-stat-val armor">${arm}</span></div>
        </div>
        ${dice}
    `;
}

function showHoverCard(entity, ev) {
    if (!hoverCardEl) { hoverCardEl = document.createElement('div'); hoverCardEl.id = 'hover-card'; document.body.appendChild(hoverCardEl); }
    hoverCardEl.innerHTML = buildCardHTML(entity);
    hoverCardEl.classList.add('visible');
    positionHoverCard(ev);
}
function moveHoverCard(ev) { if (hoverCardEl && hoverCardEl.classList.contains('visible')) positionHoverCard(ev); }
function positionHoverCard(ev) {
    if (!hoverCardEl) return;
    const pad = 16, w = 240;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    const h = hoverCardEl.offsetHeight || 300;
    if (x + w > window.innerWidth) x = ev.clientX - w - pad;
    if (y + h > window.innerHeight) y = window.innerHeight - h - pad;
    if (y < 8) y = 8;
    hoverCardEl.style.left = x + 'px'; hoverCardEl.style.top = y + 'px';
}
function hideHoverCard() { if (hoverCardEl) hoverCardEl.classList.remove('visible'); }

// ===== START =====
document.addEventListener('DOMContentLoaded', initGame);
