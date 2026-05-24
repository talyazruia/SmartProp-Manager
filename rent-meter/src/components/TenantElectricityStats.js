import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LOGO_BLUE = "#1a5f9e";

const styles = {
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    marginBottom: "20px",
    direction: "rtl",
    textAlign: "right",
  },
  title: {
    color: "#2c3e50",
    marginTop: 0,
    marginBottom: "15px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    padding: "14px",
    border: "1px solid #e0e0e0",
  },
  cardLabel: {
    color: "#607d8b",
    fontSize: "14px",
    marginBottom: "6px",
  },
  cardValue: {
    color: "#2c3e50",
    fontSize: "21px",
    fontWeight: "bold",
  },
  alert: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontWeight: "bold",
    lineHeight: "1.5",
  },
  empty: {
    padding: "18px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    textAlign: "center",
    color: "#607d8b",
  },
};

function getMonthKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthlyConsumption(paymentHistory) {
  const monthlyMap = {};

  (paymentHistory || []).forEach((payment) => {
    if (!payment.date) return;

    const monthKey = getMonthKey(payment.date);
    const consumption = Number(payment.consumptionKwh || 0);
    const amount = Number(payment.amount || 0);

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        monthKey,
        label: getMonthLabel(monthKey),
        consumption: 0,
        amount: 0,
      };
    }

    monthlyMap[monthKey].consumption += consumption;
    monthlyMap[monthKey].amount += amount;
  });

  return Object.values(monthlyMap).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );
}

function getComparisonText(currentConsumption, previousConsumption) {
  if (!previousConsumption || previousConsumption === 0) {
    return "אין מספיק נתונים להשוואה מול חודש קודם";
  }

  const diff = currentConsumption - previousConsumption;
  const percent = Math.round((diff / previousConsumption) * 100);

  if (percent > 0) {
    return `עלייה של ${percent}% לעומת החודש הקודם`;
  }

  if (percent < 0) {
    return `ירידה של ${Math.abs(percent)}% לעומת החודש הקודם`;
  }

  return "אין שינוי לעומת החודש הקודם";
}

function getConsumptionAlert(monthlyData) {
  if (monthlyData.length < 2) {
    return {
      text: "עדיין אין מספיק נתונים כדי לזהות אם הצריכה גבוהה או נמוכה.",
      backgroundColor: "#eceff1",
      color: "#455a64",
    };
  }

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonths = monthlyData.slice(0, -1);

  const average =
    previousMonths.reduce((sum, item) => sum + item.consumption, 0) /
    previousMonths.length;

  if (!average || average === 0) {
    return {
      text: "עדיין אין מספיק נתונים להשוואה מול ממוצע חודשים קודמים.",
      backgroundColor: "#eceff1",
      color: "#455a64",
    };
  }

  const diffPercent = Math.round(
    ((currentMonth.consumption - average) / average) * 100
  );

  if (diffPercent >= 25) {
    return {
      text: `שימי לב: הצריכה בחודש ${currentMonth.label} גבוהה ב-${diffPercent}% מהממוצע שלך.`,
      backgroundColor: "#ffebee",
      color: "#c62828",
    };
  }

  if (diffPercent <= -15) {
    return {
      text: `כל הכבוד: הצריכה בחודש ${currentMonth.label} נמוכה ב-${Math.abs(
        diffPercent
      )}% מהממוצע שלך.`,
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    };
  }

  return {
    text: `הצריכה בחודש ${currentMonth.label} דומה לממוצע החודשי שלך.`,
    backgroundColor: "#fff8e1",
    color: "#795548",
  };
}

export default function TenantElectricityStats({ paymentHistory }) {
  const monthlyData = buildMonthlyConsumption(paymentHistory);

  if (monthlyData.length === 0) {
    return (
      <div style={styles.wrapper}>
        <h3 style={styles.title}>ניתוח צריכת חשמל</h3>
        <div style={styles.empty}>
          אין עדיין נתוני צריכה להצגה.
          <br />
          אחרי העלאת קריאת מונה ותשלום חדש, הגרף יתעדכן.
        </div>
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth =
    monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2] : null;

  const totalConsumption = monthlyData.reduce(
    (sum, item) => sum + item.consumption,
    0
  );

  const totalAmount = monthlyData.reduce((sum, item) => sum + item.amount, 0);

  const averageConsumption = totalConsumption / monthlyData.length;

  const comparisonText = previousMonth
    ? getComparisonText(currentMonth.consumption, previousMonth.consumption)
    : "אין חודש קודם להשוואה";

  const alert = getConsumptionAlert(monthlyData);

  const chartData = {
    labels: monthlyData.map((item) => item.label),
    datasets: [
      {
        label: 'צריכת חשמל בקוט"ש',
        data: monthlyData.map((item) => item.consumption),
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "צריכת חשמל לפי חודשים",
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
        title: {
          display: true,
          text: 'קוט"ש',
        },
      },
      x: {
        title: {
          display: true,
          text: "חודש",
        },
      },
    },
  };

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>ניתוח צריכת חשמל</h3>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>צריכה בחודש האחרון</div>
          <div style={styles.cardValue}>
            {currentMonth.consumption.toFixed(2)} קוט״ש
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>ממוצע חודשי</div>
          <div style={styles.cardValue}>
            {averageConsumption.toFixed(2)} קוט״ש
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>סה״כ צריכה בתקופה</div>
          <div style={styles.cardValue}>
            {totalConsumption.toFixed(2)} קוט״ש
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>סה״כ תשלום בתקופה</div>
          <div style={styles.cardValue}>{totalAmount.toFixed(2)} ₪</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>השוואה לחודש קודם</div>
          <div
            style={{
              ...styles.cardValue,
              fontSize: "16px",
              color: previousMonth ? LOGO_BLUE : "#607d8b",
            }}
          >
            {comparisonText}
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

      <Line data={chartData} options={chartOptions} />

      <p style={{ color: "#607d8b", fontSize: "13px", marginTop: "12px" }}>
        * הנתונים מבוססים על הצריכה שנשמרה במסד הנתונים לאחר חישוב קריאת המונה.
      </p>
    </div>
  );
}