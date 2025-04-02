const express = require("express");

const app = express();
const expressAsyncHandler = require("express-async-handler");

function homeLoanCalculator(
  monthlySalary,
  interestRate,
  tenureYears,
  maxEmiPercentageLimit
) {
  const monthlyInterestRate = interestRate / (12 * 100);
  const totalMonths = tenureYears * 12;

  // Calculate max EMI limit considering annual 10% salary increase
  let totalSalary = 0;
  let currentSalary = monthlySalary;

  for (let year = 1; year <= tenureYears; year++) {
    totalSalary += currentSalary * 12;
    currentSalary *= 1.1; // 10% increment every year
  }

  // Calculate average monthly salary over the tenure
  const averageMonthlySalary = totalSalary / (tenureYears * 12);
  const maxAllowedEMI = (totalSalary * maxEmiPercentageLimit) / 100;
  // [P x R x (1+R)^N]/[(1+R)^N-1
  const emi =
    (maxAllowedEMI * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  // Calculate max loan eligibility using EMI formula
  const maxLoanEligibility =
    (maxAllowedEMI * (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)) /
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths));
  return {
    maxMonthlyEmi: maxAllowedEMI.toFixed(2),
    maxLoanAmount: maxLoanEligibility.toFixed(2),
  };
}
const homeLoanEligibility = expressAsyncHandler(async (req, res) => {
  try {
    let payload = req.body;

    // Check if all required fields are present
    if (
      !payload.monthlySalary ||
      !payload.interestRate ||
      !payload.tenureYears ||
      !payload.emiPercentage
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: monthlySalary, interestRate, tenureYears, emiPercentage",
      });
    }

    const result = homeLoanCalculator(
      payload.monthlySalary,
      payload.interestRate,
      payload.tenureYears,
      payload.emiPercentage
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in homeLoanEligibility:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
});

module.exports = { homeLoanEligibility };
