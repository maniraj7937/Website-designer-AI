/* ==========================================================================
   AURA CALC - NEXT-GEN DARK THEME CALCULATOR JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // AUDIO SYNTHESIZER (WEB AUDIO API)
    // ==========================================
    let soundEnabled = true;
    let audioCtx = null;

    function playClickSound(type = 'click') {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'num') {
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === 'op') {
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'equals') {
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'clear') {
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            }
        } catch (e) {
            // Audio fail fallback silent
        }
    }

    // ==========================================
    // CALCULATOR ENGINE STATE & DOM
    // ==========================================
    const displayMain = document.getElementById('display-main');
    const displayExpression = document.getElementById('display-expression');
    const angleModePill = document.getElementById('angle-mode-pill');
    const memoryPill = document.getElementById('memory-pill');
    const keypadWrapper = document.getElementById('keypad-wrapper');

    let currentInput = '0';
    let expression = '';
    let isEvaluated = false;
    let isDegreeMode = true; // true = DEG, false = RAD
    let memoryValue = 0;
    let history = JSON.parse(localStorage.getItem('auracalc_history') || '[]');

    // Update Display UI
    function updateDisplay() {
        displayMain.textContent = currentInput;
        displayExpression.textContent = expression;

        // Auto scaling font size if number is too long
        if (currentInput.length > 14) {
            displayMain.style.fontSize = '1.8rem';
        } else if (currentInput.length > 10) {
            displayMain.style.fontSize = '2.2rem';
        } else {
            displayMain.style.fontSize = '2.75rem';
        }
    }

    // Memory Indicator Toggle
    function updateMemoryUI() {
        if (memoryValue !== 0) {
            memoryPill.classList.remove('hidden');
        } else {
            memoryPill.classList.add('hidden');
        }
    }

    // Angle Mode Toggle (DEG / RAD)
    function toggleAngleMode() {
        isDegreeMode = !isDegreeMode;
        angleModePill.textContent = isDegreeMode ? 'DEG' : 'RAD';
        const degRadBtn = document.getElementById('deg-rad-btn');
        if (degRadBtn) {
            degRadBtn.textContent = isDegreeMode ? 'RAD' : 'DEG';
        }
    }

    angleModePill.addEventListener('click', toggleAngleMode);

    // ==========================================
    // SCIENTIFIC & MATH EVALUATION LOGIC
    // ==========================================

    // Helper: Factorial calculation
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity; // Overflow limit for JS
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    // Safe mathematical evaluator
    function evaluateExpression(expr) {
        try {
            let processed = expr;

            // Replace standard visible symbols with JavaScript Math calls
            processed = processed.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            processed = processed.replace(/π/g, 'Math.PI').replace(/\be\b/g, 'Math.E');

            // Handle implicit multiplication (e.g., 2Math.PI -> 2*Math.PI or 5(2) -> 5*(2))
            processed = processed.replace(/(\d+)(Math\.PI|Math\.E|\()/g, '$1*$2');
            processed = processed.replace(/(\)|Math\.PI|Math\.E)(\d+|\()/g, '$1*$2');

            // Power / Exponent `^` -> `**`
            processed = processed.replace(/\^/g, '**');

            // Trigonometric Functions with DEG/RAD support
            const toRad = isDegreeMode ? '(Math.PI/180)*' : '';
            const toDeg = isDegreeMode ? '*(180/Math.PI)' : '';

            // Replace inverse trig
            processed = processed.replace(/asin\(/g, `(180/Math.PI)*Math.asin(`);
            processed = processed.replace(/acos\(/g, `(180/Math.PI)*Math.acos(`);
            processed = processed.replace(/atan\(/g, `(180/Math.PI)*Math.atan(`);

            // Replace standard trig
            if (isDegreeMode) {
                processed = processed.replace(/sin\(/g, `Math.sin((Math.PI/180)*`);
                processed = processed.replace(/cos\(/g, `Math.cos((Math.PI/180)*`);
                processed = processed.replace(/tan\(/g, `Math.tan((Math.PI/180)*`);
            } else {
                processed = processed.replace(/sin\(/g, `Math.sin(`);
                processed = processed.replace(/cos\(/g, `Math.cos(`);
                processed = processed.replace(/tan\(/g, `Math.tan(`);
            }

            // Other functions
            processed = processed.replace(/ln\(/g, 'Math.log(');
            processed = processed.replace(/log\(/g, 'Math.log10(');

            // Square root & Cube root
            processed = processed.replace(/√\(/g, 'Math.sqrt(');

            // Execute via Function constructor for safer evaluation than direct eval
            const result = new Function(`'use strict'; return (${processed})`)();

            if (isNaN(result) || !isFinite(result)) {
                return 'Error';
            }

            // Round to sensible floating point precision
            return parseFloat(Number(result).toFixed(10)).toString();

        } catch (err) {
            return 'Error';
        }
    }

    // Keypad Input Handler
    function handleKeyInput(action, value) {
        if (action === 'num') {
            playClickSound('num');
            if (isEvaluated) {
                currentInput = value;
                expression = '';
                isEvaluated = false;
            } else {
                if (currentInput === '0') {
                    currentInput = value;
                } else {
                    currentInput += value;
                }
            }
        } else if (action === 'decimal') {
            playClickSound('num');
            if (isEvaluated) {
                currentInput = '0.';
                expression = '';
                isEvaluated = false;
            } else if (!currentInput.includes('.')) {
                currentInput += '.';
            }
        } else if (action === 'op') {
            playClickSound('op');
            if (isEvaluated) {
                expression = currentInput + ' ' + value + ' ';
                isEvaluated = false;
            } else {
                expression += currentInput + ' ' + value + ' ';
            }
            currentInput = '0';
        } else if (action === 'insert') {
            playClickSound('op');
            if (isEvaluated) {
                currentInput = value;
                expression = '';
                isEvaluated = false;
            } else {
                if (currentInput === '0') {
                    currentInput = value;
                } else {
                    currentInput += value;
                }
            }
        } else if (action === 'func') {
            playClickSound('op');
            if (value === 'sin(' || value === 'cos(' || value === 'tan(' || 
                value === 'asin(' || value === 'acos(' || value === 'atan(' || 
                value === 'ln(' || value === 'log(') {
                if (isEvaluated) {
                    expression = value;
                    currentInput = '0';
                    isEvaluated = false;
                } else {
                    expression += value;
                }
            } else if (value === 'square') {
                const num = parseFloat(currentInput);
                currentInput = (num * num).toString();
            } else if (value === 'cube') {
                const num = parseFloat(currentInput);
                currentInput = (num * num * num).toString();
            } else if (value === 'sqrt') {
                const num = parseFloat(currentInput);
                currentInput = num >= 0 ? Math.sqrt(num).toString() : 'Error';
            } else if (value === 'cbrt') {
                const num = parseFloat(currentInput);
                currentInput = Math.cbrt(num).toString();
            } else if (value === 'exp') {
                const num = parseFloat(currentInput);
                currentInput = Math.exp(num).toString();
            } else if (value === 'pow10') {
                const num = parseFloat(currentInput);
                currentInput = Math.pow(10, num).toString();
            } else if (value === 'reciprocal') {
                const num = parseFloat(currentInput);
                currentInput = num !== 0 ? (1 / num).toString() : 'Error';
            } else if (value === 'factorial') {
                const num = parseInt(currentInput);
                currentInput = factorial(num).toString();
            }
        } else if (action === 'percent') {
            playClickSound('op');
            const num = parseFloat(currentInput);
            currentInput = (num / 100).toString();
        } else if (action === 'plus-minus') {
            playClickSound('op');
            if (currentInput !== '0' && currentInput !== 'Error') {
                if (currentInput.startsWith('-')) {
                    currentInput = currentInput.slice(1);
                } else {
                    currentInput = '-' + currentInput;
                }
            }
        } else if (action === 'clear-all') {
            playClickSound('clear');
            currentInput = '0';
            expression = '';
            isEvaluated = false;
        } else if (action === 'clear-entry') {
            playClickSound('clear');
            currentInput = '0';
        } else if (action === 'backspace') {
            playClickSound('clear');
            if (isEvaluated) {
                currentInput = '0';
                expression = '';
                isEvaluated = false;
            } else {
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
            }
        } else if (action === 'calculate') {
            playClickSound('equals');
            const fullExpr = expression + currentInput;
            if (!fullExpr) return;

            const res = evaluateExpression(fullExpr);
            
            // Save to history if valid
            if (res !== 'Error') {
                saveHistoryItem(fullExpr, res);
            }

            expression = fullExpr + ' =';
            currentInput = res;
            isEvaluated = true;
        } else if (action === 'deg-rad') {
            toggleAngleMode();
        }

        updateDisplay();
    }

    // Keypad Click Event Delegation
    keypadWrapper.addEventListener('click', (e) => {
        const keyBtn = e.target.closest('.key');
        if (!keyBtn) return;

        const action = keyBtn.dataset.action;
        const value = keyBtn.dataset.value;

        handleKeyInput(action, value);
    });

    // Sub-toggle Standard vs Scientific
    const btnToggleStd = document.getElementById('btn-toggle-std');
    const btnToggleSci = document.getElementById('btn-toggle-sci');

    btnToggleStd.addEventListener('click', () => {
        btnToggleStd.classList.add('active');
        btnToggleSci.classList.remove('active');
        keypadWrapper.classList.add('scientific-collapsed');
    });

    btnToggleSci.addEventListener('click', () => {
        btnToggleSci.classList.add('active');
        btnToggleStd.classList.remove('active');
        keypadWrapper.classList.remove('scientific-collapsed');
    });

    // ==========================================
    // MEMORY FUNCTIONS
    // ==========================================
    document.getElementById('mem-clear').addEventListener('click', () => {
        memoryValue = 0;
        updateMemoryUI();
    });

    document.getElementById('mem-recall').addEventListener('click', () => {
        currentInput = memoryValue.toString();
        updateDisplay();
    });

    document.getElementById('mem-add').addEventListener('click', () => {
        const num = parseFloat(currentInput);
        if (!isNaN(num)) {
            memoryValue += num;
            updateMemoryUI();
        }
    });

    document.getElementById('mem-sub').addEventListener('click', () => {
        const num = parseFloat(currentInput);
        if (!isNaN(num)) {
            memoryValue -= num;
            updateMemoryUI();
        }
    });

    document.getElementById('mem-store').addEventListener('click', () => {
        const num = parseFloat(currentInput);
        if (!isNaN(num)) {
            memoryValue = num;
            updateMemoryUI();
        }
    });

    // ==========================================
    // HISTORY LOG & DRAWER
    // ==========================================
    const historyDrawer = document.getElementById('history-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');

    function saveHistoryItem(expr, result) {
        history.unshift({ expr, result, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        if (history.length > 50) history.pop();
        localStorage.setItem('auracalc_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyCount.textContent = history.length;
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fa-solid fa-calculator"></i>
                    <p>No calculation history yet.<br>Start calculating!</p>
                </div>`;
            return;
        }

        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="hist-expr">${item.expr}</div>
                <div class="hist-res">${item.result}</div>
            </div>
        `).join('');
    }

    historyList.addEventListener('click', (e) => {
        const item = e.target.closest('.history-item');
        if (!item) return;
        const index = item.dataset.index;
        const selected = history[index];
        if (selected) {
            currentInput = selected.result;
            expression = selected.expr + ' =';
            isEvaluated = true;
            updateDisplay();
            closeHistoryDrawer();
        }
    });

    document.getElementById('clear-history-btn').addEventListener('click', () => {
        history = [];
        localStorage.removeItem('auracalc_history');
        renderHistory();
    });

    function openHistoryDrawer() {
        historyDrawer.classList.add('open');
        drawerOverlay.classList.add('show');
    }

    function closeHistoryDrawer() {
        historyDrawer.classList.remove('open');
        drawerOverlay.classList.remove('show');
    }

    document.getElementById('history-toggle-btn').addEventListener('click', openHistoryDrawer);
    document.getElementById('close-history-btn').addEventListener('click', closeHistoryDrawer);
    drawerOverlay.addEventListener('click', closeHistoryDrawer);

    renderHistory();

    // ==========================================
    // UNIT CONVERTER MODULE
    // ==========================================
    const unitData = {
        length: {
            units: {
                meter: { name: 'Meters (m)', factor: 1 },
                kilometer: { name: 'Kilometers (km)', factor: 1000 },
                centimeter: { name: 'Centimeters (cm)', factor: 0.01 },
                millimeter: { name: 'Millimeters (mm)', factor: 0.001 },
                mile: { name: 'Miles (mi)', factor: 1609.34 },
                yard: { name: 'Yards (yd)', factor: 0.9144 },
                foot: { name: 'Feet (ft)', factor: 0.3048 },
                inch: { name: 'Inches (in)', factor: 0.0254 }
            }
        },
        mass: {
            units: {
                kilogram: { name: 'Kilograms (kg)', factor: 1 },
                gram: { name: 'Grams (g)', factor: 0.001 },
                milligram: { name: 'Milligrams (mg)', factor: 0.000001 },
                pound: { name: 'Pounds (lbs)', factor: 0.453592 },
                ounce: { name: 'Ounces (oz)', factor: 0.0283495 },
                metric_ton: { name: 'Metric Tons (t)', factor: 1000 }
            }
        },
        temperature: {
            special: true,
            units: {
                celsius: { name: 'Celsius (°C)' },
                fahrenheit: { name: 'Fahrenheit (°F)' },
                kelvin: { name: 'Kelvin (K)' }
            }
        },
        volume: {
            units: {
                liter: { name: 'Liters (L)', factor: 1 },
                milliliter: { name: 'Milliliters (mL)', factor: 0.001 },
                cubic_meter: { name: 'Cubic Meters (m³)', factor: 1000 },
                gallon: { name: 'US Gallons (gal)', factor: 3.78541 },
                quart: { name: 'US Quarts (qt)', factor: 0.946353 },
                cup: { name: 'US Cups', factor: 0.24 }
            }
        },
        data: {
            units: {
                byte: { name: 'Bytes (B)', factor: 1 },
                kilobyte: { name: 'Kilobytes (KB)', factor: 1024 },
                megabyte: { name: 'Megabytes (MB)', factor: 1048576 },
                gigabyte: { name: 'Gigabytes (GB)', factor: 1073741824 },
                terabyte: { name: 'Terabytes (TB)', factor: 1099511627776 }
            }
        },
        speed: {
            units: {
                m_s: { name: 'Meters / second (m/s)', factor: 1 },
                km_h: { name: 'Kilometers / hour (km/h)', factor: 0.277778 },
                mph: { name: 'Miles / hour (mph)', factor: 0.44704 },
                knot: { name: 'Knots (kn)', factor: 0.514444 }
            }
        },
        time: {
            units: {
                second: { name: 'Seconds (s)', factor: 1 },
                minute: { name: 'Minutes (min)', factor: 60 },
                hour: { name: 'Hours (h)', factor: 3600 },
                day: { name: 'Days (d)', factor: 86400 },
                week: { name: 'Weeks', factor: 604800 }
            }
        }
    };

    let activeCategory = 'length';
    const categoriesContainer = document.getElementById('converter-categories');
    const fromSelect = document.getElementById('convert-from-unit');
    const toSelect = document.getElementById('convert-to-unit');
    const fromInput = document.getElementById('convert-from-input');
    const toInput = document.getElementById('convert-to-input');
    const formulaText = document.getElementById('converter-formula-text');

    function populateUnitDropdowns() {
        const cat = unitData[activeCategory];
        if (!cat) return;

        const keys = Object.keys(cat.units);
        fromSelect.innerHTML = keys.map(k => `<option value="${k}">${cat.units[k].name}</option>`).join('');
        toSelect.innerHTML = keys.map(k => `<option value="${k}">${cat.units[k].name}</option>`).join('');

        if (keys.length > 1) {
            toSelect.selectedIndex = 1;
        }

        convertUnits();
    }

    function convertUnits() {
        const val = parseFloat(fromInput.value);
        if (isNaN(val)) {
            toInput.value = '';
            formulaText.textContent = 'Enter a valid number';
            return;
        }

        const cat = unitData[activeCategory];
        const fromUnit = fromSelect.value;
        const toUnit = toSelect.value;

        let result = 0;

        if (activeCategory === 'temperature') {
            if (fromUnit === toUnit) result = val;
            else if (fromUnit === 'celsius' && toUnit === 'fahrenheit') result = (val * 9/5) + 32;
            else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') result = (val - 32) * 5/9;
            else if (fromUnit === 'celsius' && toUnit === 'kelvin') result = val + 273.15;
            else if (fromUnit === 'kelvin' && toUnit === 'celsius') result = val - 273.15;
            else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') result = (val - 32) * 5/9 + 273.15;
            else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') result = (val - 273.15) * 9/5 + 32;
        } else {
            const fromFactor = cat.units[fromUnit].factor;
            const toFactor = cat.units[toUnit].factor;
            const inBase = val * fromFactor;
            result = inBase / toFactor;
        }

        toInput.value = parseFloat(result.toFixed(6));
        formulaText.textContent = `${val} ${cat.units[fromUnit].name.split(' ')[0]} = ${parseFloat(result.toFixed(6))} ${cat.units[toUnit].name.split(' ')[0]}`;
    }

    categoriesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
        populateUnitDropdowns();
    });

    fromInput.addEventListener('input', convertUnits);
    fromSelect.addEventListener('change', convertUnits);
    toSelect.addEventListener('change', convertUnits);

    document.getElementById('swap-units-btn').addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        convertUnits();
    });

    populateUnitDropdowns();

    // ==========================================
    // QUICK TOOLS (TIP & DISCOUNT CALCULATOR)
    // ==========================================
    
    // Tip Calculator Logic
    const tipBill = document.getElementById('tip-bill');
    const tipSlider = document.getElementById('tip-slider');
    const tipPercentVal = document.getElementById('tip-percent-val');
    const tipPeople = document.getElementById('tip-people');
    const tipTotalAmount = document.getElementById('tip-total-amount');
    const tipTotalBill = document.getElementById('tip-total-bill');
    const tipPerPerson = document.getElementById('tip-per-person');

    function updateTipCalculator() {
        const bill = parseFloat(tipBill.value) || 0;
        const tipPercent = parseFloat(tipSlider.value) || 0;
        const people = parseInt(tipPeople.value) || 1;

        tipPercentVal.textContent = tipPercent + '%';

        const tipAmount = bill * (tipPercent / 100);
        const totalBill = bill + tipAmount;
        const perPerson = totalBill / Math.max(1, people);

        tipTotalAmount.textContent = '$' + tipAmount.toFixed(2);
        tipTotalBill.textContent = '$' + totalBill.toFixed(2);
        tipPerPerson.textContent = '$' + perPerson.toFixed(2);
    }

    tipBill.addEventListener('input', updateTipCalculator);
    tipSlider.addEventListener('input', updateTipCalculator);
    tipPeople.addEventListener('input', updateTipCalculator);

    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tipSlider.value = btn.dataset.tip;
            updateTipCalculator();
        });
    });

    document.getElementById('tip-people-minus').addEventListener('click', () => {
        if (parseInt(tipPeople.value) > 1) {
            tipPeople.value = parseInt(tipPeople.value) - 1;
            updateTipCalculator();
        }
    });

    document.getElementById('tip-people-plus').addEventListener('click', () => {
        tipPeople.value = parseInt(tipPeople.value) + 1;
        updateTipCalculator();
    });

    updateTipCalculator();

    // Discount Calculator Logic
    const discOriginal = document.getElementById('disc-original');
    const discPercent = document.getElementById('disc-percent');
    const discTax = document.getElementById('disc-tax');
    const discSavedVal = document.getElementById('disc-saved-val');
    const discTaxVal = document.getElementById('disc-tax-val');
    const discFinalPrice = document.getElementById('disc-final-price');

    function updateDiscountCalculator() {
        const orig = parseFloat(discOriginal.value) || 0;
        const disc = parseFloat(discPercent.value) || 0;
        const taxRate = parseFloat(discTax.value) || 0;

        const saved = orig * (disc / 100);
        const discountedPrice = orig - saved;
        const taxAmount = discountedPrice * (taxRate / 100);
        const finalPrice = discountedPrice + taxAmount;

        discSavedVal.textContent = '$' + saved.toFixed(2);
        discTaxVal.textContent = '$' + taxAmount.toFixed(2);
        discFinalPrice.textContent = '$' + finalPrice.toFixed(2);
    }

    discOriginal.addEventListener('input', updateDiscountCalculator);
    discPercent.addEventListener('input', updateDiscountCalculator);
    discTax.addEventListener('input', updateDiscountCalculator);

    updateDiscountCalculator();

    // ==========================================
    // NAVIGATION & TAB SWITCHING
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabViews = document.querySelectorAll('.tab-view');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabViews.forEach(v => v.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // ==========================================
    // THEME ACCENT PICKER
    // ==========================================
    const themeBtn = document.getElementById('theme-btn');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');

    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        themeDropdown.classList.remove('show');
    });

    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const accent = opt.dataset.accent;
            document.documentElement.setAttribute('data-theme', accent);
            themeOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            localStorage.setItem('auracalc_theme', accent);
        });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('auracalc_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeOptions.forEach(o => {
            if (o.dataset.accent === savedTheme) o.classList.add('active');
            else o.classList.remove('active');
        });
    }

    // Sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.innerHTML = soundEnabled ? 
            '<i class="fa-solid fa-volume-high"></i>' : 
            '<i class="fa-solid fa-volume-xmark"></i>';
    });

    // Copy to Clipboard
    const copyBtn = document.getElementById('copy-display-btn');
    const toast = document.getElementById('toast-message');

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(displayMain.textContent).then(() => {
            showToast('Result copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy');
        });
    });

    // Keyboard Shortcuts Modal
    const kbBtn = document.getElementById('kb-shortcuts-btn');
    const kbModal = document.getElementById('kb-modal');
    const closeKbModal = document.getElementById('close-kb-modal');

    kbBtn.addEventListener('click', () => kbModal.classList.add('show'));
    closeKbModal.addEventListener('click', () => kbModal.classList.remove('show'));
    kbModal.addEventListener('click', (e) => {
        if (e.target === kbModal) kbModal.classList.remove('show');
    });

    // ==========================================
    // PHYSICAL KEYBOARD LISTENERS
    // ==========================================
    window.addEventListener('keydown', (e) => {
        // Only trigger if typing on calculator view and not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        const key = e.key;

        if (key >= '0' && key <= '9') {
            handleKeyInput('num', key);
        } else if (key === '.') {
            handleKeyInput('decimal');
        } else if (key === '+') {
            handleKeyInput('op', '+');
        } else if (key === '-') {
            handleKeyInput('op', '−');
        } else if (key === '*') {
            handleKeyInput('op', '×');
        } else if (key === '/') {
            e.preventDefault();
            handleKeyInput('op', '÷');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            handleKeyInput('calculate');
        } else if (key === 'Backspace') {
            handleKeyInput('backspace');
        } else if (key === 'Escape') {
            handleKeyInput('clear-all');
        } else if (key === '(' || key === ')') {
            handleKeyInput('insert', key);
        } else if (key === '^') {
            handleKeyInput('op', '^');
        } else if (key === '%') {
            handleKeyInput('percent');
        }
    });

});
