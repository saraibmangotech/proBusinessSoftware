import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

const invoiceData = {
  sender: {
    name: "John Doe",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
  },
  recipient: {
    name: "Jane Smith",
    address: "456 Elm Street",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
  },
  items: [
    { description: "Item 1", quantity: 2, unitPrice: 10 },
    { description: "Item 2", quantity: 3, unitPrice: 15 },
    { description: "Item 3", quantity: 1, unitPrice: 20 },
  ],
  invoiceNumber: "INV-123456",
  date: "April 26, 2023",
};

const styles = StyleSheet.create({
  // Your styles here...
});

const InvoiceDocument = () => {
  const totalAmount = invoiceData.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );

  return (
    <Document>
      <Page style={styles.page}>
        <View>
          <Text style={styles.header}>Invoice</Text>
          <View style={styles.sender}>
            <Text style={styles.addressLine}>
              {invoiceData.sender.name}
            </Text>
            <Text style={styles.addressLine}>
              {invoiceData.sender.address}
            </Text>
            <Text style={styles.addressLine}>
              {invoiceData.sender.city}, {invoiceData.sender.state}{" "}
              {invoiceData.sender.zip}
            </Text>
          </View>
          <View style={styles.recipient}>
            <Text style={styles.addressLine}>
              {invoiceData.recipient.name}
            </Text>
            <Text style={styles.addressLine}>
              {invoiceData.recipient.address}
            </Text>
            <Text style={styles.addressLine}>
              {invoiceData.recipient.city}, {invoiceData.recipient.state}{" "}
              {invoiceData.recipient.zip}
            </Text>
          </View>
          <View style={styles.itemsTable}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>Description</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>Unit Price</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
            </View>
            {invoiceData.items.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.unitPrice.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
