/**
 * C.A.K.R.A. System Controller Engine
 * Advanced Predictive Simulator
 */

// Memory feature: load history from localStorage if present
let conversationHistory = [];
try {
  const savedHistory = localStorage.getItem('cakra_chat_history');
  if (savedHistory) {
    conversationHistory = JSON.parse(savedHistory);
  }
} catch (error) {
  console.error("Failed to restore local session history:", error);
}

let thinkingEl = null;
let network = null;
let nodes = null;
let edges = null;
let flickerInterval = null;

// Baseline diagnostic states
let currentActiveEngine = 'GEMINI 2.5';
let currentPathStatus = 'OPTIMAL';
let currentPathStatusColor = 'var(--success-green)';
let currentAccuracy = '99.87%';

// UI Elements
const chatScreen = document.getElementById('chat-screen');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const btnRun = document.getElementById('btn-run');
const systemTimeEl = document.getElementById('system-time');
const networkWarning = document.getElementById('network-warning');
const btnNewSim = document.getElementById('btn-new-simulation');
const welcomeCard = document.getElementById('welcome-card');
const diagActiveEngine = document.getElementById('diag-active-engine');

// System Clock in WITA (GMT+8) Timezone
function updateClock() {
  if (systemTimeEl) {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    const r = {};
    parts.forEach(p => { r[p.type] = p.value; });
    const timeStr = `${r.year}-${r.month}-${r.day} ${r.hour}:${r.minute}:${r.second} WITA`;
    systemTimeEl.textContent = timeStr;
  }
}
setInterval(updateClock, 1000);
updateClock();

// Diagnostics Boot Lines
const BOOT_LINES = [
  "MENGINISIALISASI MESIN PREDIKTIF C.A.K.R.A...",
  "MEMUAT KUMPULAN DATA MAKRO...",
  "SISTEM ONLINE"
];
let bootIndex = 0;

/**
 * Initializes the Vis.js Force-Directed Node Network
 */
function initNetworkGraph() {
  const container = document.getElementById('network-canvas');
  if (!container) return;

  // Initialize nodes
  nodes = new vis.DataSet([
    { 
      id: 1, 
      label: 'MESIN UTAMA\n(C.A.K.R.A.)', 
      size: 32, 
      color: { background: '#00FFFF', border: '#00FFFF', highlight: '#00FFFF' },
      shadow: { enabled: true, color: 'rgba(0, 255, 255, 0.7)', size: 16 }
    },
    { id: 2, label: 'Ekonomi Makro', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } },
    { id: 3, label: 'Sentimen Publik', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } },
    { id: 4, label: 'Rantai Pasok', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } },
    { id: 5, label: 'Volatilitas Pasar', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } }
  ]);

  // Connect satellites to core
  edges = new vis.DataSet([
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 1, to: 5 }
  ]);

  const data = { nodes: nodes, edges: edges };

  // Stylized sci-fi physics options
  const options = {
    nodes: {
      shape: 'dot',
      font: {
        size: 14,
        color: '#ffffff',
        face: 'Rajdhani',
        strokeWidth: 0
      },
      borderWidth: 1,
      shadow: {
        enabled: true,
        color: 'rgba(0, 255, 255, 0.3)',
        size: 10,
        x: 0,
        y: 0
      }
    },
    edges: {
      color: {
        color: 'rgba(0, 255, 255, 0.15)',
        highlight: 'rgba(0, 255, 255, 0.4)'
      },
      width: 1.5,
      smooth: {
        type: 'continuous'
      }
    },
    physics: {
      barnesHut: {
        gravitationalConstant: -2500,
        centralGravity: 0.15,
        springLength: 130,
        springConstant: 0.04,
        damping: 0.08,
        avoidOverlap: 0.5
      },
      stabilization: {
        iterations: 100
      }
    },
    interaction: {
      zoomView: true,
      dragView: true,
      hover: true
    }
  };

  network = new vis.Network(container, data, options);

  // Bind node click diagnostics
  network.on("selectNode", function (params) {
    if (params.nodes.length > 0) {
      const selectedId = params.nodes[0];
      const selectedNode = nodes.get(selectedId);
      if (selectedNode && diagActiveEngine) {
        const label = selectedNode.label.replace('\n', ' ');
        diagActiveEngine.textContent = `NODE: ${label.toUpperCase()}`;
        
        const pathEl = document.getElementById('diag-path-status');
        const accEl = document.getElementById('diag-accuracy');
        
        if (selectedId === 1) {
          if (pathEl) {
            pathEl.textContent = "OPTIMAL";
            pathEl.style.color = "var(--success-green)";
          }
          if (accEl) accEl.textContent = "99.87%";
        } else if (selectedId === 2) {
          if (pathEl) {
            pathEl.textContent = "ANALISIS AKTIF";
            pathEl.style.color = "var(--accent-cyan)";
          }
          if (accEl) accEl.textContent = "98.42%";
        } else if (selectedId === 3) {
          if (pathEl) {
            pathEl.textContent = "OPTIMAL";
            pathEl.style.color = "var(--success-green)";
          }
          if (accEl) accEl.textContent = "92.15%";
        } else if (selectedId === 4) {
          if (pathEl) {
            pathEl.textContent = "OPTIMAL";
            pathEl.style.color = "var(--success-green)";
          }
          if (accEl) accEl.textContent = "95.80%";
        } else if (selectedId === 5) {
          if (pathEl) {
            pathEl.textContent = "DEVIASI RENDAH";
            pathEl.style.color = "var(--warning-orange)";
          }
          if (accEl) accEl.textContent = "96.12%";
        } else {
          if (pathEl) {
            pathEl.textContent = "TERDISTRIBUSI";
            pathEl.style.color = "var(--accent-cyan)";
          }
          if (accEl) {
            const hashAcc = (85 + (selectedId % 15)).toFixed(2) + "%";
            accEl.textContent = hashAcc;
          }
        }
      }
    }
  });

  network.on("deselectNode", function (params) {
    if (diagActiveEngine) {
      diagActiveEngine.textContent = currentActiveEngine;
    }
    const pathEl = document.getElementById('diag-path-status');
    const accEl = document.getElementById('diag-accuracy');
    if (pathEl) {
      pathEl.textContent = currentPathStatus;
      pathEl.style.color = currentPathStatusColor;
    }
    if (accEl) {
      accEl.textContent = currentAccuracy;
    }
  });

  // If restoring history, spawn some placeholder sub-nodes to represent past calculations
  if (conversationHistory.length > 0) {
    injectSubNodes(Math.min(5, conversationHistory.length * 2));
  }
}

