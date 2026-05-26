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
  pink: "#e91e63",
  brown: "#795548",
  text: "#243447",
  muted: "#607d8b",
  border: "#dbe7f3",
};

const APARTMENT_COLORS = [
  { background: "rgba(26, 95, 158, 0.82)", border: "#1a5f9e" },
  { background: "rgba(0, 166, 166, 0.82)", border: "#00a6a6" },
  { background: "rgba(255, 159, 28, 0.82)", border: "#ff9f1c" },
  { background: "rgba(123, 97, 255, 0.82)", border: "#7b61ff" },
  { background: "rgba(46, 125, 50, 0.82)", border: "#2e7d32" },
  { background: "rgba(233, 30, 99, 0.82)", border: "#e91e63" },
  { background: "rgba(214, 40, 40, 0.82)", border: "#d62828" },
  { background: "rgba(121, 85, 72, 0.82)", border: "#795548" },
];

const styles = {
  wrapper: {
    marginTop: "25px",
    marginBottom: "30px",
    background: "linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%)",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 10px 28px rgba(26, 95, 158, 0.10)",
    border: `1px solid ${COLORS.border}`,
  },
  title: {
    color: COLORS.text,
    borderBottom: `3px solid ${COLORS.blue}`,
    paddingBottom: "12px",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: "14px",
    marginTop: "-12px",
    marginBottom: "20px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  },
  card: {
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 5px 14px rgba(0,0,0,0.06)",
    border: `1px solid ${COLORS.border}`,
    minHeight: "95px",
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "600",
  },
  cardValue: {
    color: COLORS.text,
    fontSize: "24px",
    fontWeight: "900",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: "20px",
    marginBottom: "22px",
  },
  chartBox: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(26, 95, 158, 0.10)",
    border: `1px solid ${COLORS.border}`,
  },
  fullWidthChartBox: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(26, 95, 158, 0.10)",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "22px",
  },
  largeChartWrapper: {
    position: "relative",
    height: "430px",
  },
  regularChartWrapper: {
    position: "relative",
    height: "340px",
  },
  chartNote: {
    marginTop: "10px",
    fontSize: "13px",
    color: COLORS.muted,
    lineHeight: "1.5",
  },
  statusList: {
    marginTop: "14px",
    display: "grid",
    gap: "8px",
  },
  statusItem: {
    padding: "10px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  tableTitle: {
    color: COLORS.text,
    marginTop: "28px",
    marginBottom: "12px",
    borderRight: `5px solid ${COLORS.blue}`,
    paddingRight: "10px",
    fontSize: "20px",
    fontWeight: "900",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    backgroundColor: "white",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  th: {
    backgroundColor: COLORS.blue,
    color: "white",
    padding: "12px",
    textAlign: "right",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5edf5",
    color: COLORS.text,
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "18px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
  },
  loading: {
    backgroundColor: "#fff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 7px rgba(0,0,0,0.08)",
    marginBottom: "15px",
    color: COLORS.blue,
    fontWeight: "bold",
  },
  emptyMessage: {
    textAlign: "center",
    color: COLORS.muted,
    padding: "40px 10px",
    fontWeight: "bold",
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

function getColorSet(index) {
  return APARTMENT_COLORS[index % APARTMENT_COLORS.length];
}

function getMonthsSinceLastPaymentInfo(dateValue) {
  if (!dateValue) {
    return {
      value: null,
      displayText: "אין תשלום קודם",
      isOlderThanYear: true,
    };
  }

  const fromDate = new Date(dateValue);
  const today = new Date();

  const months =
    (today.getFullYear() - fromDate.getFullYear()) * 12 +
    (today.getMonth() - fromDate.getMonth());

  const safeMonths = Math.max(months, 0);

  if (safeMonths > 12) {
    return {
      value: 12,
      displayText: "מעל שנה",
      isOlderThanYear: true,
    };
  }

  return {
    value: safeMonths,
    displayText: `${safeMonths} חודשים`,
    isOlderThanYear: false,
  };
}

function getPaymentStatusForCurrentMonth(payments) {
  const currentMonthKey = getCurrentMonthKey();

  const paymentsThisMonth = (payments || []).filter(
    (payment) => payment.date && getMonthKey(payment.date) === currentMonthKey
  );

  const hasApprovedPayment = paymentsThisMonth.some(isPaymentApproved);

  if (hasApprovedPayment) {
    return {
      text: "שולם ואושר",
      type: "approved",
      color: COLORS.green,
      backgroundColor: COLORS.greenLight,
    };
  }

  if (paymentsThisMonth.length > 0) {
    return {
      text: "שולם וממתין לאישור",
      type: "pending",
      color: "#8a5a00",
      backgroundColor: COLORS.orangeLight,
    };
  }

  return {
    text: "לא התקבל תשלום החודש",
    type: "noPaymentThisMonth",
    color: COLORS.muted,
    backgroundColor: "#eef3f7",
  };
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

    const paymentStatus = rented
      ? getPaymentStatusForCurrentMonth(payments)
      : {
          text: "דירה פנויה",
          type: "empty",
          color: COLORS.muted,
          backgroundColor: "#eef3f7",
        };

    const monthsFromLastPaymentInfo = getMonthsSinceLastPaymentInfo(
      latestPayment?.date
    );

    const longTimeNoPayment =
      rented &&
      (
        !latestPayment ||
        monthsFromLastPaymentInfo.isOlderThanYear ||
        (
          monthsFromLastPaymentInfo.value !== null &&
          monthsFromLastPaymentInfo.value > 2
        )
      );

    return {
      apartmentId: apt.id,
      address: apt.address || `דירה ${apt.id}`,
      tenant: apt.tenant || "—",
      rented,
      currentMonthConsumption,
      currentMonthAmount,
      latestPaymentDate: latestPayment?.date || null,
      paymentStatus,
      monthsFromLastPayment: monthsFromLastPaymentInfo.value,
      monthsFromLastPaymentText: monthsFromLastPaymentInfo.displayText,
      longTimeNoPayment,
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

  const approvedRows = rentedRows.filter(
    (row) => row.paymentStatus.type === "approved"
  );

  const pendingRows = rentedRows.filter(
    (row) => row.paymentStatus.type === "pending"
  );

  const longTimeNoPaymentRows = rentedRows.filter(
    (row) => row.longTimeNoPayment
  );

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
        backgroundColor: rows.map((_, index) => getColorSet(index).background),
        borderColor: rows.map((_, index) => getColorSet(index).border),
        borderWidth: 2,
        borderRadius: 12,
        barThickness: 30,
      },
    ],
  };

  const consumptionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "צריכת חשמל לפי דירה",
        color: COLORS.text,
        font: {
          size: 20,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const row = rows[context.dataIndex];

            return [
              `צריכה: ${Number(context.raw || 0).toFixed(2)} קוט"ש`,
              `שוכר: ${row?.tenant || "—"}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: COLORS.muted,
          font: {
            size: 12,
            weight: "bold",
          },
        },
        title: {
          display: true,
          text: 'צריכה בקוט"ש',
          color: COLORS.text,
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(0,0,0,0.08)",
        },
      },
      y: {
        ticks: {
          color: COLORS.text,
          font: {
            size: 12,
            weight: "bold",
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const paymentStatusData = {
    labels: ["שולם ואושר", "שולם וממתין לאישור"],
    datasets: [
      {
        data: [approvedRows.length, pendingRows.length],
        backgroundColor: [COLORS.green, COLORS.orange],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 4,
      },
    ],
  };

  const paymentStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      title: {
        display: true,
        text: `תשלומים שהתקבלו - ${currentMonthLabel}`,
        color: COLORS.text,
        font: {
          size: 18,
          weight: "bold",
        },
      },
      legend: {
        position: "bottom",
        labels: {
          color: COLORS.text,
          font: {
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label;
            const value = context.raw;

            return `${label}: ${value}`;
          },
          afterLabel: function (context) {
            const relevantRows =
              context.dataIndex === 0 ? approvedRows : pendingRows;

            if (relevantRows.length === 0) {
              return ["אין דירות בסטטוס זה"];
            }

            const list = relevantRows
              .slice(0, 8)
              .map((row) => `• ${row.tenant} | ${row.address}`);

            if (relevantRows.length > 8) {
              list.push(`ועוד ${relevantRows.length - 8} דירות...`);
            }

            return list;
          },
        },
      },
    },
  };

  const longNoPaymentChartData = {
    labels: longTimeNoPaymentRows.map((row) => row.tenant),
    datasets: [
      {
        label: "כמה זמן עבר מהתשלום האחרון",
        data: longTimeNoPaymentRows.map((row) =>
          row.monthsFromLastPayment === null ? 12 : row.monthsFromLastPayment
        ),
        backgroundColor: longTimeNoPaymentRows.map(
          (_, index) => getColorSet(index + 3).background
        ),
        borderColor: longTimeNoPaymentRows.map(
          (_, index) => getColorSet(index + 3).border
        ),
        borderWidth: 2,
        borderRadius: 12,
        barThickness: 32,
      },
    ],
  };

  const longNoPaymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "שוכרים שלא שילמו מעל חודשיים",
        color: COLORS.text,
        font: {
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const row = longTimeNoPaymentRows[context.dataIndex];

            if (!row?.latestPaymentDate) {
              return "לא נמצא תשלום קודם";
            }

            return [
              `עברו: ${row.monthsFromLastPaymentText}`,
              `דירה: ${row.address}`,
            ];
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 12,
        ticks: {
          stepSize: 1,
          color: COLORS.muted,
          font: {
            weight: "bold",
          },
        },
        title: {
          display: true,
          text: "חודשים מאז תשלום אחרון",
          color: COLORS.text,
          font: {
            weight: "bold",
          },
        },
      },
      x: {
        ticks: {
          color: COLORS.text,
          font: {
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>סטטיסטיקות למשכיר</h2>
      <div style={styles.subtitle}>
        תמונת מצב חודשית של צריכת חשמל, תשלומים שהתקבלו ושוכרים שלא שילמו זמן רב
      </div>

      {loading && <div style={styles.loading}>טוען נתוני תשלומים...</div>}

      <div style={styles.cards}>
        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.blueLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>סה״כ דירות</div>
          <div style={{ ...styles.cardValue, color: COLORS.blue }}>
            {rows.length}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.greenLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>דירות מושכרות</div>
          <div style={{ ...styles.cardValue, color: COLORS.green }}>
            {rentedRows.length}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.orangeLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>ממתינים לאישור</div>
          <div style={{ ...styles.cardValue, color: COLORS.orange }}>
            {pendingRows.length}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.redLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>לא שילמו מעל חודשיים</div>
          <div style={{ ...styles.cardValue, color: COLORS.red }}>
            {longTimeNoPaymentRows.length}
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.tealLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>צריכת חשמל החודש</div>
          <div style={{ ...styles.cardValue, color: COLORS.teal }}>
            {totalConsumptionThisMonth.toFixed(2)} קוט״ש
          </div>
        </div>

        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${COLORS.purpleLight}, #ffffff)`,
          }}
        >
          <div style={styles.cardLabel}>תשלומי חשמל החודש</div>
          <div style={{ ...styles.cardValue, color: COLORS.purple }}>
            {totalIncomeThisMonth.toFixed(2)} ₪
          </div>
        </div>
      </div>

      <div style={styles.fullWidthChartBox}>
        <div style={styles.largeChartWrapper}>
          <Bar data={consumptionChartData} options={consumptionChartOptions} />
        </div>
        <div style={styles.chartNote}>
          כל דירה מוצגת בצבע אחר. הגרף מציג את סך צריכת החשמל של כל דירה בחודש הנוכחי.
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartBox}>
          <div style={styles.regularChartWrapper}>
            {approvedRows.length + pendingRows.length > 0 ? (
              <Doughnut data={paymentStatusData} options={paymentStatusOptions} />
            ) : (
              <div style={styles.emptyMessage}>
                לא התקבלו תשלומים החודש.
              </div>
            )}
          </div>

          <div style={styles.statusList}>
            <div
              style={{
                ...styles.statusItem,
                color: COLORS.green,
                backgroundColor: COLORS.greenLight,
              }}
            >
              <span>שולם ואושר</span>
              <span>{approvedRows.length} דירות</span>
            </div>

            <div
              style={{
                ...styles.statusItem,
                color: "#8a5a00",
                backgroundColor: COLORS.orangeLight,
              }}
            >
              <span>שולם וממתין לאישור</span>
              <span>{pendingRows.length} דירות</span>
            </div>
          </div>
        </div>

        <div style={styles.chartBox}>
          <div style={styles.regularChartWrapper}>
            {longTimeNoPaymentRows.length > 0 ? (
              <Bar
                data={longNoPaymentChartData}
                options={longNoPaymentChartOptions}
              />
            ) : (
              <div style={styles.emptyMessage}>
                אין כרגע שוכרים שלא שילמו מעל חודשיים 🎉
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 style={styles.tableTitle}>טבלת מעקב תשלומים לפי דירה</h3>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>דירה</th>
            <th style={styles.th}>שוכר</th>
            <th style={styles.th}>צריכה החודש</th>
            <th style={styles.th}>סכום החודש</th>
            <th style={styles.th}>תשלום אחרון</th>
            <th style={styles.th}>סטטוס תשלום החודש</th>
            <th style={styles.th}>כמה חודשים עברו מהתשלום האחרון</th>
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
                  : "אין תשלום קודם"}
              </td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.badge,
                    color: row.paymentStatus.color,
                    backgroundColor: row.paymentStatus.backgroundColor,
                  }}
                >
                  {row.paymentStatus.text}
                </span>
              </td>
              <td style={styles.td}>{row.monthsFromLastPaymentText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}