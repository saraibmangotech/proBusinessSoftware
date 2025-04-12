import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import { Icons } from "assets";
import { Box } from '@mui/material';
import Colors from "assets/Style/Colors";
import moment from "moment";
import axios from 'axios';

function MapComponent({ data,dataexport }) {

	const mapApi = 'https://maps.googleapis.com/maps/api/geocode/json'
	const mapKey = 'AIzaSyCsT-b8-J4wnqKYUBFROMPQr_IEYdjNiSg'

	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: mapKey,
	});

	const [currentLocation, setCurrentLocation] = useState(null);


	const [startPoint, setStartPoint] = useState(null);
	const [endPoint, setEndPoint] = useState(null);

	const [markerCoordinates, setMarkerCoordinates] = useState([]);

	const generatePointsBetweenTwoPoints = (pointA, pointB, numberOfPoints) => {
		try {
			const points = [];

			for (let i = 0; i <= numberOfPoints; i++) {
				const fraction = i / numberOfPoints;
				const lat = pointA.lat + fraction * (pointB.lat - pointA.lat);
				const lng = pointA.lng + fraction * (pointB.lng - pointA.lng);

				points.push({ lat, lng });
			}

			return points;
		} catch (error) {
			console.log('generatePointsBetweenTwoPoints => error:', error)
		}
	}

	// *Get the coordinates using the geocoding service
	const getCoordinates = async () => {
		try {
			const address1 = data?.details?.location?.city_name + data?.details?.location?.state_code + '-' + data?.details?.location?.country_name
			const address2 = data?.details?.destination?.name

			const response1 = await axios.get(`${mapApi}?address=${address1}&key=${mapKey}`);
			const response2 = await axios.get(`${mapApi}?address=${address2}&key=${mapKey}`);

			if (
				response1.data.status === 'OK' &&
				response1.data.results.length > 0 &&
				response2.data.status === 'OK' &&
				response2.data.results.length > 0
			) {
				const location1 = response1.data.results[0].geometry.location;
				const location2 = response2.data.results[0].geometry.location;

				setStartPoint({ lat: location1?.lat, lng: location1?.lng });
				setEndPoint({ lat: location2?.lat, lng: location2?.lng });

				const routeCoordinates = [
					{ lat: location1.lat, lng: location1.lng },
					{ lat: location2.lat, lng: location2.lng },
				];
				setMarkerCoordinates(routeCoordinates);
				const numberOfPoints = 1000;
				const pointsArray = generatePointsBetweenTwoPoints(
					{ lat: location1.lat, lng: location1.lng },
					{ lat: location2.lat, lng: location2.lng },
					numberOfPoints,
				);
				var a = moment(data?.details?.tracking?.loaded);
				var b = moment(data?.details?.tracking?.expected_arrival);
				const result = !data?.details?.tracking?.loaded && !data?.details?.tracking?.expected_arrival ? 1000 : b.diff(a, 'days');
				if (data?.tracking?.loaded && data?.tracking?.expected_arrival) {
					setCurrentLocation(pointsArray[Math?.round(1000 / result)]);
				} else {
					setCurrentLocation(pointsArray[0]);
				}
			} else {
				console.error('Geocoding failed:', response1?.data?.status);
				console.error('Geocoding failed:', response2?.data?.status);
			}
		} catch (error) {
			console.log('getCoordinates => error:', error)
		}
	};

		// *Get the coordinates using the geocoding service
		const getCoordinatesExport = async () => {
			try {
				console.log(dataexport?.details?.location);
				const address1 = dataexport?.details?.location
				const address2 = dataexport?.details?.destination

				let newAddress = address2.split(" ");
				
				newAddress.splice(newAddress.length - 1, 0, "Port");
				newAddress = newAddress.join(" ")
				console.log(newAddress)


				const response1 = await axios.get(`${mapApi}?address=${address1}&key=${mapKey}`);
				const response2 = await axios.get(`${mapApi}?address=${newAddress}&key=${mapKey}`);
	
				if (
					response1.data.status === 'OK' &&
					response1.data.results.length > 0 &&
					response2.data.status === 'OK' &&
					response2.data.results.length > 0
				) {
					const location1 = response1.data.results[0].geometry.location;
					const location2 = response2.data.results[0].geometry.location;
	
					setStartPoint({ lat: location1?.lat, lng: location1?.lng });
					setEndPoint({ lat: location2?.lat, lng: location2?.lng });
	
					const routeCoordinates = [
						{ lat: location1.lat, lng: location1.lng },
						{ lat: location2.lat, lng: location2.lng },
					];
					setMarkerCoordinates(routeCoordinates);
					const numberOfPoints = 1000;
					const pointsArray = generatePointsBetweenTwoPoints(
						{ lat: location1.lat, lng: location1.lng },
						{ lat: location2.lat, lng: location2.lng },
						numberOfPoints,
					);
					var a = moment(dataexport?.tracking?.booked);
					var b = moment(dataexport?.tracking?.eta);
					const result = !dataexport?.tracking?.booked && !dataexport?.tracking?.eta ? 1000 : b.diff(a, 'days');
					if (dataexport?.tracking?.booked && dataexport?.tracking?.eta) {
						setCurrentLocation(pointsArray[Math?.round(1000 / result)]);
					} else {
						setCurrentLocation(pointsArray[0]);
					}
				} else {
					console.error('Geocoding failed:', response1?.data?.status);
					console.error('Geocoding failed:', response2?.data?.status);
				}
			} catch (error) {
				console.log('getCoordinates => error:', error)
			}
		};

	// useEffect(() => {
	// 	getCoordinates();
		
	// }, [data]);
	useEffect(() => {
		getCoordinatesExport()
		getCoordinates()
		
	}, [dataexport]);

	// Check if startPoint and endPoint are not null before using their properties
	if (!startPoint || !endPoint) {
		return "Loading...";
	}

	const defaultCenter = currentLocation || startPoint;
	const defaultZoom = 4;

	const path = [startPoint, endPoint];
	const bounds = new window.google.maps.LatLngBounds();
	path.forEach((point) => bounds.extend(point));

	if (loadError) return "Error loading maps";
	if (!isLoaded) return "Loading maps";

	return (
		<Box sx={{ height: "500px", width: "100%", margin: "0 auto" }}>
			<GoogleMap
				mapContainerStyle={{ height: "100%", width: "100%" }}
				center={defaultCenter}
				zoom={defaultZoom}
				options={{ gestureHandling: "greedy" }}
				onLoad={(map) => map.fitBounds(bounds)}
			>
				<Marker
					position={currentLocation}
					icon={{
						url: Icons.trackingPointer,
						scaledSize: new window.google.maps.Size(30, 30),
						fillColor: "black",
					}}
				></Marker>
				{markerCoordinates.map((item, index) => (
					<Marker
						key={index}
						position={item}
					/>
				))}

				{/* Polyline connecting Start, Midpoint, and End Points */}
				<Polyline path={path} options={{ strokeColor: Colors.primary }} />
			</GoogleMap>
		</Box>
	);
};

export default MapComponent;
