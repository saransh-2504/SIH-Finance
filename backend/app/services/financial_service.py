from math import pow

MICRO_LIMIT = 140000
TERM_LIMIT = 5000000


def route_scheme(project_cost: float):
    if project_cost <= MICRO_LIMIT:
        return {"name": "Micro Finance Scheme", "interest_rate": 6.5, "tenure_years": 3, "moratorium_months": 3, "max_loan": 125000}
    if project_cost <= TERM_LIMIT:
        return {"name": "Term Loan Scheme", "interest_rate": 8, "tenure_years": 7, "moratorium_months": 6, "max_loan": 4500000}
    return None


def calculate_finance(margin: float):
    if margin <= 0:
        raise ValueError("margin must be positive")
    project_cost = margin / 0.10
    loan_amount = project_cost * 0.90
    scheme = route_scheme(project_cost)
    if scheme is None:
        return {"project_cost": project_cost, "loan_amount": loan_amount, "scheme": None}
    return {"project_cost": project_cost, "loan_amount": min(loan_amount, scheme["max_loan"]), "scheme": scheme}


def calculate_emi(principal: float, annual_rate: float, tenure_years: int):
    months = tenure_years * 12
    monthly_rate = annual_rate / 12 / 100
    if monthly_rate == 0:
        emi = principal / months
    else:
        emi = principal * monthly_rate * pow(1 + monthly_rate, months) / (pow(1 + monthly_rate, months) - 1)
    return {"emi": emi, "total_interest": emi * months - principal, "total_repayment": emi * months}
