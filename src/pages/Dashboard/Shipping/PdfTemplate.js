import React from 'react';
import { Document, Page, View,Text } from '@react-pdf/renderer';

const MyPDFComponent = () => (
  <Document>
    <Page>
      <View>
        <Text>Hello, World!</Text>
      </View>
    </Page>
  </Document>
);

export default MyPDFComponent;