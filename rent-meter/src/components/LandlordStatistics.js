import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LOGO_BLUE = "#1a5f9e";
const LOGO_GOLD = "#f2b819";

const styles = {
  wrapper: {
    marginTop: "25px",
    marginBottom: "30px",
  },
  title: {
    color: "#2c3e50",
    borderBottom: `2px solid ${LOGO_BLUE}`,
    paddingBottom: "10px",
    marginBottom: "20px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 7px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
  },
  cardLabel: {
    color: "#607d8b",
    fontSize: "14px",
    marginBottom: "6px",
  },
  cardValue: {
    color: "#2c3e50",
    fontSize: "24px",
    fontWeight: "bold",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  chartBox: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 7px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
  },
  th: {
    backgroundColor: LOGO_BLUE,
    color: "white",
    padding: "12px",
    textAlign: "right",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
  },
  loading: {
    backgroundColor: "#fff",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 2px 7px rgba(0,0,0,0.08)",
    marginBottom: "15px",
  },
};

function isAptRented(apt) {
  return apt && apt.rented === true && apt.tenant && apt.tenant !== "null";
}

function getMonthKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getCurrentMonthKey() {
  return getMonthKey(new Date());
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });
}

function isPaymentApproved(payment) {
  return payment.approved === true || payment.isApproved === true;
}

function getStatusInfo(payments) {
  const currentMonthKey = getCurrentMonthKey();

  const paymentsThisMonth = (payments || []).filter(
    (payment) => payment.date && getMonthKey(payment.date) === currentMonthKey
  );

  const approvedThisMonth = paymentsThisMonth.some(isPaymentApproved);

  if (approvedThisMonth) {
    return {
      text: "שולם ואושר",
      type: "paid",
      color: "#2e7d32",
      backgroundColor: "#e8f5e9",
    };
  }

  if (paymentsThisMonth.length > 0) {
    return {
      text: "ממתין לאישור",
      type: "pending",
      color: "#795548",
      backgroundColor: "#fff8e1",
    };
  }

  return {
    text: "לא שולם החודש",
    type: "unpaid",
    color: "#c62828",
    backgroundColor: "#ffebee",
  };
}

function countUnapprovedMonths(payments, status) {
  const currentMonthKey = getCurrentMonthKey();
  const unapprovedMonthKeys = new Set();

  (payments || []).forEach((payment) => {
    if (!payment.date) return;

    if (!isPaymentApproved(payment)) {
      unapprovedMonthKeys.add(getMonthKey(payment.date));
    }
  });

  /*
    אם אין בכלל תשלום בחודש הנוכחי,
    גם החודש הנוכחי נחשב כחודש בעייתי.
    אם יש תשלום החודש אבל הוא לא מאושר,
    הוא כבר נספר בלולאה למעלה.
  */
  if (status.type === "unpaid") {
    unapprovedMonthKeys.add(currentMonthKey);
  }

  return unapprovedMonthKeys.size;
}

function prepareApartmentRows(apartments, paymentsByApartment) {
  const currentMonthKey = getCurrentMonthKey();

  return (apartments || []).map((apt) => {
    const payments = paymentsByApartment[apt.id] || [];

    const paymentsCurrentMonth = payments.filter(
      (payment) => payment.date && getMonthKey(payment.date) === currentMonthKey
    );

    const currentMonthConsumption = paymentsCurrentMonth.reduce(
      (sum, payment) => sum + Number(payment.consumptionKwh || 0),
      0
    );

    const currentMonthAmount = paymentsCurrentMonth.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const sortedPayments = [...payments].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const latestPayment = sortedPayments[0] || null;
    const rented = isAptRented(apt);

    const status = rented
      ? getStatusInfo(payments)
      : {
          text: "דירה פנויה",
          type: "empty",
          color: "#455a64",
          backgroundColor: "#eceff1",
        };

    const debtMonths = rented ? countUnapprovedMonths(payments, status) : 0;

    return {
      apartmentId: apt.id,
      address: apt.address || `דירה ${apt.id}`,
      tenant: apt.tenant || "—",
      rented,
      currentMonthConsumption,
      currentMonthAmount,
      latestPaymentDate: latestPayment?.date || null,
      status,
      debtMonths,
    };
  });
}

