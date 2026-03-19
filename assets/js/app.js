const data = [
  { year: 2005, pocketMoney: 5, currentValue: 210, treatCount: 1.25, vibe: 17 },
  { year: 2006, pocketMoney: 5, currentValue: 188, treatCount: 1.19, vibe: 16 },
  { year: 2007, pocketMoney: 10, currentValue: 332, treatCount: 2.11, vibe: 28 },
  { year: 2008, pocketMoney: 10, currentValue: 286, treatCount: 1.94, vibe: 26 },
  { year: 2009, pocketMoney: 10, currentValue: 247, treatCount: 1.77, vibe: 24 },
  { year: 2010, pocketMoney: 20, currentValue: 430, treatCount: 3.36, vibe: 45 },
  { year: 2011, pocketMoney: 20, currentValue: 396, treatCount: 3.08, vibe: 41 },
  { year: 2012, pocketMoney: 25, currentValue: 432, treatCount: 3.03, vibe: 40 },
  { year: 2013, pocketMoney: 30, currentValue: 472, treatCount: 3.53, vibe: 47 },
  { year: 2014, pocketMoney: 30, currentValue: 424, treatCount: 3.24, vibe: 43 },
  { year: 2015, pocketMoney: 40, currentValue: 518, treatCount: 3.9, vibe: 52 },
  { year: 2016, pocketMoney: 50, currentValue: 608, treatCount: 4.65, vibe: 62 },
  { year: 2017, pocketMoney: 50, currentValue: 548, treatCount: 4.65, vibe: 62 },
  { year: 2018, pocketMoney: 75, currentValue: 702, treatCount: 6.98, vibe: 93 },
  { year: 2019, pocketMoney: 100, currentValue: 835, treatCount: 7.15, vibe: 95 },
  { year: 2020, pocketMoney: 100, currentValue: 706, treatCount: 7.15, vibe: 95 },
  { year: 2021, pocketMoney: 150, currentValue: 824, treatCount: 7.5, vibe: 100 },
  { year: 2022, pocketMoney: 200, currentValue: 766, treatCount: 4.26, vibe: 57 },
  { year: 2023, pocketMoney: 250, currentValue: 667, treatCount: 2.63, vibe: 35 },
  { year: 2024, pocketMoney: 300, currentValue: 456, treatCount: 1.94, vibe: 26 },
  { year: 2025, pocketMoney: 400, currentValue: 528, treatCount: 0.93, vibe: 12 },
  { year: 2026, pocketMoney: 500, currentValue: 500, treatCount: 1, vibe: 13 }
];

const metricConfig = {
  pocketMoney: {
    label: "TRY serisi",
    format: (value) => formatTRY(value)
  },
  currentValue: {
    label: "2026 eşdeğeri",
    format: (value) => formatTRY(value)
  },
  treatCount: {
    label: "Big Mac adedi serisi",
    format: (value) => `${formatBigMac(value)} Big Mac`
  },
  vibe: {
    label: "Big Mac alım gücü skoru",
    format: (value) => `${value} puan`
  }
};

const state = {
  selectedIndex: data.length - 1,
  compareIndex: Math.max(0, data.length - 6),
  metric: "pocketMoney"
};

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const chart = document.querySelector("#chart");
let hoverTooltip, hoverBg, hoverLabel, hoverPoint;
const yearRange = document.querySelector("#year-range");
const compareYear = document.querySelector("#compare-year");
const metricTabs = document.querySelector("#metric-tabs");
const chartSummary = document.querySelector("#chart-summary");
const selectedYearPill = document.querySelector("#selected-year-pill");
const moneyValue = document.querySelector("#money-value");
const realValue = document.querySelector("#real-value");
const treatValue = document.querySelector("#treat-value");
const vibeValue = document.querySelector("#vibe-value");
const heroAmount = document.querySelector("#hero-amount");
const compareLeadingYear = document.querySelector("#compare-leading-year");
const compareLeadingCopy = document.querySelector("#compare-leading-copy");
const compareLeftLabel = document.querySelector("#compare-left-label");
const compareRightLabel = document.querySelector("#compare-right-label");
const compareDeltaLabel = document.querySelector("#compare-delta-label");

