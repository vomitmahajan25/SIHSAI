import io
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFService:
    @staticmethod
    def generate_business_plan_pdf(plan_data: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Brand colors from visual design system
        forest_green = colors.HexColor("#102B25")
        secondary_green = colors.HexColor("#287A50")
        accent_lime = colors.HexColor("#D8F3A5")
        text_dark = colors.HexColor("#1C2924")
        text_muted = colors.HexColor("#64716A")
        border_color = colors.HexColor("#DDE5DA")

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=forest_green
        )

        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            textColor=secondary_green
        )

        h2_style = ParagraphStyle(
            "SectionH2",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=forest_green,
            spaceBefore=10,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=text_dark
        )

        metric_key_style = ParagraphStyle(
            "MetricKey",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=forest_green
        )

        metric_val_style = ParagraphStyle(
            "MetricVal",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=text_dark
        )

        story = []

        # Header block
        story.append(Paragraph("GramVikas AI — Micro-Enterprise Business Plan", title_style))
        story.append(Paragraph(f"<b>Business:</b> {plan_data.get('business_name')} | <b>Entrepreneur:</b> {plan_data.get('entrepreneur_name')} | <b>Location:</b> {plan_data.get('locality')}", subtitle_style))
        story.append(Paragraph(f"Generated on: {plan_data.get('date_generated')} | SIH 2026 PS 10091", ParagraphStyle("Meta", parent=body_style, textColor=text_muted, fontSize=8)))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=secondary_green, spaceAfter=15))

        sections = plan_data.get("sections", [])
        for sec in sections:
            num = sec.get("section_number")
            title = sec.get("title")
            content = sec.get("content")
            metrics = sec.get("key_metrics", {})

            sec_elements = []
            sec_elements.append(Paragraph(f"{num}. {title}", h2_style))
            sec_elements.append(Paragraph(content.replace("\n", "<br/>"), body_style))
            sec_elements.append(Spacer(1, 6))

            if metrics:
                table_data = []
                row = []
                for k, v in metrics.items():
                    cell = [Paragraph(str(k), metric_key_style), Paragraph(str(v), metric_val_style)]
                    row.append(cell)
                    if len(row) == 2:
                        table_data.append(row)
                        row = []
                if row:
                    # Pad last cell if odd count
                    row.append([Paragraph("", metric_key_style), Paragraph("", metric_val_style)])
                    table_data.append(row)

                if table_data:
                    # Flat 2-column or 4-column table
                    flat_rows = []
                    for r in table_data:
                        flat_rows.append([r[0][0], r[0][1], r[1][0], r[1][1]])

                    t = Table(flat_rows, colWidths=[130, 130, 130, 130])
                    t.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F6F8F2")),
                        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
                        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ]))
                    sec_elements.append(t)
                    sec_elements.append(Spacer(1, 8))

            story.append(KeepTogether(sec_elements))

        # Footer disclaimer
        story.append(Spacer(1, 15))
        story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceAfter=8))
        story.append(Paragraph(
            "<b>Disclaimer:</b> This business plan was compiled using GramVikas AI based on entrepreneur-provided inputs and localized business assumptions. "
            "Financial estimates are indicative projections and do not guarantee loan sanction, credit approval, or business profitability.",
            ParagraphStyle("Disclaimer", parent=body_style, textColor=text_muted, fontSize=7.5, leading=10)
        ))

        doc.build(story)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_financial_report_pdf(fin_summary: Dict[str, Any], business_name: str, entrepreneur_name: str) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        forest_green = colors.HexColor("#102B25")
        secondary_green = colors.HexColor("#287A50")
        border_color = colors.HexColor("#DDE5DA")
        text_dark = colors.HexColor("#1C2924")

        title_style = ParagraphStyle("T", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=forest_green)
        sub_style = ParagraphStyle("S", fontName="Helvetica", fontSize=10, leading=14, textColor=secondary_green)
        body_style = ParagraphStyle("B", fontName="Helvetica", fontSize=9, leading=13, textColor=text_dark)
        bold_style = ParagraphStyle("BB", fontName="Helvetica-Bold", fontSize=9, leading=13, textColor=forest_green)

        story = [
            Paragraph("GramVikas AI — Statement of Financial Health & Performance", title_style),
            Paragraph(f"<b>Business:</b> {business_name} | <b>Proprietor:</b> {entrepreneur_name} | <b>Period:</b> {fin_summary.get('timeframe')}", sub_style),
            Spacer(1, 8),
            HRFlowable(width="100%", thickness=2, color=secondary_green, spaceAfter=12),
            Paragraph("<b>I. PROFIT & LOSS SUMMARY (INR ₹)</b>", bold_style),
            Spacer(1, 4)
        ]

        pnl_data = [
            [Paragraph("Total Recorded Sales / Revenue", body_style), Paragraph(f"₹{fin_summary.get('total_revenue', 0.0):,.2f}", bold_style)],
            [Paragraph("Cost of Goods Sold (Inventory / Direct Purchases)", body_style), Paragraph(f"₹{fin_summary.get('cogs', 0.0):,.2f}", body_style)],
            [Paragraph("<b>Gross Profit</b>", bold_style), Paragraph(f"<b>₹{fin_summary.get('gross_profit', 0.0):,.2f}</b>", bold_style)],
            [Paragraph("Operating Expenses (Rent, Utilities, Transport, Labor)", body_style), Paragraph(f"₹{fin_summary.get('operating_expenses', 0.0):,.2f}", body_style)],
            [Paragraph("<b>Net Profit</b>", bold_style), Paragraph(f"<b>₹{fin_summary.get('net_profit', 0.0):,.2f}</b>", bold_style)],
            [Paragraph("Net Profit Margin (%)", body_style), Paragraph(f"{fin_summary.get('net_profit_margin_pct', 0.0):.1f}%", bold_style)],
        ]

        t_pnl = Table(pnl_data, colWidths=[350, 170])
        t_pnl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t_pnl)
        story.append(Spacer(1, 14))

        story.append(Paragraph("<b>II. CASH FLOW & BALANCE SHEET METRICS</b>", bold_style))
        story.append(Spacer(1, 4))

        cf_data = [
            [Paragraph("Total Cash Inflows", body_style), Paragraph(f"₹{fin_summary.get('cash_inflows', 0.0):,.2f}", body_style)],
            [Paragraph("Total Cash Outflows", body_style), Paragraph(f"₹{fin_summary.get('cash_outflows', 0.0):,.2f}", body_style)],
            [Paragraph("<b>Net Cash Flow</b>", bold_style), Paragraph(f"<b>₹{fin_summary.get('net_cash_flow', 0.0):,.2f}</b>", bold_style)],
            [Paragraph("Current Inventory Valuation", body_style), Paragraph(f"₹{fin_summary.get('inventory_valuation', 0.0):,.2f}", body_style)],
            [Paragraph("Total Recorded Outstanding Debt", body_style), Paragraph(f"₹{fin_summary.get('total_debt_outstanding', 0.0):,.2f}", body_style)],
            [Paragraph("Monthly Break-Even Sales Needed", body_style), Paragraph(f"₹{fin_summary.get('break_even_monthly_revenue', 0.0):,.2f}", body_style)],
            [Paragraph("Financial Health Score", bold_style), Paragraph(f"{fin_summary.get('financial_health_score')}/100 ({fin_summary.get('financial_health_status')})", bold_style)],
        ]

        t_cf = Table(cf_data, colWidths=[350, 170])
        t_cf.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t_cf)
        story.append(Spacer(1, 14))

        recs = fin_summary.get("key_recommendations", [])
        if recs:
            story.append(Paragraph("<b>III. KEY BUSINESS HEALTH RECOMMENDATIONS</b>", bold_style))
            story.append(Spacer(1, 4))
            for r in recs:
                story.append(Paragraph(f"• {r}", body_style))
                story.append(Spacer(1, 3))

        story.append(Spacer(1, 20))
        story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceAfter=6))
        story.append(Paragraph(
            "Generated automatically by GramVikas AI based on authenticated user transaction records. Not a substitute for statutory audit.",
            ParagraphStyle("D", fontName="Helvetica", fontSize=7.5, leading=10, textColor=colors.HexColor("#64716A"))
        ))

        doc.build(story)
        buffer.seek(0)
        return buffer
