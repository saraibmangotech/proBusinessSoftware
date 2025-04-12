import { Fragment } from "react";
import { Close, DownloadForOfflineOutlined } from "@mui/icons-material";
import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import { FontFamily, JpgIcon, PdfIcon } from "assets";
import Colors from "assets/Style/Colors";
import { DownloadFile } from "utils";

function Uploading({ key, data, uploadedSize, progress, removeDoc }) {

  return (
    <Box key={key} sx={{ border: `1px solid ${Colors.mercury}`, borderRadius: 1, px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', mb: 1.5 }}>
      {data?.isUpload ? (
        <IconButton onClick={() => DownloadFile(data)}  >
          <DownloadForOfflineOutlined sx={{ fontSize: 30, color: Colors.smokeyGrey }} />
        </IconButton>
      ) : (
        <Fragment>
          {data?.type === 'pdf' && <PdfIcon />}
          {data?.type === 'jpg' && <JpgIcon />}
          {data?.type === 'jpeg' && <JpgIcon />}
          {data?.type === 'png' && <JpgIcon />}
        </Fragment>
      )}
      <Box sx={{ flex: 1, ml: 1 }}>
        <Box sx={{ display: 'flex', gap: '20px', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography className={'text-truncate'} variant="caption" sx={{ color: Colors.cloud, flex: 1 }}>
            {data?.name}
          </Typography>
          <Box>
            <Typography variant="caption" sx={{ color: Colors.cloud }}>
              {data?.isUpload ? 'Complete' : 'Uploading'}
            </Typography>
            {data?.isUpload &&
              <IconButton sx={{ width: 20, height: 20, ml: 0.5 }} onClick={() => removeDoc()}>
                <Close sx={{ color: Colors.danger, fontSize: 16 }} />
              </IconButton>
            }
          </Box>
        </Box>
        <LinearProgress variant="determinate"
          value={data?.isUpload ? 100 : progress}
          sx={{
            borderRadius: 2,
            bgcolor: Colors.mercury,
            '.MuiLinearProgress-bar': {
              bgcolor: data?.isUpload ? Colors.primary : Colors.bluishCyan
            }
          }}
        />
        <Typography variant="overline" sx={{ color: Colors.cloud, fontFamily: FontFamily.NunitoRegular }}>
          {data?.isUpload ? data?.size : uploadedSize} / {data?.size}
        </Typography>
      </Box>
    </Box>
  );
}

export default Uploading