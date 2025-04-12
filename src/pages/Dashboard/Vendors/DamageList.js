import React, { Fragment, useEffect, useRef, useState } from "react";
import {
	Grid,
	Box,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Paper,
	tableCellClasses,
	CircularProgress,
	IconButton,
	Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import { Debounce, formatPermissionData, handleExportWithComponent } from "utils";
import ClientServices from "services/Client";
import { PendingIcon, CheckIcon } from "assets";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
	border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		fontSize: 14,
		fontFamily: FontFamily.NunitoRegular,
		border: 0,
		padding: "15px",
		textAlign: "center",
		whiteSpace: "nowrap",
		background: Colors.primary,
		color: Colors.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		fontFamily: FontFamily.NunitoRegular,
		textAlign: "center",
		textWrap: "nowrap",

		padding: '5px !important',
		".MuiBox-root": {
			display: "flex",
			gap: "6px",
			alignItems: "center",
			justifyContent: "center",
			".MuiBox-root": {
				cursor: "pointer",
			},
		},
		svg: {
			width: "auto",
			height: "24px",
		},
		".MuiTypography-root": {
			textTransform: "capitalize",
			fontFamily: FontFamily.NunitoRegular,
			textWrap: "nowrap",
		},
		".MuiButtonBase-root": {
			padding: "8px",
			width: "28px",
			height: "28px",
		},
	},
}));

const useStyles = makeStyles({
	loaderWrap: {
		display: "flex",
		height: 100,
		"& svg": {
			width: "40px !important",
			height: "40px !important",
		},
	},
});

