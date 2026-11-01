from datetime import date
from typing import List, Dict, Any
from app.schemas.all_schemas import SchemeEligibilityMatch

VERIFIED_SCHEMES = [
    {
        "id": "pm-svanidhi",
        "scheme_name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
        "issuing_authority": "Ministry of Housing and Urban Affairs (MoHUA), Govt. of India",
        "intended_beneficiaries": "Urban and peri-urban street vendors, hawkers, thelawalas, fruit/vegetable sellers, cart vendors",
        "business_categories": "Street Vending, Food Cart, Kirana/Vegetables, Small Services",
        "official_url": "https://pmsvanidhi.mohua.gov.in/",
        "eligibility_conditions": "1. Street vendors in possession of Certificate of Vending / Identity Card issued by Urban Local Bodies (ULBs).\n2. Vendors identified in survey or possessing Letter of Recommendation (LoR).\n3. Valid Aadhaar and mobile-linked bank account.",
        "required_documents": "1. Aadhaar Card\n2. Voter ID or ULB Vending Certificate / Letter of Recommendation (LoR)\n3. Bank Account Passbook copy\n4. Active mobile number",
        "application_procedure": "Apply online at pmsvanidhi.mohua.gov.in or via nearest Common Service Centre (CSC) / Banking Correspondent. 1st tranche: ₹10,000 (1 yr term); 2nd tranche on timely repayment: ₹20,000; 3rd tranche: ₹50,000. Features 7% annual interest subsidy.",
        "max_loan_subsidy_info": "Working capital loan up to ₹50,000 (Tranches ₹10k, ₹20k, ₹50k) with 7% interest subsidy & up to ₹1,200 annual cashback on digital transactions.",
        "last_verified_date": date(2026, 8, 15)
    },
    {
        "id": "pm-mudra-shishu",
        "scheme_name": "Pradhan Mantri MUDRA Yojana (PMMY) - Shishu Category",
        "issuing_authority": "Department of Financial Services, Ministry of Finance, Govt. of India",
        "intended_beneficiaries": "Micro-enterprises, small shopkeepers, fruit/veg vendors, repair shops, artisanal units, first-time rural entrepreneurs",
        "business_categories": "Kirana, Retail, Agriculture Allied, Service, Manufacturing, Tailoring",
        "official_url": "https://www.mudra.org.in/",
        "eligibility_conditions": "1. Any Indian citizen with a viable business plan for a non-farm income-generating micro-enterprise.\n2. No prior default with any financial institution.\n3. Loan requirement up to ₹50,000.",
        "required_documents": "1. Proof of Identity (Aadhaar/Voter ID/PAN)\n2. Proof of Residence\n3. Quotation of machinery/items to be purchased or business expense estimate\n4. Business address proof\n5. Passport size photograph",
        "application_procedure": "Apply at any Commercial Bank, RRB, Small Finance Bank, MFI or online via JanSamarth portal (jansamarth.in). Collateral-free lending guaranteed by NCGTC.",
        "max_loan_subsidy_info": "Collateral-free loan up to ₹50,000. Repayment period typically 3 to 5 years at competitive bank lending rates.",
        "last_verified_date": date(2026, 9, 1)
    },
    {
        "id": "pm-mudra-kishore-tarun",
        "scheme_name": "Pradhan Mantri MUDRA Yojana (PMMY) - Kishore & Tarun Categories",
        "issuing_authority": "Department of Financial Services, Ministry of Finance, Govt. of India",
        "intended_beneficiaries": "Established micro and small businesses seeking growth, equipment purchase, or higher working capital",
        "business_categories": "Retail Trade, Wholesale, Food Processing, Manufacturing, Small Transporters",
        "official_url": "https://www.mudra.org.in/",
        "eligibility_conditions": "1. Existing business with demonstrated operational track record.\n2. Kishore: Loans above ₹50,000 up to ₹5 Lakh.\n3. Tarun: Loans above ₹5 Lakh up to ₹10 Lakh (extended to ₹20 Lakh under recent budget guidelines for verified repeat borrowers).",
        "required_documents": "1. KYC Documents of proprietor/partners\n2. Proof of Business Registration / Udyam Certificate\n3. Bank statement for past 6-12 months\n4. Past 1-2 years sales record / ITR if applicable\n5. Projected balance sheet and cash flow statement",
        "application_procedure": "Apply through public sector banks, private banks, RRBs, or online at JanSamarth.in. No third-party collateral required.",
        "max_loan_subsidy_info": "Collateral-free loan from ₹50,000 to ₹10-20 Lakh. Flexible repayment terms between 36 to 60 months.",
        "last_verified_date": date(2026, 9, 1)
    },
    {
        "id": "pm-vishwakarma",
        "scheme_name": "PM Vishwakarma Scheme",
        "issuing_authority": "Ministry of Micro, Small and Medium Enterprises (MoMSME), Govt. of India",
        "intended_beneficiaries": "Traditional artisans and craftspeople working with hands and tools across 18 designated trades (carpenters, blacksmiths, potters, cobblers, tailors, weavers, basket makers, etc.)",
        "business_categories": "Handicrafts, Artisanal, Carpentry, Blacksmithing, Tailoring, Leatherwork",
        "official_url": "https://pmvishwakarma.gov.in/",
        "eligibility_conditions": "1. Artisan or craftsperson working in one of the 18 family-based traditional trades.\n2. Minimum age 18 years.\n3. Engaged in the trade on the date of registration.\n4. Only one member of the family is eligible.",
        "required_documents": "1. Aadhaar Card\n2. Mobile Number linked to Aadhaar\n3. Bank Account details\n4. Ration Card / Family verification",
        "application_procedure": "Register at nearest CSC with biometric authentication. Involves 3-stage verification (Gram Panchayat / ULB, District Screening, Screening Committee). Benefits include PM Vishwakarma Certificate & ID, skill training with ₹500/day stipend, ₹15,000 modern toolkit incentive, and collateral-free enterprise loans (₹1 Lakh 1st tranche, ₹2 Lakh 2nd tranche at concessional 5% interest rate).",
        "max_loan_subsidy_info": "Up to ₹3 Lakh collateral-free loan at 5% concessional interest rate (8% interest subvention provided by Govt) + ₹15,000 toolkit grant.",
        "last_verified_date": date(2026, 9, 10)
    },
    {
        "id": "pmegp",
        "scheme_name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "issuing_authority": "Khadi and Village Industries Commission (KVIC), Ministry of MSME",
        "intended_beneficiaries": "Individuals above 18 years setting up new micro-enterprises in manufacturing or service sectors in rural/urban areas",
        "business_categories": "Manufacturing, Processing Units, Agro-based industries, Service Centers",
        "official_url": "https://www.kviconline.gov.in/pmegpeportal/",
        "eligibility_conditions": "1. Age 18+ years.\n2. At least 8th standard pass for manufacturing projects above ₹10 Lakh and service projects above ₹5 Lakh.\n3. Only for new viable enterprise projects.",
        "required_documents": "1. Aadhaar, PAN\n2. Detailed Project Report (DPR)\n3. Educational qualification certificate\n4. Caste/Special category certificate if claiming higher subsidy\n5. Rural area certificate from local revenue authority (for rural projects)",
        "application_procedure": "Submit online application with DPR at kviconline.gov.in. Margin money subsidy: 25% for General category in rural areas; 35% for SC/ST/OBC/Women/Minority in rural areas. Balance financed by participating commercial banks.",
        "max_loan_subsidy_info": "Project cost up to ₹50 Lakh for manufacturing, ₹20 Lakh for services. Capital subsidy between 15% to 35% credited to beneficiary bank account.",
        "last_verified_date": date(2026, 8, 20)
    },
    {
        "id": "stand-up-india",
        "scheme_name": "Stand-Up India Scheme",
        "issuing_authority": "Department of Financial Services, Ministry of Finance / SIDBI",
        "intended_beneficiaries": "Women entrepreneurs and SC/ST individuals setting up greenfield (first-time) enterprises",
        "business_categories": "Trading, Manufacturing, Services, Agri-allied Activities",
        "official_url": "https://www.standupmitra.in/",
        "eligibility_conditions": "1. Woman or SC/ST entrepreneur.\n2. Greenfield enterprise (first-time venture in trading/manufacturing/services/allied agri).\n3. In case of non-individual enterprise, 51% shareholding & controlling stake must be held by SC/ST or woman.",
        "required_documents": "1. Identity & Address Proof\n2. Business plan and financial projections\n3. Caste Certificate (for SC/ST)\n4. Partnership deed or company incorporation (if applicable)",
        "application_procedure": "Apply online at standupmitra.in or directly at any scheduled commercial bank branch.",
        "max_loan_subsidy_info": "Bank loans between ₹10 Lakh and ₹1 Crore for setting up greenfield enterprises.",
        "last_verified_date": date(2026, 7, 30)
    },
    {
        "id": "udyam-registration",
        "scheme_name": "Udyam MSME Registration (Zero Cost Portal)",
        "issuing_authority": "Ministry of Micro, Small and Medium Enterprises, Govt. of India",
        "intended_beneficiaries": "All micro, small, and medium businesses in India",
        "business_categories": "All Manufacturing and Service Enterprises, including Retail and Wholesale traders",
        "official_url": "https://udyamregistration.gov.in/",
        "eligibility_conditions": "1. Any active enterprise operating in India.\n2. Micro enterprise threshold: Investment in Plant & Machinery < ₹1 Crore AND Annual Turnover < ₹5 Crore.",
        "required_documents": "1. Aadhaar Number of Entrepreneur\n2. PAN Number\n3. Bank Account Details\n4. Business address and employee count",
        "application_procedure": "100% paperless, free of cost, self-declaration based registration at udyamregistration.gov.in. Never pay private agents. Provides official Udyam Certificate with QR code.",
        "max_loan_subsidy_info": "Free certification unlocking priority sector bank lending, interest rate concessions (1-1.5%), exemption from tender fees, and protection against delayed payments.",
        "last_verified_date": date(2026, 10, 1)
    }
]