/**
 * Temporarily scales the core node and increases physics repulsion
 * to simulate an active search ripple wave across coordinates.
 */
function pulseNetwork() {
  if (!nodes || !network) return;

  // Scale core node
  nodes.update({ 
    id: 1, 
    size: 48, 
    color: { background: '#FFB300', border: '#FFB300' }, // Pulse to warning yellow
    shadow: { color: 'rgba(255, 179, 0, 0.8)', size: 25 } 
  });

  // Temporarily spike physics repulsion for bounce ripple
  network.setOptions({
    physics: {
      barnesHut: {
        gravitationalConstant: -10000,
        springLength: 180
      }
    }
  });

  // Return to normal bounds
  setTimeout(() => {
    nodes.update({ 
      id: 1, 
      size: 32, 
      color: { background: '#00FFFF', border: '#00FFFF' }, 
      shadow: { color: 'rgba(0, 255, 255, 0.7)', size: 16 } 
    });
    network.setOptions({
      physics: {
        barnesHut: {
          gravitationalConstant: -2500,
          springLength: 130
        }
      }
    });
  }, 1000);
}

/**
 * Spawns dynamic sub-nodes connected to random satellite cores.
 */
function injectSubNodes(count = 2) {
  if (!nodes || !edges) return;

  const satellites = [2, 3, 4, 5];
  const subNames = [
    "Node_X7", "Rantai_B4", "Sentimen_K9", "Variabel_Z3", "Dampak_G1", 
    "Indeks_W8", "Node_P2", "Korelasi_M5", "Faktor_T6", "Matrik_C1"
  ];

  for (let i = 0; i < count; i++) {
    const subNodeId = Date.now() + i + Math.random();
    const targetSatellite = satellites[Math.floor(Math.random() * satellites.length)];
    const randomLabel = subNames[Math.floor(Math.random() * subNames.length)];

    // Inject small satellite variables in warning yellow/orange
    nodes.add({
      id: subNodeId,
      label: randomLabel,
      size: 14,
      color: { background: '#FFB300', border: '#FFB300', highlight: '#FFB300' },
      font: { size: 11, color: '#ffffff', face: 'Rajdhani' },
      shadow: { enabled: true, color: 'rgba(255, 179, 0, 0.5)', size: 8, x: 0, y: 0 }
    });

    edges.add({
      from: targetSatellite,
      to: subNodeId,
      color: { color: 'rgba(255, 179, 0, 0.25)' },
      width: 1.2
    });
  }
}

