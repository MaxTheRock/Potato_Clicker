/* --------------------------------------------------------------
   Autoclicker detector for Potato Clicker
   -------------------------------------------------------------- */
(() => {
  const button = document.getElementById("potato-button");
  if (!button) {
    return;
  }
  const MAX_INTERVAL_REGULARITY = 20;
  const MIN_CLICKS_FOR_DETECTION = 20;
  const BLOCK_DURATION = 5_000;
  const clickTimestamps = [];
  let blocked = false;
  let alertShown = false;
  function handleClick(e) {
    if (blocked) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    const now = Date.now();
    clickTimestamps.push(now);
    if (clickTimestamps.length > 50) clickTimestamps.shift();
    if (clickTimestamps.length < MIN_CLICKS_FOR_DETECTION) return;
    const intervals = [];
    for (let i = 1; i < clickTimestamps.length; i++) {
      intervals.push(clickTimestamps[i] - clickTimestamps[i - 1]);
    }
    const first = intervals[0];
    const allSimilar = intervals.every(
      (intv) => Math.abs(intv - first) < MAX_INTERVAL_REGULARITY
    );
    if (allSimilar && !alertShown) {
      alertShown = true;
      blocked = true;
      setTimeout(() => {
        blocked = false;
        clickTimestamps.length = 0;
        alertShown = false;
      }, BLOCK_DURATION);
    }
  }
  button.addEventListener("click", handleClick, { capture: true });
  button.addEventListener("touchstart", handleClick, { capture: true });
})();