export default function LandlordStatistics({ apartments }) {
  const [paymentsByApartment, setPaymentsByApartment] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentsForApartments = async () => {
      if (!apartments || apartments.length === 0) {
        setPaymentsByApartment({});
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all(
          apartments.map(async (apt) => {
            try {
              const res = await axios.get(
                `http://localhost:8081/api/payments/property/${apt.id}`
              );

              return {
                apartmentId: apt.id,
                payments: res.data || [],
              };
            } catch (err) {
              console.error(`שגיאה בטעינת תשלומים לדירה ${apt.id}`, err);

              return {
                apartmentId: apt.id,
                payments: [],
              };
            }
          })
        );

        const nextPaymentsByApartment = {};

        results.forEach((result) => {
          nextPaymentsByApartment[result.apartmentId] = result.payments;
        });

        setPaymentsByApartment(nextPaymentsByApartment);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsForApartments();
  }, [apartments]);

  const rows = useMemo(
    () => prepareApartmentRows(apartments, paymentsByApartment),
    [apartments, paymentsByApartment]
  );

  if (!apartments || apartments.length === 0) {
    return null;
  }

  const rentedRows = rows.filter((row) => row.rented);
  const paidRows = rentedRows.filter((row) => row.status.type === "paid");
  const pendingRows = rentedRows.filter((row) => row.status.type === "pending");
  const unpaidRows = rentedRows.filter((row) => row.status.type === "unpaid");
  const debtRows = rentedRows.filter((row) => row.debtMonths > 0);

  const totalConsumptionThisMonth = rows.reduce(
    (sum, row) => sum + row.currentMonthConsumption,
    0
  );

  const totalIncomeThisMonth = rows.reduce(
    (sum, row) => sum + row.currentMonthAmount,
    0
  );

  const currentMonthLabel = getMonthLabel(getCurrentMonthKey());

  const consumptionChartData = {
    labels: rows.map((row) => row.address),
    datasets: [
      {
        label: `צריכת חשמל ב-${currentMonthLabel}`,
        data: rows.map((row) => row.currentMonthConsumption),
        borderWidth: 1,
      },
    ],
  };

  const consumptionChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "צריכת חשמל לפי דירה",
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
      },
    },
  };

  const paymentStatusData = {
    labels: ["שולם ואושר", "ממתין לאישור", "לא שולם"],
    datasets: [
      {
        data: [paidRows.length, pendingRows.length, unpaidRows.length],
        backgroundColor: ["#2e7d32", LOGO_GOLD, "#c62828"],
      },
    ],
  };

  const paymentStatusOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `סטטוס תשלומים - ${currentMonthLabel}`,
      },
      legend: {
        position: "bottom",
      },
    },
  };

  const debtChartData = {
    labels: debtRows.map((row) => row.tenant),
    datasets: [
      {
        label: "מספר חודשים בחוב",
        data: debtRows.map((row) => row.debtMonths),
        borderWidth: 1,
      },
    ],
  };

  const debtChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "שוכרים שצוברים חוב",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${Number(context.raw || 0)} חודשים בחוב`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>סטטיסטיקות למשכיר</h2>

      {loading && <div style={styles.loading}>טוען נתוני תשלומים...</div>}

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>סה״כ דירות</div>
          <div style={styles.cardValue}>{rows.length}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>דירות מושכרות</div>
          <div style={styles.cardValue}>{rentedRows.length}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>שוכרים בחוב</div>
          <div style={styles.cardValue}>{debtRows.length}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>צריכת חשמל החודש</div>
          <div style={styles.cardValue}>
            {totalConsumptionThisMonth.toFixed(2)} קוט״ש
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>תשלומי חשמל החודש</div>
          <div style={styles.cardValue}>
            {totalIncomeThisMonth.toFixed(2)} ₪
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartBox}>
          <Bar data={consumptionChartData} options={consumptionChartOptions} />
        </div>

        <div style={styles.chartBox}>
          <Doughnut data={paymentStatusData} options={paymentStatusOptions} />
        </div>

        <div style={styles.chartBox}>
          {debtRows.length > 0 ? (
            <Bar data={debtChartData} options={debtChartOptions} />
          ) : (
            <p style={{ textAlign: "center", color: "#607d8b" }}>
              אין כרגע שוכרים שצוברים חוב.
            </p>
          )}
        </div>
      </div>

      <h3 style={{ color: "#2c3e50" }}>טבלת סטטוס תשלומים</h3>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>דירה</th>
            <th style={styles.th}>שוכר</th>
            <th style={styles.th}>צריכה החודש</th>
            <th style={styles.th}>סכום החודש</th>
            <th style={styles.th}>תשלום אחרון</th>
            <th style={styles.th}>סטטוס</th>
            <th style={styles.th}>חודשים בחוב</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.apartmentId}>
              <td style={styles.td}>{row.address}</td>
              <td style={styles.td}>{row.tenant}</td>
              <td style={styles.td}>
                {row.currentMonthConsumption.toFixed(2)} קוט״ש
              </td>
              <td style={styles.td}>{row.currentMonthAmount.toFixed(2)} ₪</td>
              <td style={styles.td}>
                {row.latestPaymentDate
                  ? new Date(row.latestPaymentDate).toLocaleDateString("he-IL")
                  : "אין תשלום"}
              </td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.badge,
                    color: row.status.color,
                    backgroundColor: row.status.backgroundColor,
                  }}
                >
                  {row.status.text}
                </span>
              </td>
              <td style={styles.td}>{row.debtMonths}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}