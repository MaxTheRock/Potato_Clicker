(() => {
  const clickerButton = document.getElementById("potato-button");
  const clickerCountDisplay = document.getElementById("potato-amount");
  //const heartsCountDisplay = document.getElementById("heart_amount");
  const titleElement = document.getElementById("title");
  const comments = document.getElementById("comment");
  const hints = document.getElementById("hints");
  const comments_mobile = document.getElementById("comment-mobile");
  const input = document.getElementById("nameInput");
  const openBtn = document.getElementById("openModal");
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");
  const openBtns = document.getElementById("openModalStats");
  const closeBtns = document.getElementById("closeModalStats");
  const modals = document.getElementById("modalstats");
  const openBtno = document.getElementById("openModalOptions");
  const closeBtno = document.getElementById("closeModalOptions");
  const modalo = document.getElementById("modaloptions");
  const modalr = document.getElementById("modalrebirth");
  //const timerInterval = setInterval(updateTimer, 60 * 1000);
  const openBtnsk = document.getElementById("openModalSkins");
  const closeBtnsk = document.getElementById("closeModalSkins");
  const openBtnr = document.getElementById("openModalRebirth");
  const closeBtnr = document.getElementById("closeModalRebirth");
  const modalsk = document.getElementById("modalskins");

  const closeBtncodes = document.getElementById("closeModalCodes");
  const modalcodes = document.getElementById("modalcodes");
  const closeBtncodesgolden = document.getElementById("closeModalGolden");
  const modalcodesgolden = document.getElementById("modalcodesgolden");
  //const openModalAnouncements = document.getElementById("openModalAnouncements");
  //const closeModalAnouncements = document.getElementById("closeModalAnouncements");
  const modalanouncements = document.getElementById("modalanouncements");

  const potatoesCountElement = document.getElementById("potBank");
  const allTimePotatoesElement = document.getElementById("totPot");
  const runStartTimeElement = document.getElementById("runStart");
  const buildingsOwnedElement = document.getElementById("buildingsOwned");
  const potatoesPerSecondElement = document.getElementById("potatoesPerSecond");
  const rawPotatoesPerSecondElement = document.getElementById("rawPotatoesPerSecond");
  const potatoesPerClickElement = document.getElementById("potatoesPerClick");
  const potatoClicksElement = document.getElementById("potatoClicks");
  const handFarmedPotatoesElement =
    document.getElementById("handFarmedPotatoes");
  const goldenPotatoClicksElement =
    document.getElementById("goldenPotatoClicks");
  const runningVersionElement = document.getElementById("runningVersion");
  const versionElement = document.getElementById("version");
  const clickArea = document.getElementById("potato-button");
  const goldenPotato = document.getElementById("golden-potato-button");
  const goldenPotatoImage = document.getElementById("golden-potato");
  const SAVE_KEY_V2 = "potato_clicker_save_v2";
  const upgradeTotalElement = document.getElementById("upgrades-text");
  const achievmentTotalElement = document.getElementById("achievments-text");
  const openOptionsMobile = document.getElementById("openModalOptions_mobile");
  const openStatsMobile = document.getElementById("openModalStats_mobile");
  const openInfoMobile = document.getElementById("openModalInfo_mobile");
  const accountStatus = document.getElementById("accountStatus");
  const timerEl = document.getElementById("event_timer");
  const Codeinput = document.getElementById("codeInput");
  const CodeinputGolden = document.getElementById("codeInputGolden");
  const Codebutton = document.getElementById("redeemCodeButton");
  const CodebuttonGolden = document.getElementById("redeemCodeButtonGolden");
  const isTouchDevice = ("ontouchstart" in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 700;

  const tooltip = document.getElementById("tooltip");
  //const heartContainer = document.querySelector(".heart-container");
  const MODE_STORAGE_KEY = "potato_clicker_mode";
  const middle_buildings = document.getElementById("building_middle");
  const sell_button = document.getElementById("sell_button");
  const buy_button = document.getElementById("buy_button");
  document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("darkenSlider");
    const backgrounds = document.querySelectorAll(".pixelated-background");

    slider.addEventListener("input", () => {
      backgrounds.forEach(bg => {
        bg.style.setProperty("--overlay-alpha", slider.value);
      });
      backgroundAlpha = Number(slider.value);
    });
    saveGame(true);
  });
  /**
   * @param {"light"|"dark"} m
   */
  function storeMode(m) {
    try { localStorage.setItem(MODE_STORAGE_KEY, m); } catch (_) {}
  }
  function loadSavedMode() {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      return saved === "dark" ? "dark" : "light";
    } catch (_) {
      return "light";
    }
  }

  // CHEAT
  let lastPotatoCheck = Date.now();
  let lastPotatoAmount = 0;
  let lastAllTimeAmount = 0;

  function cheatDetection() {
      const now = Date.now();
      const elapsed = (now - lastPotatoCheck) / 1000;

      const potatoDelta = potatoes - lastPotatoAmount;
      const allTimeDelta = allTimePotatoes - lastAllTimeAmount;

      const maxLegitGain = (autoClickAmount * 10 * elapsed) + (potatoClicks * window.potatoesPerClick);

      lastPotatoCheck = now;
      lastPotatoAmount = potatoes;
      lastAllTimeAmount = allTimePotatoes;

      setTimeout(cheatDetection, 5000);
  }

  function flagCheater(reason) {
      console.warn("Cheat detected:", reason);
      potatoes = 0;
      autoClickAmount = 0;
      allTimePotatoes = 0;
      window.potatoesPerClick = 1;
      window._basePotatoesPerClick = 1;
      buildings.forEach(b => { b.owned = 0; b.cpsMultiplier = 1; });
      calculateAutoClick();
      saveGame(true);
  }

  // AUDIO
  const clickSound = new Audio("audio/pop.wav");
  const achievementSound = new Audio("audio/achievement.mp3");
  const buySound = new Audio("audio/buy.mp3");
  const errorSound = new Audio("audio/error.mp3");
  const upgradeSound = new Audio("audio/upgrade.mp3");
  const randomSounds = [];

  for (let i = 1; i <= 13; i++) {
    const audio = new Audio(`audio/random/${i}.mp3`);
    audio.preload = "auto";
    randomSounds.push(audio);
  }

  function playRandomSound() {
    const index = Math.floor(Math.random() * randomSounds.length);
    const sound = randomSounds[index];
    sound.volume = sfxVolume;
    sound.currentTime = 0.5;
    sound.play().catch(() => {});
  }

  let tooltipHideTimeout = null;
  let mobileAutoHideTimeout = null;
  let comment_count = 0;
  let rawPotatoes = 0;
  let potatoes = 0;
  //let hearts = 0;
  let mode = loadSavedMode();
  let potatoesPerSecond = 0;
  let potatoesLastSecond = 0;
  let allTimePotatoes = 0;
  window.allTimePotatoes = allTimePotatoes;
  let runStartTime = Date.now();
  let buildingsOwned = 0;
  let rawPotatoesPerSecond = 0;
  let potatoesPerClick = 1;
  window.potatoesPerClick = potatoesPerClick;
  let potatoClicks = 0;
  let handFarmedPotatoes = 0;
  let goldenPotatoClicks = 0;
  let runningVersion = "v0.78";
  let autoClickAmount = 0;
  let runDurationSeconds;
  let totalUpgrades = 0;
  let frenzy = false;
  let half_price_amount = 1;
  let click_boost = false;
  let storeCount = 0;
  let recentClicks = [];
  let lastUpgradeTime = Date.now();
  let idleTime = 0;
  let upgradeTime = 0;
  let lastDbSaveTime = Date.now();
  let backgroundAlpha = 0.1;
  let selling = false;
  let sfxVolume = 1;
  window.sfxVolume = sfxVolume;
  window.rp = 0;
  const DB_SAVE_INTERVAL_MS = 240 * 60 * 1000;
  //heartContainer.style.setProperty("--fill", "30%");
  const eventTime = new Date(2026, 1, 16);

  // PERKS
  let building_discount = 1;
  window.building_discount = building_discount;
  let production_percent = 1;
  window.production_percent = production_percent;
  let golden_timing_perk = 1;
  window.golden_timing_perk = golden_timing_perk;

  let normal_hints = [
    "What are you doing here!!!",
    "Get out before I tell MaxTheRock...",
    "You know that I can see you right?",
    "Stop clicking the button, you might break it.",
    "Owww, that hurts.",
    "How did you even get here.",
    "Who told you where this is?",
    "I will find you eventually.",
    "I'm not doing a very good job of guarding this...",
    "Your here for the skins right?",
    "Let me tell you a secret... There is nothing here!!!",
    "I thought this game was only about clicking a potato.",
    "Press the X in the corner (trust me)",
    "Have you seen my key anywhere",
    "Try to actually play the game instead of lingering here.",
    "Get out!!!!!!",
    "Don't make me use force!!!",
    "So... Anyway... How has been your day?",
    "Put your bank details in the code box and I'll give you a prize ;)",
    "This is not the secret room you are looking for.",
    "Congrats, you found absolutely nothing.",
    "I swear this wasn't supposed to be discoverable.",
    "Please pretend you didn't see this.",
    "This area is under very serious protection.",
    "Stop staring at the text. It gets shy.",
    "There was content here. Then it left.",
    "You've officially gone off-script.",
    "Nothing to see here. Move along.",
    "I'm running out of things to say… help.",
    "This message was added just to annoy you.",
    "Are you expecting lore or something?",
    "The potato is judging you right now.",
    "Achievement unlocked: Curiosity.",
    "This text box is paid per letter.",
    "You're clicking like there's a reward. There isn't.",
    "Somewhere, a potato felt that click.",
    "I was told to guard this. No one said how.",
    "If you keep clicking, I might say something useful.",
    "Spoiler alert: still nothing here.",
    "You again?",
    "This is why we can't have nice things.",
    "I should really lock this better.",
    "Are you trying to break the game?",
    "At this point I admire the dedication."
  ]

  let special_hints = [
    "Can I come in please??",
    "Gary, are you there...",
    "The timing must of been impossible for you to get here...",
    "Get off this dossers game.",
    "These beats are fire!!!",
    "I really need a drink",
    "I wonder if there is a drink made out of potatoes...",
    "I need a real punchy drink right now",
    "You will be dancing by the end of the week if you carry on!!"
  ]

  function rollRandomHint() {
    let randomNumber = Math.floor(Math.random() * 10) + 1;
    if (randomNumber >=3) {
      hints.style.color = "white";
      return normal_hints[Math.floor(Math.random() * normal_hints.length)];
    } else {
      hints.style.color = "orange";
      return special_hints[Math.floor(Math.random() * special_hints.length)];
    }
  }

  // ================== BUILDINGS ==================
  let buildings = [
    {
      id: "cursor",
      name: "Peeler",
      price: 15,
      basePrice: 15,
      owned: 0,
      icon: "assets/cursor.png",
      realIcon: "assets/cursor.png",
      baseCps: 0.1,
      cpsMultiplier: 1,
      cps: 0.1,
      unlocked: false,
      sort: 1,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "farmer",
      name: "Farmer",
      price: 100,
      basePrice: 100,
      owned: 0,
      icon: "assets/farmer.png",
      realIcon: "assets/farmer.png",
      baseCps: 1,
      cpsMultiplier: 1,
      cps: 1,
      unlocked: false,
      sort: 2,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "tractor",
      name: "Tractor",
      price: 1100,
      basePrice: 1100,
      owned: 0,
      icon: "assets/tractor.png",
      realIcon: "assets/tractor.png",
      baseCps: 8,
      cpsMultiplier: 1,
      cps: 8,
      unlocked: false,
      sort: 3,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "greenhouse",
      name: "Greenhouse",
      price: 12000,
      basePrice: 12000,
      owned: 0,
      icon: "assets/greenhouse.png",
      realIcon: "assets/greenhouse.png",
      baseCps: 30,
      cpsMultiplier: 1,
      cps: 30,
      unlocked: false,
      sort: 4,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "chip_factory",
      name: "Chip Factory",
      price: 150000,
      basePrice: 150000,
      owned: 0,
      icon: "assets/chip_factory.png",
      realIcon: "assets/chip_factory.png",
      baseCps: 260,
      cpsMultiplier: 1,
      cps: 260,
      unlocked: false,
      sort: 5,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "restaurant",
      name: "Restaurant",
      price: 1400000,
      basePrice: 1400000,
      owned: 0,
      icon: "assets/restaurant.png",
      realIcon: "assets/restaurant.png",
      baseCps: 1400,
      cpsMultiplier: 1,
      cps: 1400,
      unlocked: false,
      sort: 6,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "supermarket",
      name: "Supermarket",
      price: 20000000,
      basePrice: 20000000,
      owned: 0,
      icon: "assets/supermarket.png",
      realIcon: "assets/supermarket.png",
      baseCps: 7800,
      cpsMultiplier: 1,
      cps: 7800,
      unlocked: false,
      sort: 7,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "distillary",
      name: "Distillery",
      price: 330000000,
      basePrice: 330000000,
      owned: 0,
      icon: "assets/distillary.png",
      realIcon: "assets/distillary.png",
      baseCps: 44000,
      cpsMultiplier: 1,
      cps: 44000,
      unlocked: false,
      sort: 8,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "airport",
      name: "Airport",
      price: 5100000000,
      basePrice: 5100000000,
      owned: 0,
      icon: "assets/airport.png",
      realIcon: "assets/airport.png",
      baseCps: 260000,
      cpsMultiplier: 1,
      cps: 260000,
      unlocked: false,
      sort: 9,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "space_station",
      name: "Space Station",
      price: 75000000000,
      basePrice: 75000000000,
      owned: 0,
      icon: "assets/space_station.png",
      realIcon: "assets/space_station.png",
      baseCps: 1600000,
      cpsMultiplier: 1,
      cps: 1600000,
      unlocked: false,
      sort: 10,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "planet",
      name: "Planet",
      price: 1000000000000,
      basePrice: 1000000000000,
      owned: 0,
      icon: "assets/planet.png",
      realIcon: "assets/planet.png",
      baseCps: 10000000,
      cpsMultiplier: 1,
      cps: 10000000,
      unlocked: false,
      sort: 11,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "intergalactic_farm",
      name: "Intergalactic Farm",
      price: 14000000000000,
      basePrice: 14000000000000,
      owned: 0,
      icon: "assets/intergalactic_farm.png",
      realIcon: "assets/intergalactic_farm.png",
      baseCps: 65000000,
      cpsMultiplier: 1,
      cps: 65000000,
      unlocked: false,
      sort: 12,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "time_machine",
      name: "Time Machine",
      price: 170000000000000,
      basePrice: 170000000000000,
      owned: 0,
      icon: "assets/time_machine.png",
      realIcon: "assets/time_machine.png",
      baseCps: 430000000,
      cpsMultiplier: 1,
      cps: 430000000,
      unlocked: false,
      sort: 13,
      mystery: true,
      totalGenerated: 0,
    },
    {
      id: "quantum_reactor",
      name: "Quantum Reactor",
      price: 2100000000000000,
      basePrice: 2100000000000000,
      owned: 0,
      icon: "assets/quantum_reactor.png",
      realIcon: "assets/quantum_reactor.png",
      baseCps: 2900000000,
      cpsMultiplier: 1,
      cps: 2900000000,
      unlocked: false,
      sort: 14,
      mystery: true,
      totalGenerated: 0,
    },
  ];

  // ================== UPGRADES ==================
  let upgrades = [
    {
      id: "peelerx2_1",
      name: "Increased grip strength",
      description: "Your peelers work harder.",
      effect: "x2 Potatoes per click & x2 Peeler Building power.",
      price: 100,
      icon: "assets/upgrades/peeler_+2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "peelerx2_2",
      name: "Reinforced peeling",
      description: "Your peelers are tough",
      effect: "x2 Potatoes per click & x2 Peeler Building power.",
      price: 500,
      icon: "assets/upgrades/peeler_x2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "peelerx2_3",
      name: "Razor sharp peeler",
      description: "Each peeler is more efficient",
      effect: "x2 Potatoes per click & x2 Peeler Building power.",
      price: 10000,
      icon: "assets/upgrades/peelerx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "peelerx2_4",
      name: "Double edged peeler",
      description: "Each peeler is now double sided",
      effect: "x2 Potatoes per click & x2 Peeler Building power.",
      price: 100000,
      icon: "assets/upgrades/peelerx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "farmerx2_1",
      name: "Farming Aprentiships",
      description: "Your farmers are more experienced",
      effect: "x2 Farmer Potatoes",
      price: 1000,
      icon: "assets/upgrades/farmerx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "farmerx2_2",
      name: "Farming University",
      description: "Your farmers are smart",
      effect: "x2 Farmer Potatoes",
      price: 5000,
      icon: "assets/upgrades/farmerx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "farmerx2_3",
      name: "Farming Degree's",
      description: "Your farmers are even more smarter",
      effect: "x2 Farmer Potatoes",
      price: 100000,
      icon: "assets/upgrades/farmerx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "farmerx2_4",
      name: "PhD in Farming",
      description: "Your farmers are the best in the world",
      effect: "x2 Farmer Potatoes",
      price: 1000000,
      icon: "assets/upgrades/farmerx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "tractorx2_1",
      name: "Larger tires",
      description: "Tractors now come with larger wheels",
      effect: "x2 Tractor Potatoes",
      price: 10000,
      icon: "assets/upgrades/tractorx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "tractorx2_2",
      name: "More horsepower",
      description: "Engine power has doubled!",
      effect: "x2 Tractor Potatoes",
      price: 50000,
      icon: "assets/upgrades/tractorx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "tractorx2_3",
      name: "Newer Model",
      description: "Bought straight from the salon.",
      effect: "x2 Tractor Potatoes",
      price: 1000000,
      icon: "assets/upgrades/tractorx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "tractorx2_4",
      name: "Latest Model",
      description: "The best tractor money can buy.",
      effect: "x2 Tractor Potatoes",
      price: 10000000,
      icon: "assets/upgrades/tractorx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "greenhousex2_1",
      name: "Tempered glass windows",
      description: "Greenhouses are safer and more productive",
      effect: "x2 Greenhouse Potatoes",
      price: 120000,
      icon: "assets/upgrades/greenhousex2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "greenhousex2_2",
      name: "The taller, the better!",
      description: "Greenhouses have 2 floors now.",
      effect: "x2 Greenhouse Potatoes",
      price: 600000,
      icon: "assets/upgrades/greenhousex2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "greenhousex2_3",
      name: "What's better than walking... Levitation!",
      description: "Greenhouses have a lift!",
      effect: "x2 Greenhouse Potatoes",
      price: 12000000,
      icon: "assets/upgrades/greenhousex2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "greenhousex2_4",
      name: "The Ultimate Greenhouse",
      description: "The most advanced greenhouse in the world!",
      effect: "x2 Greenhouse Potatoes",
      price: 120000000,
      icon: "assets/upgrades/greenhousex2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "chipfactoryx2_1",
      name: "Marketing",
      description: "Increasing the demand for home-made chips",
      effect: "x2 Chip Factory Potatoes",
      price: 1200000,
      icon: "assets/upgrades/chipfactoryx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "chipfactoryx2_2",
      name: "Addictive Chemicals",
      description: "Chips are now part of your 5 a day",
      effect: "x2 Chip Factory Potatoes",
      price: 6000000,
      icon: "assets/upgrades/chipfactoryx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "chipfactoryx2_3",
      name: "Happy Chip Bundles",
      description: "Marketing strategy to increase sales.",
      effect: "x2 Chip Factory Potatoes",
      price: 120000000,
      icon: "assets/upgrades/chipfactoryx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "chipfactoryx2_4",
      name: "The Ultimate Chip Factory",
      description: "The most advanced chip factory in the world!",
      effect: "x2 Chip Factory Potatoes",
      price: 1200000000,
      icon: "assets/upgrades/chipfactoryx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "restaurantx2_1",
      name: "Cleaning staff",
      description: "People are more likely to have a meal here.",
      effect: "x2 Restaurant Potatoes",
      price: 14000000,
      icon: "assets/upgrades/restaurantx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "restaurantx2_2",
      name: "Buffet",
      description: "A buffet has been added to every restaurant you own!",
      effect: "x2 Restaurant Potatoes",
      price: 70000000,
      icon: "assets/upgrades/restaurantx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "restaurantx2_3",
      name: "VIP Service",
      description: "VIP service is offered to celebrities",
      effect: "x2 Restaurant Potatoes",
      price: 1400000000,
      icon: "assets/upgrades/restaurantx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "restaurantx2_4",
      name: "The Ultimate Restaurant",
      description: "The most advanced restaurant in the world!",
      effect: "x2 Restaurant Potatoes",
      price: 14000000000,
      icon: "assets/upgrades/restaurantx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "supermarketx2_1",
      name: "Everyday restocking",
      description: "Ensuring that any kind of potato can be bought.",
      effect: "x2 Supermarket Potatoes.",
      price: 800000000,
      icon: "assets/upgrades/supermarketx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "supermarketx2_2",
      name: "Rewards Systems",
      description: "Customers are more likely to come back for the rewards.",
      effect: "x2 Supermarket Potatoes.",
      price: 4000000000,
      icon: "assets/upgrades/supermarketx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "supermarketx2_3",
      name: "Double Floor",
      description: "Larger supermarket = More customers",
      effect: "x2 Supermarket Potatoes.",
      price: 800000000000,
      icon: "assets/upgrades/supermarketx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "supermarketx2_4",
      name: "The Ultimate Supermarket",
      description: "The most advanced supermarket in the world!",
      effect: "x2 Supermarket Potatoes.",
      price: 8000000000000,
      icon: "assets/upgrades/supermarketx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "distillaryx2_1",
      name: "Larger Capacity",
      description: "Can hold double the load.",
      effect: "x2 Distillary Potatoes.",
      price: 50000000000,
      icon: "assets/upgrades/distillaryx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "distillaryx2_2",
      name: "Reinforced security.",
      description: "Less likely to be stolen from.",
      effect: "x2 Distillary Potatoes.",
      price: 250000000000,
      icon: "assets/upgrades/distillaryx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "distillaryx2_3",
      name: "Better tasting",
      description: "Your business attracts more customers.",
      effect: "x2 Distillary Potatoes.",
      price: 50000000000000,
      icon: "assets/upgrades/distillaryx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "distillaryx2_4",
      name: "The Ultimate Distillery",
      description: "The most advanced distillery in the world!",
      effect: "x2 Distillary Potatoes.",
      price: 500000000000000,
      icon: "assets/upgrades/distillaryx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "airportx2_1",
      name: "New runway",
      description: "More plane exports.",
      effect: "x2 Airport Potatoes",
      price: 400000000000,
      icon: "assets/upgrades/airportx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "airportx2_2",
      name: "Destination Expansion",
      description: "More trade routes",
      effect: "x2 Airport Potatoes",
      price: 2000000000000,
      icon: "assets/upgrades/airportx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "airportx2_3",
      name: "Better planes",
      description: "Each plane has double the power",
      effect: "x2 Airport Potatoes",
      price: 400000000000000,
      icon: "assets/upgrades/airportx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "airportx2_4",
      name: "The Ultimate Airport",
      description: "The most advanced airport in the world!",
      effect: "x2 Airport Potatoes",
      price: 4000000000000000,
      icon: "assets/upgrades/airportx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "spacestationx2_1",
      name: "More docking bays",
      description: "Can now dock more ships.",
      effect: "x2 Space Station Potatoes",
      price: 3000000000000,
      icon: "assets/upgrades/spacestationx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "spacestationx2_2",
      name: "Improved technology",
      description: "Better tech means more efficiency.",
      effect: "x2 Space Station Potatoes",
      price: 15000000000000,
      icon: "assets/upgrades/spacestationx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "spacestationx2_3",
      name: "Advanced AI",
      description: "AI runs the station more efficiently.",
      effect: "x2 Space Station Potatoes",
      price: 3000000000000000,
      icon: "assets/upgrades/spacestationx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "spacestationx2_4",
      name: "The Ultimate Space Station",
      description: "The most advanced space station in the world!",
      effect: "x2 Space Station Potatoes",
      price: 30000000000000000,
      icon: "assets/upgrades/spacestationx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "planetx2_1",
      name: "Increased gravity",
      description: "Stronger gravity means more potatoes.",
      effect: "x2 Planet Potatoes",
      price: 20000000000000,
      icon: "assets/upgrades/planetx2_1.png",
      unlocked: false,
    },
    {
      id: "planetx2_2",
      name: "Better atmosphere",
      description: "A better atmosphere means more life.",
      effect: "x2 Planet Potatoes",
      price: 100000000000000,
      icon: "assets/upgrades/planetx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "planetx2_3",
      name: "Advanced ecosystems",
      description: "More advanced ecosystems mean more potatoes.",
      effect: "x2 Planet Potatoes",
      price: 20000000000000000,
      icon: "assets/upgrades/planetx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "planetx2_4",
      name: "The Ultimate Planet",
      description: "The most advanced planet in the universe!",
      effect: "x2 Planet Potatoes",
      price: 200000000000000000,
      icon: "assets/upgrades/planetx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "intergalacticfarmx2_1",
      name: "Expanded Fields",
      description: "More space to grow potatoes.",
      effect: "x2 Intergalactic Farm Potatoes",
      price: 150000000000000,
      icon: "assets/upgrades/intergalacticfarmx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "intergalacticfarmx2_2",
      name: "Advanced Irrigation",
      description: "Better watering systems for your crops.",
      effect: "x2 Intergalactic Farm Potatoes",
      price: 750000000000000,
      icon: "assets/upgrades/intergalacticfarmx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "intergalacticfarmx2_3",
      name: "Genetic Modification",
      description: "Stronger, faster-growing potatoes.",
      effect: "x2 Intergalactic Farm Potatoes",
      price: 150000000000000000,
      icon: "assets/upgrades/intergalacticfarmx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "intergalacticfarmx2_4",
      name: "The Ultimate Intergalactic Farm",
      description: "The most advanced intergalactic farm in the universe!",
      effect: "x2 Intergalactic Farm Potatoes",
      price: 1500000000000000000,
      icon: "assets/upgrades/intergalacticfarmx2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "timemachinex2_1",
      name: "Temporal Efficiency",
      description: "Time machines operate more efficiently.",
      effect: "x2 Time Machine Potatoes",
      price: 1200000000000000,
      icon: "assets/upgrades/timemachinex2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "timemachinex2_2",
      name: "Chrono Boosters",
      description: "Boosters that enhance time travel capabilities.",
      effect: "x2 Time Machine Potatoes",
      price: 6000000000000000,
      icon: "assets/upgrades/timemachinex2_2.png",
      unlocked: false,
    },
    {
      id: "timemachinex2_3",
      name: "Quantum Stabilizers",
      description: "Stabilizers that improve temporal navigation.",
      effect: "x2 Time Machine Potatoes",
      price: 1200000000000000000,
      icon: "assets/upgrades/timemachinex2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "timemachinex2_4",
      name: "The Ultimate Time Machine",
      description: "The most advanced time machine in the universe!",
      effect: "x2 Time Machine Potatoes",
      price: 12000000000000000000,
      icon: "assets/upgrades/timemachinex2_4.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "quantumreactorx2_1",
      name: "Enhanced Quantum Fields",
      description: "Quantum reactors operate with enhanced fields.",
      effect: "x2 Quantum Reactor Potatoes",
      price: 17000000000000000,
      icon: "assets/upgrades/quantumreactorx2_1.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "quantumreactorx2_2",
      name: "Superposition Amplifiers",
      description: "Amplifiers that boost quantum superposition effects.",
      effect: "x2 Quantum Reactor Potatoes",
      price: 85000000000000000,
      icon: "assets/upgrades/quantumreactorx2_2.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "quantumreactorx2_3",
      name: "Entanglement Enhancers",
      description: "Enhancers that improve quantum entanglement processes.",
      effect: "x2 Quantum Reactor Potatoes",
      price: 17000000000000000000,
      icon: "assets/upgrades/quantumreactorx2_3.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "quantumreactorx2_4",
      name: "The Ultimate Quantum Reactor",
      description: "The most advanced quantum reactor in the universe!",
      effect: "x2 Quantum Reactor Potatoes",
      price: 170000000000000000000,
      icon: "assets/upgrades/quantumreactorx2_4.png",
      unlocked: false,
      completed: false,
    },
  ];

  let skins = [
    {
      id: "default",
      name: "Default",
      image: "assets/potato.png",
      unlocked: true,
      equipped: true,
      description: "Unlocked by default.",
    },
    {
      id: "blank",
      name: "Blank",
      image: "assets/variants/blank.png",
      unlocked: false,
      equipped: false,
      description: "Do nothing for 1 hour.",
    },
    {
      id: "code",
      name: "Code",
      image: "assets/variants/code.png",
      unlocked: false,
      equipped: false,
      description: "Click on the github link in the navbar.",
    },
    {
      id: "crown",
      name: "Crown",
      image: "assets/variants/crown.png",
      unlocked: false,
      equipped: false,
      description: "Collect 1 million potatoes.",
    },
    {
      id: "golden",
      name: "Golden",
      image: "assets/variants/golden.png",
      unlocked: false,
      equipped: false,
      description: "Use every golden potato variant at least once.",
    },
    {
      id: "monster",
      name: "Potato Punch",
      image: "assets/variants/monster.png",
      unlocked: false,
      equipped: false,
      description: "A secret is required to unlock this skin.",
      credits: "Designed by Arthur Weedon.",
    },
    {
      id: "pixel",
      name: "Pixel",
      image: "assets/variants/pixel.png",
      unlocked: false,
      equipped: false,
      description: "Collect 10 different skins.",
    },
    {
      id: "rainbow",
      name: "Rainbow",
      image: "assets/variants/rainbow.png",
      unlocked: false,
      equipped: false,
      description: "Unlock every skin in the game.",
    },
    {
      id: "realistic",
      name: "Realistic",
      image: "assets/variants/realistic.png",
      unlocked: false,
      equipped: false,
      description: "Start your run 5 days ago.",
    },
    {
      id: "rock",
      name: "Rock",
      image: "assets/variants/rock.png",
      unlocked: false,
      equipped: false,
      description: "Buy 100 buildings.",
    },
    {
      id: "synth",
      name: "Synth",
      image: "assets/variants/synth.png",
      unlocked: false,
      equipped: false,
      description: "A secret is required to unlock this skin.",
    },
    {
      id: "inverted",
      name: "Inverted",
      image: "assets/variants/inverted.png",
      unlocked: false,
      equipped: false,
      description: "Click exactly 666 times in one session.",
    },
    {
      id: "monochrome",
      name: "Monochrome",
      image: "assets/variants/monochrome.png",
      unlocked: false,
      equipped: false,
      description:
        "Buy no upgrades for 10 minutes whilst having the 'Blank' skin equipped.",
    },
    {
      id: "neon",
      name: "Neon",
      image: "assets/variants/neon.png",
      unlocked: false,
      equipped: false,
      description: "Click 200 times in 30 seconds.",
    },
    {
      id: "face",
      name: "Face",
      image: "assets/variants/face.png",
      unlocked: false,
      equipped: false,
      description: "A secret is required to unlock this skin.",
      credits: "Designed by William Sheard.",
    },
    {
      id: "menglish",
      name: "Menglish",
      image: "assets/variants/menglish.png",
      unlocked: false,
      equipped: false,
      description: "A secret is required to unlock this skin.",
    },
    {
      id: "glass",
      name: "Glass",
      image: "assets/variants/glass.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 20 greenhouses.",
    },
    {
      id: "peeled",
      name: "Peeled",
      image: "assets/variants/peeled.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 100 peelers.",
    },
    {
      id: "puzzle",
      name: "Puzzle",
      image: "assets/variants/puzzle.png",
      unlocked: false,
      equipped: false,
      description: "Find all the secrets in the game.",
    },
    {
      id: "sweet",
      name: "Sweet",
      image: "assets/variants/sweet.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 50 chip factories.",
    },
    {
      id: "upside-down",
      name: "Upside Down",
      image: "assets/variants/upside-down.png",
      unlocked: false,
      equipped: false,
      description: "Sell a building.",
    },
    {
      id: "potion",
      name: "Potion",
      image: "assets/variants/potion.png",
      unlocked: false,
      equipped: false,
      description: "Check out Potion Clicker!",
      credits: "Designed by Rohan Launer.",
    },
    {
      id: "geometry",
      name: "Geometry Dash",
      image: "assets/variants/geometry.png",
      unlocked: false,
      equipped: false,
      description: "A secret is required to unlock this skin.",
      credits: "Designed by Arthur Weedon.",
    },
    {
      id: "baked",
      name: "Baked",
      image: "assets/variants/baked.png",
      unlocked: false,
      equipped: false,
      description: "Play the game for 1 week.",
      credits: "Designed by Rohan Launer.",
    },
    {
      id: "finger",
      name: "Finger",
      image: "assets/variants/finger.png",
      unlocked: false,
      equipped: false,
      description: "Click 100,000 times.",
    },
    {
      id: "computato",
      name: "Computato",
      image: "assets/variants/computato.png",
      unlocked: false,
      equipped: false,
      description: "Play on a Computer!",
      credits: "Designed by Arthur Weedon.",
    },
    {
      id: "astronaut",
      name: "Astronaut",
      image: "assets/variants/astronaut.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 1 space related building.",
    },
    {
      id: "sus",
      name: "Sus",
      image: "assets/variants/sus.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 10 space related building.",
      credits: "Designed by Elliot Sturges.",
    },
    {
      id: "crisp",
      name: "Crisp",
      image: "assets/variants/crisp.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 200 peelers.",
    },
    {
      id: "ice",
      name: "Ice",
      image: "assets/variants/ice.png",
      unlocked: false,
      equipped: false,
      description: "Do nothing for 5 hours.",
    },
    {
      id: "yin_yang",
      name: "Yin Yang",
      image: "assets/variants/yin_yang.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 100 of everything!",
      credits: "Designed by William Sheard.",
    },
    {
      id: "rose",
      name: "Rose",
      image: "assets/variants/rose.png",
      unlocked: false,
      owned: false,
      description: "Part of the Valentine's Day Event!",
      credits: "Designed by William Sheard.",
      price: 100,
    },
    {
      id: "love_letter",
      name: "Love Letter",
      image: "assets/variants/love_letter.png",
      unlocked: false,
      equipped: false,
      description: "Part of the Valentine's Day Event!",
      price: 500,
    },
    {
      id: "cupid",
      name: "Cupid",
      image: "assets/variants/cupid.png",
      unlocked: false,
      equipped: false,
      description: "Part of the Valentine's Day Event!",
      credits: "Designed by Rohan Launer.",
      price: 5000,
    },
    {
      id: "chocolate",
      name: "Chocolate",
      image: "assets/variants/chocolate.png",
      unlocked: false,
      equipped: false,
      description: "Part of the Valentine's Day Event!",
      price: 20000
    },
    {
      id: "gift_box",
      name: "Gift Box",
      image: "assets/variants/gift_box.png",
      unlocked: false,
      equipped: false,
      description: "Part of the Valentine's Day Event!",
      price: 100000
    },
    {
      id: "heart",
      name: "Heart",
      image: "assets/variants/heart.png",
      unlocked: false,
      equipped: false,
      description: "Part of the Valentine's Day Event!",
      price: 500000
    },
    {
      id: "grass",
      name: "Grass",
      image: "assets/variants/grass.png",
      unlocked: false,
      equipped: false,
      description: "Purchase 100 farmers!",
      credits: "Designed by Gabriel D'Agostino.",
    },
    {
      id: "noll_sport",
      name: "Noll Sport",
      image: "assets/variants/noll_sport.png",
      unlocked: false,
      equipped: false,
      description: "A secret is required to unlock this skin.",
      credits: "Designed by Noll Clark & William Sheard.",
    },
    {
      id: "bruh",
      name: "Bruh",
      image: "assets/variants/bruh.png",
      unlocked: false,
      equipped: false,
      description: "Cycle through 50 comments without refreshing.",
    },
    {
      id: "grape_mlg",
      name: "Grape MLG",
      image: "assets/variants/grape_mlg.png",
      unlocked: false,
      equipped: false,
      description: "Top 10 on the leaderboard exclusive.",
      credits: "Designed by Thomas Warne.",
    },
    {
      id: "navy",
      name: "The Navy",
      image: "assets/variants/navy.png",
      unlocked: false,
      equipped: false,
      description: "As always, Navy sings second.",
      credits: "Designed by William Gravenor.",
    },
    {
      id: "golden_bruh",
      name: "Golden Bruh",
      image: "assets/variants/golden_bruh.png",
      unlocked: false,
      equipped: false,
      description: "A golden secret is required to unlock this skin.",
    },
    {
      id: "golden_astronaut",
      name: "Golden Astronaut",
      image: "assets/variants/golden_astronaut.png",
      unlocked: false,
      equipped: false,
      description: "A golden secret is required to unlock this skin.",
    },
    {
      id: "missing_texture",
      name: "Missing Texture",
      image: "assets/variants/missing_texture.png",
      unlocked: false,
      equipped: false,
      description: "1% chance to unlock every second.",
    },
  ];

  function isPC() {
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent,
    );
    const hasFinePointer = window.matchMedia("(pointer:fine)").matches;
    return hasFinePointer && !isMobileUA;
  }

  function checkBuildingMiddle() {
    const farmer = buildings.find((b) => b.id === "farmer");
    if (farmer.owned >= 1) {
      middle_buildings.style.display = "block";
    }
  }

  function checkAchievements() {
    cheatDetection();

    if (potatoClicks >= 1) {
      achievmentsAdd("first_click");
    }

    if (potatoes >= 100) {
      achievmentsAdd("hundred_potatoes");
    }

    if (potatoes >= 1_000_000) {
      achievmentsAdd("million_potatoes");
    }

    if (potatoes >= 1_000_000_000) {
      achievmentsAdd("billion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000) {
      achievmentsAdd("trillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000) {
      achievmentsAdd("quadrillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000_000) {
      achievmentsAdd("quintillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000_000_000) {
      achievmentsAdd("sextillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000_000_000_000) {
      achievmentsAdd("septillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000_000_000_000_000) {
      achievmentsAdd("octillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000_000_000_000_000_000) {
      achievmentsAdd("nonillion_potatoes");
    }

    if (potatoes >= 1_000_000_000_000_000_000_000_000_000_000_000) {
      achievmentsAdd("decillion_potatoes");
    }

    if (potatoClicks >= 666) {
      achievmentsAdd("inverted_potatoes");
    }

    if (potatoClicks >= 10000) {
      achievmentsAdd("pro_clicker");
    }

    if (potatoClicks >= 1000) {
      achievmentsAdd("click_frenzy");
    }

    if (potatoClicks >= 5000) {
      achievmentsAdd("click_marathon");
    }

    if (potatoClicks >= 100000) {
      achievmentsAdd("click_insanity");
    }

    if (potatoClicks >= 1000000) {
      achievmentsAdd("click_legend");
    }

    if (clicksLast30Seconds >= 200) {
      achievmentsAdd("overclock");
    }

    if (buildingsOwned >= 10) {
      achievmentsAdd("buidling_enthusiast");
    }
    if (buildingsOwned >= 50) {
      achievmentsAdd("building_tycoon");
    }
    if (buildingsOwned >= 100) {
      achievmentsAdd("sturdy_as_a_rock");
    }
    if (buildingsOwned >= 200) {
      achievmentsAdd("building_mogul");
    }
    if (buildingsOwned >= 500) {
      achievmentsAdd("building_king");
    }
    if (buildingsOwned >= 1000) {
      achievmentsAdd("building_legend");
    }

    if (totalUpgrades >= 1) {
      achievmentsAdd("upgrade_novice");
    }
    if (totalUpgrades >= 5) {
      achievmentsAdd("upgrade_intermediate");
    }
    if (totalUpgrades >= 10) {
      achievmentsAdd("upgrade_expert");
    }
    if (totalUpgrades >= 30) {
      achievmentsAdd("upgrade_advanced");
    }
    if (totalUpgrades >= 50) {
      achievmentsAdd("upgrade_professional");
      achievmentsAdd("upgrade_master");
    }

    const unlockedSkins = skins.filter((s) => s.unlocked).length;
    if (unlockedSkins >= 10) {
      achievmentsAdd("4K");
    }

    if (idleTime >= 3600) {
      achievmentsAdd("idle_master");
    }

    if (idleTime >= 18000) {
      achievmentsAdd("ice");
    }

    if (totalCollectedVariants.size >= 3) {
      achievmentsAdd("variant_collector");
    }

    if (runStartTime <= Date.now() - 5 * 24 * 60 * 60 * 1000) {
      achievmentsAdd("five_day_run");
    }

    if (runStartTime <= Date.now() - 7 * 24 * 60 * 60 * 1000) {
      achievmentsAdd("baked");
    }

    if (getEquippedSkin().id === "blank" && upgradeTime >= 600) {
      achievmentsAdd("monochrome_potatoes");
    }

    if (unlockedSkins === skins.length - 1) {
      achievmentsAdd("collector");
    }

    const secretAchievements = [
      "monster",
      "synth_master",
      "you_look_like_a_potato",
      "dosser",
      "geometry_dash",
    ];
    const allSecretsRedeemed = secretAchievements.every((id) => {
      const a = achievments.find((a) => a.id === id);
      return a && a.completed;
    });
    if (allSecretsRedeemed) {
      achievmentsAdd("let_me_in");
    }

    const greenhouse = buildings.find((b) => b.id === "greenhouse");
    if (greenhouse && greenhouse.owned >= 20) {
      achievmentsAdd("smash");
    }

    const peeler = buildings.find((b) => b.id === "cursor");
    const farmer = buildings.find((b) => b.id === "farmer");
    const tractor = buildings.find((b) => b.id === "tractor");
    const chip_factory = buildings.find((b) => b.id === "chip_factory");
    const restaurant = buildings.find((b) => b.id === "restaurant");
    const supermarket = buildings.find((b) => b.id === "supermarket");
    const distillary = buildings.find((b) => b.id === "distillary");
    const airport = buildings.find((b) => b.id === "airport");
    const space_station = buildings.find((b) => b.id === "space_station");
    const planet = buildings.find((b) => b.id === "planet");
    const inter = buildings.find((b) => b.id === "intergalactic_farm");
    const time_machine = buildings.find((b) => b.id === "time_machine");
    const quantum_reactor = buildings.find((b) => b.id === "quantum_reactor");
    if (peeler && peeler.owned >= 100) {
      achievmentsAdd("peel_master");
    }

    if (peeler && peeler.owned >= 200) {
      achievmentsAdd("crisp");
    }

    if (farmer.owned >= 100) {
      achievmentsAdd("grass")
    }

    const chipFactory = buildings.find((b) => b.id === "chip_factory");
    if (chipFactory && chipFactory.owned >= 50) {
      achievmentsAdd("ewww");
    }

    if (window.versionTraveled) {
      achievmentsAdd("time_traveler");
    }

    if (
      peeler?.owned >= 100 &&
      farmer?.owned >= 100 &&
      tractor?.owned >= 100 &&
      greenhouse?.owned >= 100 &&
      chip_factory?.owned >= 100 &&
      restaurant?.owned >= 100 &&
      supermarket?.owned >= 100 &&
      distillary?.owned >= 100 &&
      airport?.owned >= 100 &&
      space_station?.owned >= 100 &&
      planet?.owned >= 100 &&
      intergalactic_farm?.owned >= 100 &&
      time_machine?.owned >= 100 &&
      quantum_reactor?.owned >= 100
    ) {
      achievmentsAdd("yin_yang");
    }

    if (potatoClicks >= 100000) {
      achievmentsAdd("finger");
    }

    if (isPC()) {
      achievmentsAdd("computato");
    }

    if (
      (space_station && space_station.owned >= 1) ||
      (planet && planet.owned >= 1) ||
      (inter && planet.owned >= 1)
    ) {
      achievmentsAdd("astronaut");
    }
    if (space_station.owned + planet.owned + inter.owned >= 10) {
      achievmentsAdd("sus");
    }

    if (comment_count >= 50) {
      achievmentsAdd("bruh");
    }

    checkIfTop10();
  }

  let achievments = [
    {
      id: "first_click",
      name: "First Click",
      description: "Make your first potato click.",
      completed: false,
      skinReward: null,
    },
    {
      id: "hundred_potatoes",
      name: "Century of Potatoes",
      description: "Collect 100 potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "million_potatoes",
      name: "Millionaire",
      description: "Collect 1 million potatoes.",
      completed: false,
      skinReward: "crown",
    },
    {
      id: "billion_potatoes",
      name: "Billionaire",
      description: "Collect 1 billion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "trillion_potatoes",
      name: "Trillionaire",
      description: "Collect 1 trillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "quadrillion_potatoes",
      name: "Quadrillionaire",
      description: "Collect 1 quadrillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "quintillion_potatoes",
      name: "Quintillionaire",
      description: "Collect 1 quintillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "sextillion_potatoes",
      name: "Sextillionaire",
      description: "Collect 1 sextillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "septillion_potatoes",
      name: "Septillionaire",
      description: "Collect 1 septillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "octillion_potatoes",
      name: "Octillionaire",
      description: "Collect 1 octillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "nonillion_potatoes",
      name: "Nonillionaire",
      description: "Collect 1 nonillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "decillion_potatoes",
      name: "Decillionaire",
      description: "Collect 1 decillion potatoes.",
      completed: false,
      skinReward: null,
    },
    {
      id: "pro_clicker",
      name: "Pro Clicker",
      description: "Click 10,000 times in total.",
      completed: false,
      skinReward: null,
    },
    {
      id: "click_frenzy",
      name: "Click Frenzy",
      description: "Click 1,000 times in one session.",
      completed: false,
      skinReward: null,
    },
    {
      id: "click_marathon",
      name: "Click Marathon",
      description: "Click 5,000 times in one session.",
      completed: false,
      skinReward: null,
    },
    {
      id: "click_insanity",
      name: "Click Insanity",
      description: "Click 100,000 times in one session.",
      completed: false,
      skinReward: null,
    },
    {
      id: "click_legend",
      name: "Click Legend",
      description: "Click 1,000,000 times in total.",
      completed: false,
      skinReward: null,
    },
    {
      id: "buidling_enthusiast",
      name: "Building Enthusiast",
      description: "Buy 10 buildings.",
      completed: false,
      skinReward: null,
    },
    {
      id: "building_tycoon",
      name: "Building Tycoon",
      description: "Buy 50 buildings.",
      completed: false,
      skinReward: null,
    },
    {
      id: "building_mogul",
      name: "Building Mogul",
      description: "Buy 200 buildings.",
      completed: false,
      skinReward: null,
    },
    {
      id: "building_king",
      name: "Building King",
      description: "Buy 500 buildings.",
      completed: false,
      skinReward: null,
    },
    {
      id: "building_legend",
      name: "Building Legend",
      description: "Buy 1000 buildings.",
      completed: false,
      skinReward: null,
    },
    {
      id: "upgrade_novice",
      name: "Upgrade Novice",
      description: "Purchase 1 upgrade.",
      completed: false,
      skinReward: null,
    },
    {
      id: "upgrade_intermediate",
      name: "Upgrade Intermediate",
      description: "Purchase 5 upgrades.",
      completed: false,
      skinReward: null,
    },
    {
      id: "upgrade_advanced",
      name: "Upgrade Advanced",
      description: "Purchase 30 upgrades.",
      completed: false,
      skinReward: null,
    },
    {
      id: "upgrade_professional",
      name: "Upgrade Professional",
      description: "Purchase 50 upgrades.",
      completed: false,
      skinReward: null,
    },
    {
      id: "upgrade_expert",
      name: "Upgrade Expert",
      description: "Purchase 10 upgrades.",
      completed: false,
      skinReward: null,
    },
    {
      id: "upgrade_master",
      name: "Upgrade Master",
      description: "Purchase 50 upgrades.",
      completed: false,
      skinReward: null,
    },
    {
      id: "inverted_potatoes",
      name: "Something Feels Wrong",
      description: "Click exactly 666 times in one session.",
      completed: false,
      skinReward: "inverted",
    },
    {
      id: "monochrome_potatoes",
      name: "Monochrome Master",
      description:
        "Buy no upgrades for 10 minutes whilst having the 'Blank' skin equipped.",
      completed: false,
      skinReward: "monochrome",
    },
    {
      id: "overclock",
      name: "Overclock",
      description: "Click 200 times in 30 seconds.",
      completed: false,
      skinReward: "neon",
    },
    {
      id: "you_look_like_a_potato",
      name: "You look like a potato",
      description: "A secret is required to unlock this skin.",
      completed: false,
      skinReward: "face",
    },
    {
      id: "sturdy_as_a_rock",
      name: "Sturdy as a Rock",
      description: "Buy 100 buildings.",
      completed: false,
      skinReward: "rock",
    },
    {
      id: "idle_master",
      name: "Idle Master",
      description: "Idle for 1 hour.",
      completed: false,
      skinReward: "blank",
    },
    {
      id: "developer",
      name: "Developer",
      description: "Click the github link in the navbar.",
      completed: false,
      skinReward: "code",
    },
    {
      id: "variant_collector",
      name: "Variant Collector",
      description: "Use every golden potato variant at least once.",
      completed: false,
      skinReward: "golden",
    },
    {
      id: "five_day_run",
      name: "Five Day Run",
      description: "Start your run 5 days ago.",
      completed: false,
      skinReward: "realistic",
    },
    {
      id: "monster",
      name: "Potato Punch",
      description: "A secret is required to unlock this skin.",
      completed: false,
      skinReward: "monster",
    },
    {
      id: "synth_master",
      name: "Synth Master",
      description: "A secret is required to unlock this skin.",
      completed: false,
      skinReward: "synth",
    },
    {
      id: "collector",
      name: "Collector",
      description: "Unlock every skin in the game..",
      completed: false,
      skinReward: "rainbow",
    },
    {
      id: "4K",
      name: "4K Resolution",
      description: "Collect 10 different skins.",
      completed: false,
      skinReward: "pixel",
    },
    {
      id: "dosser",
      name: "Dosser",
      description: "A secret is required to unlock this skin.",
      completed: false,
      skinReward: "menglish",
    },
    {
      id: "smash",
      name: "Smash!",
      description: "Purchase 20 greenhouses.",
      completed: false,
      skinReward: "glass",
    },
    {
      id: "peel_master",
      name: "Peel Master",
      description: "Purchase 100 peelers.",
      completed: false,
      skinReward: "peeled",
    },
    {
      id: "let_me_in",
      name: "Let me in",
      description: "Find all the secrets in the game.",
      completed: false,
      skinReward: "puzzle",
    },
    {
      id: "ewww",
      name: "Ewww!",
      description: "Purchase 50 chip factories.",
      completed: false,
      skinReward: "sweet",
    },
    {
      id: "seller",
      name: "Seller",
      description: "Sell a building",
      completed: false,
      skinReward: "upside-down",
    },
    {
      id: "potion_clicker",
      name: "Potion Clicker",
      description: "Check out Potion Clicker!.",
      completed: false,
      skinReward: "potion",
    },
    {
      id: "geometry_dash",
      name: "How did you do that!",
      description: "A secret is required to unlock this skin.",
      completed: false,
      skinReward: "geometry",
    },
    {
      id: "baked",
      name: "Mmmm... Yummy!",
      description: "Play the game for 1 week.",
      completed: false,
      skinReward: "baked",
    },
    {
      id: "finger",
      name: "My thumb is sore...",
      description: "Click 100,000 times in total.",
      completed: false,
      skinReward: "finger",
    },
    {
      id: "computato",
      name: "On the big screen!",
      description: "Play on a computer.",
      completed: false,
      skinReward: "computato",
    },
    {
      id: "astronaut",
      name: "We are going up!",
      description: "Purchase 1 space related building.",
      completed: false,
      skinReward: "astronaut",
    },
    {
      id: "sus",
      name: "Wait a second...",
      description: "Purchase 10 space related building.",
      completed: false,
      skinReward: "sus",
    },
    {
      id: "ice",
      name: "Brain Freeze",
      description: "Do nothing for 5 hours.",
      completed: false,
      skinReward: "ice",
    },
    {
      id: "crisp",
      name: "Crunchy.",
      description: "Purchase 200 peelers.",
      completed: false,
      skinReward: "crisp",
    },
    {
      id: "yin_yang",
      name: "Peace.",
      description: "Purchase 100 of everything.",
      completed: false,
      skinReward: "yin_yang",
    },
    {
      id: "grass",
      name: "Click some Grass",
      description: "Purchase 100 farmers.",
      completed: false,
      skinReward: "grass",
    },
    {
      id: "noll_sport",
      name: "Let's get sporty!!",
      description: "A secret is required to unlock this skin.",
      completed: false,
      skinReward: "noll_sport",
    },
    {
      id: "bruh",
      name: "BRUH",
      description: "Cycle through 50 comments without refreshing.",
      completed: false,
      skinReward: "bruh",
    },
    {
      id: "grape_mlg",
      name: "Grape MLG",
      description: "Top 10 on the leaderboard exclusive.",
      completed: false,
      skinReward: "grape_mlg",
    },
    {
      id: "navy",
      name: "The Navy",
      description: "As always, Navy sings second.",
      completed: false,
      skinReward: "navy",
    },
    {
      id: "golden_bruh",
      name: "Golden Bruh",
      description: "A golden secret is required to unlock this skin.",
      completed: false,
      skinReward: "golden_bruh",
    },
    {
      id: "golden_astronaut",
      name: "Golden Astronaut",
      description: "A golden secret is required to unlock this skin.",
      completed: false,
      skinReward: "golden_astronaut",
    },
    {
      id: "missing_texture",
      name: "Golden Astronaut",
      description: "What a lucky person!",
      completed: false,
      skinReward: "missing_texture",
    },
  ];

  let _isTop10 = false;

  async function checkIfTop10() {
      const token = window.authApi?.getToken();
      if (!token) return;

      try {
          const [data, me] = await Promise.all([
              window.authApi.fetchLeaderboard(),
              window.authApi.me()
          ]);

          const top = data?.topPlayers || [];
          const myName = me?.username;
          if (!myName) return;

          _isTop10 = top.slice(0, 10).some(p => p.username === myName);

          if (_isTop10) achievmentsAdd("grape_mlg");
      } catch (e) {
          console.warn("Top10 check failed", e);
      }
  }
  /*
  function updateTimer() {
    const now = new Date();
    const diff = eventTime - now;

    if (diff <= 0) {
      timerEl.textContent = "Event ended!";
      clearInterval(timerInterval);
      return;
    }

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    timerEl.textContent = `Event ends in ${days}d ${hours}h ${minutes}m `;
  }
  */
  let mysteryCount = 0;
  buildings.forEach((b) => {
    if (b.mystery && mysteryCount < 2) {
      b.unlocked = true;
      mysteryCount++;
    } else if (b.mystery) {
      b.unlocked = false;
    }
  });

  function showAchievementPopup(title, description, rewardText = null) {
    const container = document.getElementById("achievement-container");

    const popup = document.createElement("div");
    popup.className = "achievement-popup";

    popup.innerHTML = `
      <div class="achievement-title">Achievement Unlocked</div>
      <div class="achievement-title">${title}</div>
      <div class="achievement-desc">${description}</div>
      ${
        rewardText
          ? `<div class="achievement-reward">🎨 ${rewardText}</div>`
          : ""
      }
    `;

    container.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 3600);
  }

  const comment_names = [
    "Max",
    "Oliver",
    "William",
    "Arthur",
    "Rohan",
    "Kaiden",
    "Leon",
    "David",
    "Ryan",
    "Milo",
    "Rowan",
  ];

  Codebutton.addEventListener("click", () => {
    const value = Codeinput.value;
    if (value === "potatopunch") {
      achievmentsAdd("monster");
      alert("Code redeemed! Achievement unlocked: Potato Punch");
      hints.textContent = "That's where my drink was!!!"
      hints.style.color = "lightgreen";
    } else if (value === "potatobeats") {
      achievmentsAdd("synth_master");
      alert("Code redeemed! Achievement unlocked: Synth Master");
      hints.textContent = "Now you can play music whilst clicking!!"
      hints.style.color = "lightgreen";
    } else if (value === "canicomeingary") {
      achievmentsAdd("you_look_like_a_potato");
      hints.textContent = "Come in..."
      hints.style.color = "lightgreen";
      alert("Code redeemed! Achievement unlocked: You look like a potato");
    } else if (value === "dossersgames") {
      achievmentsAdd("dosser");
      alert("Code redeemed! Achievement unlocked: Menglish");
      hints.textContent = "Those who know..."
      hints.style.color = "lightgreen";
    } else if (value === "impossibletiming") {
      achievmentsAdd("geometry_dash");
      alert("Code redeemed! Achievement unlocked: How did you do that!");
      hints.textContent = "That really does require impossible timing!"
      hints.style.color = "lightgreen";
    } else if (value === "basketballrat") {
      achievmentsAdd("noll_sport");
      alert("Code redeemed! Achievement unlocked: Let's get sporty!");
      hints.textContent = "What are you waiting for?!?!"
      hints.style.color = "lightgreen";
    } else if (value === "flynavy") {
      achievmentsAdd("navy");
      alert("Code redeemed! Achievement unlocked: Fly Navy!");
      hints.textContent = "Navy sings second!"
      hints.style.color = "lightgreen";
    } else {
      hints.textContent = rollRandomHint();
    }
    Codeinput.value = "";
  });

  CodebuttonGolden.addEventListener("click", () => {
    const value = CodeinputGolden.value;
    if (value === "D3LUXEBRUH") {
      achievmentsAdd("golden_bruh");
      alert("Code redeemed! Achievement unlocked: Golden Bruh");
    } else if (value === "ASTR0N_AU_T") {
      achievmentsAdd("golden_astronaut");
      alert("Code redeemed! Achievement unlocked: Golden Astronaut");
    }
    CodeinputGolden.value = "";
  });

  function storeCounter() {
    storeCount++;
  }

  function random_name() {
    return comment_names[Math.floor(Math.random() * comment_names.length)];
  }

  var comment_types = {
    none: [
      "Nobody is talking about your potatoes.",
      "Your potatoes are non-existent.",
      "You have no potatoes to discuss.",
      "Your potatoes are invisible to the world.",
      "Even the dirt is disappointed."
    ],

    under100: [
      "Your potatoes are being ignored.",
      "Many people overlook your potatoes.",
      "Your potatoes are not getting any attention.",
      "Your potatoes are infected.",
      "Someone stepped on one by accident."
    ],

    _1000to5000: [
      "Your potatoes are getting some attention.",
      "A few people are noticing your potatoes.",
      "You are making a few sales a day.",
      () => `A kid named ${random_name()} adopted one of your potatoes.`,
      "At least someone believes in you."
    ],

    _5000to20000: [
      "Your potato business is rising!",
      "People are leaving reviews about your stall.",
      "People are actually buying your potatoes.",
      "Your potatoes are a solid 7/10.",
      "Someone asked for seconds."
    ],

    _20000to100000: [
      "Your potatoes are going viral on social media!",
      "People are talking about your potatoes.",
      "People are queuing up for potatoes.",
      "Your potatoes made the newspaper!",
      "You might need more crates."
    ],

    _100000to500000: [
      "You have regular customers now.",
      "Your potatoes are used in everyday meals.",
      "People ask you for business advice.",
      "Your stall stands out from the rest.",
      "Competitors are getting nervous."
    ],

    _500000to1000000: [
      "You have been invited onto the news!",
      "You moved into a bigger building.",
      "Your town’s flag has a potato on it.",
      "People travel hours to see your potatoes.",
      "Everyone loves your potatoes!!"
    ],

    _1Mto10M: [
      "The king requested a potato tasting.",
      "You released official potato merch.",
      "You should probably touch grass.",
      "Your potatoes are No.1 nationwide.",
      "Historians are taking notes."
    ],

    _10Mto50M: [
      "Your potatoes have their own website.",
      "Potatoes are your country’s national dish.",
      "Schools teach about your potatoes.",
      "Keep going… this is getting serious.",
      "Your face is on the logo now."
    ],

    _50Mto100M: [
      "Your potatoes crossed borders.",
      "Foreign markets demand shipments.",
      "You hired managers for your managers.",
      "Potato stocks are booming.",
      "This is no longer a small business."
    ],

    _100Mto500M: [
      "Your potatoes are globally recognised.",
      "World leaders discuss potato policy.",
      "You accidentally caused inflation.",
      "Entire cities rely on your supply.",
      "This feels excessive."
    ],

    _500Mto1B: [
      "You are the potato monopoly.",
      "Documentaries are being made.",
      "Your potatoes appear in history books.",
      "Economies collapse without you.",
      "This has gone too far."
    ],

    _1Bto10B: [
      "Your potatoes fund space programs.",
      "You own islands shaped like potatoes.",
      "Aliens requested a trade deal.",
      "Earth is running on potatoes.",
      "Please stop."
    ],

    _10Bto100B: [
      "Your potatoes reached the moon.",
      "Time travelers mention your name.",
      "Reality bends around your farm.",
      "Potato worship has begun.",
      "This is getting uncomfortable."
    ],

    _100Bto1T: [
      "Your potatoes exist beyond comprehension.",
      "Numbers have lost meaning.",
      "The universe acknowledges your potatoes.",
      "You beat the game. Probably.",
      "There is nothing left to click."
    ]
  };

  function setCommentSmooth(text) {
    comments.style.opacity = "0";
    comments_mobile.style.opacity = "0";

    setTimeout(() => {
      comments.innerText = text;
      comments.style.opacity = "1";
      comments_mobile.innerText = text;
      comments_mobile.style.opacity = "1";
    }, 400);
  }

  function achievmentsAdd(id) {
    const a = achievments.find((a) => a.id === id);
    if (!a || a.completed) return;
    achievementSound.volume = sfxVolume;
    achievementSound.currentTime = 0;
    achievementSound.play();
    a.completed = true;

    let rewardText = null;

    if (a.skinReward) {
      unlockSkin(a.skinReward);

      const skin = skins.find((s) => s.id === a.skinReward);
      if (skin) {
        rewardText = `Skin unlocked — ${skin.name}`;
      }
    }

    showAchievementPopup(a.name, a.description, rewardText);
    console.log(`Achievement unlocked: ${a.name}`);

    saveGame(true);
  }
  async function updatePotatoComments() {
    comment_count++;
    setTimeout(updatePotatoComments, 10000);

    let newComment;

    if (potatoes === 0) {
      newComment =
        comment_types.none[
          Math.floor(Math.random() * comment_types.none.length)
        ];

    } else if (potatoes < 100) {
      newComment =
        comment_types.under100[
          Math.floor(Math.random() * comment_types.under100.length)
        ];

    } else if (potatoes < 5_000) {
      newComment =
        comment_types._1000to5000[
          Math.floor(Math.random() * comment_types._1000to5000.length)
        ];

    } else if (potatoes < 20_000) {
      newComment =
        comment_types._5000to20000[
          Math.floor(Math.random() * comment_types._5000to20000.length)
        ];

    } else if (potatoes < 100_000) {
      newComment =
        comment_types._20000to100000[
          Math.floor(Math.random() * comment_types._20000to100000.length)
        ];

    } else if (potatoes < 500_000) {
      newComment =
        comment_types._100000to500000[
          Math.floor(Math.random() * comment_types._100000to500000.length)
        ];

    } else if (potatoes < 1_000_000) {
      newComment =
        comment_types._500000to1000000[
          Math.floor(Math.random() * comment_types._500000to1000000.length)
        ];

    } else if (potatoes < 10_000_000) {
      newComment =
        comment_types._1Mto10M[
          Math.floor(Math.random() * comment_types._1Mto10M.length)
        ];

    } else if (potatoes < 50_000_000) {
      newComment =
        comment_types._10Mto50M[
          Math.floor(Math.random() * comment_types._10Mto50M.length)
        ];

    } else if (potatoes < 100_000_000) {
      newComment =
        comment_types._50Mto100M[
          Math.floor(Math.random() * comment_types._50Mto100M.length)
        ];

    } else if (potatoes < 500_000_000) {
      newComment =
        comment_types._100Mto500M[
          Math.floor(Math.random() * comment_types._100Mto500M.length)
        ];

    } else if (potatoes < 1_000_000_000) {
      newComment =
        comment_types._500Mto1B[
          Math.floor(Math.random() * comment_types._500Mto1B.length)
        ];

    } else if (potatoes < 10_000_000_000) {
      newComment =
        comment_types._1Bto10B[
          Math.floor(Math.random() * comment_types._1Bto10B.length)
        ];

    } else if (potatoes < 100_000_000_000) {
      newComment =
        comment_types._10Bto100B[
          Math.floor(Math.random() * comment_types._10Bto100B.length)
        ];

    } else {
      newComment =
        comment_types._100Bto1T[
          Math.floor(Math.random() * comment_types._100Bto1T.length)
        ];
    }

    if (typeof newComment === "function") {
      newComment = newComment();
    }

    setCommentSmooth(newComment);
  }

  function formatNumber(num) {
    const units = [
      {
        value: 1_000_000_000_000_000_000_000_000_000_000_000,
        label: "decillion",
      },
      { value: 1_000_000_000_000_000_000_000_000_000_000, label: "nonillion" },
      { value: 1_000_000_000_000_000_000_000_000_000, label: "octillion" },
      { value: 1_000_000_000_000_000_000_000_000, label: "septillion" },
      { value: 1_000_000_000_000_000_000_000, label: "sextillion" },
      { value: 1_000_000_000_000_000_000, label: "quintillion" },
      { value: 1_000_000_000_000_000, label: "quadrillion" },
      { value: 1_000_000_000_000, label: "trillion" },
      { value: 1_000_000_000, label: "billion" },
      { value: 1_000_000, label: "million" },
    ];
    for (const unit of units) {
      if (num >= unit.value) {
        return (
          (num / unit.value).toFixed(2).replace(/\.?0+$/, "") + " " + unit.label
        );
      }
    }
    return num.toLocaleString();
  }

  function updatePotatoDisplay() {
    if (potatoes === 1) {
      clickerCountDisplay.innerText = Math.floor(potatoes) + " potato";
      titleElement.innerText =
        Math.floor(potatoes) + " potato - Potato Clicker";
      return;
    } else {
      clickerCountDisplay.innerText =
        formatNumber(Math.floor(potatoes)) + " potatoes";
      titleElement.innerText =
        formatNumber(Math.floor(potatoes)) + " potatoes - Potato Clicker";
    }
    //heartsCountDisplay.innerText = formatNumber(Math.floor(hearts))
    if (frenzy || half_price_amount === 0.5) {
      clickerCountDisplay.style.color = "gold";
    } else {
      clickerCountDisplay.style.color = "white";
    }
  }

  function rateCounter() {
    document.querySelector(".potato-amount-persecond").innerText =
      "per second: " +
      (Math.floor(autoClickAmount * 10 * frenzy_amount * window.production_percent) / 10).toLocaleString();
    setTimeout(rateCounter, 1000);
    if (frenzy || half_price_amount === 0.5) {
      document.querySelector(".potato-amount-persecond").style.color = "gold";
    } else {
      document.querySelector(".potato-amount-persecond").style.color = "white";
    }

    if (frenzy || half_price_amount === 0.5) {
      document.querySelector(".shine").style.filter =
        "sepia(1) saturate(8) hue-rotate(38deg) brightness(1.25) contrast(1.4)";
      document.querySelector(".shine2").style.filter =
        "sepia(1) saturate(80) hue-rotate(360deg) brightness(1.25) contrast(1.4)";
    } else {
      document.querySelector(".shine").style.filter = "none";
      document.querySelector(".shine2").style.filter = "none";
    }
  }

  function formatRunTime(seconds) {
    seconds = Math.floor(seconds);

    const YEAR = 365 * 24 * 3600;
    const DAY = 24 * 3600;
    const HOUR = 3600;

    const years = Math.floor(seconds / YEAR);
    seconds %= YEAR;

    const days = Math.floor(seconds / DAY);
    seconds %= DAY;

    const hours = Math.floor(seconds / HOUR);

    const parts = [];
    if (years) parts.push(`${years} years`);
    if (days || years) parts.push(`${days} days`);
    parts.push(`${hours} hours`);

    return parts.join(" ");
  }

  function updateStatsDisplay() {
    potatoesCountElement.innerText =
      "Potatoes in bank: " + formatNumber(Math.floor(potatoes * 10) / 10);
    allTimePotatoesElement.innerText =
      "Potatoes gathered (all time): " +
      formatNumber(Math.floor(allTimePotatoes * 10) / 10);
    runDurationSeconds = Math.floor((Date.now() - runStartTime) / 1000);
    runStartTimeElement.innerText =
      "Run started: " + formatRunTime(runDurationSeconds) + " ago";
    buildingsOwnedElement.innerText = "Buildings owned: " + buildingsOwned;
    potatoesPerSecondElement.innerText =
      "Potatoes per second: " + Math.floor(autoClickAmount * 10) / 10;
    potatoesPerClickElement.innerText =
      "Potatoes per click: " + formatNumber(window.potatoesPerClick || potatoesPerClick);
    potatoClicksElement.innerText = "Potato clicks: " + potatoClicks;
    handFarmedPotatoesElement.innerText =
      "Hand-farmed potatoes: " + formatNumber(handFarmedPotatoes);
    goldenPotatoClicksElement.innerText =
      "Golden potato clicks: " + goldenPotatoClicks;
    runningVersionElement.innerText = "Running version: " + runningVersion;
    versionElement.innerText = runningVersion;
    upgradeTotalElement.innerText = `Upgrades unlocked: ${upgrades.filter((u) => u.completed).length}/54 (${Math.floor((upgrades.filter((u) => u.completed).length / 54) * 100 * 10) / 10}%)`;
    achievmentTotalElement.innerText = `Total Upgrades: ${achievments.filter((a) => a.completed).length}/48 (${Math.floor((achievments.filter((a) => a.completed).length / 48) * 100 * 10) / 10}%)`;
    setTimeout(updateStatsDisplay, 1000);
  }

  function enforceMysteryLimit() {
    let activeMysteryCount = buildings.filter(
      (b) => b.mystery && b.unlocked,
    ).length;

    let mysterySlots = 2 - activeMysteryCount;

    buildings.forEach((b) => {
      if (!b.mystery) {
        b.unlocked = true;
        return;
      }

      if (b.unlocked && mysterySlots <= 0) {
        return;
      }

      if (!b.unlocked && mysterySlots > 0) {
        b.unlocked = true;
        mysterySlots--;
      }
    });
  }

  function getSaveObject() {
    const save = {
      version: runningVersion,
      stats: {
        savedAt: Date.now(),
        potatoes,
        allTimePotatoes,
        runStartedAt: Date.now() - (runDurationSeconds || 0) * 1000,
        potatoesPerClick,
        autoClickAmount,
        potatoClicks,
        handFarmedPotatoes,
        goldenPotatoClicks,
        buildingsOwned,
        totalUpgrades,
        //hearts,
        backgroundAlpha,
        rp: window.rp,
        rebirthPersistedPurchased: window._rebirthPersistedPurchased || [],
      },
      buildings: {},
      upgrades: {},

      skins: skins.map((s) => ({
        id: s.id,
        unlocked: s.unlocked,
        equipped: s.equipped,
      })),

      achievments: achievments.map((a) => ({
        id: a.id,
        completed: a.completed,
      })),
    };

    buildings.forEach((b) => {
      save.buildings[b.id] = {
        owned: b.owned,
        mystery: b.mystery,
        totalGenerated: b.totalGenerated,
        cpsMultiplier: b.cpsMultiplier,
      };
    });

    upgrades.forEach((u) => {
      save.upgrades[u.id] = {
        unlocked: u.unlocked,
        completed: u.completed,
      };
    });

    return save;
  }

  function saveLocal() {
    const save = getSaveObject();
    localStorage.setItem(SAVE_KEY_V2, JSON.stringify(save));
  }

  async function saveToDb(showStatus = false) {
    const save = getSaveObject();

    if (window.authApi && window.authApi.getToken()) {
      try {
        await window.authApi.save(save);
        lastDbSaveTime = Date.now();
        console.log("DB save successful");

        if (window.authApi.updateLeaderboardUI) {
          window.authApi.updateLeaderboardUI();
        }

        if (showStatus && accountStatus) {
          accountStatus.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
          setTimeout(() => {
            if (accountStatus) accountStatus.textContent = " ";
          }, 4000);
        }
      } catch (e) {
        console.warn("DB save failed", e);
        if (showStatus && accountStatus) {
          accountStatus.textContent = "Save failed (network)";
          setTimeout(() => {
            if (accountStatus) accountStatus.textContent = " ";
          }, 4000);
        }
      }
    }
  }

  async function saveGame(majorChange = false) {
    saveLocal();


    if (majorChange) {
      console.log("Major change detected - saving to DB");
      await saveToDb(true);
    } else if (window.authApi && window.authApi.getToken()) {
      const timeSinceLastDbSave = Date.now() - lastDbSaveTime;
      if (timeSinceLastDbSave >= DB_SAVE_INTERVAL_MS) {
        console.log("20 minutes elapsed - saving to DB");
        await saveToDb(false);
      }
    }
  }

  let _lastManualSave = 0;
const MANUAL_SAVE_COOLDOWN_MS = 30 * 1000;

  function saveGameManual() {
      const btn = document.getElementById("saveButton");
      const now = Date.now();
      const remaining = MANUAL_SAVE_COOLDOWN_MS - (now - _lastManualSave);

      if (remaining > 0) {
          if (btn) {
              const originalText = btn.innerHTML;
              btn.innerHTML = `<p>Wait ${Math.ceil(remaining / 1000)}s</p>`;
              setTimeout(() => { if (btn) btn.innerHTML = originalText; }, 1500);
          }
          return;
      }

      _lastManualSave = now;

      // Cancel any pending debounced save since we're saving now
      clearTimeout(_dbSaveDebounceTimer);

      if (btn) {
          btn.disabled = true;
          const originalText = btn.innerHTML;
          btn.innerHTML = "<p>Saving...</p>";
          saveLocal();
          Promise.resolve(saveToDb(true))
              .catch(() => {})
              .finally(() => {
                  if (btn) {
                      btn.disabled = false;
                      btn.innerHTML = originalText;
                  }
              });
      }
  }

  async function loadGameManual() {
    const btn = document.getElementById("loadButton");
    if (btn) {
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = "<p>Loading...</p>";
      
      try {
        await loadGame();
        updateDisplay();
        updateStatsDisplay();
        renderBuildingsRegular();
        renderUpgradesRegular();
        renderSkins();
        applyEquippedSkin();
      } catch (e) {
        console.error("Manual load failed", e);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      }
    }
  }

  async function loadGame() {
    const localSaveRaw = localStorage.getItem(SAVE_KEY_V2);
    const localSave = localSaveRaw ? JSON.parse(localSaveRaw) : null;

    if (window.authApi && window.authApi.getToken()) {
      try {
        const remoteSave = await window.authApi.load();

        if (remoteSave && remoteSave.stats) {
          let saveToLoad = remoteSave;

          if (localSave && localSave.stats) {
            const remoteAllTime = remoteSave.stats?.allTimePotatoes || 0;
            const localAllTime = localSave.stats?.allTimePotatoes || 0;

            if (localAllTime > remoteAllTime) {
              saveToLoad = localSave;
              await window.authApi.save(localSave);
            } else {
              localStorage.setItem(SAVE_KEY_V2, JSON.stringify(remoteSave));
            }
          }

          loadV2(saveToLoad);
        } else if (localSave) {
          console.log("No backend save found, loading local save");
          loadV2(localSave);
          await window.authApi.save(localSave);
        } else {
          migrateOldSave();
        }
      } catch (err) {
        console.log("Backend load failed, using local save", err);
        if (localSave) loadV2(localSave);
        else migrateOldSave();
      }
    } else {
      if (localSave) loadV2(localSave);
      else migrateOldSave();
    }
  }

  function applyEquippedSkin() {
    const equippedSkin = skins.find((s) => s.equipped);
    if (!equippedSkin) return;

    const potatoImage = document.getElementById("potatoImage");
    potatoImage.src = equippedSkin.image;
  }

  function loadV2(save) {
    const s = save.stats;

    potatoes = s.potatoes;
    allTimePotatoes = s.allTimePotatoes;
    runStartTime = s.runStartedAt;
    potatoesPerClick = s.potatoesPerClick;
    window.potatoesPerClick = potatoesPerClick;
    window._basePotatoesPerClick = potatoesPerClick;
    autoClickAmount = s.autoClickAmount;
    potatoClicks = s.potatoClicks;
    handFarmedPotatoes = s.handFarmedPotatoes;
    goldenPotatoClicks = s.goldenPotatoClicks;
    buildingsOwned = s.buildingsOwned;
    totalUpgrades = s.totalUpgrades;
    //hearts = typeof s.hearts === 'number' ? s.hearts : (hearts ?? 0);
    window.rp = typeof s.rp === 'number' ? s.rp : 0;
    window._rebirthPersistedPurchased = Array.isArray(s.rebirthPersistedPurchased) ? s.rebirthPersistedPurchased : [];
    backgroundAlpha = typeof s.backgroundAlpha === 'number' ? s.backgroundAlpha: 0.1;

    const slider = document.getElementById("darkenSlider");
    const backgrounds = document.querySelectorAll(".pixelated-background");
    if (slider && backgrounds.length) {
      slider.value = backgroundAlpha;
      backgrounds.forEach(bg => {
        bg.style.setProperty("--overlay-alpha", backgroundAlpha);
      });
    }

    buildings.forEach((b) => {
      const data = save.buildings[b.id];
      if (!data) return;
      b.owned = data.owned;
      b.mystery = data.mystery;
      b.price = Math.ceil(b.basePrice * Math.pow(1.15, b.owned));
      b.totalGenerated = data.totalGenerated || 0;
      b.cpsMultiplier = data.cpsMultiplier || 1;
    });

    upgrades.forEach((u) => {
      const data = save.upgrades[u.id];
      if (!data) return;
      u.unlocked = data.unlocked;
      u.completed = data.completed;
    });

    if (save.skins) {
      save.skins.forEach((savedSkin) => {
        const skin = skins.find((s) => s.id === savedSkin.id);
        if (!skin) return;

        skin.unlocked = savedSkin.unlocked;
        skin.equipped = savedSkin.equipped;
      });
    }

    if (save.achievments) {
      save.achievments.forEach((savedA) => {
        const a = achievments.find((a) => a.id === savedA.id);
        if (!a) return;

        a.completed = savedA.completed;
      });
    }

    calculateAutoClick();
    applyEquippedSkin();
  }

  function migrateOldSave() {
    potatoes = +localStorage.getItem("potatoes") || 0;
    allTimePotatoes = +localStorage.getItem("potatoes_gathered") || 0;
    potatoesPerClick = +localStorage.getItem("potatoes_per_click") || 1;
    autoClickAmount = +localStorage.getItem("potatoes_per_second") || 0;
    potatoClicks = +localStorage.getItem("potato_clicks") || 0;
    handFarmedPotatoes = +localStorage.getItem("hand_farmed_potatoes") || 0;
    goldenPotatoClicks = +localStorage.getItem("golden_potato_clicks") || 0;
    buildingsOwned = +localStorage.getItem("buildings_owned") || 0;

    const map = {
      cursor: "cursors",
      farmer: "farmers",
      tractor: "tractors",
      greenhouse: "greenhouses",
      chip_factory: "chip_factorys",
      restaurant: "restaurants",
      supermarket: "supermarkets",
      distillary: "distillarys",
      airport: "airports",
    };

    buildings.forEach((b) => {
      b.owned = +localStorage.getItem(map[b.id]) || 0;
      b.mystery = JSON.parse(localStorage.getItem(`${b.id}_mystery`) || "true");
      b.price = Math.ceil(b.basePrice * Math.pow(1.15, b.owned));
      b.totalGenerated = 0;
      b.cpsMultiplier = 1;
    });

    saveGame();
  }

  function getEquippedSkinId() {
    const raw = localStorage.getItem("potato_clicker_save_v2");
    if (!raw) return "default";

    try {
      const save = JSON.parse(raw);
      const equipped = save.skins?.find(s => s.equipped);
      return equipped?.id || "default";
    } catch {
      return "default";
    }
  }

  function clampTooltipPosition(x, y, tooltipRect) {
    const margin = 12;                         // distance from window edges
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal – stay inside the window
    let left = Math.min(Math.max(margin, x), vw - tooltipRect.width - margin);
    // Try to place below the cursor; if there is no room, flip above
    let top = y + 20;
    if (top + tooltipRect.height + margin > vh) top = y - tooltipRect.height - 8;
    top = Math.max(margin, Math.min(top, vh - tooltipRect.height - margin));

    return { left, top };
  }

  function clearLocalData() {
    if (
      confirm(
        "Are you sure you want to erase your current save (this change cannot by reverted)?",
      )
    ) {
      localStorage.clear();
      location.reload();
    } else {
      console.log("DEBUG: Canceled");
    }
  }

  clickerButton.addEventListener("click", function () {
    const skinId = getEquippedSkinId();
    if (skinId === "synth") {
      playRandomSound();
    } else {
      clickSound.volume = sfxVolume;
      clickSound.currentTime = 0.0057;
      clickSound.play();
    }
    
    const now = Date.now();
    recentClicks.push(now);

    recentClicks = recentClicks.filter((t) => now - t <= 30000);
    window.clicksLast30Seconds = recentClicks.length;

    clickerButton.disabled = true;
    const ppc = window.potatoesPerClick || potatoesPerClick;
    potatoes += Math.floor(ppc * 10) / 10;
    rawPotatoes += ppc;
    handFarmedPotatoes += ppc;
    allTimePotatoes += ppc;
    window.allTimePotatoes = allTimePotatoes;
    potatoClicks++;
    //hearts++;
    markPlayerActivity();
    checkAchievements();

    updatePotatoDisplay();
    renderBuildings();
    renderUpgrades();
    setTimeout(() => {
      clickerButton.disabled = false;
    }, 85);
  });

  function randomMinutes(min, max) {
    return Math.random() * (max - min) + min;
  }

  const GOLDEN_VISIBLE_TIME = 10 * 1000; // visible for 10s

  // ✅ 10–20 minutes
  const GOLDEN_DELAY_MIN = 10 * 60 * 1000;

  let spawnTimeout = null;
  let hideTimeout = null;

  let goldenPotatoVariants = ["normal", "frenzy", "half_price"];
  let totalCollectedVariants = new Set();

  // -------------------- CLICK HANDLER --------------------
  goldenPotatoImage.addEventListener("click", (e) => {
    markPlayerActivity();

    const variant =
      goldenPotatoVariants[
        Math.floor(Math.random() * goldenPotatoVariants.length)
      ];

    const text = document.createElement("div");
    text.className = "text";

    let reward = 0;

    if (variant === "normal") {
      totalCollectedVariants.add("normal");
      reward = autoClickAmount * 3000;
      text.textContent = `Lucky, ${formatNumber(reward)} Potatoes!`;
    } else if (variant === "frenzy") {
      totalCollectedVariants.add("frenzy");
      frenzy = true;
      text.textContent = `3 Minute Frenzy!`;
      setTimeout(() => (frenzy = false), 3 * 60 * 1000);
    } else if (variant === "half_price") {
      totalCollectedVariants.add("half_price");
      half_price_amount = 0.5;
      text.textContent = `3 Minute Half Price!`;
      setTimeout(() => (half_price_amount = 1), 3 * 60 * 1000);
    }

    text.style.left = e.clientX + (Math.random() * 40 - 20) + "px";
    text.style.top = e.clientY - 20 + "px";
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 1000);

    potatoes += reward;
    allTimePotatoes += reward;
    goldenPotatoClicks++;

    updatePotatoDisplay();
    renderBuildings();
    renderUpgrades();

    hideGoldenPotato();
  });

  // -------------------- SHOW / HIDE --------------------
  function showGoldenPotato() {
    goldenPotatoImage.classList.remove("hidden");
    goldenPotatoImage.classList.add("shown");

    const padding = 20;
    const maxX = window.innerWidth - goldenPotatoImage.offsetWidth - padding;
    const maxY = window.innerHeight - goldenPotatoImage.offsetHeight - padding;

    const x = Math.random() * maxX + padding;
    const y = Math.random() * maxY + padding;

    goldenPotatoImage.style.left = `${x}px`;
    goldenPotatoImage.style.top = `${y}px`;
    goldenPotatoImage.style.transform = "none";

    hideTimeout = setTimeout(hideGoldenPotato, GOLDEN_VISIBLE_TIME);
  }

  function hideGoldenPotato() {
    goldenPotatoImage.classList.add("hidden");
    goldenPotatoImage.classList.remove("shown");
    clearTimeout(hideTimeout);
    scheduleNextGoldenPotato();
  }

  // -------------------- SPAWN --------------------
  function scheduleNextGoldenPotato() {
    clearTimeout(spawnTimeout);
    const goldenDelayMax = 20 * 60 * 1000 * (window.golden_timing_perk || 1);
    const delay = Math.random() * (goldenDelayMax - GOLDEN_DELAY_MIN) + GOLDEN_DELAY_MIN;
    spawnTimeout = setTimeout(showGoldenPotato, delay);
}

  // -------------------- INITIAL SPAWN --------------------
  scheduleNextGoldenPotato();

  function showTooltip(html, anchorElement) {
    // 1️⃣  Cancel any pending hide timers (fast mouse moves)
    clearTimeout(tooltip._hideTimer);
    clearTimeout(tooltip._mobileHideTimer);

    // 2️⃣  Fill content and make it visible
    tooltip.innerHTML = html;
    tooltip.classList.remove("hidden");
    tooltip.classList.add("shown");

    // 3️⃣  Initial placement – use the *current* mouse position.
    //     If the call comes from a keyboard/script we fall back to the centre of the element.
    const fallbackX = anchorElement.getBoundingClientRect().left +
                      anchorElement.getBoundingClientRect().width / 2;
    const fallbackY = anchorElement.getBoundingClientRect().top +
                      anchorElement.getBoundingClientRect().height / 2;

    // These will be updated on every mousemove (desktop)
    let lastX = fallbackX;
    let lastY = fallbackY;

    const place = () => {
      const { left, top } = clampTooltipPosition(
        lastX,
        lastY,
        tooltip.getBoundingClientRect()
      );
      tooltip.style.left = `${left}px`;
      tooltip.style.top  = `${top}px`;
    };
    place();   // initial placement

    // 4️⃣  Desktop – attach a live mousemove listener
    if (!isTouchDevice) {
      const mouseMove = (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        place();
      };
      tooltip._mouseMoveHandler = mouseMove;
      document.addEventListener("mousemove", mouseMove);
    } else {
      // 5️⃣  Mobile – hide when the user taps anywhere outside the tooltip
      const tapAway = (e) => {
        if (!tooltip.contains(e.target)) hideTooltipImmediate();
      };
      tooltip._tapAwayHandler = tapAway;
      document.addEventListener("touchstart", tapAway);
    }
  }


  function hideTooltip() {
    tooltip._hideTimer = setTimeout(() => {
      hideTooltipImmediate();
    }, 80);
  }

  function hideTooltipImmediate() {
    clearTimeout(tooltip._hideTimer);
    clearTimeout(tooltip._mobileHideTimer);

    // Remove desktop mouse‑move listener
    if (tooltip._mouseMoveHandler) {
      document.removeEventListener("mousemove", tooltip._mouseMoveHandler);
      tooltip._mouseMoveHandler = null;
    }
    // Remove mobile tap‑away listener
    if (tooltip._tapAwayHandler) {
      document.removeEventListener("touchstart", tooltip._tapAwayHandler);
      tooltip._tapAwayHandler = null;
    }

    tooltip.classList.remove("shown");
    tooltip.classList.add("hidden");
  }

  const renderedUpgrades = new Map();

  function renderUpgrades() {
    const container = document.getElementById("upgrades");
    if (!container) return;

    const buildingMap = {
      peeler: "cursor",
      farmer: "farmer",
      tractor: "tractor",
      greenhouse: "greenhouse",
      chipfactory: "chip_factory",
      restaurant: "restaurant",
      supermarket: "supermarket",
      distillary: "distillary",
      airport: "airport",
      spacestation: "space_station",
      planet: "planet",
      intergalacticfarm: "intergalactic_farm",
      timemachine: "time_machine",
      quantumreactor: "quantum_reactor",
    };

    upgrades.forEach(u => {
      for (const key in buildingMap) {
        const building = buildings.find(b => b.id === buildingMap[key]);
        if (!building) continue;
        if (u.id.includes(`${key}x2_1`) || u.id.includes(`${key}x2_2`))
          u.unlocked = building.owned >= 1 && !u.completed;
        if (u.id.includes(`${key}x2_3`))
          u.unlocked = building.owned >= 10 && !u.completed;
        if (u.id.includes(`${key}x2_4`))
          u.unlocked = building.owned >= 20 && !u.completed;
      }
    });

    const visible = upgrades
      .filter(u => u.unlocked && !u.completed)
      .sort((a, b) => a.price - b.price);

    const visibleIds = new Set(visible.map(u => u.id));

    for (const [id, btn] of renderedUpgrades) {
      if (!visibleIds.has(id)) {
        btn.remove();
        renderedUpgrades.delete(id);
      }
    }

    visible.forEach(u => {
      let upgradeButton = renderedUpgrades.get(u.id);

      if (!upgradeButton) {
        upgradeButton = document.createElement("button");
        upgradeButton.className = "upgrades-container";

        const img = document.createElement("img");
        img.src = u.icon;
        img.width = 70;
        img.draggable = false;
        img.className = "upgrade-button";

        upgradeButton.appendChild(img);

        upgradeButton.addEventListener("mouseenter", () => {
          showTooltip(
            `
            <div class="title">${u.name}</div>
            <div>${u.description}</div>
            <div class="effect">${u.effect}</div>
            <div class="price">Cost: ${formatNumber(u.price * half_price_amount)} potatoes</div>
            `,
            upgradeButton,
          );
        });
        upgradeButton.addEventListener("mouseleave", hideTooltip);

        upgradeButton.addEventListener("click", () => {
          const cost = u.price * half_price_amount;
          if (potatoes < cost) {
            errorSound.volume = sfxVolume;
            errorSound.currentTime = 0.5;
            errorSound.play();
            return
          };
          upgradeSound.volume = sfxVolume;
          upgradeSound.currentTime = 0.5;
          upgradeSound.play();
          potatoes -= cost;
          u.completed = true;
          u.unlocked = false;
          totalUpgrades++;

          upgradeButton.style.opacity = 0.4;
          updatePotatoDisplay();

          const effects = {
            peeler: "cursor",
            farmer: "farmer",
            tractor: "tractor",
            greenhouse: "greenhouse",
            chipfactory: "chip_factory",
            restaurant: "restaurant",
            supermarket: "supermarket",
            distillary: "distillary",
            airport: "airport",
            spacestation: "space_station",
            planet: "planet",
            intergalacticfarm: "intergalactic_farm",
            timemachine: "time_machine",
            quantumreactor: "quantum_reactor",
          };

          for (const key in effects) {
            if (u.id.includes(key)) {
              const b = buildings.find(b => b.id === effects[key]);
              if (b) b.cpsMultiplier *= 2;
              if (key === "peeler") {
                potatoesPerClick *= 2;
                window._basePotatoesPerClick = potatoesPerClick;
                window.potatoesPerClick = potatoesPerClick;
              }
            }
          }

          calculateAutoClick();

          requestAnimationFrame(() => {
            renderBuildings();
            renderUpgrades();
          });

          scheduleSave();
        });

        renderedUpgrades.set(u.id, upgradeButton);
        container.appendChild(upgradeButton);
      }

      const canAfford = potatoes >= u.price * half_price_amount;
      upgradeButton.style.opacity = canAfford ? 1 : 0.8;
    });
  }

  let peelerOrbitStarted = false;
  let groupStepTime = 1000;
  let groupIndex = 0;
  const rollGroupSize = 5;

  const gapFirstRows = -7;
  const gapLaterRows = 0;
  const rollDistance = 10;
  const bobAmount = 2;

  function renderPeelerOrbit(timestamp) {
    const orbit = document.querySelector(".peeler-orbit");
    if (!orbit) return;

    const peeler = getPeelerBuilding();
    const count = peeler?.owned ?? 0;
    if (count === 0) return;
    while (orbit.children.length > count) orbit.lastChild.remove();
    while (orbit.children.length < count) {
      const img = document.createElement("img");
      img.className = "peeler";
      img.src = peeler.icon;
      img.draggable = false;
      orbit.appendChild(img);
      img.style.opacity = "0";
      img.style.transition = "opacity 0.3s ease";
      requestAnimationFrame(() => (img.style.opacity = "1"));
    }
    const rect = orbit.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2 + 30;

    if (timestamp) groupIndex = Math.floor(timestamp / groupStepTime) % rollGroupSize;

    let placed = 0;
    let ring = 0;
    const baseRadius = 180;

    while (placed < count) {
      const radius = baseRadius + ring * ringSpacing(ring);

      const gap = ring < 3 ? gapFirstRows : gapLaterRows;

      const circumference = 2 * Math.PI * radius;
      const ringCapacity = Math.floor(circumference / (32 + gap));
      const peelersThisRing = Math.min(ringCapacity, count - placed);

      for (let j = 0; j < peelersThisRing; j++) {
        const img = orbit.children[placed];

        const speed =
          0.18 * (1 / (1 + ring * 0.35)) * (ring % 2 ? -1 : 1);

        const angle = (timestamp / 1000) * speed + (32 + gap) * j / radius;

        const group = Math.floor(placed / rollGroupSize);
        const inGroupIndex = placed % rollGroupSize;
        let rollOffset = 0;
        if (inGroupIndex === groupIndex) {
          const elapsed = (timestamp % groupStepTime) / groupStepTime;
          const phase = Math.sin(elapsed * Math.PI);
          rollOffset = rollDistance * phase;
        }

        const bob = Math.sin((timestamp / 1000) * 2 + placed) * bobAmount;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * (radius - rollOffset) + bob;

        img.style.transform = `
          translate(${x - 32 / 2}px, ${y - 32 / 2}px)
          rotate(${angle + Math.PI / 2 + Math.PI}rad)
        `;

        placed++;
      }

      ring++;
    }

    requestAnimationFrame(renderPeelerOrbit);
  }

  function ringSpacing(ring) {
    return ring < 3 ? 31 : 32 + (ring - 2) * 2;
  }

  function renderEventSkins() {
    const container = document.getElementById("v_skinsContainer");
    if (!container) return;
    container.innerHTML = "";

    const eventIds = ["rose","love_letter","cupid","chocolate","gift_box", "heart"];

    const eventSkins = skins.filter(s => eventIds.includes(s.id));

    eventSkins.forEach(s => {
      const skinDiv = document.createElement("button");
      skinDiv.className = `skin-div ${s.equipped ? "selected-skin" : ""}`;
      if (!s.unlocked) skinDiv.classList.add("locked-skin");

      skinDiv.innerHTML = `
        <img src="${s.image}"
            alt="${s.name}" width="100" class="skin-option"
            data-skin="${s.id}" draggable="false"/>
        <p class="skin-label">${s.name}</p>
        <div class="event-price">
          <img src="assets/heart.png" class="heart-size" draggable="false"/>
          <div class="event-price">${formatNumber(s.price || 0)}</div>
        </div>
      `;

      skinDiv.addEventListener("mouseenter", () => {
        const html = s.unlocked
          ? `<div class="title">${s.name}</div>
            <div>Price: ${formatNumber(s.price)} ♥</div>
            ${s.credits ? `<div class="credits">${s.credits}</div>` : ''}`
          : `<div class="title">???</div>
            <div>Price: ${formatNumber(s.price)} ♥</div>`;
        showTooltip(html, skinDiv);
      });
      skinDiv.addEventListener("mouseleave", hideTooltip);

      skinDiv.addEventListener("click", () => {
        if (!s.unlocked) {
          purchaseEventSkin(s.id);
        } else {
          selectSkin(s.id, false);
          updatePotatoDisplay();
        }
      });

      container.appendChild(skinDiv);
    });
  }



  function renderSkins() {
    const container = document.getElementById("skinsContainer");
    if (!container) return;

    container.innerHTML = "";

    // Reliable touch detection
    const isTouch = ("ontouchstart" in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 700;

    // Currently equipped skin
    const equippedSkin = getEquippedSkin();

    skins.forEach((s) => {
      // Create button
      const skinBtn = document.createElement("button");
      skinBtn.className = `skin-div ${s.equipped ? "selected-skin" : ""}`;
      if (!s.unlocked) skinBtn.classList.add("locked-skin");
      const isGolden = s.name?.startsWith("Golden");
      // Inner markup
      skinBtn.innerHTML = `
        <img
          src="${s.unlocked ? s.image : "assets/mystery_potato.png"}"
          alt="${s.name}"
          width="100"
          class="skin-option"
          data-skin="${s.id}"
          draggable="false"
        />
        <p class="skin-label ${isGolden ? "gold-text" : ""}">${s.unlocked ? s.name : "???"}">${s.unlocked ? s.name : "???"}</p>
      `;

      // -----------------------------
      // Tooltip / hover logic
      // -----------------------------
      if (!isTouch) {
        // Desktop hover
        skinBtn.addEventListener("mouseenter", () => {
          const html = s.unlocked
            ? `<div class="title ${isGolden ? "gold-text" : ""}">${s.name}</div><div>${s.description}</div>`
            : `<div class="title ${isGolden ? "gold-text" : ""}">???</div><div>${s.description}</div>`;
          showTooltip(html, skinBtn);
        });
        skinBtn.addEventListener("mouseleave", hideTooltip);
      } else {
        // Mobile tap shows tooltip
        let ignoreNextClick = false;

        skinBtn.addEventListener("touchstart", (e) => {
          e.stopPropagation(); // prevent immediate close
          ignoreNextClick = true;

          const html = s.unlocked
            ? `<div class="title ${isGolden ? "gold-text" : ""}">${s.name}</div><div>${s.description}</div>`
            : `<div class="title ${isGolden ? "gold-text" : ""}">???</div><div>${s.description}</div>`;
          showTooltip(html, skinBtn);

          setTimeout(() => (ignoreNextClick = false), 300);
        });

        // Mobile click also uses same ignoreNextClick
        skinBtn.addEventListener("click", () => {
          if (ignoreNextClick) return;

          if (!s.unlocked) {
            // Flash red to indicate locked
            skinBtn.style.filter = "brightness(0.5) hue-rotate(0deg)";
            setTimeout(() => (skinBtn.style.filter = ""), 200);
            return;
          }

          selectSkin(s.id);
          updatePotatoDisplay();
          renderSkins();
        });
      }

      // -----------------------------
      // Desktop click (unlocked) for selection
      // -----------------------------
      if (!isTouch) {
        skinBtn.addEventListener("click", () => {
          if (!s.unlocked) {
            // Flash red
            skinBtn.style.filter = "brightness(0.5) hue-rotate(0deg)";
            setTimeout(() => (skinBtn.style.filter = ""), 200);
            return;
          }

          selectSkin(s.id);
          updatePotatoDisplay();
          renderSkins();
        });
      }

      // -----------------------------
      // Update image and label
      // -----------------------------
      const img = skinBtn.querySelector("img");
      const label = skinBtn.querySelector(".skin-label");

      img.src = s.unlocked ? s.image : "assets/mystery_potato.png";
      label.textContent = s.unlocked ? s.name : "???";

      container.appendChild(skinBtn);
    });
  }

  function unlockSkin(id) {
    const skin = skins.find((s) => s.id === id);
    if (!skin || skin.unlocked) return false;

    skin.unlocked = true;
    return true;
  }

  function selectSkin(id) {
    skins.forEach((s) => {
      s.equipped = s.id === id;
    });

    const equippedSkin = skins.find((s) => s.equipped);
    if (equippedSkin) {
      const potatoImage = document.getElementById("potatoImage");
      if (potatoImage) {
        potatoImage.src = equippedSkin.image;
      }
    }
    renderSkins();
    renderBuildings();
    saveGame(true);
  }

  function unlockUpgrade(id) {
    const u = upgrades.find((u) => u.id === id);
    if (!u) return;

    u.unlocked = true;
    renderUpgrades();
  }

  function getEquippedSkin() {
    return skins.find((s) => s.equipped) || skins[0];
  }

  function renderBuildings() {
    enforceMysteryLimit();

    const container = document.getElementById("buildings");
    if (!container) return;

    const equippedSkin = getEquippedSkin();
    const isTouch = "ontouchstart" in window;

    const visible = buildings
      .filter(b => b.unlocked)
      .sort((a, b) => a.sort - b.sort);

    visible.forEach(b => {
      let buildingButton = document.getElementById(`building-${b.id}`);

      if (!buildingButton) {
        buildingButton = document.createElement("button");
        buildingButton.className = "building-container";
        buildingButton.id = `building-${b.id}`;
        buildingButton.style.webkitTapHighlightColor = "transparent";

        const iconDiv = document.createElement("div");
        iconDiv.className = "building-icon";

        const img = document.createElement("img");
        img.className = "building-image";
        img.width = 60;
        img.draggable = false;
        iconDiv.appendChild(img);

        const infoDiv = document.createElement("div");
        infoDiv.className = "building-info";
        infoDiv.innerHTML = `
          <div class="building-name-price">
            <h4 class="building-name"></h4>
            <p class="building-price">
              <img class="potato-icon" draggable="false" width="15">
              <span class="price-value"></span>
            </p>
          </div>
          <div class="building-amount ${selling ? "sell" : ""}">
            <p class="amount-owned"></p>
          </div>
        `;

        buildingButton.appendChild(iconDiv);
        buildingButton.appendChild(infoDiv);
        container.appendChild(buildingButton);

        if (!isTouch) {
          buildingButton.addEventListener("mouseenter", () => {
            const html = b.mystery
              ? `<div class="title">???</div><div>Price: ${formatNumber(b.price)}</div>`
              : `<div class="title">${b.name}</div>
                <div>Price: ${formatNumber(b.price)}</div>
                <div>Owned: ${b.owned}</div>
                <div>Total generated: ${Math.floor(b.totalGenerated)}</div>
                <div>Income/sec: ${Math.floor(b.cps * b.owned * 10) / 10}</div>`;
            showTooltip(html, buildingButton);
          });
          buildingButton.addEventListener("mouseleave", hideTooltip);
        } else {
          buildingButton.addEventListener("click", () => {
            const html = b.mystery
              ? `<div class="title">???</div><div>Price: ${formatNumber(b.price)}</div>`
              : `<div class="title">${b.name}</div>
                <div>Price: ${formatNumber(b.price)}</div>
                <div>Owned: ${b.owned}</div>
                <div>Total generated: ${Math.floor(b.totalGenerated)}</div>
                <div>Income/sec: ${Math.floor(b.cps * b.owned * 10) / 10}</div>`;
            showTooltip(html, buildingButton);
          });
        }

        buildingButton.addEventListener("click", () => {
          if (b.mystery) {
            errorSound.volume = sfxVolume;
            errorSound.currentTime = 0.5;
            errorSound.play();
            return
          };

          const cost = b.price * half_price_amount * window.building_discount;

          // =====================
          // SELLING MODE
          // =====================
          if (selling) {
            if (b.owned <= 0) return;

            const previousPrice = Math.floor(b.price / 1.15);

            let refund = Math.floor(previousPrice * 0.50);

            refund = Math.floor(refund * half_price_amount * window.building_discount);

            potatoes += refund;
            b.owned--;
            b.price = previousPrice;
            buildingsOwned--;
            achievmentsAdd("seller");
            calculateAutoClick();

            updatePotatoDisplay();

            requestAnimationFrame(() => {
              renderBuildings();
              renderUpgrades();
              checkBuildingMiddle();
            });

            scheduleSave();
            return;
          }

          // =====================
          // BUYING MODE
          // =====================
          if (potatoes < cost) {
            errorSound.volume = sfxVolume;
            errorSound.currentTime = 0.5;
            errorSound.play();
            return
          };
          buySound.volume = sfxVolume;
          buySound.currentTime = 0.7;
          buySound.play();
          potatoes -= cost;
          b.owned++;
          b.price = Math.ceil(b.price * 1.15);
          buildingsOwned++;
          if (window._rebirthPersistedPurchased?.includes(9)) {
            window.building_discount -= 0.0001;
          }
          calculateAutoClick();
          updatePotatoDisplay();

          if (b.id === "cursor") maybeStartPeelerOrbit();

          requestAnimationFrame(() => {
            renderBuildings();
            renderUpgrades();
            checkBuildingMiddle();
          });

          scheduleSave();
    });
  }

      const displayPrice = b.price * half_price_amount * window.building_discount;
      const img = buildingButton.querySelector(".building-image");
      const nameEl = buildingButton.querySelector(".building-name");
      const priceEl = buildingButton.querySelector(".price-value");
      const ownedEl = buildingButton.querySelector(".amount-owned");
      const amountWrapper = buildingButton.querySelector(".building-amount");
      const potatoIcon = buildingButton.querySelector(".potato-icon");

      // toggle sell class
      amountWrapper.classList.toggle("sell", selling);

      // display name and icon
      let displayName = b.name;
      let displayIcon = b.realIcon;

      if (b.mystery && potatoes < displayPrice) {
        displayName = "???";
        img.style.filter = "brightness(0)";
        img.style.opacity = "0.7";
      } else {
        b.mystery = false;
        img.style.filter = "brightness(1)";
      }

      nameEl.textContent = displayName;
      ownedEl.textContent = b.owned;

      if (!img.src.endsWith(displayIcon)) img.src = displayIcon;
      if (!potatoIcon.src.endsWith(equippedSkin.image)) potatoIcon.src = equippedSkin.image;

      // =====================
      // PRICE DISPLAY & COLOR
      // =====================
      let displayValue = displayPrice;
      let isSellMode = selling && b.owned > 0;

      if (isSellMode) {
        const previousPrice = Math.floor(b.price / 1.15);

        let refund = Math.floor(previousPrice * 0.50);

        refund = Math.floor(refund * half_price_amount);

        displayValue = refund;
      }

      priceEl.textContent = formatNumber(displayValue);

      const priceWrapper = buildingButton.querySelector(".building-price");

      if (isSellMode) {
        // selling always green
        priceWrapper.style.color = "lightgreen";
        buildingButton.style.filter = "brightness(100%)";
        buildingButton.style.cursor = "pointer";
      } else {
        // buying logic
        const canAfford = potatoes >= displayPrice;

        buildingButton.dataset.affordable = String(canAfford);
        priceWrapper.style.color = canAfford ? "lightgreen" : "rgb(209,73,73)";
        buildingButton.style.filter = canAfford ? "brightness(100%)" : "brightness(60%)";
        buildingButton.style.cursor = canAfford ? "pointer" : "default";
      }
    });
  }

  function unlockBuilding(id) {
    const b = buildings.find((b) => b.id === id);
    if (!b) return;

    b.unlocked = true;
    renderBuildings();
    renderUpgrades();

    window.authApi.save();
  }

  function calculateAutoClick() {
    buildings.forEach((b) => (b.cps = b.baseCps * b.cpsMultiplier));
    autoClickAmount = buildings.reduce(
      (total, b) => total + b.cps * b.owned,
      0,
    );
  }

  const sfxSlider = document.getElementById("sfxVolume");

  sfxSlider.addEventListener("input", () => {
    sfxVolume = parseFloat(sfxSlider.value);

    localStorage.setItem("sfxVolume", sfxVolume);
    window.sfxVolume = sfxVolume;
  });

  function maybeStartPeelerOrbit() {
    const peeler = getPeelerBuilding();
    if (!peeler || peeler.owned < 1) return;   // nothing to orbit yet

    // ---- Un‑hide the orbit container (if it was hidden) ----
    const orbitEl = document.querySelector('.peeler-orbit');
    if (orbitEl) {
      orbitEl.classList.remove('hidden');   // remove a CSS “hidden” class, if present
      orbitEl.style.display = 'block';      // fallback for plain display:none
      orbitEl.style.visibility = 'visible';
      orbitEl.style.opacity = '1';
    }

    // ---- Start the animation (only once) ----
    if (!peelerOrbitStarted) {
      peelerOrbitStarted = true;
      requestAnimationFrame(renderPeelerOrbit);
    }
  }

  const openRebirthMobile = document.getElementById("openModalRebirth_mobile");
  if (openRebirthMobile) {
      openRebirthMobile.addEventListener("click", () => {
          modalr.classList.add("open");
          modalr.style.display = "flex";
          if (window.initRebirthMindmap) {
              window.initRebirthMindmap();
          }
      });
  }

  goldenPotatoImage.classList.add("hidden");
  scheduleNextGoldenPotato();

  openBtn.addEventListener("click", () => {
    modal.classList.add("open");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  openBtns.addEventListener("click", () => {
    saveGame(true);
    modals.classList.add("open");
  });

  closeBtns.addEventListener("click", () => {
    modals.classList.remove("open");
  });

  openBtno.addEventListener("click", () => {
    modalo.classList.add("open");
  });

  closeBtno.addEventListener("click", () => {
    modalo.classList.remove("open");
  });

  openOptionsMobile.addEventListener("click", () => {
    modalo.classList.add("open");
    modalo.style.display = "flex";
  });

  openStatsMobile.addEventListener("click", () => {
    saveGame(true);
    modals.classList.add("open");
    modals.style.display = "flex";
  });

  openInfoMobile.addEventListener("click", () => {
    modal.classList.add("open");
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
    modal.style.display = "none";
  });

  closeBtns.addEventListener("click", () => {
    modals.classList.remove("open");
    modals.style.display = "none";
  });

  closeBtno.addEventListener("click", () => {
    modalo.classList.remove("open");
    modalo.style.display = "none";
  });

  openBtnsk.addEventListener("click", () => {
    modalsk.classList.add("open");
    modalsk.style.display = "flex";
    renderSkins();
  });

  closeBtnsk.addEventListener("click", () => {
    modalsk.classList.remove("open");
    modalsk.style.display = "none";
  });

  closeBtncodes.addEventListener("click", () => {
    modalcodes.classList.remove("open");
    modalcodes.style.display = "none";
  });

  closeBtncodesgolden.addEventListener("click", () => {
    modalcodesgolden.classList.remove("open");
    modalcodesgolden.style.display = "none";
  });
  /*
  openModalAnouncements.addEventListener("click", () => {
    modalanouncements.classList.add("open");
    modalanouncements.style.display = "none";
  });

  closeModalAnouncements.addEventListener("click", () => {
    modalanouncements.classList.remove("open");
    modalanouncements.style.display = "none";
  });
  */

  openBtnr.addEventListener("click", () => {
      modalr.classList.add("open");
      modalr.style.display = "flex";
      
      // Initialize mindmap when modal is visible
      if (window.initRebirthMindmap) {
          window.initRebirthMindmap();
      }
  });

  closeBtnr.addEventListener("click", () => {
    modalr.classList.remove("open");
    modalr.style.display = "none";
  });
  const preloadedSkins = new Map();

  function preloadSkin(imageSrc) {
    if (preloadedSkins.has(imageSrc)) return;

    const img = new Image();
    img.src = imageSrc;
    img.decoding = "async"; // helps Safari
    preloadedSkins.set(imageSrc, img);
  }

  clickArea.addEventListener("click", (e) => {
    const rect = clickArea.getBoundingClientRect();
    const equippedSkin = getEquippedSkin();

    preloadSkin(equippedSkin.image);

    // --- +1 trail ---
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.style.left = e.clientX - rect.left + (Math.random() * 40 - 20) + "px";
    trail.style.top = e.clientY - rect.top - 20 + "px";
    trail.textContent = `+${formatNumber(Math.floor(window.potatoesPerClick || potatoesPerClick))}`;
    clickArea.appendChild(trail);
    setTimeout(() => trail.remove(), 1000);

    // --- Potato jump (PRELOADED) ---
    const potato = preloadedSkins.get(equippedSkin.image).cloneNode(false);

    potato.className = "jump-image";
    potato.style.left = e.clientX - rect.left - 20 + "px";
    potato.style.top = e.clientY - rect.top - 20 + "px";
    potato.style.opacity = "1";

    clickArea.appendChild(potato);

    // Physics
    let velocityY = -6 - Math.random() * 2;
    let velocityX = Math.random() * 4 - 2;
    const gravity = 0.55;
    let posX = e.clientX - rect.left - 20;
    let posY = e.clientY - rect.top - 20;

    let rotation = Math.random() * 360;
    let rotationSpeed = Math.random() * 10 - 5;
    let opacity = 1;

    const animation = setInterval(() => {
      velocityY += gravity;
      posY += velocityY;
      posX += velocityX;

      rotation += rotationSpeed;
      opacity -= 0.05;

      potato.style.transform = `rotate(${rotation}deg)`;
      potato.style.left = posX + "px";
      potato.style.top = posY + "px";
      potato.style.opacity = opacity;

      if (opacity <= 0 || posY > e.clientY - rect.top) {
        clearInterval(animation);
        potato.remove();
      }
    }, 16);
  });

  let frenzy_amount;

  async function handleLogin() {
    lBtn.disabled = true;
    try {
      const res = await login(lUser.value.trim(), lPass.value);
      setToken(res.token);
      showMsg(lUser, "Logged in");
      showMsg(lPass, "");
      await updateAccountUI();
    } catch (e) {
      showMsg(lUser, "Login failed");
      console.error(e);
    } finally {
      lBtn.disabled = false;
    }
  }

  document.getElementById("logoutButton")?.addEventListener("click", () => {
    setToken(null);
    updateAccountUI();
    if (window.resetGame) window.resetGame(); // clear local game if needed
  });

  function autoClick() {
    if (frenzy === true) {
      frenzy_amount = 10;
    } else {
      frenzy_amount = 1;
    }
    const increment = (autoClickAmount * frenzy_amount * window.production_percent) / 20;
    potatoes += increment;
    allTimePotatoes += increment;
    window.allTimePotatoes = allTimePotatoes;

    buildings.forEach((b) => {
      const incomeFromThisBuilding = (b.cps * b.owned) / 20;
      b.totalGenerated += incomeFromThisBuilding;
    });
    if (storeCount >= 10) {
      console.log("Secret");
      if (frenzy || half_price_amount === 0.5) {
        modalcodesgolden.classList.add("open");
      } else {
        modalcodes.classList.add("open");
      }
      
      storeCount = 0;
    }
    //checkAchievements();
    updatePotatoDisplay();
    setTimeout(autoClick, 50);
  }

  function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;
    toggle.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
    });
  }

  setupPasswordToggle("loginPassword", "loginToggle");
  setupPasswordToggle("signupPassword", "signupToggle");

  // autosave: continuously save locally, check DB save interval
  async function autoSave() {
    // Always save locally for quick recovery
    saveLocal();

    // Check if we need to save to DB (20 minutes elapsed)
    if (window.authApi && window.authApi.getToken()) {
      const timeSinceLastDbSave = Date.now() - lastDbSaveTime;
      if (timeSinceLastDbSave >= DB_SAVE_INTERVAL_MS) {
        console.log("AFK save: 20 minutes elapsed - saving to DB");
        await saveToDb(false);
      }
    }

    setTimeout(autoSave, 10000); // check every 10 seconds
  }

  function renderBuildingsRegular() {
    renderBuildings();
    setTimeout(renderBuildingsRegular, 1000);
  }

  function renderUpgradesRegular() {
    renderUpgrades();
    setTimeout(renderUpgradesRegular, 1000);
  }

  let lastPlayerAction = Date.now();

  function markPlayerActivity() {
    lastPlayerAction = Date.now();
  }
  /*
  function purchaseEventSkin(id) {
    const skin = skins.find(s => s.id === id);
    if (!skin) return;

    const cost = skin.price || 0;   // hearts required
    if (hearts < cost) {
      return;
    }

    // Pay the cost, unlock, then equip
    hearts -= cost;
    unlockSkin(id, false);   // false ⇒ we are still using the main skins array
    selectSkin(id, false);   // equip it immediately (optional)

    // Refresh UI and persist the change
    updatePotatoDisplay();   // shows new heart count
    renderEventSkins();      // redraw the event panel
    saveGame(true);          // major change → DB save
  }

  modalanouncements.classList.add("open");
  modalanouncements.style.display = "flex";
  */
  function getPeelerBuilding() {
    return buildings.find((b) => b.id === "cursor");
  }

    let _dbSaveDebounceTimer = null;

  function scheduleSave() {
      saveLocal(); // always save locally immediately

      // Reset the debounce timer — DB save fires 60s after the LAST scheduleSave call
      clearTimeout(_dbSaveDebounceTimer);
      _dbSaveDebounceTimer = setTimeout(() => {
          console.log("Debounced save: 60s of inactivity — saving to DB");
          saveToDb(false).catch(console.warn);
      }, 60 * 1000);
  }

  function light_darkToggle() {
    const backgrounds = document.querySelectorAll(".pixelated-background");
    const storeBanners = document.querySelectorAll(".store-sign");
    const storeBannersText = document.querySelectorAll(".store-title");
    const button_toggle = document.querySelector("#modeToggle");

    if (mode === "light") {
      backgrounds.forEach(bg => bg.style.backgroundImage = "url('assets/background_dark.png')");
      storeBanners.forEach(sb => sb.style.backgroundImage = "url('assets/store-banner_dark.png')");
      storeBannersText.forEach(st => st.style.color = "white");
      mode = "dark";
      button_toggle.textContent = "Light Mode";
    } else {
      backgrounds.forEach(bg => bg.style.backgroundImage = "url('assets/background.png')");
      storeBanners.forEach(sb => sb.style.backgroundImage = "url('assets/store-banner.png')");
      storeBannersText.forEach(st => st.style.color = "black");
      mode = "light";
      button_toggle.textContent = "Dark Mode";
    }

    storeMode(mode);
    saveGame(true);
  }

  function sellPressed() {
    console.log("Sell");
    buy_button.classList.remove("selected");
    sell_button.classList.add("selected");
    selling = true;
    renderBuildings()
  }

  function buyPressed() {
    console.log("Buy");
    sell_button.classList.remove("selected");
    buy_button.classList.add("selected");
    selling = false;
    renderBuildings()
  }

  //updateTimer();
  (async () => {
    const overlay = document.getElementById('loadingOverlay');
    
    await loadGame();
    maybeStartPeelerOrbit();
    rateCounter();
    updatePotatoComments();
    updateStatsDisplay();
    autoClick();
    renderBuildingsRegular();
    renderUpgradesRegular();
    autoSave();
    renderSkins();
    renderEventSkins();
    requestAnimationFrame(renderPeelerOrbit);
    checkBuildingMiddle()
    const savedVol = localStorage.getItem("sfxVolume");
    if (savedVol !== null) {
      sfxVolume = parseFloat(savedVol);
      sfxSlider.value = sfxVolume;
      window.sfxVolume = sfxVolume;
    }
    setInterval(() => {
      idleTime = Math.floor((Date.now() - lastPlayerAction) / 1000);
      console.log("idleTime:", idleTime);
    }, 1000);
    setInterval(() => {
      upgradeTime++;
    }, 1000);
    console.log(`
      ---------------------------------------------------------------
      Potato Clicker!
      ---------------------------------------------------------------
      This is the potato clicker console. Don't mess around here unless you know what you are doing as you may accidentally wipe your game save

      Have fun and get clicking!
        - MaxTheRock
    `);
    overlay.classList.add('hidden');

    if (mode === "dark") {
      const backgrounds = document.querySelectorAll(".pixelated-background");
      const storeBanners = document.querySelectorAll(".store-sign");
      const storeBannersText = document.querySelectorAll(".store-title");
      const button_toggle = document.querySelector("#modeToggle");

      backgrounds.forEach(bg => bg.style.backgroundImage = "url('assets/background_dark.png')");
      storeBanners.forEach(sb => sb.style.backgroundImage = "url('assets/store-banner_dark.png')");
      storeBannersText.forEach(st => st.style.color = "white");
      button_toggle.textContent = "Light Mode";
    }
    setTimeout(() => overlay.remove(), 500);
  })();

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  setInterval(() => {
      if (Math.random() < 0.01) {
          achievmentsAdd("missing_texture");
      }
  }, 1000);

  
  window.addEventListener("beforeunload", () => {
    saveLocal();
    const token = window.authApi?.getToken();
    if (token) {
      const save = getSaveObject();
      const blob = new Blob([JSON.stringify(save)], { type: "application/json" });
      navigator.sendBeacon("/api/auth/save", blob);
    }
  });

  window.achievmentsAdd = achievmentsAdd;
  window.clearLocalData = clearLocalData;
  window.storeCounter = storeCounter;
  window.saveGameManual = saveGameManual;
  window.loadGameManual = loadGameManual;
  window.loadGame = loadGame;
  window.getPeelerBuilding = getPeelerBuilding;
  window.clickerButton = document.getElementById("clickerButton");
  window.light_darkToggle = light_darkToggle;
  window.sellPressed = sellPressed;
  window.buyPressed = buyPressed;
  window.showTooltip = showTooltip;
  window.hideTooltip = hideTooltip;
  window.hideTooltipImmediate = hideTooltipImmediate;
  window.renderBuildings = renderBuildings;
  window.autoClick = autoClick;
})();