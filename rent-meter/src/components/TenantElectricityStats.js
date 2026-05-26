import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = {
  blue: "#1a5f9e",
  blueLight: "#e8f3ff",
  teal: "#00a6a6",
  tealLight: "#e6fbfb",
  orange: "#ff9f1c",
  orangeLight: "#fff4df",
  purple: "#7b61ff",
  purpleLight: "#f0edff",
  green: "#2e7d32",
  greenLight: "#e8f5e9",
  red: "#d62828",
  redLight: "#ffebee",
  text: "#243447",
  muted: "#607d8b",
  border: "#dbe7f3",
};

const MONTH_LABELS_HE = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const styles = {
  wrapper: {
    background: "linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 10px 28px rgba(26, 95, 158, 0.12)",
    marginBottom: "24px",
    direction: "rtl",
    textAlign: "right",
    border: `1px solid ${COLORS.border}`,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  titleBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    color: COLORS.text,
    marginTop: 0,
    marginBottom: 0,
    fontSize: "24px",
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: "14px",
  },
  sectionTitle: {
    color: COLORS.text,
    marginTop: "30px",
    marginBottom: "14px",
    borderRight: `5px solid ${COLORS.blue}`,
    paddingRight: "10px",
    fontSize: "20px",
    fontWeight: "800",
  },
  yearSelectorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: `1px solid ${COLORS.border}`,
    padding: "10px 12px",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  yearLabel: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  yearSelect: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.blue}`,
    backgroundColor: COLORS.blueLight,
    color: COLORS.blue,
    fontWeight: "bold",
    cursor: "pointer",
    outline: "none",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  card: {
    borderRadius: "16px",
    padding: "16px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 5px 14px rgba(0,0,0,0.06)",
    minHeight: "92px",
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "600",
  },
  cardValue: {
    color: COLORS.text,
    fontSize: "22px",
    fontWeight: "900",
  },
  cardSubText: {
    color: COLORS.muted,
    fontSize: "13px",
    marginTop: "5px",
    fontWeight: "600",
  },
  alert: {
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "20px",
    fontWeight: "bold",
    lineHeight: "1.5",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  empty: {
    padding: "22px",
    backgroundColor: COLORS.blueLight,
    borderRadius: "14px",
    textAlign: "center",
    color: COLORS.muted,
    border: `1px solid ${COLORS.border}`,
  },
  chartBox: {
    marginTop: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 6px 18px rgba(26, 95, 158, 0.10)",
  },
};

function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonthIndex() {
  return new Date().getMonth();
}

function getYearFromDate(dateValue) {
  return new Date(dateValue).getFullYear();
}

function getMonthIndexFromDate(dateValue) {
  return new Date(dateValue).getMonth();
}

function getAvailableYears(paymentHistory) {
  const currentYear = getCurrentYear();
  const yearsSet = new Set([currentYear]);

  (paymentHistory || []).forEach((payment) => {
    if (!payment.date) return;
    yearsSet.add(getYearFromDate(payment.date));
  });

  return Array.from(yearsSet).sort((a, b) => b - a);
}

function buildYearlyMonthlyData(paymentHistory, selectedYear) {
  const monthlyData = MONTH_LABELS_HE.map((label, index) => ({
    monthIndex: index,
    label,
    consumption: 0,
    amount: 0,
    hasData: false,
  }));

  (paymentHistory || []).forEach((payment) => {
    if (!payment.date) return;

    const paymentYear = getYearFromDate(payment.date);

    if (paymentYear !== Number(selectedYear)) return;

    const monthIndex = getMonthIndexFromDate(payment.date);

    monthlyData[monthIndex].consumption += Number(payment.consumptionKwh || 0);
    monthlyData[monthIndex].amount += Number(payment.amount || 0);
    monthlyData[monthIndex].hasData = true;
  });

  return monthlyData;
}

function getReferenceMonthIndex(monthlyData, selectedYear) {
  const currentYear = getCurrentYear();

  if (Number(selectedYear) === currentYear) {
    return getCurrentMonthIndex();
  }

  for (let i = monthlyData.length - 1; i >= 0; i--) {
    if (monthlyData[i].hasData) {
      return i;
    }
  }

  return 0;
}

function getComparisonText(currentConsumption, previousAverage) {
  if (!previousAverage || previousAverage === 0) {
    return "אין מספיק נתונים להשוואה מול חודשים קודמים בשנה זו";
  }

  const diff = currentConsumption - previousAverage;
  const percent = Math.round((diff / previousAverage) * 100);

  if (percent > 0) {
    return `עלייה של ${percent}% לעומת ממוצע החודשים הקודמים בשנה זו`;
  }

  if (percent < 0) {
    return `ירידה של ${Math.abs(percent)}% לעומת ממוצע החודשים הקודמים בשנה זו`;
  }

  return "אין שינוי לעומת ממוצע החודשים הקודמים בשנה זו";
}

function getConsumptionAlert(monthlyData, selectedYear) {
  const referenceMonthIndex = getReferenceMonthIndex(monthlyData, selectedYear);
  const referenceMonth = monthlyData[referenceMonthIndex];

  const previousMonthsWithData = monthlyData
    .slice(0, referenceMonthIndex)
    .filter((month) => month.hasData);

  if (!referenceMonth || !referenceMonth.hasData) {
    return {
      text: `אין עדיין נתוני צריכה עבור ${MONTH_LABELS_HE[referenceMonthIndex]} ${selectedYear}.`,
      backgroundColor: COLORS.blueLight,
      color: COLORS.blue,
    };
  }

  if (previousMonthsWithData.length === 0) {
    return {
      text: `אין מספיק חודשים קודמים בשנת ${selectedYear} כדי לבצע השוואה.`,
      backgroundColor: COLORS.blueLight,
      color: COLORS.blue,
    };
  }

  const previousAverage =
    previousMonthsWithData.reduce((sum, month) => sum + month.consumption, 0) /
    previousMonthsWithData.length;

  if (!previousAverage || previousAverage === 0) {
    return {
      text: "אין מספיק נתונים תקינים להשוואה מול חודשים קודמים.",
      backgroundColor: COLORS.blueLight,
      color: COLORS.blue,
    };
  }

  const diffPercent = Math.round(
    ((referenceMonth.consumption - previousAverage) / previousAverage) * 100
  );

  if (diffPercent >= 25) {
    return {
      text: `שימי לב: בחודש ${referenceMonth.label} ${selectedYear} הצריכה גבוהה ב-${diffPercent}% מהממוצע של החודשים הקודמים באותה שנה.`,
      backgroundColor: COLORS.redLight,
      color: COLORS.red,
    };
  }

  if (diffPercent <= -15) {
    return {
      text: `כל הכבוד: בחודש ${referenceMonth.label} ${selectedYear} הצריכה נמוכה ב-${Math.abs(
        diffPercent
      )}% מהממוצע של החודשים הקודמים באותה שנה.`,
      backgroundColor: COLORS.greenLight,
      color: COLORS.green,
    };
  }

  return {
    text: `הצריכה בחודש ${referenceMonth.label} ${selectedYear} דומה לממוצע החודשים הקודמים באותה שנה.`,
    backgroundColor: COLORS.orangeLight,
    color: "#8a5a00",
  };
}

function getLowestConsumptionMonth(monthsWithData) {
  if (!monthsWithData || monthsWithData.length === 0) return null;

  return monthsWithData.reduce((lowest, current) => {
    return current.consumption < lowest.consumption ? current : lowest;
  });
}

function getHighestAmountMonth(monthsWithData) {
  if (!monthsWithData || monthsWithData.length === 0) return null;

  return monthsWithData.reduce((highest, current) => {
    return current.amount > highest.amount ? current : highest;
  });
}

export default function TenantElectricityStats({ paymentHistory }) {
  const availableYears = useMemo(
    () => getAvailableYears(paymentHistory),
    [paymentHistory]
  );

  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  useEffect(() => {
    if (availableYears.length === 0) return;

    const currentYear = getCurrentYear();

    if (availableYears.includes(currentYear)) {
      setSelectedYear(currentYear);
    } else {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  const monthlyData = useMemo(
    () => buildYearlyMonthlyData(paymentHistory, selectedYear),
    [paymentHistory, selectedYear]
  );

  const monthsWithData = monthlyData.filter((month) => month.hasData);

  const yearlyConsumption = monthlyData.reduce(
    (sum, month) => sum + month.consumption,
    0
  );

  const yearlyAmount = monthlyData.reduce(
    (sum, month) => sum + month.amount,
    0
  );

  const yearlyMonthlyAverage =
    monthsWithData.length > 0 ? yearlyConsumption / monthsWithData.length : 0;

  const referenceMonthIndex = getReferenceMonthIndex(monthlyData, selectedYear);
  const referenceMonth = monthlyData[referenceMonthIndex];

  const previousMonthsWithData = monthlyData
    .slice(0, referenceMonthIndex)
    .filter((month) => month.hasData);

  const previousAverage =
    previousMonthsWithData.length > 0
      ? previousMonthsWithData.reduce(
          (sum, month) => sum + month.consumption,
          0
        ) / previousMonthsWithData.length
      : 0;

  const comparisonText = getComparisonText(
    referenceMonth?.consumption || 0,
    previousAverage
  );

  const alert = getConsumptionAlert(monthlyData, selectedYear);

  const lowestConsumptionMonth = getLowestConsumptionMonth(monthsWithData);
  const highestAmountMonth = getHighestAmountMonth(monthsWithData);

  const consumptionChartData = {
    labels: monthlyData.map((month) => month.label),
    datasets: [
      {
        label: `צריכת חשמל בשנת ${selectedYear} בקוט"ש`,
        data: monthlyData.map((month) => month.consumption),
        borderColor: COLORS.teal,
        backgroundColor: "rgba(0, 166, 166, 0.18)",
        pointBackgroundColor: COLORS.teal,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
      },
    ],
  };

  const consumptionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: COLORS.text,
          font: {
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: `צריכת חשמל לפי חודשים - ${selectedYear}`,
        color: COLORS.text,
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${Number(context.raw || 0).toFixed(2)} קוט"ש`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: COLORS.muted,
        },
        title: {
          display: true,
          text: 'קוט"ש',
          color: COLORS.text,
        },
      },
      x: {
        ticks: {
          color: COLORS.muted,
        },
        title: {
          display: true,
          text: "חודש",
          color: COLORS.text,
        },
      },
    },
  };

  const costChartData = {
    labels: monthlyData.map((month) => month.label),
    datasets: [
      {
        label: "עלות חשמל חודשית",
        data: monthlyData.map((month) => month.amount),
        backgroundColor: "rgba(123, 97, 255, 0.72)",
        borderColor: COLORS.purple,
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  const costChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: COLORS.text,
          font: {
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: `עלות חשמל לפי חודשים - ${selectedYear}`,
        color: COLORS.text,
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${Number(context.raw || 0).toFixed(2)} ₪`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: COLORS.muted,
        },
        title: {
          display: true,
          text: "עלות בשקלים",
          color: COLORS.text,
        },
      },
      x: {
        ticks: {
          color: COLORS.muted,
        },
        title: {
          display: true,
          text: "חודש",
          color: COLORS.text,
        },
      },
    },
  };

  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.titleBox}>
            <h3 style={styles.title}>ניתוח צריכת חשמל</h3>
            <span style={styles.subtitle}>
              כאן יוצגו נתוני החשמל שלך בצורה פשוטה וברורה
            </span>
          </div>
        </div>

        <div style={styles.empty}>
          אין עדיין נתוני צריכה להצגה.
          <br />
          אחרי העלאת קריאת מונה ותשלום חדש, הגרף יתעדכן.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.titleBox}>
          <h3 style={styles.title}>ניתוח צריכת חשמל שנתי</h3>
          <span style={styles.subtitle}>
            מעקב ברור אחרי הצריכה והעלויות שלך לאורך השנה
          </span>
        </div>

        <div style={styles.yearSelectorBox}>
          <span style={styles.yearLabel}>בחרי שנה:</span>

          <select
            style={styles.yearSelect}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.cards}>
        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.tealLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>
            צריכה ב-{referenceMonth?.label || "החודש הנוכחי"}
          </div>
          <div style={{ ...styles.cardValue, color: COLORS.teal }}>
            {Number(referenceMonth?.consumption || 0).toFixed(2)} קוט״ש
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.blueLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>ממוצע חודשי שנתי</div>
          <div style={{ ...styles.cardValue, color: COLORS.blue }}>
            {yearlyMonthlyAverage.toFixed(2)} קוט״ש
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.greenLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>סה״כ צריכה שנתית</div>
          <div style={{ ...styles.cardValue, color: COLORS.green }}>
            {yearlyConsumption.toFixed(2)} קוט״ש
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.orangeLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>סה״כ תשלום שנתי</div>
          <div style={{ ...styles.cardValue, color: COLORS.orange }}>
            {yearlyAmount.toFixed(2)} ₪
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.purpleLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>השוואה לחודשים קודמים</div>
          <div
            style={{
              ...styles.cardValue,
              fontSize: "16px",
              color: previousAverage ? COLORS.purple : COLORS.muted,
            }}
          >
            {comparisonText}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.tealLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>החודש הכי חסכוני</div>
          <div style={{ ...styles.cardValue, color: COLORS.teal }}>
            {lowestConsumptionMonth
              ? `${lowestConsumptionMonth.label}`
              : "אין נתונים"}
          </div>
          <div style={styles.cardSubText}>
            {lowestConsumptionMonth
              ? `${lowestConsumptionMonth.consumption.toFixed(2)} קוט״ש`
              : ""}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.orangeLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>החודש הכי יקר</div>
          <div style={{ ...styles.cardValue, color: COLORS.orange }}>
            {highestAmountMonth ? `${highestAmountMonth.label}` : "אין נתונים"}
          </div>
          <div style={styles.cardSubText}>
            {highestAmountMonth
              ? `${highestAmountMonth.amount.toFixed(2)} ₪`
              : ""}
          </div>
        </div>
      </div>

      <div
        style={{
          ...styles.alert,
          backgroundColor: alert.backgroundColor,
          color: alert.color,
        }}
      >
        {alert.text}
      </div>

      <h3 style={styles.sectionTitle}>צריכת חשמל לפי חודשים</h3>
      <div style={styles.chartBox}>
        <Line data={consumptionChartData} options={consumptionChartOptions} />
      </div>

      <h3 style={styles.sectionTitle}>עלות חשמל לפי חודשים</h3>
      <div style={styles.chartBox}>
        <Bar data={costChartData} options={costChartOptions} />
      </div>
    </div>
  );
}