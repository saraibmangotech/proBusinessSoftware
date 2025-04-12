import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer, BlobProvider } from '@react-pdf/renderer';
import { Images } from 'assets';
import Colors from 'assets/Style/Colors';


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '70px',
  },
  section1: {
    width: '40%',
    height: '100px',
    display: 'block'
  },
  imageContainer: {
    width: '30%',
    height: '100%',
    display: 'flex'
  },
  headerImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    objectFit: 'contain',
    margin: '0 0 0 20px'
  },
  rectangleContainer: {
    display: 'flex',
    width: '70%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    marginLeft: '20px'
  },
  headerText: {
    fontSize: '20px',
    position: 'absolute',
    top: 13,
    left: 40,
    width: '100%',
    color: Colors.white
  },
  infoContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '20px',
  },
  infoTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginRight: '20px',
  },
  infoText: {
    fontSize: '9px',
    letterSpacing: '.01px',
    width: '180px'
  },
  line: {
    display: 'flex',
    width: '100%',
    height: '5px',
    backgroundColor: '#25abe1',
    position: 'relative',
  },
  textBox: {
    backgroundColor: Colors.white,
    width: '100px',
    height: '25px',
    display: 'flex',
    position: 'absolute',
    top: '-10px',
    right: '40px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    margin: '12px 20px',
    gap: '60px',
  },
  boxContainer: {
    display: 'flex',
  },
  dataContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '20px',
    width: '247px'
  },
  invoiceItem: {
    width: '100px',
    fontSize: '9px',
    paddingLeft: '10px'
  },
  infoItem: {
    width: '100px',
    fontSize: '9px',
  },
  headingStyle: {
    width: '50%',
    height: '45px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary
  },
  headingText: {
    color: Colors.white,
    fontSize: '16px',
  },
  headingStyleBlue: {
    backgroundColor: '#25abe1'
  },
  commercialText: {
    fontSize: '11px',
  },
  defaultRow: {
    backgroundColor: 'white',
  },
  row1: {
    backgroundColor: 'white', 
  },
  row2and4: {
    backgroundColor: '#ecfaff', 
  },
  row3: {
    backgroundColor: '#eefbee', 
  },
  signatureContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px',
  },
  signatureLine: {
    width: '120px',
    height: '1px',
    backgroundColor: '#747474',
  },
  signatureText: {
    fontSize: '9px'
  },
  textBlue: {
    color: '#25ABE1'
  }
});