/**
 * Dynamic flickering simulator for dashboard statistics
 * Runs during the AI calculating state.
 */
function startTelemetryFlicker() {
  const complianceEl = document.getElementById('stat-compliance');
  const variablesEl = document.getElementById('stat-variables');
  const pathStatusEl = document.getElementById('diag-path-status');
  const accuracyEl = document.getElementById('diag-accuracy');
  
  const statusTexts = ["KOMPUTASI...", "ANALISIS...", "PENYELARASAN...", "PROYEKSI...", "CALCULATING..."];
  
  flickerInterval = setInterval(() => {
    if (complianceEl) {
      complianceEl.textContent = (Math.random() * 20 + 80).toFixed(1) + '%';
    }
    if (variablesEl) {
      variablesEl.textContent = Math.floor(Math.random() * 1500 + 500).toLocaleString('id-ID');
    }
    if (pathStatusEl) {
      pathStatusEl.textContent = statusTexts[Math.floor(Math.random() * statusTexts.length)];
      pathStatusEl.style.color = "var(--warning-orange)";
    }
    if (accuracyEl) {
      accuracyEl.textContent = (Math.random() * 10 + 90).toFixed(2) + '%';
    }
  }, 100);
}

/**
 * Stops telemetry flickering and restores baseline statistics.
 */
function stopTelemetryFlicker() {
  if (flickerInterval) {
    clearInterval(flickerInterval);
    flickerInterval = null;
  }
  
  const complianceEl = document.getElementById('stat-compliance');
  const variablesEl = document.getElementById('stat-variables');
  const pathStatusEl = document.getElementById('diag-path-status');
  const accuracyEl = document.getElementById('diag-accuracy');
  
  if (complianceEl) complianceEl.textContent = "84.2%";
  if (variablesEl) variablesEl.textContent = "1,402";
  if (pathStatusEl) {
    pathStatusEl.textContent = currentPathStatus;
    pathStatusEl.style.color = currentPathStatusColor;
  }
  if (accuracyEl) accuracyEl.textContent = currentAccuracy;
}

/**
 * Parses and strips the [OUTLOOK: X% (STATUS)] tag from the raw AI response text.
 */
function parseAndStripOutlook(text) {
  const outlookRegex = /\[OUTLOOK:\s*(\d+)%\s*\((BAIK|BURUK|NETRAL)\)\]/i;
  const match = text.match(outlookRegex);
  if (match) {
    return {
      cleanText: text.replace(outlookRegex, '').trim(),
      score: parseInt(match[1], 10),
      status: match[2].toUpperCase()
    };
  }
  return { cleanText: text, score: null, status: null };
}

/**
 * Updates the top dashboard analysis header metric with the simulation outlook data.
 */
function updateHeaderOutlook(score, status) {
  const headerVal = document.getElementById('metric-outlook-val');
  if (headerVal) {
    headerVal.textContent = `${score}% ${status}`;
    headerVal.className = 'metric-val'; // Clear previous styles
    
    if (status === 'BAIK') {
      headerVal.classList.add('text-green', 'glow-green');
    } else if (status === 'BURUK') {
      headerVal.classList.add('text-orange', 'glow-orange');
    } else {
      headerVal.classList.add('text-cyan', 'glow-cyan');
    }
  }
}

/**
 * Resets the top dashboard analysis header metric to default baseline.
 */
function resetHeaderOutlook() {
  const headerVal = document.getElementById('metric-outlook-val');
  if (headerVal) {
    headerVal.textContent = "45%";
    headerVal.className = 'metric-val text-cyan glow-cyan';
  }
}

/**
 * Appends a glowing conclusion badge at the end of J.A.R.V.I.S / C.A.K.R.A. report messages.
 */
