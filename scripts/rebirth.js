const spud_counter = document.getElementById("spud_shard_count");
const replant_counter = document.getElementById("replanting_level_count");
const pop = new Audio("audio/pop.wav");

function totalAP(lifetime) {
    const tot = Math.floor(0.5 * Math.sqrt(lifetime / 1e12));
    if (replant_counter) replant_counter.textContent = tot;
    return tot;
}

function availableRP(lifetime, spent) {
    const avail = totalAP(lifetime) - spent;
    if (spud_counter) spud_counter.textContent = avail;
    return avail;
}

function progressToNextPoint(lifetime) {
    const currentAP = totalAP(lifetime);
    const nextAP = currentAP + 1;
    const cookiesForCurrent = 4 * currentAP * currentAP * 1e12;
    const cookiesForNext = 4 * nextAP * nextAP * 1e12;

    let progress = (lifetime - cookiesForCurrent) / (cookiesForNext - cookiesForCurrent);
    progress = Math.max(0, Math.min(1, progress));

    const bar = document.getElementById("rebirth_bar");
    if (bar) bar.style.setProperty('--fill-percent', (progress * 100) + '%');

    return (progress * 100).toFixed(2);
}

// ── Peeler click bonus — defined at top level so it's always available ───────
function _applyPeelerClickBonus() {
    if (!window.peelerClickBonus) return;
    if (window._basePotatoesPerClick === undefined) {
        window._basePotatoesPerClick = window.potatoesPerClick || 1;
    }
    const bonus = Math.floor((window.allTimePotatoes || 0) * window.peelerClickBonus);
    window.potatoesPerClick = (window._basePotatoesPerClick || 1) + bonus;
}
window._applyPeelerClickBonus = _applyPeelerClickBonus;

