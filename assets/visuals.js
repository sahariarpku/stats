const Viz = {
  NS: "http://www.w3.org/2000/svg",

  mean(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  },

  median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  fmt(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  },

  el(tag, attrs = {}, parent = null) {
    const node = document.createElementNS(Viz.NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (parent) parent.appendChild(node);
    return node;
  },

  themeToggle(button) {
    const modes = ["auto", "light", "dark"];
    let index = 0;
    button.addEventListener("click", () => {
      index = (index + 1) % modes.length;
      const mode = modes[index];
      if (mode === "auto") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", mode);
      button.textContent = "Theme: " + mode;
    });
  },
};