function appendOutlookBadge(container, score, status) {
  // Prevent duplicate rendering
  if (container.querySelector('.outlook-container')) return;

  const badgeDiv = document.createElement('div');
  const statusClass = `outlook-${status.toLowerCase()}`;
  badgeDiv.className = `outlook-container ${statusClass}`;
  
  let statusLabel = "Dampak Positif / Stabil";
  if (status === "BURUK") statusLabel = "Risiko Krisis / Buruk";
  if (status === "NETRAL") statusLabel = "Dampak Terbatas / Netral";

  badgeDiv.innerHTML = `
    <span class="outlook-title"><i class="fa-solid fa-gauge-high"></i> KESIMPULAN DAMPAK SIMULASI</span>
    <span class="outlook-badge-value">${score}% ${status} (${statusLabel})</span>
  `;
  container.appendChild(badgeDiv);
}

/**
 * Controls card explanation visibilities
 */
function updateWelcomeCardVisibility() {
  if (welcomeCard) {
    if (conversationHistory.length > 0) {
      welcomeCard.classList.add('hidden');
    } else {
      welcomeCard.classList.remove('hidden');
    }
  }
}

/**
 * Application boot
 */
function runBoot() {
  initNetworkGraph();
  updateWelcomeCardVisibility();
  
  if (conversationHistory.length > 0) {
    // Restore diagnostics state based on last message in history
    const lastBotMsg = [...conversationHistory].reverse().find(msg => msg.role === 'model');
    if (lastBotMsg) {
      currentActiveEngine = lastBotMsg.engine === 'groq' ? 'CADANGAN (GROQ)' : 'UTAMA (GEMINI)';
    }
    if (diagActiveEngine) {
      diagActiveEngine.textContent = currentActiveEngine;
    }

    renderHistoryLogs();
    userInput.disabled = false;
    btnRun.disabled = false;
    userInput.focus();
    footerStatusText("SISTEM CAKRA READY // RIWAYAT DIKEMBALIKAN");
  } else {
    runDiagnosticsBoot();
  }
}

/**
 * Runs diagnostics console lines
 */
function runDiagnosticsBoot() {
  userInput.disabled = true;
  btnRun.disabled = true;
  footerStatusText("MEMUAT DOCK PROTOKOL...");

  function printLine() {
    if (bootIndex < BOOT_LINES.length) {
      const line = document.createElement('div');
      line.className = 'boot-line';
      line.textContent = `> ${BOOT_LINES[bootIndex]}`;
      chatScreen.appendChild(line);
      scrollToBottom();
      bootIndex++;
      setTimeout(printLine, 200);
    } else {
      userInput.disabled = false;
      btnRun.disabled = false;
      userInput.focus();
      footerStatusText("STANDBY");
    }
  }

  printLine();
}

/**
 * Renders all history entries
 */
function renderHistoryLogs() {
  conversationHistory.forEach(msg => {
    let prefix = '[SIMULATION RESULT] >';
    if (msg.role === 'user') {
      prefix = '[VARIABLE INPUT] >';
    } else if (msg.engine === 'gemini') {
      prefix = '[SIMULATION RESULT via UTAMA/GEMINI] >';
    } else if (msg.engine === 'groq') {
      prefix = '[SIMULATION RESULT via CADANGAN/GROQ] >';
    } else if (msg.engine === 'system') {
      prefix = '[SISTEM C.A.K.R.A.] >';
    }

    const msgDiv = document.createElement('div');
    if (msg.role === 'user') {
      msgDiv.className = 'msg-container msg-user';
      msgDiv.innerHTML = `<span class="msg-prefix">${prefix}</span><span>${escapeHtml(msg.text)}</span>`;
    } else {
      msgDiv.className = 'msg-container msg-bot';
      const parsed = parseAndStripOutlook(msg.text);
      msgDiv.innerHTML = `<span class="msg-prefix">${prefix}</span><span>${parseMarkdown(parsed.cleanText)}</span>`;
      
      // Inject outlook card if it was saved in history
      if (parsed.score !== null) {
        appendOutlookBadge(msgDiv, parsed.score, parsed.status);
        updateHeaderOutlook(parsed.score, parsed.status);
      }
    }
    chatScreen.appendChild(msgDiv);
  });
  scrollToBottom();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function scrollToBottom() {
  chatScreen.scrollTo({
    top: chatScreen.scrollHeight,
    behavior: 'smooth'
  });
}

function footerStatusText(text) {
  const statusEl = document.getElementById('footer-status');
  if (statusEl) {
    statusEl.textContent = text;
  }
}

// Markdown parser
function parseMarkdown(text) {
  const lines = text.split('\n');
  let inList = false;
  let resultLines = [];

  for (let line of lines) {
    let trimmed = line.trim();
    trimmed = escapeHtml(trimmed);

    // Bold text (**text**)
    trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    const numberedHeaderMatch = trimmed.match(/^(\d+\.\s+[A-Z\s_,-]{4,})$/); // matches "1. EXECUTIVE SUMMARY"

    if (headerMatch) {
      if (inList) {
        resultLines.push('</ul>');
        inList = false;
      }
      resultLines.push(`<h3>${headerMatch[2]}</h3>`);
    } else if (numberedHeaderMatch) {
      if (inList) {
        resultLines.push('</ul>');
        inList = false;
      }
      resultLines.push(`<h3>${numberedHeaderMatch[1]}</h3>`);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        resultLines.push('<ul>');
        inList = true;
      }
      const itemContent = trimmed.substring(2);
      resultLines.push(`<li>${itemContent}</li>`);
    } else {
      if (inList && trimmed !== "") {
        resultLines.push('</ul>');
        inList = false;
      }
      if (trimmed === "") {
        if (inList) {
          resultLines.push('</ul>');
          inList = false;
        }
        resultLines.push('<br>');
      } else {
        resultLines.push(trimmed);
      }
    }
  }

  if (inList) {
    resultLines.push('</ul>');
  }

  let output = "";
  for (let i = 0; i < resultLines.length; i++) {
    const current = resultLines[i];
    output += current;
    const isBlock = current.startsWith('<h3') || current.startsWith('<ul') || current.startsWith('</ul') || current.startsWith('<li') || current.startsWith('<br>');
    const next = resultLines[i + 1];
    const nextIsBlock = next && (next.startsWith('<h3') || next.startsWith('<ul') || next.startsWith('</ul') || next.startsWith('<li') || next.startsWith('<br>'));
    
    if (i < resultLines.length - 1 && !isBlock && !nextIsBlock) {
      output += '<br>';
    }
  }

  return output;
}

