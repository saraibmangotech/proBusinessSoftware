import { Fragment, useEffect, useState } from "react"
import { Box, CircularProgress, IconButton, Typography } from "@mui/material"
import { makeStyles } from "@mui/styles"
import Colors from "assets/Style/Colors"
import { Images } from "assets"
import styled from "@emotion/styled"
import DeleteIcon from "@mui/icons-material/Delete"
import $ from "jquery"

// Styles
const useStyle = makeStyles({
  root: {
    borderRadius: 2,
    textAlign: "center",
    px: 2,
    width: "220px",
    height: "120px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
})

// Styled component for the input
const Input = styled("input")({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  display: "block",
  opacity: 0,
  fontSize: 0,
  cursor: "pointer",
})

function UploadFile2({
  inputRef,
  error,
  accept,
  register,
  multiple,
  style,
  custom,
  Memo,
  file,
  fileId,
  updateResult,
  disabled,
  loader,
}) {
  const [fileAvailable, setFileAvailable] = useState([])

  const classes = useStyle()

  useEffect(() => {
    $("input.custom-file").prop("disabled", disabled)
    $(".custom-file input").prop("disabled", disabled)
    $(".custom-file button").prop("disabled", disabled)
  }, [disabled])

  useEffect(() => {
    if (file && file.length > 0) {
      const currentFile = file
      console.log(currentFile,'currentFile');
      
      if (currentFile) {
        const multiPaths = currentFile.split(",")
        const result = multiPaths.map((item) => ({
          extension: item.split(".").pop(),
          name: item.split("/").pop(),
          path: item.trim(),
        }))
        console.log(result,'result');
        
        setFileAvailable(result)
      }
    }
  }, [file, fileId])

  const handleDelete = (path) => {
    const newResult = fileAvailable.filter((x) => x.path !== path)
    const updatedPaths = newResult.map((item) => item.path).join(",")
    setFileAvailable(newResult)
    updateResult(fileId, updatedPaths)
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map((file) => ({
      extension: file.name.split(".").pop(),
      name: file.name,
      path: URL.createObjectURL(file),
    }))

    const updatedFiles = [...fileAvailable, ...newFiles]
    setFileAvailable(updatedFiles)

    const updatedPaths = updatedFiles.map((item) => item.path).join(",")
    updateResult(fileId, updatedPaths)
  }

  return (
    <Fragment>
      <Box style={style} className={classes.root}>
        <Input
          className="custom-file"
          disabled={disabled}
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          {...register}
          style={{ width: "250px" }}
        />
        {Memo && (
          <Box sx={{ fontSize: "15px" }}>
            <Box sx={{ textAlign: "left" }}>
              <Box component={"img"} src={Images?.uploadDoc} width={"50px"}></Box>
            </Box>
            <Typography
              component={"h5"}
              variant="caption"
              sx={{ color: Colors.black, mt: 0.2, textAlign: "center", fontSize: "15px", width: "223px" }}
            >
              <span style={{ color: Colors.blue }}>Click to Upload</span> Or drag & drop
            </Typography>
            <Typography
              component={"h5"}
              variant="caption"
              sx={{ color: Colors.black, mt: 0.2, textAlign: "left", fontSize: "15px" }}
            >
              (Max. File size: 10 MB)
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: "2px", flexWrap: "wrap" }}>
        {loader ? (
          <CircularProgress />
        ) : (
          fileAvailable.length > 0 &&
          fileAvailable.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center",width:'35%' }}>
              {item?.extension && (
                <Box sx={{ position: "relative" }}>
                  <Box
                    component={"div"}
                    onClick={() => handleDelete(item?.path)}
                    sx={{ position: "absolute", top: -10, right: -10, cursor: "pointer" }}
                  >
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Box
                    component={"img"}
                    sx={{ cursor: "pointer" }}
                    onClick={() => window.open(process.env.REACT_APP_IMAGE_BASE_URL + item.path, "_blank")}
                    src={
                      item?.extension === "png" || item?.extension === "jpg" || item?.extension === "jpeg"
                        ? Images.uploadImage
                        : item?.extension === "pdf"
                          ? Images.uploadPDF
                          : item?.extension === "xls"
                            ? Images.uploadXls
                            : Images.docIcon
                    }
                    width={"50px"}
                  />
                  <p
                    onClick={() => window.open(process.env.REACT_APP_IMAGE_BASE_URL + item.path, "_blank")}
                    style={{ color: "blue", width: "120px", cursor: "pointer" }}
                  >
                    {item?.name}
                  </p>
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>

      {(error ) && (
        <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
          {error || "Please upload at least one file."}
        </Typography>
      )}
    </Fragment>
  )
}

export default UploadFile2

