import React from "react";

// export default TripleSwitchToggle;

function TripleSwitchToggle({ dataprop, name, datas, updateClick, ...rest }) {
	return (
		<div className="d-flex gap-1 align-items-center">
			<div className="tw-toggle">
				<input
					type="radio"
					{...rest}
					onClick={(e) => updateClick(e)}
					value="1"
					checked={datas == "1" ? true : false}
					className={`${datas && datas == "1" && "active"}`}
				/>
				<label className="toggle toggle-yes">OK</label>
				<input
					type="radio"
					{...rest}
					value="-1"
					onClick={(e) => updateClick(e)}
					checked={datas == "-1" ? true : false}
					className={`${datas && datas == "-1" && "active"}`}
				/>
				<label className="toggle toggle-yes">N/A</label>
				<input
					type="radio"
					{...rest}
					value="0"
					onClick={(e) => updateClick(e)}
					checked={datas == "0" ? true : false}
					className={`${ datas == "0" && "active"}`}
				/>
				<label className="toggle toggle-yes">Not</label>
				<span></span>
			</div>
			<span className="flds">{dataprop}</span>
		</div>
	);
}

export default TripleSwitchToggle;
