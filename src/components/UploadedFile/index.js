import { DownloadForOfflineOutlined } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { DownloadFile } from "utils";

function UploadedFile({ data }) {

  return (
    <Box sx={{ mt: 0.5, border: `1px solid ${Colors.mercury}`, borderRadius: 1, px: 2, py: 0.5, display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={() => DownloadFile(data)}  >
        <DownloadForOfflineOutlined sx={{ fontSize: 30, color: Colors.smokeyGrey }} />
      </IconButton>
      <Box sx={{ flex: 1, ml: 1 }}>
        <Typography className={'text-truncate'} variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.cloud }}>
          {data?.name}
        </Typography>
      </Box>
    </Box>
  );
}

export default UploadedFile