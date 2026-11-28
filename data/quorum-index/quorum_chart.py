"""Chart of the Quórum index: years of median income needed to buy an 80 m² flat in 306 Spanish municipalities.

  pip install matplotlib
  python quorum_chart.py quorum-index-2026-11.csv chart.png

One dot per municipality, grouped by region. The bands are the share of income the mortgage takes:
up to 35%, 35 to 50% and more than half. Method and limits: https://ifuentes.net/blog/how-many-years-of-income-a-flat-costs-in-spain/
"""
import csv, statistics, sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

CSV, OUT = sys.argv[1], sys.argv[2]
rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
CCAA = {"Andalucía": ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"], "Aragón": ["Huesca", "Teruel", "Zaragoza"],
        "Asturias": ["Asturias"], "Baleares": ["Balears, Illes"], "Canarias": ["Las Palmas", "Santa Cruz de Tenerife"], "Cantabria": ["Cantabria"],
        "Castilla y León": ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"],
        "Castilla-La Mancha": ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"], "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"],
        "C. Valenciana": ["Alicante", "Castellón", "Valencia"], "Extremadura": ["Badajoz", "Cáceres"], "Galicia": ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
        "Madrid": ["Madrid"], "Murcia": ["Murcia"], "Navarra": ["Navarra"], "País Vasco": ["Álava", "Bizkaia", "Gipuzkoa"], "La Rioja": ["La Rioja"],
        "Ceuta y Melilla": ["Ceuta", "Melilla"]}
EN_REGION = {"Andalucía": "Andalusia", "Aragón": "Aragon", "Baleares": "Balearic Islands", "Canarias": "Canary Islands", "Castilla y León": "Castile and León",
           "Cataluña": "Catalonia", "C. Valenciana": "Valencia region", "Navarra": "Navarre", "País Vasco": "Basque Country", "Ceuta y Melilla": "Ceuta and Melilla"}
EN_CITY = {"Sevilla": "Seville", "València": "Valencia", "Santa Eulària des Riu": "Santa Eulària (Ibiza)"}
prov2 = {p: c for c, ps in CCAA.items() for p in ps}
LO, HI, XMAX = 35, 50, 26
pts = {}
for r in rows:
    pts.setdefault(prov2[r["province"]], []).append((float(r["years_of_income_80m2"]), r["municipality"], float(r["mortgage_share_of_income_pct"])))
allp = [p for v in pts.values() for p in v]
n_lo, n_hi = sum(s > LO for _, _, s in allp), sum(s > HI for _, _, s in allp)
k = statistics.mean(s / y for y, _, s in allp)  # share of income per year of income: both are price / income
x_lo, x_hi = LO / k, HI / k
LABELS = {"Santa Eulària des Riu": (-5.6, 0.42), "Madrid": (0.7, -0.5), "Barcelona": (-4.2, 0.55), "Marbella": (-1.2, 0.5), "Puertollano": (0.4, -0.55),
          "Bilbao": (0.5, 0.5), "València": (0.6, 0.5), "Sevilla": (0.6, 0.5), "Zaragoza": (0.5, 0.5), "Valladolid": (0.5, -0.5), "Palma": (-3.6, 0.5)}
order = sorted(pts, key=lambda c: statistics.median(y for y, _, _ in pts[c]))
RED, ORA, GRY, INK, MUT, BG = "#d6452b", "#f0a03c", "#a9b4bc", "#14212b", "#5d6b75", "#fbfaf7"
col = lambda s: RED if s > HI else ORA if s > LO else GRY
fig = plt.figure(figsize=(5.4, 6.75), dpi=200, facecolor=BG)
ax = fig.add_axes([0.27, 0.115, 0.69, 0.70], facecolor=BG)
ax.axvspan(0, x_lo, color="#eef1f3", zorder=0); ax.axvspan(x_lo, x_hi, color="#fdf0dc", zorder=0); ax.axvspan(x_hi, XMAX, color="#fbe3dc", zorder=0)
for x in (x_lo, x_hi): ax.axvline(x, color="white", lw=1.2, zorder=1)
for i, c in enumerate(order):
    placed = []
    for y, m, s in sorted(pts[c]):  # nudge dots that would overlap
        off, n = 0.0, 0
        while any(abs(y - py) < 0.30 and abs(off - po) < 0.13 for py, po in placed):
            n += 1; off = ((n + 1) // 2) * 0.13 * (1 if n % 2 else -1)
            if abs(off) > 0.42: break
        placed.append((y, off))
        ax.scatter(y, i + off, s=11, color=col(s), edgecolor="white", linewidth=0.35, zorder=3)
    med = statistics.median(y for y, _, _ in pts[c]); n = len(pts[c])
    ax.text(-0.4, i, EN_REGION.get(c, c), ha="right", va="center", fontsize=7.4, color=INK, fontweight="bold" if c == "Madrid" else "normal")
    ax.text(-0.4, i - 0.33, f"{n} town{'s' if n > 1 else ''} · median {med:.1f} yrs", ha="right", va="center", fontsize=4.8, color=MUT)
    for y, m, s in pts[c]:
        if m in LABELS:
            dx, dy = LABELS[m]
            ax.annotate(f"{EN_CITY.get(m, m)} {y:.1f}", (y, i), xytext=(y + dx, i + dy), fontsize=5.6, color=INK, fontweight="bold" if m == "Madrid" else "normal",
                        arrowprops=dict(arrowstyle="-", lw=0.4, color=MUT), zorder=4)
ax.set_ylim(-0.7, len(order) - 0.4); ax.set_xlim(0, XMAX); ax.set_yticks([]); ax.set_xticks(range(0, 27, 5)); ax.tick_params(axis="x", labelsize=6.5, colors=MUT, length=0)
for sp in ax.spines.values(): sp.set_visible(False)
ax.set_xlabel("Years of median income to pay for 80 m² (861 sq ft)", fontsize=7, color=MUT, labelpad=4)
top = len(order) - 0.4
for x0, x1, t, cl in ((0, x_lo, "Mortgage takes up to\n35% of income", MUT), (x_lo, x_hi, "35% to\n50%", "#b86a0e"), (x_hi, XMAX, "More than half of income", "#b2311b")):
    ax.text((x0 + x1) / 2, top + 0.15, t, ha="center", va="bottom", fontsize=5.6, color=cl, fontweight="bold")
fig.text(0.05, 0.955, "Years of income to buy an 80 m² flat in Spain", fontsize=13.2, fontweight="bold", color=INK)
fig.text(0.05, 0.925, "306 municipalities, one dot each. Single person on the local median income.", fontsize=7.2, color=MUT)
fig.text(0.05, 0.895, f"In {n_lo} the mortgage takes more than 35% of income, the Bank of Spain's high-effort line. In {n_hi}, more than half.", fontsize=7.2, color=INK)
fig.text(0.05, 0.035, "Source: Quórum index (eVoost) · quorum.evoost.ai. Appraised value: Ministry of Housing, Q2 2026; median income per consumption unit:\n"
         "INE ADRH 2024; 25-year fixed-rate mortgage at 3.16% on 80% of the price (INE, Aug 2026). Data as of 11 Nov 2026.", fontsize=5.2, color=MUT, linespacing=1.4)
fig.savefig(OUT, facecolor=BG)
print(f"{len(allp)} municipalities; above 35%: {n_lo}; above 50%: {n_hi} -> {OUT}")
