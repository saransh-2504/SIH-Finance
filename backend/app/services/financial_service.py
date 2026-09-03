"""Deterministic financial calculations — no LLM involved."""
from __future__ import annotations
from math import pow
from typing import Optional


MICRO_LIMIT = 140_000          # Rs. 1.40 lakh
TERM_LIMIT = 5_000_000         # Rs. 50 lakh


SCHEMES: list[dict] = [
    {
        "name": "Micro Finance Scheme",
        "min_project_cost": 0,
        "max_project_cost": MICRO_LIMIT,
        "max_loan": 125_000,
        "interest_rate": 6.5,
        "tenure_years": 3,
        "moratorium_months": 3,
        "source": "MoSJE scheme guidelines (verify against latest official document)",
        "reason": (
            "Project cost up to Rs. 1.40 lakh is routed to the Micro Finance Scheme "
            "(6.5 % p.a., 3-year tenure, 3-month moratorium)."
        ),
    },
    {
        "name": "Term Loan Scheme",
        "min_project_cost": MICRO_LIMIT + 1,
        "max_project_cost": TERM_LIMIT,
        "max_loan": 4_500_000,
        "interest_rate": 8.0,
        "tenure_years": 7,
        "moratorium_months": 6,
        "source": "MoSJE scheme guidelines (verify against latest official document)",
        "reason": (
            "Project cost above Rs. 1.40 lakh and up to Rs. 50 lakh is routed to the "
            "Term Loan Scheme (8 % p.a., 7-year tenure, 6-month moratorium)."
        ),
    },
]


def route_scheme(project_cost: float) -> Optional[dict]:
    for s in SCHEMES:
        if s["min_project_cost"] <= project_cost <= s["max_project_cost"]:
            return s
    return None


def calculate_finance(margin: float) -> dict:
    if margin <= 0:
        raise ValueError("Margin must be positive.")
    project_cost = margin / 0.10
    loan_amount = project_cost * 0.90
    scheme = route_scheme(project_cost)

    if project_cost > TERM_LIMIT:
        return {
            "margin": margin,
            "project_cost": project_cost,
            "loan_amount": loan_amount,
            "capped_loan_amount": 0,
            "scheme": None,
            "unsupported_reason": (
                "Project cost exceeds the supported Term Loan range (Rs. 50 lakh). "
                "Please consult the appropriate financing authority."
            ),
        }

    capped = min(loan_amount, scheme["max_loan"]) if scheme else 0
    return {
        "margin": margin,
        "project_cost": project_cost,
        "loan_amount": loan_amount,
        "capped_loan_amount": capped,
        "scheme": scheme,
        "unsupported_reason": None,
    }


def calculate_emi(principal: float, annual_rate: float, tenure_years: int) -> dict:
    months = tenure_years * 12
    monthly_rate = annual_rate / 12 / 100
    if principal <= 0 or months <= 0:
        return {"emi": 0, "total_interest": 0, "total_repayment": 0}
    if monthly_rate == 0:
        emi = principal / months
    else:
        emi = (
            principal
            * monthly_rate
            * pow(1 + monthly_rate, months)
            / (pow(1 + monthly_rate, months) - 1)
        )
    total_repayment = emi * months
    return {
        "emi": round(emi, 2),
        "total_interest": round(total_repayment - principal, 2),
        "total_repayment": round(total_repayment, 2),
    }


def quarterly_schedule(principal: float, annual_rate: float, tenure_years: int) -> list[dict]:
    emi_data = calculate_emi(principal, annual_rate, tenure_years)
    emi = emi_data["emi"]
    monthly_rate = annual_rate / 12 / 100
    balance = principal
    rows = []
    for q in range(1, tenure_years * 4 + 1):
        principal_paid = 0.0
        interest_paid = 0.0
        for _ in range(3):
            if balance <= 0:
                break
            interest = balance * monthly_rate
            principal_part = min(emi - interest, balance)
            interest_paid += interest
            principal_paid += principal_part
            balance = max(0.0, balance - principal_part)
        rows.append(
            {
                "quarter": f"Q{q}",
                "principal": round(principal_paid, 2),
                "interest": round(interest_paid, 2),
                "total": round(principal_paid + interest_paid, 2),
                "balance": round(balance, 2),
            }
        )
    return rows


def calculate_business_model(
    monthly_customers: int,
    average_price: float,
    variable_cost_per_sale: float,
    rent: float,
    wages: float,
    utilities: float,
    transport: float,
    marketing: float,
    working_capital: float,
    loan_amount: float,
    interest_rate: float,
    tenure_years: int,
) -> dict:
    revenue = monthly_customers * average_price
    variable_costs = monthly_customers * variable_cost_per_sale
    fixed_costs = rent + wages + utilities + transport + marketing
    operating_surplus = revenue - variable_costs - fixed_costs
    emi_data = calculate_emi(loan_amount, interest_rate, tenure_years)
    emi = emi_data["emi"]
    cash_flow_after_debt = operating_surplus - emi
    repayment_coverage = (operating_surplus / emi) if emi > 0 else 99.0
    contribution_margin = max(1.0, average_price - variable_cost_per_sale)
    break_even_customers = int((fixed_costs + emi) / contribution_margin) + 1
    monthly_burn = max(1.0, fixed_costs + variable_costs - revenue + emi)
    cash_runway_months = 12 if cash_flow_after_debt >= 0 else int(working_capital / monthly_burn)
    survival_revenue = variable_costs + fixed_costs + emi

    if repayment_coverage >= 1.8 and cash_flow_after_debt > 10_000:
        status = "Healthy"
        borrow_advice = "Proceed"
    elif repayment_coverage >= 1.2 and cash_flow_after_debt >= 0:
        status = "Watch"
        borrow_advice = "Reduce Financing"
    else:
        status = "High Risk"
        borrow_advice = "Don't Borrow Yet"

    return {
        "revenue": round(revenue, 2),
        "variable_costs": round(variable_costs, 2),
        "fixed_costs": round(fixed_costs, 2),
        "operating_surplus": round(operating_surplus, 2),
        "emi": round(emi, 2),
        "cash_flow_after_debt": round(cash_flow_after_debt, 2),
        "repayment_coverage": round(repayment_coverage, 2),
        "break_even_customers": break_even_customers,
        "cash_runway_months": cash_runway_months,
        "survival_revenue": round(survival_revenue, 2),
        "status": status,
        "borrow_advice": borrow_advice,
    }