// Atomically output HTML tags during typewriter
function typewriteHTML(element, htmlString, speed = 5, callback) {
  let i = 0;
  let currentHTML = "";
  
  function step() {
    if (i >= htmlString.length) {
      element.innerHTML = htmlString;
      if (callback) callback();
      return;
    }
    
    if (htmlString[i] === '<') {
      const tagEnd = htmlString.indexOf('>', i);
      if (tagEnd !== -1) {
        currentHTML += htmlString.substring(i, tagEnd + 1);
        i = tagEnd + 1;
      } else {
        currentHTML += htmlString[i];
        i++;
      }
    } else {
      currentHTML += htmlString[i];
      i++;
    }
    
    element.innerHTML = currentHTML;
    scrollToBottom();
    setTimeout(step, speed);
  }
  
  step();
}

function renderUserMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg-container msg-user';
  
  const prefixSpan = document.createElement('span');
  prefixSpan.className = 'msg-prefix';
  prefixSpan.textContent = '[VARIABLE INPUT] >';
  msgDiv.appendChild(prefixSpan);
  
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  msgDiv.appendChild(textSpan);
  
  chatScreen.appendChild(msgDiv);
  scrollToBottom();
}

function renderBotResponse(text, engine) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg-container msg-bot';
  
  let prefix = '[SIMULATION RESULT] >';
  if (engine === 'gemini') {
    prefix = '[SIMULATION RESULT via UTAMA/GEMINI] >';
  } else if (engine === 'groq') {
    prefix = '[SIMULATION RESULT via CADANGAN/GROQ] >';
  } else if (engine === 'system') {
    prefix = '[SISTEM C.A.K.R.A.] >';
  }

  const prefixSpan = document.createElement('span');
  prefixSpan.className = 'msg-prefix';
  prefixSpan.textContent = prefix;
  msgDiv.appendChild(prefixSpan);
  
  const textSpan = document.createElement('span');
  msgDiv.appendChild(textSpan);
  chatScreen.appendChild(msgDiv);
  scrollToBottom();
  
  // Parse and split outlook tag
  const parsed = parseAndStripOutlook(text);
  const parsedHTML = parseMarkdown(parsed.cleanText);
  
  userInput.disabled = true;
  btnRun.disabled = true;
  footerStatusText("MENGINTEGRASIKAN DATA STACK...");
  
  typewriteHTML(textSpan, parsedHTML, 3, () => {
    userInput.disabled = false;
    btnRun.disabled = false;
    userInput.focus();
    footerStatusText("STANDBY");
    
    // Inject conclusion badge and update headers upon typing end
    if (parsed.score !== null) {
      appendOutlookBadge(msgDiv, parsed.score, parsed.status);
      updateHeaderOutlook(parsed.score, parsed.status);
    }
    scrollToBottom();
  });
}