class SchemeService:
    @staticmethod
    def get_all_schemes() -> List[Dict[str, Any]]:
        return VERIFIED_SCHEMES

    @staticmethod
    def get_scheme_by_id(scheme_id: str) -> Optional[Dict[str, Any]]:
        for s in VERIFIED_SCHEMES:
            if s["id"] == scheme_id:
                return s
        return None

    @staticmethod
    def evaluate_eligibility(
        business_category: str,
        business_type: str,
        annual_turnover: float,
        experience_years: float,
        has_udyam: bool = False,
        gender: str = "All",
        social_category: str = "General"
    ) -> List[SchemeEligibilityMatch]:
        matches: List[SchemeEligibilityMatch] = []
        cat_lower = business_category.lower()
        type_lower = business_type.lower()
        gender_lower = gender.lower()

        for scheme in VERIFIED_SCHEMES:
            sid = scheme["id"]
            reasons = []
            next_steps = []
            status = "More information required"
            max_benefit = scheme.get("max_loan_subsidy_info")

            if sid == "pm-svanidhi":
                if "street" in type_lower or "vendor" in type_lower or "vending" in type_lower or "cart" in type_lower or "hawker" in type_lower:
                    status = "Potentially relevant"
                    reasons.append("Your business type aligns directly with urban/semi-urban street vending and cart operations.")
                    reasons.append("Eligible for initial ₹10,000 working capital with 7% interest subvention.")
                    next_steps.append("Obtain vending certificate or Letter of Recommendation (LoR) from your local municipality/ULB.")
                else:
                    status = "Appears unlikely based on provided information"
                    reasons.append("PM SVANidhi is specifically reserved for street vendors and cart operators rather than fixed shop establishments.")
                    next_steps.append("Consider PMMY MUDRA Shishu if you operate a fixed kirana shop or small workshop.")

            elif sid == "pm-mudra-shishu":
                if annual_turnover <= 1000000:
                    status = "Potentially relevant"
                    reasons.append("Your turnover and micro scale match the MUDRA Shishu collateral-free threshold (up to ₹50,000).")
                    reasons.append("Suitable for initial working capital, small stock replenishment, or equipment repair.")
                    next_steps.append("Prepare a 1-page quotation of goods/supplies to purchase and visit your nearest public sector bank or apply on JanSamarth.")
                else:
                    status = "More information required"
                    reasons.append("Turnover indicates your financing needs may exceed ₹50,000.")
                    next_steps.append("Consider MUDRA Kishore (₹50,000 to ₹5 Lakh) for larger credit requirements.")

            elif sid == "pm-mudra-kishore-tarun":
                if experience_years >= 1 or annual_turnover >= 200000:
                    status = "Potentially relevant"
                    reasons.append("Your operational experience supports an expansion loan between ₹50,000 and ₹10 Lakh.")
                    next_steps.append("Organize past 6 months bank statement and your sales Khata records to demonstrate repayment capacity.")
                else:
                    status = "More information required"
                    reasons.append("Lenders typically evaluate 1-2 years of steady transaction track record for Kishore/Tarun tiers.")
                    next_steps.append("Maintain disciplined daily bookkeeping in GramVikas Khata book to build documented cash flow proof.")

            elif sid == "pm-vishwakarma":
                artisan_keywords = ["tailor", "handicraft", "carpent", "wood", "blacksmith", "potter", "cobbler", "artisan", "craft", "weaver", "barber", "washerman"]
                if any(kw in cat_lower for kw in artisan_keywords):
                    status = "Potentially relevant"
                    reasons.append("Your trade falls under the 18 recognized traditional craft/artisan trades.")
                    reasons.append("Eligible for ₹15,000 free toolkit grant + 5% concessional loan up to ₹3 Lakh.")
                    next_steps.append("Complete biometric Aadhaar verification at your local CSC centre.")
                else:
                    status = "Appears unlikely based on provided information"
                    reasons.append("PM Vishwakarma is restricted to 18 traditional craft categories.")
                    next_steps.append("If you engage in any artisanal or repair work, verify the official trade list on pmvishwakarma.gov.in.")

            elif sid == "stand-up-india":
                is_female = "female" in gender_lower or "woman" in gender_lower or "women" in gender_lower
                is_sc_st = social_category in ["SC", "ST"]
                if (is_female or is_sc_st) and experience_years <= 2:
                    status = "Potentially relevant"
                    reasons.append("Targeted for women and SC/ST entrepreneurs launching first-time greenfield ventures.")
                    next_steps.append("Draft a formal project report using GramVikas AI Business Plan generator for bank submission.")
                else:
                    status = "Appears unlikely based on provided information"
                    reasons.append("Mandatory eligibility requires borrower to be a woman or belong to SC/ST category.")

            elif sid == "pmegp":
                if experience_years <= 1:
                    status = "Potentially relevant"
                    reasons.append("PMEGP provides generous capital subsidies (up to 35% in rural areas) for new micro enterprises.")
                    next_steps.append("Prepare Detailed Project Report (DPR) detailing capital expenditure and working capital requirements.")
                else:
                    status = "More information required"
                    reasons.append("PMEGP focuses primarily on establishing new units (greenfield projects).")

            elif sid == "udyam-registration":
                status = "Potentially relevant"
                if not has_udyam:
                    reasons.append("Essential foundation: Official MSME status is completely free and unlocks bank priority lending and interest concessions.")
                    next_steps.append("Register on udyamregistration.gov.in using Aadhaar and PAN in under 10 minutes.")
                else:
                    reasons.append("You already hold Udyam registration, ensuring priority sector compliance.")
                    next_steps.append("Keep your certificate updated when annual turnover changes.")

            matches.append(SchemeEligibilityMatch(
                scheme_id=scheme["id"],
                scheme_name=scheme["scheme_name"],
                issuing_authority=scheme["issuing_authority"],
                official_url=scheme["official_url"],
                status=status,
                relevance_reasons=reasons,
                missing_criteria_or_next_steps=next_steps,
                max_benefit=max_benefit
            ))

        return matches
