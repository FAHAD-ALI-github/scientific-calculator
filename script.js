class ScientificCalculator {
    constructor() {
        this.upperDisplay = document.getElementById('upperDisplay');
        this.lowerDisplay = document.getElementById('lowerDisplay');
        this.currentInput = '';
        this.lastAnswer = 0;
        this.isRadians = true;
        this.isScientificMode = false;
        this.calculator = document.getElementById('calculator');
        this.scientificModeBtn = document.getElementById('scientificModeBtn');
        
        this.initEventListeners();
        this.updateDisplay();
    }
    
    initEventListeners() {
        // Add click listeners to all buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                try {
                    const action = e.target.dataset.action;
                    const value = e.target.dataset.value;
                    
                    if (action) {
                        this.handleAction(action);
                    } else if (value) {
                        this.handleInput(value);
                    }
                } catch (error) {
                    console.error('Button click error:', error);
                    this.showError();
                }
            });
        });
        
        // Add mode toggle listener
        this.scientificModeBtn.addEventListener('click', () => {
            this.toggleMode();
        });
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            try {
                this.handleKeyboard(e);
            } catch (error) {
                console.error('Keyboard error:', error);
            }
        });
    }
    
    toggleMode() {
        this.isScientificMode = !this.isScientificMode;
        const scientificRows = document.querySelectorAll('.scientific-row');
        const toggleSwitch = this.scientificModeBtn;
        
        // Add mode changing class for glow effect
        toggleSwitch.classList.add('mode-changing');
        
        if (this.isScientificMode) {
            // Switch to Scientific mode
            this.calculator.classList.remove('basic-mode');
            scientificRows.forEach(btn => btn.classList.remove('hidden'));
            toggleSwitch.classList.add('scientific-mode');
        } else {
            // Switch to Basic mode
            this.calculator.classList.add('basic-mode');
            scientificRows.forEach(btn => btn.classList.add('hidden'));
            toggleSwitch.classList.remove('scientific-mode');
        }
        
        // Remove mode changing class after animation
        setTimeout(() => {
            toggleSwitch.classList.remove('mode-changing');
        }, 400);
    }
    
    handleInput(value) {
        this.currentInput += value;
        this.updateDisplay();
        this.calculateLive();
    }
    
    handleAction(action) {
        try {
            switch (action) {
                case 'ac':
                    this.allClear();
                    break;
                case 'del':
                    this.delete();
                    break;
                case 'back':
                    this.backspace();
                    break;
                case 'equals':
                    this.calculate();
                    break;
                case 'ans':
                    this.insertAnswer();
                    break;
                case 'sin':
                case 'cos':
                case 'tan':
                case 'asin':
                case 'acos':
                case 'atan':
                case 'ln':
                case 'log':
                case 'exp':
                case 'pow10':
                case 'sqrt':
                case 'cbrt':
                case 'reciprocal':
                case 'factorial':
                case 'nthroot':
                    this.handleFunction(action);
                    break;
                case 'square':
                    this.currentInput += '^2';
                    this.updateDisplay();
                    this.calculateLive();
                    break;
                case 'cube':
                    this.currentInput += '^3';
                    this.updateDisplay();
                    this.calculateLive();
                    break;
                case 'pow':
                    this.currentInput += '^';
                    this.updateDisplay();
                    break;
                case 'pi':
                    this.currentInput += Math.PI.toString();
                    this.updateDisplay();
                    this.calculateLive();
                    break;
                case 'e':
                    this.currentInput += Math.E.toString();
                    this.updateDisplay();
                    this.calculateLive();
                    break;
                case 'percent':
                    this.currentInput += '/100';
                    this.updateDisplay();
                    this.calculateLive();
                    break;
            }
        } catch (error) {
            console.error('Action error:', error);
            this.showError();
        }
    }
    
    handleFunction(func) {
        const needsParentheses = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'exp', 'pow10', 'sqrt', 'cbrt'];
        
        if (needsParentheses.includes(func)) {
            // Use proper mathematical notation for inverse trig functions
            if (func === 'asin') {
                this.currentInput += 'sin⁻¹(';
            } else if (func === 'acos') {
                this.currentInput += 'cos⁻¹(';
            } else if (func === 'atan') {
                this.currentInput += 'tan⁻¹(';
            } else {
                this.currentInput += func + '(';
            }
        } else if (func === 'reciprocal') {
            // Fixed reciprocal function - just add 1/ instead of 1/(
            this.currentInput += '1/';
        } else if (func === 'factorial') {
            this.currentInput += '!';
        } else if (func === 'nthroot') {
            this.currentInput += ' nthroot ';
        }
        
        this.updateDisplay();
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        if ('0123456789.'.includes(key)) {
            this.handleInput(key);
        } else if ('+-*/'.includes(key)) {
            this.handleInput(key === '*' ? '*' : key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape') {
            this.allClear();
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        } else if (key === 'Delete') {
            this.delete();
        } else if (key === '(' || key === ')') {
            this.handleInput(key);
        }
    }
    
    updateDisplay() {
        this.upperDisplay.value = this.currentInput || '0';
    }
    
    // Auto-complete brackets for incomplete expressions
    autoCompleteBrackets(expression) {
        let openBrackets = 0;
        let completedExpression = expression;
        
        for (let char of expression) {
            if (char === '(') openBrackets++;
            else if (char === ')') openBrackets--;
        }
        
        // Add closing brackets for unclosed ones
        while (openBrackets > 0) {
            completedExpression += ')';
            openBrackets--;
        }
        
        return completedExpression;
    }
    
    calculateLive() {
        if (!this.currentInput) {
            this.lowerDisplay.textContent = '0';
            return;
        }
        
        try {
            // Auto-complete brackets for live calculation
            const completedExpression = this.autoCompleteBrackets(this.currentInput);
            
            // Skip evaluation if expression is clearly incomplete
            if (this.isIncompleteExpression(completedExpression)) {
                return;
            }
            
            const result = this.evaluateExpression(completedExpression);
            
            if (isFinite(result) && !isNaN(result)) {
                this.lowerDisplay.textContent = this.formatResult(result);
                this.lowerDisplay.classList.remove('error');
            } else {
                this.lowerDisplay.textContent = '0';
            }
        } catch (error) {
            console.log('Live calculation error (expected for incomplete expressions):', error.message);
            // Don't show error during live calculation for incomplete expressions
            // Just keep the previous result or show 0
            if (this.lowerDisplay.textContent === 'Error') {
                this.lowerDisplay.textContent = '0';
            }
        }
    }
    
    // Check if expression is incomplete and shouldn't be evaluated
    isIncompleteExpression(expr) {
        // Check for incomplete function calls or operators at the end
        const incompletePatterns = [
            /[+\-*/^]$/, // ends with operator
            /\b(sin|cos|tan|sin⁻¹|cos⁻¹|tan⁻¹|ln|log|exp|sqrt|cbrt|pow10)\($/, // function with no argument
            /^\s*$/ // empty or whitespace only
        ];
        
        return incompletePatterns.some(pattern => pattern.test(expr));
    }
    
    calculate() {
        if (!this.currentInput) return;
        
        try {
            // Auto-complete brackets before final calculation
            const completedExpression = this.autoCompleteBrackets(this.currentInput);
            const result = this.evaluateExpression(completedExpression);
            
            if (!isFinite(result)) {
                throw new Error('Invalid result');
            }
            
            this.lastAnswer = result;
            this.lowerDisplay.textContent = this.formatResult(result);
            this.lowerDisplay.classList.remove('error');
            this.currentInput = '';
            this.updateDisplay();
        } catch (error) {
            this.showError();
        }
    }
    
    evaluateExpression(expression) {
        // Custom expression evaluator without external dependencies
        let expr = expression.trim();
        
        // Replace display operators with JavaScript operators
        expr = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**');
            
        // Handle functions - FIXED ORDER AND SPECIFICITY
        // Handle inverse trig functions first (more specific patterns)
        // Handle the proper mathematical notation with degree/radian conversion
        expr = expr.replace(/sin⁻¹\(/g, 'this.radToDeg(Math.asin(');
        expr = expr.replace(/cos⁻¹\(/g, 'this.radToDeg(Math.acos(');
        expr = expr.replace(/tan⁻¹\(/g, 'this.radToDeg(Math.atan(');
        
        // Handle regular trig functions (less specific patterns) with degree/radian conversion
        expr = expr.replace(/\bsin\(/g, 'Math.sin(this.degToRad(');
        expr = expr.replace(/\bcos\(/g, 'Math.cos(this.degToRad(');
        expr = expr.replace(/\btan\(/g, 'Math.tan(this.degToRad(');
        
        // Handle logarithmic functions - FIXED to avoid double replacement
        // Use more specific patterns that won't match already processed Math.log
        expr = expr.replace(/\bln\(/g, 'Math.log(');        // Natural log
        expr = expr.replace(/(?<!Math\.)log\(/g, 'Math.log10(');  // Base-10 log, but not if already Math.log
        
        // Handle exponential functions
        expr = expr.replace(/\bexp\(/g, 'Math.exp(');
        expr = expr.replace(/pow10\(/g, 'Math.pow(10,');
        
        // Handle root functions
        expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
        expr = expr.replace(/cbrt\(/g, 'Math.cbrt(');
        
        // Handle factorial
        expr = expr.replace(/(\d+(?:\.\d+)?)\!/g, (match, num) => {
            return `this.factorial(${num})`;
        });
        
        // Handle nthroot
        expr = expr.replace(/(\d+(?:\.\d+)?)\s+nthroot\s+(\d+(?:\.\d+)?)/g, 'Math.pow($2, 1/$1)');
        
        // Need to close extra parentheses for degree/radian conversions
        // Count and balance parentheses for trig functions
        const trigFunctions = ['sin(', 'cos(', 'tan(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹('];
        let extraClosingNeeded = 0;
        
        for (let func of trigFunctions) {
            const matches = expression.match(new RegExp(func.replace('(', '\\('), 'g'));
            if (matches) {
                extraClosingNeeded += matches.length;
            }
        }
        
        // Add the extra closing parentheses needed for degree conversions
        for (let i = 0; i < extraClosingNeeded; i++) {
            expr += ')';
        }
        
        // REMOVED the problematic reciprocal replacement that was adding extra parentheses
        // The reciprocal is now handled properly in the handleFunction method
        
        console.log('Original expression:', expression);
        console.log('Processed expression:', expr);
        
        // Use Function constructor for safer evaluation than eval
        try {
            const func = new Function('return ' + expr);
            const result = func.call(this);
            console.log('Result:', result);
            
            // Handle domain errors for inverse trig functions
            if (isNaN(result)) {
                // Check if it's a domain error
                if (expression.includes('sin⁻¹') || expression.includes('cos⁻¹')) {
                    throw new Error('Domain Error: asin/acos only defined for [-1, 1]');
                }
                throw new Error('Invalid calculation');
            }
            
            return result;
        } catch (error) {
            console.error('Evaluation error:', error);
            console.error('Failed expression:', expr);
            throw error;
        }
    }
    
    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) {
            throw new Error('Factorial is only defined for non-negative integers');
        }
        if (n > 170) {
            return Infinity;
        }
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    // Helper functions for degree/radian conversion
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    formatResult(result) {
        if (Number.isInteger(result) && Math.abs(result) < 1e15) {
            return result.toString();
        }
        
        if (Math.abs(result) < 1e-6 || Math.abs(result) >= 1e15) {
            return result.toExponential(6);
        }
        
        return parseFloat(result.toPrecision(12)).toString();
    }
    
    showError() {
        this.lowerDisplay.textContent = 'Error';
        this.lowerDisplay.classList.add('error');
    }
    
    allClear() {
        this.currentInput = '';
        this.updateDisplay();
        this.lowerDisplay.textContent = '0';
        this.lowerDisplay.classList.remove('error');
    }
    
    delete() {
        this.currentInput = '';
        this.updateDisplay();
        this.calculateLive();
    }
    
    backspace() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateDisplay();
            this.calculateLive();
        }
    }
    
    insertAnswer() {
        this.currentInput += this.lastAnswer.toString();
        this.updateDisplay();
        this.calculateLive();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new ScientificCalculator();
        console.log('Calculator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
    }
});