function renderSystemError(message) {
  const errDiv = document.createElement('div');
  errDiv.className = 'msg-container msg-bot';
  errDiv.style.color = 'var(--warning-orange)';
  
  const prefixSpan = document.createElement('span');
  prefixSpan.className = 'msg-prefix';
  prefixSpan.style.color = 'var(--warning-orange)';
  prefixSpan.textContent = '[SYSTEM ERROR] >';
  errDiv.appendChild(prefixSpan);
  
  const textSpan = document.createElement('span');
  textSpan.textContent = `CRITICAL: ${message}. DATASTREAM RECALIBRATION RECOMMENDED.`;
  errDiv.appendChild(textSpan);
  
  chatScreen.appendChild(errDiv);
  scrollToBottom();
  
  userInput.disabled = false;
  btnRun.disabled = false;
  userInput.focus();
  footerStatusText("DEVIASI TERDETEKSI");
}

function showThinkingIndicator() {
  thinkingEl = document.createElement('div');
  thinkingEl.className = 'thinking-container';
  thinkingEl.innerHTML = `&gt; COMPUTING PROBABILITIES...<span class="cursor-block"></span>`;
  chatScreen.appendChild(thinkingEl);
  scrollToBottom();
  
  // Reset the top dashboard metrics header before calculations start
  resetHeaderOutlook();

  // Append glowing laser scanner sweep overlay in right analysis card
  const analysisPanel = document.getElementById('analysis-panel');
  if (analysisPanel && !document.getElementById('laser-scanner')) {
    const scanner = document.createElement('div');
    scanner.className = 'laser-scan';
    scanner.id = 'laser-scanner';
    analysisPanel.appendChild(scanner);
  }
  
  // Start numbers/text flicker animation
  startTelemetryFlicker();
}

function hideThinkingIndicator() {
  if (thinkingEl) {
    thinkingEl.remove();
    thinkingEl = null;
  }
  
  // Remove laser scanner overlay
  const scanner = document.getElementById('laser-scanner');
  if (scanner) {
    scanner.remove();
  }
  
  // Stop telemetry flicker and restore baseline stats
  stopTelemetryFlicker();
}

// Submission
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const query = userInput.value.trim();
  if (!query) return;
  
  userInput.value = '';
  
  // Hide welcome card upon first message
  if (conversationHistory.length === 0 && welcomeCard) {
    welcomeCard.classList.add('hidden');
  }
  
  renderUserMessage(query);
  conversationHistory.push({ role: 'user', text: query });
  localStorage.setItem('cakra_chat_history', JSON.stringify(conversationHistory));
  
  // Pulse visual Vis.js background nodes
  pulseNetwork();
  
  showThinkingIndicator();
  footerStatusText("MEMPROSES ALIRAN KOORDINAT...");
  
  // Start the network spike timer (3000ms threshold)
  let networkTimeout = setTimeout(() => {
    networkWarning.classList.remove('hidden');
    footerStatusText("DETEKSI SPIKE I/O JARINGAN");
  }, 3000);
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        conversation: conversationHistory
      })
    });
    
    // Clear spike warning status
    clearTimeout(networkTimeout);
    networkWarning.classList.add('hidden');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Simulation response failure.");
    }
    
    const data = await response.json();
    hideThinkingIndicator();
    
    // Inject 2-3 dynamic subnodes representing new mapped futures
    injectSubNodes(Math.floor(Math.random() * 2) + 2);
    
    // Sync active engine labels on Left Diagnostic Card
    currentActiveEngine = data.engine === 'groq' ? 'CADANGAN (GROQ)' : 'UTAMA (GEMINI)';
    if (diagActiveEngine) {
      diagActiveEngine.textContent = currentActiveEngine;
    }
    
    // Save AI response to history including dynamic responding engine tags
    conversationHistory.push({ role: 'model', text: data.text, engine: data.engine });
    localStorage.setItem('cakra_chat_history', JSON.stringify(conversationHistory));
    
    renderBotResponse(data.text, data.engine);
    
  } catch (error) {
    clearTimeout(networkTimeout);
    networkWarning.classList.add('hidden');
    hideThinkingIndicator();
    renderSystemError(error.message);
  }
});