function Invoice() {
  const customerData = [
    { key: 'Customer No: ', value: 'C00013' },
    { key: 'Customer Name: ', value: 'LAWEND HUSSEIN HASAN' },
    { key: 'Phone: ', value: '051 123 4567' },
    { key: 'Address: ', value: 'Sharjah- UAE' },
    { key: 'Customer Email: ', value: 'Customer Email:  ' },
    { key: 'Customer Country:', value: ' Iraq' },
  ];

  const invoiceData = [
    { key: 'Invoice on: ', value: '21-Aug-23' },
    { key: 'Creation on:', value: '9-Oct-22' },
    { key: 'Last Updated on:', value: '1-Oct-22' },
    { key: 'Due on:', value: '9-Oct-22' },
    { key: 'Past Due days:', value: '9' },
  ];

  const vehicleData = [
    { key: 'BUYER ID', value: '481047' },
    { key: 'PURCHASE DATE', value: '30-Sep-22' },
    { key: 'MODEL', value: '2009' },
    { key: 'MAKE', value: 'MERCEDES-BENZ E-CLASS 3.5L' },
    { key: 'LOT #', value: '33364093' },
    { key: 'VIN #', value: 'WDBUF56X89B394106' },
    { key: 'COLOR', value: 'White' },
    { key: 'Auction', value: '' },
  ];

  const commercialData = [
    { row1: ['PURCHASE PRICE', 'AED 15,000.00', 'AED 55,125.00'] },
    { row2: ['OTHER CHARGES', 'AED 300.00', 'AED 1,102.50'] },
    { row3: ['TOTAL DUE', '$ 15,300.00', 'AED 56,227.50'] },
    { row4: ['ROUND OFF', '$ 3.00', 'AED 11.03'] },
    { row5: ['PAID AMOUNT', 'AED 15,297.00', 'AED 56,216.48'] },
    { row6: ['BALANCE DUE', '$ -', 'AED 0.00'] },
  ];

  const notesData = [
    "AFTER TT TIME RCVD SO LATE PAYMENT AND STORAGE MUST BE ON CLIENT, 7-OCT-2022",
    "VEHICLE CASH RCVD FROM Mr. ABC, , 7-OCT-2022"
  ];

  const paymentHistoryData = [
    { row1: ['PAID ON', 'PAYMENT MODE', 'USD', 'AED'] },
    { row2: ['5-Oct-22', 'BANK TR.', 'AED 300.00', 'AED 37,852.50'] },
    { row3: ['7-Oct-22', 'EXCHANGE', '$ 1,997.00', 'AED 7,338.98'] },
    { row4: ['10-Oct-22', 'CASH', '$ 3,000.00', 'AED 11,025.00'] },
  ];

  const termsConditionData = [{
    data: {
      heading: "-> PLEASE READ CAREFULLY BELOW TERM & CONDITION:",
      points: [
        "1 - I've clearly informed and the make the understand all the vehicle information, amount, charges and rates.",
        "2 - Kindly pay the due amount within 3 business days from the purchase date to avoid the Late Payment and Storages that will be charged once vehicle arrived to final destination (Further, If there are some special annousment/memo ignore this and follow that)",
        "3 - If vehicle got relisted, the relist charges customer has to pay within 3 days otherwise 15% Penalty will applied after 3 days as issued memo on 9/Jun/2022.",
        "4 - Galaxy Customer care department will inform you about the latest updates about rates and charges through WhatsApp and emails."
      ]
    },
  }];

  return (
    <Document style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
      <Page size={'A4'} style={{ display: 'flex', }}>
        {/* <Header /> */}
        <View>
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image src={Images.invoiceLogo} style={styles.headerImage} />
            </View>
            <View style={styles.rectangleContainer}>
              <Image src={Images.rectangle} style={styles.headerRectangle} />
              <Text style={styles.headerText}>Company: Galaxy Used Cars Tr. LLC</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>97165102000</Text>
              <Text style={styles.infoText}>info@gwwshipping.com</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>www.gwwshipping.com</Text>
              <Text style={styles.infoText}>Ind Area#4 P.O Box 83126, Sharjah , UAE</Text>
            </View>
          </View>
          <View style={styles.line}>
            <View style={styles.textBox}>
              <Text>INVOICE</Text>
            </View>
          </View>
          {/* Invoice */}
          <View style={styles.sectionContainer}>
            <View style={styles.boxContainer} >
              {customerData.map((item, index) => (
                <View key={index} style={styles.dataContainer}>
                      <Text style={styles.infoItem}>{item.key}</Text>
                      <Text style={{ fontSize: '9px' }}>{item.value}</Text>
                    </View>
                  ))}
            </View>
            <View style={styles.boxContainer}>
              {invoiceData.map((item, index) => (
                    <View key={index} style={{ ...styles.dataContainer, borderTop: index === 0 || index < 2 ? '1px solid #d9d9d9' : 'none', borderLeft: '1px solid #d9d9d9', borderRight: '1px solid #d9d9d9', borderBottom: index > 0 && '1px solid #d9d9d9', backgroundColor: index % 2 === 0 ? '#F9FFF9' : '#F8FDFF', height: '25px' }}>
                      <Text style={styles.invoiceItem}>{item.key}</Text>
                      <Text style={{ fontSize: '9px' }}>{item.value}</Text>
                    </View>
                  ))}
            </View>
          </View>
          {/* Vehicle and Commercial */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: '40px' }}>
            <View style={styles.headingStyle}>
              <Text style={styles.headingText} >VEHICLE INFORMATION</Text>
            </View>
            <View style={styles.headingStyle}>
              <Text style={styles.headingText} >COMMERCIAL</Text>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.boxContainer}>
              {vehicleData.map((item, index) => (
                <View key={index} style={styles.dataContainer}>
                      <Text style={styles.infoItem}>{item.key}</Text>
                      <Text style={{ fontSize: '9px' }}>{item.value}</Text>
                    </View>
                  ))}
            </View>
            <View style={{ ...styles.boxContainer }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: '40px', }}>
                <Text style={styles.commercialText}>AMOUNT IN</Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                <Text style={styles.commercialText}>PARTICULAR</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: '40px', gap: '50px' }}>
                <Text style={styles.commercialText}>USD</Text>
                <Text style={styles.commercialText}>AED</Text>
              </View>
              {commercialData.map((data, index) => {
                const values = Object.values(data);
                if (values.length === 1 && Array.isArray(values[0])) {
                  return (
                        <View key={index} style={{ ...styles.dataContainer }}>
                          {values[0].map((cell, cellIndex) => (
                          <View key={cellIndex} style={{ width: '250px', borderRight: cellIndex === 2 ? 'none' : '1px solid #B2B5BA', height: '20px', paddingLeft: cellIndex !== 0 ? '5px' : 0, backgroundColor: index % 2 === 0 ? '#F9FFF9' : '#F8FDFF', display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                            <Text style={{ fontSize: '9px' }}>
                              {cell}
                            </Text>
                          </View>
                        ))}
                        </View>
                      )
                    }
                    return null;
                  })}
            </View>
          </View>
          {/* Notes and Payment */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: '40px' }}>
            <View style={{ ...styles.headingStyle, ...styles.headingStyleBlue }}>
              <Text style={styles.headingText} >NOTES</Text>
            </View>
            <View style={{ ...styles.headingStyle, ...styles.headingStyleBlue }}>
              <Text style={styles.headingText} >PAYMENT HISTORY</Text>
            </View>
              </View>
          <View style={styles.sectionContainer}>
            <View style={styles.boxContainer}>
              <View style={{ marginTop: '17px', }}>
                {notesData.map((item, index) =>
                  <View key={index} style={{ ...styles.dataContainer, backgroundColor: index === 1 && '#ECFAFF', height: '28px' }}>
                    <Text style={{ fontSize: '9px' }}>{item}</Text>
                  </View>
                )}
              </View>
              <View style={{ ...styles.signatureContainer, marginTop: '60px' }}>
                <Text style={styles.signatureText}>Galaxy Used Cars Tr. LLC</Text>
                <View style={styles.signatureLine}></View>
                <Text style={{ ...styles.signatureText, ...styles.textBlue }}>Authorized Signature</Text>
              </View>
            </View>
            <View style={styles.boxContainer}>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginRight: '20px', fontSize: '11px' }}>
                <Text style={{ fontSize: '11px' }}>AMOUNT IN</Text>
              </View>
              {paymentHistoryData.map((data, index) => {
                let rowStyle = styles.defaultRow; // Default style
                if (index === 0) {
                  rowStyle = styles.row1;
                } else if (index === 1 || index === 3) {
                  rowStyle = styles.row2and4;
                } else if (index === 2) {
                  rowStyle = styles.row3;
                }
                const values = Object.values(data);
                if (values.length === 1 && Array.isArray(values[0])) {
                  return (
                        <View key={index} style={{ ...styles.dataContainer, ...rowStyle, height: '28px' }}>
                          {values[0].map((cell, cellIndex) => (
                          <View key={cellIndex} style={{ width: '250px' }}>
                            <Text style={{ fontSize: '9px' }}>{cell}</Text>
                          </View>
                        ))}
                        </View>
                      )
                    }
                    return null;
                  })}
              <View style={styles.signatureContainer}>
                <Text style={styles.signatureText}>LAWEND HUSSEIN HASAN</Text>
                <View style={styles.signatureLine}></View>
                <Text style={{ ...styles.signatureText, ...styles.textBlue }}>Customer Signature</Text>
              </View>
            </View>
          </View>
          {/* Terms and Condition */}
          <View style={{ marginBottom: '3.2px' }}>
            <View style={{ padding: '0 10px 0 10px' }}>
              {termsConditionData.map((item, index) => {
                const heading = Object.values(item.data.heading)
                const values = Object.values(item.data.points);
                if (heading && values.length !== 0 && Array.isArray(values)) {
                  return (
                        <View style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          <View key={index}>
                            <Text style={{ fontSize: '9px' }}>{heading}</Text>
                          </View>
                          {values.map((item, keyIndex) => (
                            <View key={keyIndex}>
                            <Text style={{ fontSize: '8px', color: '#747474' }}>{item}</Text>
                          </View>
                        ))}
                        </View>
                      )
                    }
                    return null
                  })}
            </View>
          </View>
          {/* Footer */}
          <View style={{ display: 'flex', width: '100%', height: '40px', backgroundColor: Colors.primary, padding: '8px 18px' }}>
            <Text style={{ color: Colors.white, fontSize: '9px' }}>
              Customer care Contact: Mohammed husni - +971523195682 (Arabic & English ) Ardamehr Shoev - +971545836028 (English ,Arabic, Tajik & Farsi) Ravin abdul kareem - +971528293801 (Kurdish , Arabic & English) Maqsat Gylyjov - +97158666403 (Turken , Russian & English)
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default Invoice;
