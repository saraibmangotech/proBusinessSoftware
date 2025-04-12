import { Document, Page, Image, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { FontFamily } from 'assets';
import { Images } from 'assets';
import Colors from 'assets/Style/Colors';

const passInfo = [
	{ key: 'Model', value: '2023' },
	{ key: 'Make', value: 'VOLKSWAGEN ATLAS CROSS SPORT SE' },
	{ key: 'VIN#', value: '1V2FE2CA8PC203527' },
	{ key: 'Lot#', value: '11706570' },
	{ key: 'Color', value: 'Gray' },
	{ key: 'Container#', value: '0' },
	{ key: 'Arrived Date', value: '25-June-23' },
	{ key: 'Valid Upto', value: '8/28/2023 20:44' },
];

// const styles = StyleSheet.create({})

function GatePass() {
	return (
		<Document>
			<Page size={'A4'} orientation='landscape'>
				<View style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row' }}>

					<View style={{ width: '56%', height: '100%' }}>
						<View style={{ margin: '30px 0 45px 35px' }}>
							<Image src={Images.invoiceLogo} style={{ width: '130px', height: '50px' }} />
						</View>

						<View style={{ margin: '0 80px 40px 40px' }}>
							<View style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
								{passInfo.map((item, index) => (
									<View key={index} style={{ display: 'flex', flexDirection: 'row', backgroundColor: index === 7 && '#25abe1', borderBottom: index === 7 ? '1px solid #25ABE1' : '1px solid #B2B5BA', borderLeft: index !== 7 ? '1px solid #B2B5BA' : '1px solid #25ABE1', borderRight: index !== 7 ? '1px solid #B2B5BA' : '1px solid #25ABE1', borderTop: index < 1 && '1px solid #B2B5BA', }}>
										<Text style={{ fontSize: '10px', width: '120px', color: index === 7 && '#ffffff', borderRight: index !== 7 ? '1px solid #B2B5BA' : '1px solid #FFFFFF', padding: '10px 0 20px 10px' }}>{item.key}</Text>
										<Text style={{ fontSize: '10px', width: '100%', color: index === 7 && '#ffffff', padding: '10px 0 20px 10px' }}>{item.value}</Text>
								</View>
							))}
							</View>
				</View>

						<View style={{ width: '100%', height: '50%' }}>
							<View>
								<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '10px', backgroundColor: '#eaf9ff', width: '100%', padding: '20px 0 20px 40px' }}>
									<View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
										<Text style={{ fontSize: '10px' }}>Staff Name</Text>
										<Text style={{ fontSize: '10px' }}>Staff Notes</Text>
							</View>
							<View>
										<Text style={{ fontSize: '8px' }}>NIHAL</Text>
							</View>
						</View>

								<View style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', height: '100%', backgroundColor: '#EEFBEE', padding: '20px 10px 20px 40px' }}>
									<Text style={{ fontSize: '10px', width: '100%' }}>T&C</Text>
									<Text style={{ fontSize: '8px', width: '100%', color: '#323B4B' }}>
								1. THIS GATE PASS WILL BE VALID FOR ONLY 2 DAYS. PARKING CHARGE WILL BE COUNTED FROM THIRD DAY.
							</Text>
									<Text style={{ fontSize: '8px', width: '100%', color: '#323B4B' }}>
								2. Invalid Gate Pass will not ALLOWED to take out the Vehicle from Galaxy Yard & New Gate Pass should be requested
								from the Galaxy Office with extra Parking.
							</Text>
									<Text style={{ fontSize: '8px', width: '100%', color: '#323B4B' }}>
								3. The parking will be free for the first 15 Days from the Day of Arrival, After that it will be charged form Day one.
							</Text>
						</View>
					</View>
				</View>
			</View>

					<View style={{ width: '44%', height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
						<View style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto' }}>
							<View>
								<Text style={{ fontSize: '30px', fontWeight: '700' }}>VECHILE GATE PASS</Text>
							</View>
							<View style={{ width: '100%', height: '1px', backgroundColor: '#747474' }}></View>
							<View style={{ display: 'flex', flexDirection: 'row', margin: '10px 0 10px 10px', alignItems: 'center', }}>
								<Text style={{ fontSize: '14px' }}>Printed Date & Time : </Text>
								<Text style={{ fontSize: '12px' }}>8/26/2023 20:44</Text>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
								<Text style={{ fontSize: '14px', width: '130px' }}>Gate Pass Status</Text>
								<View style={{ backgroundColor: '#38CB89', width: '200px', height: '55px', display: 'flex', justifyContent: 'center' }}>
									<Text style={{ paddingLeft: '10px', color: '#FFFFFF' }}>Paid & Valid</Text>
								</View>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
								<Text style={{ fontSize: '14px', width: '130px' }}>Chargable Days</Text>
								<View style={{ backgroundColor: '#25ABE1', width: '200px', height: '49px', display: 'flex', justifyContent: 'center' }}>
									<Text style={{ paddingLeft: '10px', color: '#FFFFFF', fontSize: '12px' }}>62</Text>
								</View>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
								<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>Location of Yard</Text>
								<View style={{ backgroundColor: '#C5FFE5', width: '200px', height: '49px', display: 'flex', }}>
									<Text style={{ margin: '5px 0 0 10px', fontSize: '12px' }}>YARD 13</Text>
								</View>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px', height: '24px' }}>
								<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>
							Per day charge
						</Text>
								<View style={{ width: '200px', display: 'flex', flexDirection: 'row', }}>
									<View style={{ display: 'flex', backgroundColor: '#EEFBEE', width: '84px', height: '24px', justifyContent: 'center' }}>
										<Text style={{ fontSize: '14px' }}>$ 3.00</Text>
									</View>
									<View style={{ display: 'flex', backgroundColor: '#D2F2FF', width: '116px', height: '24px', justifyContent: 'center' }}>
										<Text style={{ fontSize: '14px' }}>AED 11.03</Text>
									</View>
								</View>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px', height: '24px' }}>
								<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>
							Parking Due
						</Text>
								<View style={{ width: '200px', display: 'flex', flexDirection: 'row', }}>
									<View style={{ display: 'flex', backgroundColor: '#EEFBEE', width: '84px', height: '24px', justifyContent: 'center' }}>
										<Text style={{ fontSize: '14px' }}>$ 186.00</Text>
									</View>
									<View style={{ display: 'flex', backgroundColor: '#D2F2FF', width: '116px', height: '24px', justifyContent: 'center' }}>
										<Text style={{ fontSize: '14px' }}>AED 683.55</Text>
									</View>
								</View>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px', height: '24px' }}>
								<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>
							Recovery Charges
						</Text>
								<View style={{ width: '200px', display: 'flex', flexDirection: 'row', }}>
									<View style={{ display: 'flex', backgroundColor: '#EEFBEE', width: '84px', height: '24px', justifyContent: 'center' }}>
										<Text style={{ fontSize: '14px' }}>$ 27.21</Text>
									</View>
									<View style={{ display: 'flex', backgroundColor: '#D2F2FF', width: '116px', height: '24px', justifyContent: 'center' }}>
										<Text style={{ fontSize: '14px' }}>AED 100.00</Text>
									</View>
								</View>
							</View>

							{/*  */}
							<View style={{ margin: '30px 0 35px 0' }}>
								<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px', height: '24px' }}>
									<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>
								Total Due
							</Text>
									<View style={{ width: '200px', display: 'flex', flexDirection: 'row', }}>
										<View style={{ display: 'flex', backgroundColor: '#EEFBEE', width: '84px', height: '24px', justifyContent: 'center' }}>
											<Text style={{ fontSize: '14px' }}>$ 213.21</Text>
										</View>
										<View style={{ display: 'flex', backgroundColor: '#D2F2FF', width: '116px', height: '24px', justifyContent: 'center' }}>
											<Text style={{ fontSize: '14px' }}>AED 783.55</Text>
										</View>
						</View>
								</View>
								<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px', height: '24px' }}>
									<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>
								Paid Amount
							</Text>
									<View style={{ width: '200px', display: 'flex', flexDirection: 'row', }}>
										<View style={{ display: 'flex', backgroundColor: '#EEFBEE', width: '84px', height: '24px', justifyContent: 'center' }}>
											<Text style={{ fontSize: '14px' }}>$ 213.21</Text>
										</View>
										<View style={{ display: 'flex', backgroundColor: '#D2F2FF', width: '116px', height: '24px', justifyContent: 'center' }}>
											<Text style={{ fontSize: '14px' }}>AED 783.55</Text>
										</View>
						</View>
								</View>
								<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginLeft: '10px', height: '24px' }}>
									<Text style={{ fontSize: '14px', color: '#747474', width: '130px' }}>
								Balance Due
							</Text>
									<View style={{ width: '200px', display: 'flex', flexDirection: 'row', }}>
										<View style={{ display: 'flex', backgroundColor: '#EEFBEE', width: '84px', height: '24px', justifyContent: 'center' }}>
											<Text style={{ fontSize: '14px' }}>0.00</Text>
										</View>
										<View style={{ display: 'flex', backgroundColor: '#D2F2FF', width: '116px', height: '24px', justifyContent: 'center' }}>
											<Text style={{ fontSize: '14px' }}>0.00</Text>
										</View>
						</View>
								</View>
							</View>
							<View style={{ width: '100%', height: '1px', backgroundColor: '#747474' }}></View>
							{/*  */}
							{/*  */}
							<View style={{ margin: '30px 0 0 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
								<View style={{ display: 'flex', flexDirection: 'row' }}>
									<Text style={{ fontSize: '14px', color: '#747474', width: '160px' }}>Customer Name:</Text>
									<Text style={{ fontSize: '14px', }}>OSAMA QYAS ABBAS</Text>
								</View>
								<View style={{ display: 'flex', flexDirection: 'row' }}>
									<Text style={{ fontSize: '14px', color: '#747474', width: '160px' }}>Vehicle Receiver Name:</Text>
									<Text style={{ fontSize: '14px', color: '#747474' }}>Person Name</Text>
								</View>
							</View>
							{/*  */}
						</View>
			</View>

				</View>
			</Page>
		</Document>
	)
}

export default GatePass;