function DamageList() {
	const classes = useStyles();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const contentRef = useRef(null);
	const tableHead = ["Date", "Vendor", "Vendor Amount", "Damage GWS", "Client Amount", "Credit GWS", "Created By", "Status", "Action"];

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const [loader, setLoader] = useState(false);

	// *For Vendor Dropdown
	const [vendors, setVendors] = useState([]);
	const [selectedVendor, setSelectedVendor] = useState(null);

	// *For Permissions
	const [permissions, setPermissions] = useState();

	// *For TT List
	const [damages, setDamages] = useState();


	// *For Paid Status
	const [selectedStatus, setSelectedStatus] = useState(null);



	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Vin and Lot
	const [vin, setVin] = useState([]);
	const [selectedVin, setSelectedVin] = useState();
	const [lot, setLot] = useState([]);
	const [selectedLot, setSelectedLot] = useState();

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For Vendor
	const getVendorDropdown = async () => {
		try {
			const { data } = await VendorServices.getVendorDropdown();

			setVendors(data?.vendors.filter(vendor => vendor.type === "shipping"));
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For TT List
	const getDamages = async (page, limit, filter) => {
		setLoader(true);
		try {
			const Page = page ? page : currentPage;
			const Limit = limit ? limit : pageLimit;
			const Filter = { ...filters, ...filter };
			setCurrentPage(Page);
			setPageLimit(Limit);
			setFilters(Filter);
			let params = {
				page: Page,
				limit: Limit,
			};
			params = { ...params, ...Filter };
			const { data } = await VendorServices.getDamages(params);
			setTotalCount(data?.damages?.count);
			setDamages(data?.damages?.rows);
			setPermissions(formatPermissionData(data?.permissions));
			data?.permissions.forEach((e) => {
				if (e?.route && e?.identifier && e?.permitted) {
					dispatch(addPermission(e?.route));
				}
			});
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoader(false);
		}
	};
	// *For Get Business Countries
	const getClientVin = async () => {
		let params = {
			page: 1,
			limit: 15,
			unused: false,
		};
		try {
			const { data } = await ClientServices.getClientVin(params);

			const arrayOfObjects = data?.filters?.vins.map((value, index) => ({
				id: value, // Adding 1 to start the id from 1
				name: value,
			}));
			const arrayOfObjects1 = data?.filters?.lots.map((value, index) => ({
				id: value, // Adding 1 to start the id from 1
				name: value,
			}));

			setVin(arrayOfObjects);
			setLot(arrayOfObjects1);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Apply Filters
	const applyFilter = async () => {
		try {
			let data = {
				vendor_id: selectedVendor?.id,
				Vin: selectedVin?.id,
				Lot: selectedLot?.id,
				applied: selectedStatus?.id

			};
			getDamages(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Action");
		const rows = damages?.map((item) => [
			moment(item?.created_at).format("MM-DD-YYYY"),
			item?.vendor?.name ?? "-",
			`$ ${parseFloat(item?.vendor_amount).toFixed(2) ?? "-"}`,
			`$ ${parseFloat(item?.damage_gws).toFixed(2) ?? "-"}`,
			`$ ${parseFloat(item?.client_amount).toFixed(2) ?? "-"}`,
			`$ ${parseFloat(item?.credit_gws).toFixed(2) ?? "-"}`,
			item?.creator?.name ?? "-",
			item?.applied ? "Applied" : "UnApplied",
		])

		const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

		const buf = XLSX.write(wb, {
			bookType: "xlsx",
			type: "array",
			mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(new Blob([buf]), "data.xlsx");
	};

	useEffect(() => {
		getVendorDropdown();
		getClientVin()
	}, []);

	return (
		<Box sx={{ m: 4, mb: 2 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mr: 4,
					my: 4,
				}}
			>
				<Typography
					variant="h5"
					sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}
				>
					Booked Vehicle Damages
				</Typography>
				{damages?.length > 0 && (
					<Box sx={{
						textAlign: "right", p: 4, display: "flex", gap: 2

					}}>
						<PrimaryButton
							title="Download PDF"
							type="button"
							style={{ backgroundColor: Colors.bluishCyan }}
							onClick={() => handleExportWithComponent(contentRef)}
						/>
						<PrimaryButton
							title={"Download Excel"}
							onClick={() => downloadExcel()}
						/>
					</Box>
				)}
			</Box>
			<Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
				<Box
					component={"form"}
					onSubmit={handleSubmit(applyFilter)}
					sx={{
						m: "20px 0 20px 5px",

					}}
				>
					<Grid container spacing={1} alignItems={"center"} columns={10}>
						<Grid item md={2}>
							<SelectField
								size="small"
								label={"Vendor"}
								options={vendors}
								selected={selectedVendor}
								onSelect={(value) => setSelectedVendor(value)}
								error={errors?.vendor?.message}
								register={register("vendor", {
									required: "Please select vendor.",
								})}
							/>
						</Grid>
						<Grid item md={2}>
							<SelectField
								size="small"
								label={"Status"}
								options={[{ id: true, name: 'Applied' }, { id: false, name: 'UnApplied' }]}
								selected={selectedStatus}
								onSelect={(value) => setSelectedStatus(value)}
								error={errors?.status?.message}
								register={register("status")}
							/>
						</Grid>
						<Grid item xs={12} md={2}>
							<SelectField
								size="small"
								options={vin}
								label={"Vin"}
								selected={selectedVin}
								onSelect={(value) => setSelectedVin(value)}
								error={errors?.vin?.message}
								register={register("vin", {})}
							/>
						</Grid>
						<Grid item xs={12} md={2}>
							<SelectField
								size="small"
								options={lot}
								label={"Lot"}
								selected={selectedLot}
								onSelect={(value) => setSelectedLot(value)}
								error={errors?.lot?.message}
								register={register("lot", {})}
							/>
						</Grid>

						<Grid item xs={12} md={2}>
							<Box
								sx={{
									mt: "11px",
									display: "flex",
									justifyContent: "flex-end",
								}}
							>
								<PrimaryButton title={"Search"} type={"submit"} />
							</Box>
						</Grid>
					</Grid>
				</Box>

				{loader ? (
					<CircleLoading />
				) : (
					damages && (
						<Fragment>
							<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
								fileName="Booked Vehicle Damages"
							>
								<Box className='pdf-show' sx={{ display: 'none' }}>
									<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
										<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
											Booked Vehicle Damages
										</Typography>
										<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
									</Box>
								</Box>
								{/* ========== Table ========== */}
								<TableContainer
									component={Paper}
									sx={{
										boxShadow: "0px 8px 18px 0px #9B9B9B1A",
										borderRadius: 2,
										maxHeight: "calc(100vh - 330px)",
									}}
									className="table-box"
								>
									<Table stickyHeader sx={{ minWidth: 500 }}>
										<TableHead>
											<TableRow>
												{tableHead.map((item, index) => (
													<Cell className="pdf-table" key={index}>{item}</Cell>
												))}
											</TableRow>
										</TableHead>
										<TableBody>
											{!loader ? (
												damages?.length > 0 ? (
													<Fragment>
														{damages.map((item, index) => (
															<Row
																key={index}
																sx={{
																	bgcolor: index % 2 !== 0 && "#EFF8E7",
																}}
															>
																<Cell className="pdf-table" >
																	{moment(item?.created_at).format(
																		"MM-DD-YYYY"
																	)}
																</Cell>
																<Cell className="pdf-table" >
																	{item?.vendor?.name ?? "-"}
																</Cell>

																<Cell className="pdf-table" >$ {parseFloat(item?.vendor_amount).toFixed(2) ?? "-"}</Cell>
																<Cell className="pdf-table" >$ {parseFloat(item?.damage_gws).toFixed(2) ?? "-"}</Cell>
																<Cell className="pdf-table" >$ {parseFloat(item?.client_amount).toFixed(2) ?? "-"}</Cell>
																<Cell className="pdf-table" >$ {parseFloat(item?.credit_gws).toFixed(2) ?? "-"}</Cell>

																<Cell className="pdf-table" >
																	<Tooltip
																		className='pdf-hide'
																		title={item?.creator?.name ?? "-"}
																		arrow
																		placement="top"
																		slotProps={{
																			popper: {
																				modifiers: [
																					{
																						name: "offset",
																						options: {
																							offset: [10, -2],
																						},
																					},
																				],
																			},
																		}}
																	>
																		{
																			item?.creator?.name?.length > 12
																				? item?.creator?.name?.slice(0, 8) + "..."
																				: item?.creator?.name
																		}
																	</Tooltip>
																	<Box
																		component={"div"}
																		className='pdf-show'
																		sx={{ display: "none !important" }}
																	>
																		{item?.creator?.name ?? "-"}
																	</Box>
																</Cell>
																<Cell className="pdf-table" >
																	<Box
																		sx={{
																			cursor:
																				item?.applied === true &&
																				"pointer",
																			path: {
																				fill:
																					item?.applied === true
																						? Colors.success
																						: Colors.danger,
																			},
																		}}

																	>
																		<span className="pdf-hide">		{item?.applied === false ? (
																			<PendingIcon />
																		) : (
																			<CheckIcon />
																		)} </span>
																		<Typography variant="body2">
																			{item?.applied ? "Applied" : "UnApplied"}
																		</Typography>
																	</Box>
																</Cell>
																<Cell>
																	<Box component={'div'} className="pdf-hide" sx={{ gap: "16px !important" }}>
																		{!item?.applied && <Box
																			onClick={() =>
																				navigate(
																					`/vendor-funds-apply`,
																					{ state: item }
																				)
																			}
																		>
																			<IconButton
																				sx={{
																					bgcolor: Colors.primary,
																					"&:hover": {
																						bgcolor:
																							Colors.primary,
																					},
																				}}
																			>
																				<EyeIcon />
																			</IconButton>
																			<Typography variant="body2">
																				Apply Fund
																			</Typography>
																		</Box>}
																		<Box
																			onClick={() =>
																				navigate(
																					`/damage-detail/${item?.id}`,

																				)
																			}
																		>
																			<IconButton
																				sx={{
																					bgcolor: Colors.primary,
																					"&:hover": {
																						bgcolor:
																							Colors.primary,
																					},
																				}}
																			>
																				<EyeIcon />
																			</IconButton>
																			<Typography variant="body2">
																				View Detail
																			</Typography>
																		</Box>
																	</Box>
																</Cell>
															</Row>
														))}
													</Fragment>
												) : (
													<Row>
														<Cell
															colSpan={tableHead.length + 1}
															align="center"
															sx={{ fontWeight: 600 }}
														>
															No Data Found
														</Cell>
													</Row>
												)
											) : (
												<Row>
													<Cell
														colSpan={tableHead.length + 2}
														align="center"
														sx={{ fontWeight: 600 }}
													>
														<Box className={classes.loaderWrap}>
															<CircularProgress />
														</Box>
													</Cell>
												</Row>
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</PDFExport>
							{/* ========== Pagination ========== */}
							{console.log(damages?.length)}
							<Pagination
								currentPage={currentPage}
								pageSize={pageLimit}
								onPageSizeChange={(size) => getDamages(1, size.target.value)}
								tableCount={damages?.length}
								totalCount={totalCount}
								onPageChange={(page) => getDamages(page, "")}
							/>
						</Fragment>
					)
				)}
			</Box>
		</Box>
	);
}

export default DamageList;
