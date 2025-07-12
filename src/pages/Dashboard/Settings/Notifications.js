"use client"

import { useState } from "react"
import { Box, Paper, Typography, IconButton, Chip, Avatar, Divider, Menu, MenuItem, Badge } from "@mui/material"
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"

// Styled components
const NotificationContainer = styled(Paper)(({ theme }) => ({
  padding: "16px",
  marginBottom: "8px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  "&:hover": {
    backgroundColor: "#f8f9fa",
    cursor: "pointer",
  },
}))

const NotificationHeader = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: "8px",
})

const NotificationContent = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
})

const NotificationDetails = styled(Box)({
  flex: 1,
  minWidth: 0,
})

const NotificationMeta = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "8px",
  fontSize: "12px",
  color: "#666",
})

// Dummy data
const notificationsData = [
  {
    id: 1,
    type: "leave_request",
    title: "Leave Request Approval",
    description: "Sarah Johnson has requested 3 days of annual leave from Dec 20-22, 2024",
    sender: "Sarah Johnson",
    timestamp: "2 hours ago",
    category: "Marketing",
    priority: "medium",
    icon: AssignmentIcon,
    iconColor: "#2196f3",
    read: false,
  },
  {
    id: 2,
    type: "policy_update",
    title: "Updated Remote Work Policy",
    description: "New remote work guidelines have been published. Please review the updated policy document.",
    sender: "HR Department",
    timestamp: "4 hours ago",
    category: "HR",
    priority: "high",
    icon: WarningIcon,
    iconColor: "#ff9800",
    read: false,
  },
  {
    id: 3,
    type: "payroll",
    title: "Payroll Processing Complete",
    description: "December 2024 payroll has been processed. Salary slips are now available in your portal.",
    sender: "Payroll System",
    timestamp: "6 hours ago",
    category: "Finance",
    priority: "low",
    icon: CheckCircleIcon,
    iconColor: "#4caf50",
    read: true,
  },
  {
    id: 4,
    type: "training",
    title: "Mandatory Training Reminder",
    description: "Cybersecurity training deadline is approaching. Complete by Dec 31, 2024.",
    sender: "Learning & Development",
    timestamp: "1 day ago",
    category: "IT",
    priority: "high",
    icon: ScheduleIcon,
    iconColor: "#9c27b0",
    read: false,
  },
  {
    id: 5,
    type: "announcement",
    title: "Holiday Schedule Announcement",
    description: "Company holiday schedule for 2025 has been published. Check the calendar for details.",
    sender: "Management",
    timestamp: "2 days ago",
    category: "Management",
    priority: "medium",
    icon: InfoIcon,
    iconColor: "#ffc107",
    read: true,
  },
  {
    id: 6,
    type: "maintenance",
    title: "System Maintenance Notice",
    description: "HRMS system will undergo maintenance on Dec 28, 2024 from 2:00 AM to 4:00 AM.",
    sender: "IT Support",
    timestamp: "3 days ago",
    category: "IT",
    priority: "medium",
    icon: BuildIcon,
    iconColor: "#607d8b",
    read: true,
  },
  {
    id: 7,
    type: "leave_denied",
    title: "Leave Request Denied",
    description: "Your leave request for Jan 15-17, 2025 has been denied due to project deadlines.",
    sender: "Project Manager",
    timestamp: "4 days ago",
    category: "Engineering",
    priority: "high",
    icon: CancelIcon,
    iconColor: "#f44336",
    read: false,
  },
]

function NotificationsList() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)

  const handleMenuClick = (event, notification) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedNotification(notification)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedNotification(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f44336"
      case "medium":
        return "#ff9800"
      case "low":
        return "#4caf50"
      default:
        return "#9e9e9e"
    }
  }

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification)
    // Handle notification click logic here
  }

  const unreadCount = notificationsData.filter((n) => !n.read).length

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ fontSize: 32, color: "#1976d2" }} />
        </Badge>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
          Notifications
        </Typography>
      </Box>

      {/* Notifications List */}
      <Box>
        {notificationsData.map((notification, index) => {
          const IconComponent = notification.icon
          return (
            <NotificationContainer
              key={notification.id}
              elevation={0}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? "#fff" : "#f3f7ff",
                borderLeft: notification.read ? "none" : "4px solid #2196f3",
              }}
            >
              <NotificationContent>
                {/* Icon */}
                <Avatar
                  sx={{
                    backgroundColor: notification.iconColor,
                    width: 40,
                    height: 40,
                  }}
                >
                  <IconComponent sx={{ color: "white", fontSize: 20 }} />
                </Avatar>

                {/* Content */}
                <NotificationDetails>
                  <NotificationHeader>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: notification.read ? "normal" : "bold",
                          color: "#333",
                          mb: 0.5,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.description}
                      </Typography>
                    </Box>

                    {/* Priority and Actions */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={getPriorityLabel(notification.priority)}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(notification.priority),
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                      />
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, notification)} sx={{ color: "#666" }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </NotificationHeader>

                  {/* Meta information */}
                  <NotificationMeta>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      {notification.sender}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      •
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      {notification.timestamp}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      •
                    </Typography>
                    <Chip
                      label={notification.category}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: "20px",
                        fontSize: "10px",
                        borderColor: "#ddd",
                        color: "#666",
                      }}
                    />
                  </NotificationMeta>
                </NotificationDetails>
              </NotificationContent>
            </NotificationContainer>
          )
        })}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150 },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Mark as Read</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Archive</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default NotificationsList