// Purge/Reset New Simulation Button
if (btnNewSim) {
  btnNewSim.addEventListener('click', () => {
    localStorage.removeItem('cakra_chat_history');
    conversationHistory = [];
    
    // Clear chat screen leaving only the welcome card if present
    chatScreen.innerHTML = '';
    if (welcomeCard) {
      chatScreen.appendChild(welcomeCard);
      welcomeCard.classList.remove('hidden');
    }
    
    // Reset metrics headers
    resetHeaderOutlook();
    
    // Sync Active Engine default diagnostic label
    currentActiveEngine = 'GEMINI 2.5';
    currentPathStatus = 'OPTIMAL';
    currentPathStatusColor = 'var(--success-green)';
    currentAccuracy = '99.87%';
    if (diagActiveEngine) {
      diagActiveEngine.textContent = currentActiveEngine;
    }

    // Reset nodes to baseline Core + 4 Satellites (purges dynamically spawned ones)
    if (nodes && edges) {
      nodes.clear();
      edges.clear();
      
      nodes.add([
        { 
          id: 1, 
          label: 'MESIN UTAMA\n(C.A.K.R.A.)', 
          size: 32, 
          color: { background: '#00FFFF', border: '#00FFFF', highlight: '#00FFFF' },
          shadow: { enabled: true, color: 'rgba(0, 255, 255, 0.7)', size: 16 }
        },
        { id: 2, label: 'Ekonomi Makro', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } },
        { id: 3, label: 'Sentimen Publik', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } },
        { id: 4, label: 'Rantai Pasok', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } },
        { id: 5, label: 'Volatilitas Pasar', size: 22, color: { background: '#0a1e36', border: '#00FFFF' } }
      ]);

      edges.add([
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 1, to: 5 }
      ]);
    }
    
    bootIndex = 0;
    runDiagnosticsBoot();
  });
}

