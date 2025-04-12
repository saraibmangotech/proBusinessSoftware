import { Box } from '@mui/material';
import { Images } from 'assets';
import React, { useState } from 'react';

const LabelCustomInput = ({ allowance, label, StartLabel, placeholder, disabled, register, defaultValue, postfix, error, bgcolor, color, border, type, value, min, step, max }) => {
  const [edit, setEdit] = useState(postfix ? true : false);

  const toggleEdit = () => {
    setEdit(!edit);
  };

  return (
    <div>
      <div className="input-container">
        <label style={{ fontSize: '16px', fontWeight: 'bold' }}>{label}</label>
        <div className="input-group" style={{ border: border ? border : '', borderRadius: border ? '0px' : '', width: border ? '260px' : '' }}>
          <span className="input-prefix" style={{ fontWeight: label === '%' ? 'bold' : '', fontSize: border ? '10px' : '16px', backgroundColor: bgcolor ? bgcolor : '', color: color ? color : '', borderRight: border ? 'none' : '', padding: border ? '0px 0px' : '', fontFamily: 'Public Sans' }}>{StartLabel}</span>
          <input
            {...register}
            value={value}
            type={type ? 'text' : 'number'}
            step={step ? step : 'any'}
            max={max ? max : ''}
            placeholder={placeholder}
            // min={type != 'text' ? '1' : undefined} 
            min={allowance ? '0' : (type !== 'text' ? '1' : undefined)}
            disabled={disabled || (edit ? true : false)}
            defaultValue={defaultValue}
            style={{ backgroundColor: edit ? '#EEEEEE' : '', borderRadius: border ? '0px' : '' }}
          />
          {postfix && (
            <span className="input-postfix" onClick={toggleEdit} style={{ fontWeight: label === '%' ? 'bold' : '', fontSize: '16px', display: 'flex', cursor: 'pointer' }}>
              <Box component={'img'} src={edit ? Images.editIcon2 : Images.checkIcon} width={'20px'} />
            </span>
          )}
          &nbsp;
        </div>
        <span style={{ color: '#d32f2f', fontSize: '12px' }}>{error || ''}</span>
      </div>
    </div>
  );
};

export default LabelCustomInput;
