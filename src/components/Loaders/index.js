import { Box, CircularProgress } from "@mui/material";
import { Images, Loader } from "assets";

export const CircleLoading = () => {
  return (
    <Box sx={{ display: 'block', position: 'relative', justifyContent: 'center', alignItems: 'center', minHeight: 380, height: 'calc(100vh - 210px)' }}>
      <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        <CircularProgress />
      </Box>
    </Box>
  );
}

export const PreLoading = () => {
  return (
    <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
      <Box component={'img'} src={Images.logoDark} sx={{ height: '150px' }} />
    </Box>
  );
}