// Export Report Button
const btnExport = document.getElementById('btn-export');
if (btnExport) {
  btnExport.addEventListener('click', () => {
    if (conversationHistory.length === 0) {
      alert("Belum ada riwayat simulasi untuk diekspor.");
      return;
    }
    
    // Generate WITA formatted timestamp
    const now = new Date();
    const options = {
      timeZone: 'Asia/Makassar',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    const r = {};
    parts.forEach(p => { r[p.type] = p.value; });
    const timestampStr = `${r.year}-${r.month}-${r.day} ${r.hour}:${r.minute}:${r.second} WITA`;
    
    // Create new print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker terdeteksi. Izinkan popup untuk mengunduh laporan PDF.");
      return;
    }
    
    // Build HTML content for the PDF Briefing Dossier
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Simulasi C.A.K.R.A.</title>
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1a202c;
      background-color: #ffffff;
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px double #0056b3;
      padding-bottom: 15px;
      margin-bottom: 25px;
      text-align: center;
    }
    .header .title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0056b3;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .header .subtitle {
      font-size: 0.85rem;
      font-weight: 700;
      color: #718096;
      margin-top: 5px;
      letter-spacing: 1px;
    }
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 35px;
    }
    .metadata-table td {
      border: 1px solid #cbd5e0;
      padding: 10px 14px;
      font-size: 0.9rem;
    }
    .metadata-table td.label {
      font-weight: bold;
      background-color: #f7fafc;
      width: 25%;
      color: #4a5568;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1a202c;
      margin-top: 35px;
      margin-bottom: 18px;
      border-bottom: 1.5px solid #0056b3;
      padding-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .log-entry {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .user-entry {
      background-color: #f7fafc;
      border-left: 4px solid #0056b3;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 0 4px 4px 0;
    }
    .user-entry strong {
      color: #0056b3;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
    }
    .user-entry p {
      margin: 8px 0 0 0;
      font-size: 1.05rem;
      font-weight: 500;
    }
    .bot-entry {
      padding: 5px 0;
    }
    .bot-entry h3 {
      font-size: 1.1rem;
      color: #2d3748;
      margin-top: 20px;
      margin-bottom: 8px;
      border-left: 3px solid #0056b3;
      padding-left: 8px;
    }
    .bot-entry ul {
      margin: 8px 0 15px 20px;
      padding: 0;
    }
    .bot-entry li {
      margin-bottom: 6px;
    }
    .bot-entry strong {
      color: #1a202c;
    }
    .outlook-badge-container {
      margin-top: 15px;
      page-break-inside: avoid;
    }
    .outlook-badge {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 12px 20px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 0.95rem;
      border: 1px solid #cbd5e0;
      box-sizing: border-box;
    }
    .outlook-title {
      color: #718096;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .outlook-val {
      font-size: 1.05rem;
      letter-spacing: 1px;
    }
    .outlook-baik {
      background-color: #f0fff4;
      color: #2f855a;
      border-color: #c6f6d5;
    }
    .outlook-buruk {
      background-color: #fffaf0;
      color: #c05621;
      border-color: #feebc8;
    }
    .outlook-netral {
      background-color: #ebf8ff;
      color: #2b6cb0;
      border-color: #bee3f8;
    }
    .signature-section {
      margin-top: 80px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 280px;
      text-align: center;
    }
    .signature-title {
      font-size: 0.85rem;
      font-weight: bold;
      color: #4a5568;
      margin-bottom: 65px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .signature-line {
      font-weight: 800;
      color: #1a202c;
      border-bottom: 1.5px solid #718096;
      padding-bottom: 6px;
      margin-bottom: 4px;
      font-size: 1.05rem;
    }
    .signature-sub {
      font-size: 0.78rem;
      color: #718096;
      letter-spacing: 0.5px;
    }
    @media print {
      body {
        padding: 0;
      }
      @page {
        margin: 1.5cm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">CAKRAWALA ANALISIS KEBIJAKAN & RISIKO ALIRAN</div>
    <div class="subtitle">DOKUMEN HASIL SIMULASI PREDIKTIF MAKRO (C.A.K.R.A.)</div>
  </div>

  <table class="metadata-table">
    <tr>
      <td class="label">Waktu Ekspor</td>
      <td>${timestampStr}</td>
      <td class="label">Engine Analisis</td>
      <td>${currentActiveEngine}</td>
    </tr>
    <tr>
      <td class="label">Akurasi Sistem</td>
      <td>${currentAccuracy}</td>
      <td class="label">Total Interaksi</td>
      <td>${conversationHistory.length} entri</td>
    </tr>
  </table>

  <div class="section-title">LOG AKTIVITAS SIMULASI</div>
`;

    // Process and append transcript logs
    conversationHistory.forEach((msg, idx) => {
      if (msg.role === 'user') {
        html += `
  <div class="log-entry">
    <div class="user-entry">
      <strong>[VARIABLE INPUT #${idx + 1}]</strong>
      <p>"${escapeHtml(msg.text)}"</p>
    </div>
  </div>`;
      } else {
        const parsed = parseAndStripOutlook(msg.text);
        const parsedHTML = parseMarkdown(parsed.cleanText);
        const engineLabel = msg.engine === 'groq' ? 'CADANGAN/GROQ' : 'UTAMA/GEMINI';
        
        let badgeHtml = '';
        if (parsed.score !== null) {
          const statusClass = `outlook-${parsed.status.toLowerCase()}`;
          let statusLabel = "Dampak Positif / Stabil";
          if (parsed.status === "BURUK") statusLabel = "Risiko Krisis / Buruk";
          if (parsed.status === "NETRAL") statusLabel = "Dampak Terbatas / Netral";
          
          badgeHtml = `
          <div class="outlook-badge-container">
            <div class="outlook-badge ${statusClass}">
              <span class="outlook-title">KESIMPULAN DAMPAK SIMULASI</span>
              <span class="outlook-val">${parsed.score}% ${parsed.status} (${statusLabel})</span>
            </div>
          </div>`;
        }

        html += `
  <div class="log-entry">
    <div class="bot-entry">
      <div style="font-size: 0.8rem; font-weight: bold; color: #718096; margin-bottom: 5px; text-transform: uppercase;">
        [SIMULATION RESULT #${idx + 1} via ${engineLabel}]
      </div>
      <div>${parsedHTML}</div>
      ${badgeHtml}
    </div>
  </div>`;
      }
    });

    // Add Signature Block
    html += `
  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-title">ANALIS UTAMA C.A.K.R.A.</div>
      <div class="signature-line">Muhammad Latief Saputra</div>
      <div class="signature-sub">Sistem Analisis & Proyeksi Kebijakan Aliran</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() {
        window.close();
      };
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  });
}

// Boot the application on load
window.addEventListener('DOMContentLoaded', runBoot);
