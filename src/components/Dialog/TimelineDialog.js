import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";

const LogTimelineDialog = ({ open, onClose, logs = [] }) => {
  return (
 <Dialog
  open={open}
  onClose={onClose}
  maxWidth="sm"
  fullWidth
  sx={{
    "& .MuiDialog-paper": {
      borderRadius: 3,
      backgroundColor: "#fff", // white background
      color: "#000",
      p: 2,
    },
  }}
>
  {/* Header */}
  <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Activity Timeline
    </Typography>
    <IconButton onClick={onClose}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  {/* Content */}
  <DialogContent dividers sx={{ maxHeight: "70vh" }}>
    {logs.length === 0 ? (
      <Typography align="center" sx={{ color: "#888", mt: 2 }}>
        No activity logs found.
      </Typography>
    ) : (
      <Box display="flex" flexDirection="column" gap={2}>
        {logs.map((log) => (
          <Box
            key={log.id}
            sx={{
              width: "100%",
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f5f5f5",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {log.creator?.name || "Unknown User"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#555", mt: 0.5 }}>
              {log.log}
            </Typography>
            <Typography variant="caption" sx={{ color: "#999", mt: 0.5, display: "block" }}>
              {new Date(log.created_at).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    )}
  </DialogContent>
</Dialog>

  );
};

export default LogTimelineDialog;
