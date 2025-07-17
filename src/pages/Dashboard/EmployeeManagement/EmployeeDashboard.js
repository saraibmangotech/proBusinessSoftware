"use client"
import { Box, Typography, Grid, Card, Avatar, Button, LinearProgress, Chip } from "@mui/material"
import {
  EmailOutlined,
  PhoneOutlined,
  CalendarTodayOutlined,
  AttachMoneyOutlined,
  CheckCircleOutline,
  WarningAmberOutlined,
  CancelOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
  PersonOutline,
  CreditCardOutlined,
  WorkOutline,
  HourglassEmptyOutlined,
  EventNoteOutlined,
  ScheduleOutlined,
} from "@mui/icons-material"

import { VisibilityOutlined } from "@mui/icons-material"


const EmployeeDashboard = () => {
  return (
    <Box sx={{ p: 4, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(to right, #6A0DAD, #4169E1)", // Purple to Royal Blue gradient
          color: "white",
          p: 4,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Profile Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: "rgba(255,255,255,0.2)" }}>
                <PersonOutline sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Welcome back, John Doe! 👋
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Security Guard - Security
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Employee ID: EMP001
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <EmailOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2">john.doe@company.com</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <PhoneOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Mobile
                    </Typography>
                    <Typography variant="body2">+971 50 123 4567</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <CalendarTodayOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Joined
                    </Typography>
                    <Typography variant="body2">2023-01-15</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <AttachMoneyOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Salary
                    </Typography>
                    <Typography variant="body2">AED 4,500</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Box sx={{ borderLeft: { md: "1px solid rgba(255,255,255,0.3)" }, pl: { md: 4 }, pt: { xs: 3, md: 0 } }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Quick Stats
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Hours
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    1240h
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed Shifts
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    156
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Bank Account
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    ADCB - ****1234
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Document Status & Expiry Tracking */}
      <Card sx={{ mb: 4, borderRadius: 3, p: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DescriptionOutlined sx={{ mr: 1, color: "#6A0DAD" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            Document Status & Expiry Tracking
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monitor your important document expiry dates
        </Typography>

        <Grid container spacing={3}>
          {/* Passport Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, p: 2, bgcolor: "#e8f5e9", boxShadow: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DescriptionOutlined sx={{ mr: 1, color: "#4CAF50" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                    Passport
                  </Typography>
                </Box>
                <Chip
                  label="Valid"
                  icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                  sx={{ bgcolor: "#4CAF50", color: "white", height: 24, "& .MuiChip-icon": { color: "white" } }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Expires:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
                2025-06-15
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Days left:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#4CAF50", mb: 2 }}>
                156 days
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityOutlined />}
                sx={{
                  borderColor: "#4CAF50",
                  color: "#4CAF50",
                  "&:hover": { borderColor: "#388E3C", bgcolor: "#e8f5e9" },
                  width: "100%",
                }}
              >
                View Document
              </Button>
            </Card>
          </Grid>

          {/* Emirates ID Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, p: 2, bgcolor: "#fff3e0", boxShadow: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CreditCardOutlined sx={{ mr: 1, color: "#FF9800" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                    Emirates ID
                  </Typography>
                </Box>
                <Chip
                  label="Expiring Soon"
                  icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />}
                  sx={{ bgcolor: "#FF9800", color: "white", height: 24, "& .MuiChip-icon": { color: "white" } }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Expires:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
                2024-12-20
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Days left:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#FF9800", mb: 2 }}>
                45 days
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityOutlined />}
                sx={{
                  borderColor: "#FF9800",
                  color: "#FF9800",
                  "&:hover": { borderColor: "#FB8C00", bgcolor: "#fff3e0" },
                  width: "100%",
                }}
              >
                View Document
              </Button>
            </Card>
          </Grid>

          {/* Visa Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, p: 2, bgcolor: "#ffebee", boxShadow: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DescriptionOutlined sx={{ mr: 1, color: "#F44336" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                    Visa
                  </Typography>
                </Box>
                <Chip
                  label="Expired"
                  icon={<CancelOutlined sx={{ fontSize: 16 }} />}
                  sx={{ bgcolor: "#F44336", color: "white", height: 24, "& .MuiChip-icon": { color: "white" } }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Expires:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
                2024-08-30
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Days left:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#F44336", mb: 2 }}>
                30 days ago
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityOutlined />}
                sx={{
                  borderColor: "#F44336",
                  color: "#F44336",
                  "&:hover": { borderColor: "#D32F2F", bgcolor: "#ffebee" },
                  width: "100%",
                }}
              >
                View Document
              </Button>
            </Card>
          </Grid>

          {/* Labor Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, p: 2, bgcolor: "#e8f5e9", boxShadow: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <WorkOutline sx={{ mr: 1, color: "#4CAF50" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                    Labor Card
                  </Typography>
                </Box>
                <Chip
                  label="Valid"
                  icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                  sx={{ bgcolor: "#4CAF50", color: "white", height: 24, "& .MuiChip-icon": { color: "white" } }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Expires:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
                2025-03-10
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Days left:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#4CAF50", mb: 2 }}>
                89 days
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityOutlined />}
                sx={{
                  borderColor: "#4CAF50",
                  color: "#4CAF50",
                  "&:hover": { borderColor: "#388E3C", bgcolor: "#e8f5e9" },
                  width: "100%",
                }}
              >
                View Document
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Card>

      {/* Current Shift Status */}
      <Grid container>
        <Grid item xs={6}>
      <Card sx={{ borderRadius: 3, p: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <HourglassEmptyOutlined sx={{ mr: 1, color: "#6A0DAD" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            Current Shift Status
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your active shift details and progress
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EventNoteOutlined sx={{ mr: 1, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      2024-01-15
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ScheduleOutlined sx={{ mr: 1, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      09:00 - 17:00
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOnOutlined sx={{ mr: 1, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      Main Building
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonOutline sx={{ mr: 1, color: "#666" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Supervisor
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      Jane Smith
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

        
        </Grid>
      </Card>
      </Grid>
      </Grid>
    </Box>
  )
}

export default EmployeeDashboard