function formatTRY(value) {
  return `₺${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatBigMac(value) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

function formatSigned(value, formatter) {
  if (value === 0) {
    return formatter(0);
  }

  return value > 0 ? `+${formatter(value)}` : `-${formatter(Math.abs(value))}`;
}

function getMetricValue(item, key) {
  return item[key];
}

function buildCompareSelect() {
  compareYear.innerHTML = data
    .map(
      (item, index) => `
        <option value="${index}">${item.year}</option>
      `
    )
    .join("");
}

function syncMetricTabs() {
  metricTabs.querySelectorAll("[data-metric]").forEach((button) => {
    const isActive = button.dataset.metric === state.metric;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function buildChart() {
  const width = 860;
  const height = 360;
  const padding = { top: 42, right: 80, bottom: 48, left: 62 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const colorBg = getCSSVar("--bg");
  const colorBlack = getCSSVar("--black");
  const colorPage = getCSSVar("--page");
  const config = metricConfig[state.metric];
  const values = data.map((item) => getMetricValue(item, state.metric));
  const maxValue = Math.max(...values);
  const selected = data[state.selectedIndex];
  const compare = data[state.compareIndex];
  const selectedValue = getMetricValue(selected, state.metric);
  const compareValue = getMetricValue(compare, state.metric);

  const xFor = (index) => padding.left + (innerWidth / (data.length - 1)) * index;
  const yFor = (value) => padding.top + innerHeight - (value / (maxValue || 1)) * innerHeight;
  const selectedLabelY = Math.max(18, yFor(selectedValue) - 18);
  const compareLabelY = Math.min(height - 20, yFor(compareValue) + 28);

  const linePath = data
    .map((item, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(getMetricValue(item, state.metric))}`)
    .join(" ");

  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${padding.top + innerHeight} L ${xFor(0)} ${padding.top + innerHeight} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1]
    .map((fraction) => {
      const y = padding.top + innerHeight - innerHeight * fraction;
      const value = Math.round(maxValue * fraction);
      return `
        <line class="chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
        <text class="chart-label" x="8" y="${y + 4}">${config.format(value)}</text>
      `;
    })
    .join("");

  const yearMarkers = data
    .filter((_, index) => (index % 4 === 0 && index !== data.length - 2) || index === data.length - 1)
    .map((item) => {
      const index = data.findIndex((entry) => entry.year === item.year);
      return `<text class="chart-label" x="${xFor(index)}" y="${height - 16}" text-anchor="middle">${item.year}</text>`;
    })
    .join("");

  const points = data
    .map((item, index) => {
      const x = xFor(index);
      const y = yFor(getMetricValue(item, state.metric));
      const classes = ["chart-point"];

      if (index === state.selectedIndex) {
        classes.push("is-selected");
      }

      if (index === state.compareIndex) {
        classes.push("is-compare");
      }

      const radius = index === state.selectedIndex || index === state.compareIndex ? 8 : 5;

      return `
        <circle class="${classes.join(" ")}" cx="${x}" cy="${y}" r="${radius}"></circle>
        <circle class="chart-hit" data-index="${index}" cx="${x}" cy="${y}" r="18"></circle>
      `;
    })
    .join("");

  chart.innerHTML = `
    ${gridLines}
    <path class="chart-area" d="${areaPath}"></path>
    <path class="chart-line" d="${linePath}"></path>
    ${points}
    <g>
      <rect x="${xFor(state.selectedIndex) - ((`${selected.year} / ${config.format(selectedValue)}`).length * 8 + 20) / 2}" y="${selectedLabelY - 16}" width="${(`${selected.year} / ${config.format(selectedValue)}`).length * 8 + 20}" height="24" rx="4" fill="${colorBg}" />
      <text x="${xFor(state.selectedIndex)}" y="${selectedLabelY}" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">
        ${selected.year} / ${config.format(selectedValue)}
      </text>
    </g>
    <g>
      <rect x="${xFor(state.compareIndex) - ((`${compare.year} / ${config.format(compareValue)}`).length * 8 + 20) / 2}" y="${compareLabelY - 16}" width="${(`${compare.year} / ${config.format(compareValue)}`).length * 8 + 20}" height="24" rx="4" fill="${colorBlack}" />
      <text x="${xFor(state.compareIndex)}" y="${compareLabelY}" text-anchor="middle" fill="${colorPage}" font-size="13" font-weight="700">
        ${compare.year} / ${config.format(compareValue)}
      </text>
    </g>
    <g id="hover-tooltip" visibility="hidden">
      <rect id="hover-bg" x="0" y="0" width="0" height="28" rx="4" fill="${colorBlack}" />
      <text id="hover-label" x="0" y="0" text-anchor="middle" fill="${colorPage}" font-size="13" font-weight="700"></text>
    </g>
    <circle class="chart-hover-point" id="hover-point" cx="0" cy="0" r="6" visibility="hidden"></circle>
    ${yearMarkers}
  `;

  hoverTooltip = chart.querySelector("#hover-tooltip");
  hoverBg = chart.querySelector("#hover-bg");
  hoverLabel = chart.querySelector("#hover-label");
  hoverPoint = chart.querySelector("#hover-point");
}

function updateStats() {
  const selected = data[state.selectedIndex];
  const latest = data[data.length - 1];

  selectedYearPill.textContent = `${selected.year}`;
  chartSummary.textContent = metricConfig[state.metric].label;
  moneyValue.textContent = formatTRY(selected.pocketMoney);
  realValue.textContent = formatTRY(selected.currentValue);
  treatValue.textContent = formatBigMac(selected.treatCount);
  vibeValue.textContent = `${selected.vibe}`;
  heroAmount.textContent = `${latest.pocketMoney}`;
}