function initMindmap({ nodes, connections }) {
    const viewport = document.getElementById("mindmapViewport");
    const world = document.getElementById("mindmapWorld");
    const canvas = document.getElementById("mindmapLines");

    if (!viewport || !world || !canvas) {
        console.error("Mindmap elements not found");
        return;
    }

    const ctx = canvas.getContext("2d");
    const isTouch = "ontouchstart" in window;

    // ── Load persisted purchased set from save ──────────────────────────────
    const persistedPurchased = new Set(window._rebirthPersistedPurchased || []);
    let purchased = new Set([...persistedPurchased]);

    // Helper: save persisted set back to the global so script.js picks it up
    function savePersistedToGlobal() {
        window._rebirthPersistedPurchased = [...persistedPurchased];
    }

    // ── Close button visibility ─────────────────────────────────────────────
    const closeBtn = document.getElementById("closeModalRebirth");

    function updateCloseButtonVisibility() {
        if (!closeBtn) return;
        // Hide × if any perk is queued OR permanently purchased
        const anyPurchased = purchased.size > 0;
        closeBtn.style.display = anyPurchased ? "none" : "";
    }

    // The ONLY function that should write to spud_counter while modal is open
    function updateSessionCounter() {
        const sessionCost = [...purchased]
            .filter(j => !persistedPurchased.has(j))
            .reduce((sum, j) => {
                const match = nodes[j].cost ? nodes[j].cost.match(/\d+/) : null;
                return sum + (match ? parseInt(match[0]) : 0);
            }, 0);
        const displayAvail = totalAP(window.allTimePotatoes) - (window.rp || 0) - sessionCost;
        if (spud_counter) spud_counter.textContent = Math.max(0, displayAvail);
    }

    function resetSessionPurchases() {
        purchased = new Set([...persistedPurchased]);
        updateAllNodes();
        updateSessionCounter();
        updateCloseButtonVisibility();
    }

    if (closeBtn) {
        // Reset queued (but not yet planted) perks when closing
        closeBtn.addEventListener("click", () => {
            resetSessionPurchases();
        });
    }

    // Initial visibility check
    updateCloseButtonVisibility();

    function getLayers() {
        const unlocked = new Set();
        const visible = new Set();

        unlocked.add(0);

        connections.forEach(([a, b]) => {
            if (purchased.has(a)) {
                const node = nodes[b];
                const prereqs = node.prerequisites || [];
                const prereqsMet = prereqs.every(p => purchased.has(p));
                if (prereqsMet) unlocked.add(b);
            }
        });

        connections.forEach(([a, b]) => {
            if ((unlocked.has(a) || purchased.has(a)) && !unlocked.has(b) && !purchased.has(b)) {
                visible.add(b);
            }
        });

        return { unlocked, visible };
    }

    function getUnlocked() {
        return getLayers().unlocked;
    }

    function getNodeElements() {
        return [...world.querySelectorAll('.mindmap-node')];
    }

    function updateAllNodes() {
        const { unlocked, visible } = getLayers();
        const nodeEls = getNodeElements();

        nodes.forEach((n, i) => {
            const el = nodeEls[i];
            if (!el) return;

            const isPurchased = purchased.has(i);
            const isUnlocked  = unlocked.has(i) && !isPurchased;
            const isVisible   = visible.has(i);
            const isHidden    = !isPurchased && !isUnlocked && !isVisible;

            el.classList.toggle('node-purchased', isPurchased);
            el.classList.toggle('node-unlocked',  isUnlocked);
            el.classList.toggle('node-visible',   isVisible);
            el.classList.toggle('node-locked',    isHidden);

            el.style.display = isHidden ? 'none' : '';

            const img = el.querySelector('img');
            if (img) img.style.display = isVisible ? 'none' : '';
        });

        requestAnimationFrame(drawLines);
    }

    function tryPurchaseNode(i) {
        if (purchased.has(i)) return;

        const unlocked = getUnlocked();
        if (!unlocked.has(i)) return;

        const n = nodes[i];
        const costMatch = n.cost ? n.cost.match(/\d+/) : null;
        const cost = costMatch ? parseInt(costMatch[0]) : 0;

        const sessionCost = [...purchased]
            .filter(j => !persistedPurchased.has(j))
            .reduce((sum, j) => {
                const match = nodes[j].cost ? nodes[j].cost.match(/\d+/) : null;
                return sum + (match ? parseInt(match[0]) : 0);
            }, 0);
        const avail = totalAP(window.allTimePotatoes) - (window.rp || 0) - sessionCost;

        if (avail < cost) {
            const el = getNodeElements()[i];
            el.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.9)';
            setTimeout(() => { el.style.boxShadow = ''; }, 600);
            return;
        }

        const wasUnlocked = new Set(getLayers().unlocked);

        purchased.add(i);

        updateAllNodes();
        updateSessionCounter();
        updateCloseButtonVisibility();

        const { unlocked: nowUnlocked } = getLayers();
        const newlyUnlocked = [];
        nodes.forEach((_, j) => {
            if (nowUnlocked.has(j) && !wasUnlocked.has(j) && !purchased.has(j)) {
                newlyUnlocked.push(j);
            }
        });

        const nodeEls = getNodeElements();
        newlyUnlocked.forEach((j, idx) => {
            setTimeout(() => {
                pop.volume = window.sfxVolume !== undefined ? window.sfxVolume : 1;
                pop.currentTime = 0.0057;
                pop.play().catch(() => {});
                const el = nodeEls[j];
                if (!el) return;
                el.style.transition = 'transform 0.15s ease-out';
                el.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    setTimeout(() => { el.style.transition = ''; }, 200);
                }, 150);
            }, idx * 100);
        });
    }

    function applyAllPerks() {
        purchased.forEach(i => {
            if (persistedPurchased.has(i)) return;

            const n = nodes[i];
            switch (n.label) {
                case "On the house":
                    window.building_discount = Math.max(0.01, (window.building_discount || 1) - 0.05);
                    if (window.renderBuildings) window.renderBuildings();
                    break;
                case "Cheap & Crunchy":
                    window.building_discount = Math.max(0.01, (window.building_discount || 1) - 0.07);
                    if (window.renderBuildings) window.renderBuildings();
                    break;
                case "Liquified":
                    window.production_percent = (window.production_percent || 1) + 0.1;
                    break;
                case "Gasified":
                    window.production_percent = (window.production_percent || 1) + 0.15;
                    break;
                case "Crystalised":
                    window.production_percent = (window.production_percent || 1) + 0.17;
                    break;
                case "Golden Timing!":
                    window.golden_timing_perk = Math.max(0.01, (window.golden_timing_perk || 1) - 0.05);
                    break;
                case "Golden Luck!":
                    window.golden_timing_perk = Math.max(0.01, (window.golden_timing_perk || 1) - 0.15);
                    break;
                case "Golden Shifting!":
                    window.golden_timing_perk = Math.max(0.01, (window.golden_timing_perk || 1) - 0.2);
                    break;
                case "Golden Peeler":
                    window.peelerClickBonus = (window.peelerClickBonus || 0) + 0.005;
                    _applyPeelerClickBonus();
                    break;
                case "Platinium Peeler":
                    window.peelerClickBonus = (window.peelerClickBonus || 0) + 0.01;
                    _applyPeelerClickBonus();
                    break;
            }

            const costMatch = n.cost ? n.cost.match(/\d+/) : null;
            const cost = costMatch ? parseInt(costMatch[0]) : 0;
            window.rp += cost;
            persistedPurchased.add(i);
        });

        // Sync back to global so script.js saves it
        savePersistedToGlobal();
    }

    // ── RE-PLANT button ─────────────────────────────────────────────────────
    const replantBtn = document.querySelector(".rebirth-confirm");
    if (replantBtn) {
        replantBtn.addEventListener("click", () => {
            const newPurchases = [...purchased].filter(i => !persistedPurchased.has(i));
            if (newPurchases.length === 0) {
                replantBtn.textContent = "Nothing new!";
                setTimeout(() => { replantBtn.textContent = "RE-PLANT"; }, 1500);
                return;
            }

            // Commit the perks
            applyAllPerks();

            // After replant rp is committed, update the shard display
            availableRP(window.allTimePotatoes, window.rp);

            // ── Full game reset (keep achievements, skins, allTimePotatoes, rebirth) ──
            if (window.performRebirthReset) {
                window.performRebirthReset();
            }

            replantBtn.textContent = "✓ Planted!";
            setTimeout(() => { replantBtn.textContent = "RE-PLANT"; }, 1500);

            updateCloseButtonVisibility();
        });
    }

    // _applyPeelerClickBonus is defined at module level above

    function maybeShowTooltip(n, i, el) {
        const { visible } = getLayers();
        if (visible.has(i)) return;
        const html = buildTooltip(n, i);
        if (!html) return;
        if (window.showTooltip) window.showTooltip(html, el);
    }

    function buildTooltip(n, i) {
        const isPurchased = purchased.has(i);
        const isPersistedPurchased = persistedPurchased.has(i);
        const { unlocked, visible } = getLayers();
        const isUnlocked = unlocked.has(i) && !isPurchased;
        const isVisible  = visible.has(i);
        const costMatch = n.cost ? n.cost.match(/\d+/) : null;
        const cost = costMatch ? parseInt(costMatch[0]) : 0;

        const sessionCost = [...purchased]
            .filter(j => !persistedPurchased.has(j))
            .reduce((sum, j) => {
                const match = nodes[j].cost ? nodes[j].cost.match(/\d+/) : null;
                return sum + (match ? parseInt(match[0]) : 0);
            }, 0);
        const avail = totalAP(window.allTimePotatoes) - (window.rp || 0) - sessionCost;
        const canAfford = avail >= cost;

        if (isVisible) return null;

        const pendingLabel = isPurchased && !isPersistedPurchased
            ? `<div style="color:#ffd54f;font-size:11px;margin-top:4px;">⏳ Pending — press RE-PLANT to confirm</div>`
            : '';

        return `
            <div class="title">${n.label}</div>
            ${n.quote ? `<div class="quote">''${n.quote}''</div>` : ''}
            ${n.description ? `<div>${n.description}</div>` : ''}
            ${n.effect ? `<div class="effect">${n.effect}</div>` : ''}
            ${isPersistedPurchased
                ? `<div style="color:#81c784;font-size:11px;margin-top:4px;">✓ Purchased</div>`
                : isPurchased
                    ? pendingLabel
                    : isUnlocked
                        ? `<div class="price" style="color:${canAfford ? '#ffd54f' : '#ff6b6b'}">
                               Cost: ${n.cost || 'Free'}${!canAfford ? ' — not enough shards' : ''}
                           </div>
                           <div style="font-size:11px;opacity:0.7;margin-top:2px;">Click to queue</div>`
                        : ``
            }
        `;
    }

    // Create nodes
    world.innerHTML = "";
    nodes.forEach((n, i) => {
        const el = document.createElement("div");
        el.className = "mindmap-node node-locked";
        el.style.left = n.x + "px";
        el.style.top = n.y + "px";

        const img = document.createElement("img");
        img.src = n.image;
        img.alt = n.label;
        img.draggable = false;
        el.appendChild(img);

        if (!isTouch) {
            el.addEventListener("mouseenter", () => maybeShowTooltip(n, i, el));
            el.addEventListener("mouseleave", () => { if (window.hideTooltip) window.hideTooltip(); });
        } else {
            el.addEventListener("click", () => maybeShowTooltip(n, i, el));
        }

        el.addEventListener("click", () => {
            tryPurchaseNode(i);
            if (!isTouch) maybeShowTooltip(n, i, el);
        });

        world.appendChild(el);
    });

    updateAllNodes();
    updateCloseButtonVisibility();

    function drawLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;

        const vpRect = viewport.getBoundingClientRect();
        const nodeEls = getNodeElements();
        const { unlocked, visible } = getLayers();

        connections.forEach(([a, b]) => {
            const aHidden = !purchased.has(a) && !unlocked.has(a) && !visible.has(a);
            const bHidden = !purchased.has(b) && !unlocked.has(b) && !visible.has(b);
            if (aHidden || bHidden) return;

            const r1 = nodeEls[a]?.getBoundingClientRect();
            const r2 = nodeEls[b]?.getBoundingClientRect();
            if (!r1 || !r2) return;

            const x1 = r1.left + r1.width / 2 - vpRect.left;
            const y1 = r1.top + r1.height / 2 - vpRect.top;
            const x2 = r2.left + r2.width / 2 - vpRect.left;
            const y2 = r2.top + r2.height / 2 - vpRect.top;

            if (purchased.has(a) && purchased.has(b)) {
                ctx.strokeStyle = "#ffd54f";
                ctx.fillStyle = "#ffd54f";
            } else if (purchased.has(a)) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.83)";
                ctx.fillStyle = "rgba(255,255,255,0.75)";
            } else {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
                ctx.fillStyle = "rgba(255,255,255,0.15)";
            }

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            const angle = Math.atan2(y2 - y1, x2 - x1);
            const headLen = 12;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        });
    }

    let isDragging = false, startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    let scale = 1;
    const MAX_DRAG_DISTANCE = 500;
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 1.0;

    function clampOffset(x, y) {
        const firstNode = nodes[0];
        const nodeSize = 100;
        const centerX = (viewport.clientWidth / 2) - (firstNode.x + nodeSize / 2);
        const centerY = (viewport.clientHeight / 3.25) - (firstNode.y + nodeSize / 2);
        return {
            x: Math.max(centerX - MAX_DRAG_DISTANCE, Math.min(centerX + MAX_DRAG_DISTANCE, x)),
            y: Math.max(centerY - MAX_DRAG_DISTANCE, Math.min(centerY + MAX_DRAG_DISTANCE, y))
        };
    }

    const PARALLAX_SPEED = 0.2;
    const OVERLAY_SPEED = 0.4;

    function resize() {
        canvas.width = viewport.clientWidth;
        canvas.height = viewport.clientHeight;

        if (offsetX === 0 && offsetY === 0) {
            const firstNode = nodes[0];
            const nodeSize = 100;
            offsetX = (viewport.clientWidth / 2) - (firstNode.x + nodeSize / 2);
            offsetY = (viewport.clientHeight / 3.25) - (firstNode.y + nodeSize / 2);
            world.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        }

        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(drawLines)));
    }
    window.addEventListener("resize", resize);
    resize();

    function startDrag(x, y) {
        isDragging = true;
        viewport.style.cursor = "grabbing";
        startX = x - offsetX;
        startY = y - offsetY;
    }

    function moveDrag(x, y) {
        if (!isDragging) return;
        const clamped = clampOffset(x - startX, y - startY);
        offsetX = clamped.x;
        offsetY = clamped.y;
        world.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

        const bgSize = 640 * scale;
        viewport.style.backgroundPosition = `${offsetX * PARALLAX_SPEED}px ${offsetY * PARALLAX_SPEED}px`;
        viewport.style.backgroundSize = `${bgSize}px ${bgSize}px`;
        const overlay = document.getElementById("mindmapOverlay");
        if (overlay) {
            overlay.style.backgroundPosition = `${offsetX * OVERLAY_SPEED}px ${offsetY * OVERLAY_SPEED}px`;
            overlay.style.backgroundSize = `${bgSize}px ${bgSize}px`;
        }

        requestAnimationFrame(drawLines);
    }

    function endDrag() {
        isDragging = false;
        viewport.style.cursor = "grab";
    }

    viewport.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
        world.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

        const bgSize = 640 * scale;
        viewport.style.backgroundSize = `${bgSize}px ${bgSize}px`;
        const overlay = document.getElementById("mindmapOverlay");
        if (overlay) overlay.style.backgroundSize = `${bgSize}px ${bgSize}px`;

        requestAnimationFrame(drawLines);
    }, { passive: false });

    let lastTouchDistance = 0;
    viewport.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (lastTouchDistance > 0) {
                const delta = (distance - lastTouchDistance) * 0.01;
                scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
                world.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

                const bgSize = 640 * scale;
                viewport.style.backgroundSize = `${bgSize}px ${bgSize}px`;
                const overlay = document.getElementById("mindmapOverlay");
                if (overlay) overlay.style.backgroundSize = `${bgSize}px ${bgSize}px`;

                requestAnimationFrame(drawLines);
            }
            lastTouchDistance = distance;
        } else if (e.touches.length === 1 && isDragging) {
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    viewport.addEventListener("touchend", () => {
        lastTouchDistance = 0;
        endDrag();
    });

    viewport.addEventListener("mousedown", e => startDrag(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => moveDrag(e.clientX, e.clientY));
    window.addEventListener("mouseup", endDrag);
    viewport.addEventListener("touchstart", e => {
        e.preventDefault();
        if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(drawLines)));
}

let mindmapInitialized = false;

function initRebirthMindmap() {
    if (mindmapInitialized) return;
    mindmapInitialized = true;

    setTimeout(() => {
        initMindmap({
            nodes: [
                {
                    label: "Re-glued!",
                    image: "assets/rebirth_nodes/reglued.png",
                    description: "This is the first of many nodes! Earn Spud Shards by playing and spend them to upgrade your rebirth path.",
                    cost: "1 Spud Shard",
                    quote: "It fell apart. We don't talk about it.",
                    x: 100,
                    y: 100
                },
                {
                    label: "Liquified",
                    image: "assets/rebirth_nodes/liquified.png",
                    description: "For optimal storage, potatoes can be melted into liquid form.",
                    cost: "5 Spud Shards",
                    effect: "+10% to all production",
                    quote: "Technically still a potato.",
                    x: 350,
                    y: 120
                },
                {
                    label: "Gasified",
                    image: "assets/rebirth_nodes/gasified.png",
                    description: "Even more optimal, might need smarter farmers though to keep up with this new technology...",
                    cost: "10 Spud Shards",
                    effect: "+15% to all production",
                    quote: "Please do not inhale the potatoes.",
                    x: 600,
                    y: 200
                },
                {
                    label: "Crystalised",
                    image: "assets/rebirth_nodes/crystalised.png",
                    description: "Easier to stack up the potatoes to be put into boxes for later.",
                    cost: "12 Spud Shards",
                    effect: "+17% to all production",
                    quote: "Refined to perfection.",
                    x: 350,
                    y: 320
                },
                {
                    label: "Golden Timing!",
                    image: "assets/rebirth_nodes/golden_timing.png",
                    description: "By analysing the golden potato algorithm, you can now slightly alter their appearance!",
                    cost: "3 Spud Shards",
                    effect: "Golden potatoes appear 5% faster than usual.",
                    quote: "Because patience is overrated.",
                    x: -90,
                    y: -50
                },
                {
                    label: "Golden Luck!",
                    image: "assets/rebirth_nodes/golden_luck.png",
                    description: "By analysing the golden potato algorithm, you can now slightly alter their appearance!",
                    cost: "8 Spud Shards",
                    effect: "Golden potatoes appear 15% faster than usual.",
                    quote: "The odds are feeling generous.",
                    x: -300,
                    y: -40
                },
                {
                    label: "Golden Shifting!",
                    image: "assets/rebirth_nodes/golden_shifting.png",
                    description: "A formula has been found to turn some types of potatoes into golden ones.",
                    cost: "14 Spud Shards",
                    effect: "Golden potatoes appear 20% faster than usual.",
                    quote: "Some spuds just glow different.",
                    x: -500,
                    y: -20
                },
                {
                    label: "On the house",
                    image: "assets/rebirth_nodes/on_the_house.png",
                    description: "These buildings have been polished with the starchiest bleach known to man!",
                    cost: "2 Spud Shards",
                    effect: "Buildings are +5% cheaper.",
                    quote: "Management will notice eventually.",
                    x: 100,
                    y: -50
                },
                {
                    label: "Cheap & Crunchy",
                    image: "assets/rebirth_nodes/crunchy.png",
                    description: "These buildings have been polished with the starchiest bleach known to man!",
                    cost: "2 Spud Shards",
                    effect: "Buildings are +7% cheaper.",
                    quote: "I can hear something crunching in my pocket...",
                    x: 0,
                    y: -200
                },
                {
                    label: "Stacked Savings",
                    image: "assets/rebirth_nodes/stacked.png",
                    description: "Every time a building is bought, you add part of it to your blueprint. Eventually you will have the whole plan right??",
                    cost: "3 Spud Shards",
                    effect: "Each building you buy increases your next building discount by +0.1%.",
                    quote: "Buy one… buy more… save more!",
                    x: 220,
                    y: -150
                },
                {
                    label: "Golden Peeler",
                    image: "assets/rebirth_nodes/g_peeler.png",
                    description: "Golden stuff is cool so it's better, right?",
                    cost: "2 Spud Shards",
                    effect: "+0.5% of all-time potatoes added as a bonus per click.",
                    quote: "The golden touch… but for potatoes.",
                    x: -50,
                    y: 200,
                    prerequisites: [0, 4]
                },
                {
                    label: "Platinium Peeler",
                    image: "assets/rebirth_nodes/p_peeler.png",
                    description: "The Platinum Peeler makes every click feel luxurious.",
                    cost: "4 Spud Shards",
                    effect: "+1% of all-time potatoes added as a bonus per click.",
                    quote: "Now your clicks sparkle.",
                    x: -200,
                    y: 300,
                }
            ],
            connections: [
                [0, 1],
                [1, 2],
                [1, 3],
                [0, 4],
                [4, 5],
                [5, 6],
                [0, 7],
                [7, 8],
                [7, 9],
                [4, 10],
                [0, 10],
                [10, 11]
            ]
        });
    }, 150);
}

window.initRebirthMindmap = initRebirthMindmap;

// ── Re-apply persisted perks on page load ───────────────────────────────────
// script.js loads _rebirthPersistedPurchased from the save before rebirth.js
// runs its interval, so we wait a tick then apply every committed perk once.
function reapplyPersistedPerks() {
    const persisted = window._rebirthPersistedPurchased || [];
    if (persisted.length === 0) return;

    // We need the node definitions to look up perk labels by index.
    // Mirror the same node array used in initRebirthMindmap.
    const nodeLabels = [
        "Re-glued!",          // 0
        "Liquified",          // 1
        "Gasified",           // 2
        "Crystalised",        // 3
        "Golden Timing!",     // 4
        "Golden Luck!",       // 5
        "Golden Shifting!",   // 6
        "On the house",       // 7
        "Cheap & Crunchy",    // 8
        "Stacked Savings",    // 9
        "Golden Peeler",      // 10
        "Platinium Peeler",   // 11
    ];

    persisted.forEach(i => {
        const label = nodeLabels[i];
        if (!label) return;

        switch (label) {
            case "On the house":
                window.building_discount = Math.max(0.01, (window.building_discount || 1) - 0.05);
                break;
            case "Cheap & Crunchy":
                window.building_discount = Math.max(0.01, (window.building_discount || 1) - 0.07);
                break;
            case "Liquified":
                window.production_percent = (window.production_percent || 1) + 0.1;
                break;
            case "Gasified":
                window.production_percent = (window.production_percent || 1) + 0.15;
                break;
            case "Crystalised":
                window.production_percent = (window.production_percent || 1) + 0.17;
                break;
            case "Golden Timing!":
                window.golden_timing_perk = Math.max(0.01, (window.golden_timing_perk || 1) - 0.05);
                break;
            case "Golden Luck!":
                window.golden_timing_perk = Math.max(0.01, (window.golden_timing_perk || 1) - 0.15);
                break;
            case "Golden Shifting!":
                window.golden_timing_perk = Math.max(0.01, (window.golden_timing_perk || 1) - 0.2);
                break;
            case "Golden Peeler":
                window.peelerClickBonus = (window.peelerClickBonus || 0) + 0.005;
                break;
            case "Platinium Peeler":
                window.peelerClickBonus = (window.peelerClickBonus || 0) + 0.01;
                break;
        }
    });

    // Apply peeler click bonus now that all bonuses are summed
    if (window.peelerClickBonus && window._applyPeelerClickBonus) {
        window._applyPeelerClickBonus();
    }

    // Refresh buildings display in case discount changed
    if (window.renderBuildings) window.renderBuildings();

    console.log("Rebirth perks re-applied:", persisted);
}

// Poll until loadV2 has populated _rebirthPersistedPurchased (it's async)
function waitThenReapply() {
    if (Array.isArray(window._rebirthPersistedPurchased)) {
        reapplyPersistedPerks();
    } else {
        setTimeout(waitThenReapply, 50);
    }
}
setTimeout(waitThenReapply, 0);

// ── Rebirth reset function (called from RE-PLANT) ───────────────────────────
// Keeps: achievements, skins, allTimePotatoes, rebirth perks (rp + persistedPurchased)
window.performRebirthReset = function () {
    // We need to reach into script.js scope via the globals it exposes
    // script.js exposes: window.saveGame, and the save key is "potato_clicker_save_v2"
    const SAVE_KEY_V2 = "potato_clicker_save_v2";
    const raw = localStorage.getItem(SAVE_KEY_V2);
    if (!raw) return;

    let save;
    try { save = JSON.parse(raw); } catch { return; }

    // Things to preserve
    const keptSkins = save.skins;
    const keptAchievements = save.achievments;
    const keptAllTime = save.stats.allTimePotatoes;
    const keptRp = window.rp || 0;
    const keptPersistedPurchased = window._rebirthPersistedPurchased || [];
    const keptBackgroundAlpha = save.stats.backgroundAlpha || 0.1;

    // Build a fresh save — zero out everything game-related
    const freshSave = {
        version: save.version,
        stats: {
            potatoes: 0,
            allTimePotatoes: keptAllTime,
            runStartedAt: Date.now(),
            potatoesPerClick: 1,
            autoClickAmount: 0,
            potatoClicks: 0,
            handFarmedPotatoes: 0,
            goldenPotatoClicks: 0,
            buildingsOwned: 0,
            totalUpgrades: 0,
            backgroundAlpha: keptBackgroundAlpha,
            rp: keptRp,
            rebirthPersistedPurchased: keptPersistedPurchased,
        },
        buildings: {},
        upgrades: {},
        skins: keptSkins,
        achievments: keptAchievements,
    };

    // Zero out buildings
    const buildingDefaults = [
        "cursor","farmer","tractor","greenhouse","chip_factory",
        "restaurant","supermarket","distillary","airport",
        "space_station","planet","intergalactic_farm","time_machine","quantum_reactor"
    ];
    buildingDefaults.forEach(id => {
        freshSave.buildings[id] = {
            owned: 0,
            mystery: true,
            totalGenerated: 0,
            cpsMultiplier: 1,
        };
    });

    // Zero out upgrades (keep them locked/not completed)
    if (save.upgrades) {
        Object.keys(save.upgrades).forEach(id => {
            freshSave.upgrades[id] = { unlocked: false, completed: false };
        });
    }

    // Write the fresh save and reload
    localStorage.setItem(SAVE_KEY_V2, JSON.stringify(freshSave));

    // Also push to DB if logged in
    if (window.authApi && window.authApi.getToken && window.authApi.getToken()) {
        window.authApi.save(freshSave).catch(() => {});
    }

    // Reload the page so all in-memory state is cleanly re-initialised
    location.reload();
};

// ── Rebirth bar + spud shard counter update loop ────────────────────────────
setInterval(() => {
    const lifetime = window.allTimePotatoes || 0;
    progressToNextPoint(lifetime);

    const levelEl = document.getElementById("rebirth_level");
    if (!levelEl) return;
    const avail = totalAP(lifetime) - (window.rp || 0);
    levelEl.style.display = avail === 0 ? "none" : "flex";
    if (avail !== 0) levelEl.textContent = `+${avail}`;

    // Only update spud_counter if the modal is NOT open
    const modal = document.getElementById("modalrebirth");
    const modalOpen = modal && getComputedStyle(modal).display !== "none";
    if (!modalOpen) {
        if (spud_counter) spud_counter.textContent = avail;
    }

    if (window._applyPeelerClickBonus && window.peelerClickBonus) {
        window._applyPeelerClickBonus();
    }
}, 1000);