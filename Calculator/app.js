var calculator = {
  displayValue: "0",
  firstOperand: null,
  waitingForSecondOperand: false,
  operator: null,
};
var display = document.getElementById("calculatorDisplay");
const performCalculation = {
  '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
  '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
  '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
  '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
  '=': (firstOperand, secondOperand) => secondOperand
};

document.getElementById("calculatorWindowBody").addEventListener("click", e => {
  if (!e.target.matches("button")) return;
  if (e.target.id.includes("_N")) {
    if (calculator.waitingForSecondOperand === true) {
      calculator.displayValue = e.target.value;
      calculator.waitingForSecondOperand = false;
    } else {
      calculator.displayValue = calculator.displayValue === '0' ? e.target.value : calculator.displayValue + e.target.value;
    }
    return display.value = calculator.displayValue;
  }
  if (e.target.id.includes("_O")) {
    const inputValue = parseFloat(calculator.displayValue);
    if (calculator.firstOperand == null) {
      calculator.firstOperand = inputValue;
    } else if (calculator.operator) {
      const result = performCalculation[calculator.operator](calculator.firstOperand, inputValue);
      calculator.displayValue = String(result);
      calculator.firstOperand = result;
    }
    calculator.waitingForSecondOperand = true;
    calculator.operator = e.target.value;
    console.log(calculator);
    return display.value = calculator.displayValue;
  }
  if (e.target.id.includes("Decimal")) {
    if (!calculator.displayValue.includes(e.target.innerText)) {
      calculator.displayValue += e.target.innerText;
      return display.value = calculator.displayValue;
    }
  }
  if (e.target.id.includes("Clear")) {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    return display.value = calculator.displayValue;
  }
});