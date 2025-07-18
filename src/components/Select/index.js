"use client"

import { Fragment } from "react"
import { Autocomplete, Box, InputLabel, TextField, Typography, createFilterOptions } from "@mui/material"

function SelectField(props) {
  const { label, size, disabled, onSearch, addNew, multiple, selected, onSelect, register, error, options ,sx} = props

  const filter = createFilterOptions({
    matchFrom: "any",
    stringify: (option) => option.name || "",
    limit: 100,
  })


  const handleFilterOptions = (options, params) => {
    const { inputValue } = params

   
    const filtered = filter(options, params)

   
    const uniqueOptions = []
    const seenNames = new Set()

    filtered.forEach((option) => {
      const optionName = option.name || option
      if (!seenNames.has(optionName)) {
        seenNames.add(optionName)
        uniqueOptions.push(option)
      }
    })

    

   
    const isExisting = uniqueOptions.some((option) => {
      const optionName = typeof option === "string" ? option : option.name
      return optionName && optionName.toLowerCase() === inputValue.toLowerCase()
    })

    if (inputValue !== "" && !isExisting && addNew) {
      uniqueOptions.push({
        inputValue,
        name: `Add "${inputValue}"`,
      })
    }

    return uniqueOptions
  }

  
  const handleOptionLabel = (option) => {
   
    if (typeof option === "string") {
      return option
    }

    // *Add new option created dynamically
    if (option && option.inputValue && addNew) {
      return option.inputValue
    }

    // *Regular option
    return option && option.name ? option.name : ""
  }

  // *For Handle Change
  const handleChange = (event, newValue) => {
    if (typeof newValue === "string") {
      onSelect(newValue)
      return
    }

    if (newValue && newValue.inputValue && addNew) {
      addNew(newValue.inputValue)
      return
    }

    onSelect(newValue)
  }

  
  const handleSearch = (event, value) => {
    if (onSearch) {
      
      clearTimeout(handleSearch.timeoutId)
      handleSearch.timeoutId = setTimeout(() => {
        onSearch(value)
      }, 300)
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <InputLabel
        sx={{
          fontWeight: "bold",
          color: "#333",
          fontSize: "16px",
          mb: "10px",
        }}
        error={error && selected === "" && true}
      >
        {label}
      </InputLabel>

      <Autocomplete
        disabled={disabled}
        size={size}
        multiple={multiple}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false

          if (typeof option === "string" && typeof value === "string") {
            return option === value
          }

          const optionName = option.name || option
          const valueName = value.name || value

          return optionName === valueName
        }}
        value={selected}
        options={options || []}
        filterOptions={handleFilterOptions}
        getOptionLabel={handleOptionLabel}
        onChange={handleChange}
        onInputChange={handleSearch}
        sx={{ mb: !error && 2 }}
        PopperProps={{
          style: { zIndex: 1400 }, // Higher z-index to appear above modal
        }}
        renderOption={(props, option, { index }) => (
          <li {...props} key={`${option.name || option}-${index}`}>
            {typeof option === "string" ? option : option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{
              ...sx,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "2px solid black !important",
                  borderRadius: "12px",
                },
              },
              position: "relative", 
              zIndex: 1, 
            }}
            placeholder={label}
            error={error}
            {...register}
            InputProps={{
              ...params.InputProps,
              endAdornment: <Fragment>{params.InputProps.endAdornment}</Fragment>,
            }}
          />
        )}
      />

      {error && (
        <Typography variant="caption" color="error" sx={{ textAlign: "left" }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default SelectField