function updateCompare() {
  const left = data[state.selectedIndex];
  const right = data[state.compareIndex];
  const config = metricConfig[state.metric];
  const leftValue = getMetricValue(left, state.metric);
  const rightValue = getMetricValue(right, state.metric);
  const delta = leftValue - rightValue;
  const percent = rightValue === 0 ? 0 : Math.round((delta / rightValue) * 100);

  compareLeftLabel.textContent = `${left.year}: ${config.format(leftValue)}`;
  compareRightLabel.textContent = `${right.year}: ${config.format(rightValue)}`;
  compareDeltaLabel.textContent = `Fark: ${formatSigned(delta, config.format)} (${delta === 0 ? "0%" : `%${Math.abs(percent)}`})`;

  if (delta > 0) {
    compareLeadingYear.textContent = `${left.year}`;
    compareLeadingCopy.textContent = "önde";
  } else if (delta < 0) {
    compareLeadingYear.textContent = `${right.year}`;
    compareLeadingCopy.textContent = "önde";
  } else {
    compareLeadingYear.textContent = "EŞİT";
    compareLeadingCopy.textContent = "";
  }
}

function render() {
  const selectedYear = data[state.selectedIndex].year;
  yearRange.value = `${state.selectedIndex}`;
  yearRange.setAttribute("aria-valuenow", selectedYear);
  yearRange.setAttribute("aria-valuetext", `${selectedYear}`);
  compareYear.value = `${state.compareIndex}`;
  syncMetricTabs();
  buildChart();
  updateStats();
  updateCompare();
  updateShareLink();
}

metricTabs.addEventListener("click", (event) => {
  const target = event.target.closest("[data-metric]");

  if (!target) {
    return;
  }

  state.metric = target.dataset.metric;
  render();
});

chart.addEventListener("click", (event) => {
  const index = event.target.dataset.index;

  if (index === undefined) {
    return;
  }

  state.selectedIndex = Number(index);
  render();
});

chart.addEventListener("mouseover", (event) => {
  const index = event.target.dataset.index;
  if (index === undefined) return;

  const i = Number(index);
  const item = data[i];
  const config = metricConfig[state.metric];
  const value = getMetricValue(item, state.metric);

  const text = `${item.year} / ${config.format(value)}`;
  hoverLabel.textContent = text;

  const textLen = text.length * 8 + 20;

  const hitCircle = event.target;
  const cx = Number(hitCircle.getAttribute("cx"));
  const cy = Number(hitCircle.getAttribute("cy"));

  hoverLabel.setAttribute("x", cx);
  hoverLabel.setAttribute("y", cy - 22);
  hoverBg.setAttribute("x", cx - textLen / 2);
  hoverBg.setAttribute("y", cy - 38);
  hoverBg.setAttribute("width", textLen);

  hoverPoint.setAttribute("cx", cx);
  hoverPoint.setAttribute("cy", cy);

  hoverTooltip.setAttribute("visibility", "visible");
  hoverPoint.setAttribute("visibility", "visible");
});

chart.addEventListener("mouseout", (event) => {
  const index = event.target.dataset.index;
  if (index === undefined) return;

  hoverTooltip.setAttribute("visibility", "hidden");
  hoverPoint.setAttribute("visibility", "hidden");
});

yearRange.addEventListener("input", () => {
  state.selectedIndex = Number(yearRange.value);
  render();
});

compareYear.addEventListener("change", () => {
  state.compareIndex = Number(compareYear.value);
  render();
});

const shareBtn = document.querySelector("#share-x");

function updateShareLink() {
  const selected = data[state.selectedIndex];
  const text = `Bu yılki bayram harçlığı ${formatTRY(selected.pocketMoney)}!\nhttps://bayramharcligi.com\n\nBu amme hizmeti için teşekkürler @doguabaris!`;
  shareBtn.href = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

const sectionNav = document.querySelector(".section-nav");
const sectionTabs = sectionNav.querySelectorAll("[role='tab']");
const sectionPanels = document.querySelectorAll("#main-content [role='tabpanel']");

sectionNav.addEventListener("click", (event) => {
  const tab = event.target.closest("[role='tab']");
  if (!tab) return;

  sectionTabs.forEach((t) => {
    t.classList.remove("is-active");
    t.setAttribute("aria-selected", "false");
  });

  sectionPanels.forEach((panel) => {
    panel.hidden = true;
  });

  tab.classList.add("is-active");
  tab.setAttribute("aria-selected", "true");
  document.getElementById(tab.getAttribute("aria-controls")).hidden = false;
});

yearRange.max = `${data.length - 1}`;
yearRange.value = `${state.selectedIndex}`;
buildCompareSelect();
render();
