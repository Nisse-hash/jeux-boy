// ===== GAME DATA (from Airtable) =====

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

// Rat Géant - from Airtable: Bête, Mélée, PV 4, Armure 0, all 6 faces = Morsure 3
const RAT_TEMPLATE = {
    name: 'Rat Géant',
    type: 'Bête',
    description: 'Rongeur infâme des égouts, ses dents rongent jusqu\'à l\'os.',
    range: 1, // Mélée
    maxHp: 4,
    armor: 0,
    effect: '',
    emoji: '🐀',
    dice: [
        {
            faces: [
                { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
                { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
                { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
                { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
                { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
                { name: 'Morsure', value: 3, type: 'physique', keywords: [] },
            ]
        }
    ]
};

// Improvised Hero: Guerrier
const HERO_TEMPLATE = {
    name: 'Aldric',
    type: 'Guerrier',
    description: 'Vétéran des guerres du Nord, sa lame ne connaît pas la pitié.',
    range: 1,
    maxHp: 12,
    armor: 2,
    effect: '',
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

// ===== GAME STATE =====
let gameState = {
    turn: 0,
    phase: 'hero', // 'hero' or 'enemy'
    enemies: [],
    heroes: [],
    currentDiceResults: [],
    selectedDieIndex: -1,
    gameOver: false,
};

// ===== INIT =====
function initGame() {
    gameState.turn = 1;
    gameState.phase = 'hero';
    gameState.gameOver = false;
    gameState.currentDiceResults = [];
    gameState.selectedDieIndex = -1;

    // Create 5 rats
    gameState.enemies = [];
    for (let i = 0; i < 5; i++) {
        gameState.enemies.push({
            ...JSON.parse(JSON.stringify(RAT_TEMPLATE)),
            id: 'enemy_' + i,
            hp: RAT_TEMPLATE.maxHp,
            currentArmor: 0,
            stunned: false,
        });
    }

    // Create hero
    gameState.heroes = [{
        ...JSON.parse(JSON.stringify(HERO_TEMPLATE)),
        id: 'hero_0',
        hp: HERO_TEMPLATE.maxHp,
        currentArmor: 0,
        stunned: false,
    }];

    render();
    addLog('--- Rencontre: Les Egouts Sombres ---', 'turn');
    addLog('5 Rats Géants surgissent de l\'obscurité !', 'info');
    updateTurnInfo();
}

// ===== RENDERING =====
function render() {
    renderEnemies();
    renderHeroes();
    renderDice();
    updateButtons();
}

function renderEnemies() {
    const container = document.getElementById('enemy-cards');
    container.innerHTML = '';
    gameState.enemies.forEach((enemy, idx) => {
        container.appendChild(createCard(enemy, idx, false));
    });
}

function renderHeroes() {
    const container = document.getElementById('hero-cards');
    container.innerHTML = '';
    gameState.heroes.forEach((hero, idx) => {
        container.appendChild(createCard(hero, idx, true));
    });
}

function createCard(entity, idx, isHero) {
    const card = document.createElement('div');
    card.className = `card ${isHero ? 'hero-card' : ''} ${entity.hp <= 0 ? 'dead' : ''}`;
    card.id = entity.id;

    // Header
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
        <span class="card-type">${entity.type}</span>
        <span class="card-name">${entity.name}</span>
        <span class="card-range">${entity.range}</span>
    `;

    // Image area
    const imageDiv = document.createElement('div');
    imageDiv.className = 'card-image';
    imageDiv.innerHTML = `<div class="creature-icon">${entity.emoji}</div>`;

    // Description
    const descDiv = document.createElement('div');
    descDiv.className = 'card-description';
    descDiv.textContent = entity.description;

    // Effect
    const effectDiv = document.createElement('div');
    effectDiv.className = 'card-effect';
    if (entity.effect) {
        effectDiv.textContent = '- ' + entity.effect;
    }

    // Stats area
    const statsDiv = document.createElement('div');
    statsDiv.className = 'card-stats';

    // PV hearts
    const pvDiv = document.createElement('div');
    pvDiv.className = 'card-pv';
    for (let i = 0; i < entity.maxHp; i++) {
        const heart = document.createElement('div');
        heart.className = `heart ${i < entity.hp ? '' : 'empty'}`;
        pvDiv.appendChild(heart);
    }

    // Armor badge
    const armorDiv = document.createElement('div');
    armorDiv.className = 'armor-badge';
    armorDiv.textContent = entity.currentArmor > 0 ? entity.currentArmor : entity.armor;

    // Dice faces
    const diceDiv = document.createElement('div');
    diceDiv.className = 'card-dice';

    entity.dice.forEach(die => {
        const row = document.createElement('div');
        row.className = 'dice-row';
        die.faces.forEach(face => {
            const faceIcon = document.createElement('div');
            faceIcon.className = `dice-face-icon type-${face.type}`;
            faceIcon.textContent = face.value;
            faceIcon.title = `${face.name} ${face.value} (${face.type})`;
            row.appendChild(faceIcon);
        });
        diceDiv.appendChild(row);
    });

    statsDiv.appendChild(pvDiv);
    statsDiv.appendChild(diceDiv);
    statsDiv.appendChild(armorDiv);

    card.appendChild(header);
    card.appendChild(imageDiv);
    card.appendChild(descDiv);
    if (entity.effect) card.appendChild(effectDiv);
    card.appendChild(statsDiv);

    return card;
}

function renderDice() {
    const tray = document.getElementById('dice-tray');
    tray.innerHTML = '';

    if (gameState.currentDiceResults.length === 0) {
        tray.innerHTML = '<span style="color: var(--text-secondary); font-family: var(--font-body); font-style: italic;">Lancez les dés pour agir...</span>';
        return;
    }

    gameState.currentDiceResults.forEach((result, idx) => {
        const die = document.createElement('div');
        die.className = `die ${result.used ? 'used' : ''}`;
        const ft = FACE_TYPES[result.face.type] || { icon: '?', color: '#fff', label: result.face.type };

        die.innerHTML = `
            <div class="die-value" style="color: ${ft.color}">${result.face.value}</div>
            <div class="die-label">${result.face.name}</div>
            <div class="die-type-icon">${ft.icon} ${ft.label}</div>
        `;

        if (!result.used && gameState.phase === 'hero' && !gameState.gameOver) {
            die.onclick = () => selectDie(idx);
        }

        tray.appendChild(die);
    });
}

function updateButtons() {
    const rollBtn = document.getElementById('btn-roll');
    const endBtn = document.getElementById('btn-end-turn');
    const restartBtn = document.getElementById('btn-restart');

    if (gameState.gameOver) {
        rollBtn.style.display = 'none';
        endBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        return;
    }

    if (gameState.phase === 'hero') {
        if (gameState.currentDiceResults.length === 0) {
            rollBtn.style.display = 'inline-block';
            rollBtn.disabled = false;
            endBtn.style.display = 'none';
        } else {
            rollBtn.style.display = 'none';
            endBtn.style.display = 'inline-block';
        }
    } else {
        rollBtn.style.display = 'none';
        endBtn.style.display = 'none';
    }
    restartBtn.style.display = 'none';
}

function updateTurnInfo() {
    const info = document.getElementById('turn-info');
    if (gameState.gameOver) {
        info.textContent = '';
        return;
    }
    if (gameState.phase === 'hero') {
        info.textContent = `Tour ${gameState.turn} — Phase Héros`;
    } else {
        info.textContent = `Tour ${gameState.turn} — Phase Ennemis`;
    }
}

// ===== COMBAT LOG =====
function addLog(text, type = '') {
    const log = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.parentElement.scrollTop = log.parentElement.scrollHeight;
}

// ===== DICE ROLLING =====
function rollDice() {
    if (gameState.gameOver) return;

    const entity = gameState.phase === 'hero' ? gameState.heroes[0] : null;
    if (!entity) return;

    // Show overlay
    const overlay = document.getElementById('dice-overlay');
    const anim1 = document.getElementById('dice-anim-1');
    const anim2 = document.getElementById('dice-anim-2');
    overlay.classList.remove('hidden');
    anim2.style.display = entity.dice.length > 1 ? 'flex' : 'none';

    // Animate random numbers
    let animInterval = setInterval(() => {
        anim1.textContent = Math.floor(Math.random() * 6) + 1;
        if (entity.dice.length > 1) {
            anim2.textContent = Math.floor(Math.random() * 6) + 1;
        }
    }, 80);

    // Resolve after animation
    setTimeout(() => {
        clearInterval(animInterval);

        // Roll each die
        gameState.currentDiceResults = [];
        entity.dice.forEach((die, dieIdx) => {
            const faceIdx = Math.floor(Math.random() * 6);
            const face = die.faces[faceIdx];
            gameState.currentDiceResults.push({
                dieIndex: dieIdx,
                faceIndex: faceIdx,
                face: { ...face },
                used: false,
                label: die.label || `Dé ${dieIdx + 1}`,
            });
        });

        // Show final values
        anim1.textContent = gameState.currentDiceResults[0].face.value;
        if (gameState.currentDiceResults.length > 1) {
            anim2.textContent = gameState.currentDiceResults[1].face.value;
        }

        // Log
        gameState.currentDiceResults.forEach(r => {
            addLog(`${r.label}: ${r.face.name} ${r.face.value} (${r.face.type})`, 'info');
        });

        setTimeout(() => {
            overlay.classList.add('hidden');
            render();
        }, 600);

    }, 1000);
}

// ===== DIE SELECTION & TARGETING =====
function selectDie(idx) {
    if (gameState.currentDiceResults[idx].used) return;
    gameState.selectedDieIndex = idx;
    const result = gameState.currentDiceResults[idx];

    // Highlight die
    document.querySelectorAll('.die').forEach((d, i) => {
        d.style.outline = i === idx ? '2px solid var(--accent-gold)' : 'none';
    });

    // Determine valid targets
    clearTargets();

    if (result.face.type === 'defense' || result.face.type === 'soin') {
        // Target self (hero)
        makeSelectable(gameState.heroes, true);
    } else {
        // Target enemies
        makeSelectable(gameState.enemies.filter(e => e.hp > 0), false);
    }
}

function clearTargets() {
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('selectable', 'targeted');
        c.onclick = null;
    });
}

function makeSelectable(entities, isHero) {
    entities.forEach(entity => {
        const el = document.getElementById(entity.id);
        if (!el || entity.hp <= 0) return;
        el.classList.add('selectable');
        el.onclick = () => applyDie(entity, isHero);
    });
}

// ===== APPLY DIE =====
function applyDie(target, isHero) {
    const idx = gameState.selectedDieIndex;
    if (idx < 0) return;

    const result = gameState.currentDiceResults[idx];
    if (result.used) return;

    const face = result.face;

    if (face.type === 'defense') {
        // Add armor
        target.currentArmor += face.value;
        addLog(`${target.name} gagne ${face.value} de défense !`, 'defense');
        showPopup(target.id, `+${face.value} 🛡`, 'block');
    } else if (face.type === 'soin') {
        // Heal
        const healed = Math.min(face.value, target.maxHp - target.hp);
        target.hp += healed;
        addLog(`${target.name} récupère ${healed} PV !`, 'heal');
        showPopup(target.id, `+${healed} ❤`, 'heal');
    } else {
        // Damage
        let dmg = face.value;
        let blocked = 0;

        // Apply armor
        if (target.currentArmor > 0) {
            blocked = Math.min(target.currentArmor, dmg);
            target.currentArmor -= blocked;
            dmg -= blocked;
        }
        if (target.armor > 0 && dmg > 0) {
            const armorBlock = Math.min(target.armor, dmg);
            blocked += armorBlock;
            dmg -= armorBlock;
        }

        target.hp = Math.max(0, target.hp - dmg);

        if (blocked > 0) {
            addLog(`${face.name} ${face.value} sur ${target.name}: ${dmg} dégâts (${blocked} bloqués)`, 'damage');
        } else {
            addLog(`${face.name} ${face.value} sur ${target.name}: ${dmg} dégâts !`, 'damage');
        }
        showPopup(target.id, `-${dmg}`, 'damage');

        // Check for couple keyword
        if (face.keywords && face.keywords.includes('couple')) {
            const enemies = gameState.enemies.filter(e => e.hp > 0);
            const tIdx = enemies.indexOf(target);
            if (tIdx >= 0 && tIdx < enemies.length - 1) {
                const adjacent = enemies[tIdx + 1];
                let adjDmg = face.value;
                if (adjacent.armor > 0) adjDmg = Math.max(0, adjDmg - adjacent.armor);
                adjacent.hp = Math.max(0, adjacent.hp - adjDmg);
                addLog(`Couple! ${adjacent.name} subit aussi ${adjDmg} dégâts !`, 'damage');
                showPopup(adjacent.id, `-${adjDmg}`, 'damage');
                if (adjacent.hp <= 0) {
                    addLog(`${adjacent.name} est vaincu !`, 'death');
                }
            }
        }

        // Check death
        if (target.hp <= 0) {
            addLog(`${target.name} est vaincu !`, 'death');
        }
    }

    // Mark die as used
    result.used = true;
    gameState.selectedDieIndex = -1;
    clearTargets();
    render();

    // Check win/loss
    checkGameEnd();
}

// ===== ENEMY TURN =====
function enemyTurn() {
    gameState.phase = 'enemy';
    updateTurnInfo();
    render();

    const aliveEnemies = gameState.enemies.filter(e => e.hp > 0);
    const hero = gameState.heroes[0];

    if (aliveEnemies.length === 0 || hero.hp <= 0) {
        checkGameEnd();
        return;
    }

    addLog(`--- Tour ${gameState.turn} : Phase Ennemis ---`, 'turn');

    let delay = 500;
    aliveEnemies.forEach((enemy, i) => {
        setTimeout(() => {
            if (hero.hp <= 0 || gameState.gameOver) return;

            // Roll die for enemy
            const die = enemy.dice[0];
            const faceIdx = Math.floor(Math.random() * 6);
            const face = die.faces[faceIdx];

            // Highlight enemy
            const el = document.getElementById(enemy.id);
            if (el) el.classList.add('targeted');

            addLog(`${enemy.name} lance: ${face.name} ${face.value}`, 'info');

            // Apply damage to hero
            let dmg = face.value;
            let blocked = 0;

            if (hero.currentArmor > 0) {
                blocked = Math.min(hero.currentArmor, dmg);
                hero.currentArmor -= blocked;
                dmg -= blocked;
            }
            if (hero.armor > 0 && dmg > 0) {
                const armorBlock = Math.min(hero.armor, dmg);
                blocked += armorBlock;
                dmg -= armorBlock;
            }

            hero.hp = Math.max(0, hero.hp - dmg);

            if (blocked > 0) {
                addLog(`${enemy.name} inflige ${dmg} dégâts à ${hero.name} (${blocked} bloqués)`, 'damage');
            } else {
                addLog(`${enemy.name} inflige ${dmg} dégâts à ${hero.name} !`, 'damage');
            }
            showPopup('hero_0', `-${dmg}`, 'damage');

            // Remove highlight
            setTimeout(() => {
                if (el) el.classList.remove('targeted');
                render();
            }, 400);

            // After last enemy
            if (i === aliveEnemies.length - 1) {
                setTimeout(() => {
                    if (hero.hp <= 0) {
                        checkGameEnd();
                        return;
                    }
                    // Next hero turn
                    gameState.turn++;
                    gameState.phase = 'hero';
                    gameState.currentDiceResults = [];
                    gameState.selectedDieIndex = -1;
                    // Reset temporary armor
                    hero.currentArmor = 0;
                    addLog(`--- Tour ${gameState.turn} : Phase Héros ---`, 'turn');
                    updateTurnInfo();
                    render();
                }, 600);
            }
        }, delay * (i + 1));
    });
}

function endTurn() {
    // Check if all dice used - otherwise confirm
    const unused = gameState.currentDiceResults.filter(d => !d.used);
    if (unused.length > 0) {
        // Allow ending with unused dice
        addLog(`${unused.length} dé(s) non utilisé(s).`, 'info');
    }

    clearTargets();
    enemyTurn();
}

// ===== GAME END =====
function checkGameEnd() {
    const hero = gameState.heroes[0];
    const aliveEnemies = gameState.enemies.filter(e => e.hp > 0);

    if (aliveEnemies.length === 0 && hero.hp > 0) {
        gameState.gameOver = true;
        addLog('VICTOIRE ! Tous les rats sont vaincus !', 'info');
        showBanner('victory', 'Victoire !', `${hero.name} survit avec ${hero.hp} PV.`);
        render();
    } else if (hero.hp <= 0) {
        gameState.gameOver = true;
        addLog('DEFAITE... Le héros est tombé.', 'death');
        showBanner('defeat', 'Défaite...', `${hero.name} a succombé aux rats.`);
        render();
    }
}

function showBanner(type, title, subtitle) {
    const existing = document.querySelector('.game-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = `game-banner ${type}`;
    banner.innerHTML = `<h2>${title}</h2><p>${subtitle}</p>`;
    document.body.appendChild(banner);
}

function restartGame() {
    const banner = document.querySelector('.game-banner');
    if (banner) banner.remove();
    document.getElementById('log-entries').innerHTML = '';
    initGame();
}

// ===== POPUP =====
function showPopup(entityId, text, type) {
    const el = document.getElementById(entityId);
    if (!el) return;

    const popup = document.createElement('div');
    popup.className = `damage-popup ${type}`;
    popup.textContent = text;
    popup.style.position = 'absolute';
    popup.style.left = '50%';
    popup.style.top = '30%';
    popup.style.transform = 'translateX(-50%)';
    el.style.position = 'relative';
    el.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}

// ===== START =====
document.addEventListener('DOMContentLoaded', initGame);
