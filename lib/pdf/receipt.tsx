import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Receipt-style PDF for a single donation. Renders entirely server-side via
// @react-pdf/renderer — no headless browser, no system fonts assumed.

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: "#FFFFFF",
    fontSize: 11,
    color: "#1e1e1e",
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f4c5c",
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 9,
    color: "#5c5c5c",
    marginBottom: 24,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd6c7",
    marginVertical: 12,
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e1e1e",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    color: "#5c5c5c",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    color: "#1e1e1e",
    fontSize: 11,
  },
  amountValue: {
    color: "#0f4c5c",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 32,
    fontSize: 9,
    color: "#5c5c5c",
    lineHeight: 1.5,
  },
});

export type ReceiptData = {
  donationId: string;
  donorName: string;
  donorEmail: string;
  amountUSD: number;
  recurring: boolean;
  occurredAt: Date;
  dedicationText?: string;
  targetLabel: string; // e.g. "Sponsorship for Priyonti Barua" or "General fund"
  orgName: string;
  orgAddress: string;
  ein: string;
};

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  const dateStr = data.occurredAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View>
          <Text style={styles.brand}>{data.orgName}</Text>
          <Text style={styles.brandSub}>501(c)(3) Donation Receipt</Text>
        </View>

        <View style={styles.hr} />

        <View>
          <Text style={styles.heading}>Donation summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt #</Text>
            <Text style={styles.value}>{data.donationId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Donor</Text>
            <Text style={styles.value}>
              {data.donorName}
              {data.donorEmail ? `  ·  ${data.donorEmail}` : ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Designated to</Text>
            <Text style={styles.value}>{data.targetLabel}</Text>
          </View>
          {data.dedicationText ? (
            <View style={styles.row}>
              <Text style={styles.label}>Dedication</Text>
              <Text style={styles.value}>{data.dedicationText}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{data.recurring ? "Recurring monthly" : "One-time"}</Text>
          </View>
          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={styles.label}>Amount (USD)</Text>
            <Text style={styles.amountValue}>${data.amountUSD.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <View>
          <Text style={styles.heading}>Tax information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Organization EIN</Text>
            <Text style={styles.value}>{data.ein}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{data.orgAddress}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {data.orgName} is a tax-exempt 501(c)(3) nonprofit. No goods or services were provided in
          exchange for this contribution; the full amount is tax-deductible to the extent allowed by
          law. Retain this receipt with your tax records.
        </Text>
      </Page>
    </Document>
  );
}
