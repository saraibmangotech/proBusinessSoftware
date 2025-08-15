"use client"
import { useEffect, useState } from "react"
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Pagination,
  Select,
  MenuItem as SelectItem,
} from "@mui/material"
import {
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
import SystemServices from "services/System"
import { showErrorToast } from "components/NewToaster"
import moment from "moment"
import { useNavigate } from "react-router-dom"

// Styled components
const NotificationContainer = styled(Paper)(() => ({
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

function NotificationsList() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({})
  const navigate = useNavigate()
  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotifications = async (page = currentPage, limit = pageSize, filter = {}) => {
    try {
      const params = {
        page,
        limit,
        ...filters,
        ...filter,
      }
      const { data } = await SystemServices.getNotifications(params)
      setNotifications(data?.notifications?.rows || [])
      setTotalCount(data?.count || 0)
      setCurrentPage(page)
      setPageSize(limit)
      setFilters(filter)
    } catch (error) {
      showErrorToast(error)
    }
  }

  useEffect(() => {
    getNotifications(1)
  }, [])

  const handleMenuClick = (event, notification) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedNotification(notification)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedNotification(null)
  }

  const iconMap = {
    AssignmentIcon: AssignmentIcon,
    WarningIcon: WarningIcon,
    CheckCircleIcon: CheckCircleIcon,
    ScheduleIcon: ScheduleIcon,
    InfoIcon: InfoIcon,
    BuildIcon: BuildIcon,
    CancelIcon: CancelIcon,
  };

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

  const getPriorityLabel = (priority) => priority.charAt(0).toUpperCase() + priority.slice(1)

  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification)
    if (notification?.type == 'Leave Request') {
      navigate('/leave-list')
    }
    // Handle view logic here
  }

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName]
    if (IconComponent) {
      return <IconComponent sx={{ color: "white", fontSize: 20 }} />
    }
    // Fallback icon if the specified icon is not found
    return <NotificationsIcon sx={{ color: "white", fontSize: 20 }} />
  }

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ fontSize: 32, color: "#1976d2" }} />
          </Badge>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
            Notifications
          </Typography>
        </Box>
      </Box>

      {/* Notifications */}
      <Box>
        {notifications.map((notification) => {
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
                <Avatar
                  sx={{
                    backgroundColor: notification.icon_color,
                    width: 40,
                    height: 40,
                  }}
                >
                  {renderIcon(notification.icon)}
                </Avatar>
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
                      <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.4 }}>
                        {notification.description}
                      </Typography>
                    </Box>
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
                      {/* <IconButton size="small" onClick={(e) => handleMenuClick(e, notification)} sx={{ color: "#666" }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton> */}
                    </Box>
                  </NotificationHeader>
                  <NotificationMeta>
                    <Typography variant="caption">{notification.sender?.name}</Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">{moment(notification.created_at).format('DD-MM-YYYY')}</Typography>
                    <Typography variant="caption">•</Typography>
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

      {/* Pagination */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2, alignItems: "center" }}>
        <Typography variant="body2">Rows per page:</Typography>
        <Select
          value={pageSize}
          onChange={(e) => {
            setPageSize(e.target.value)
            getNotifications(1, e.target.value)
          }}
          size="small"
        >
          {[5, 10, 20, 50].map((limit) => (
            <SelectItem key={limit} value={limit}>
              {limit}
            </SelectItem>
          ))}
        </Select>
        <Pagination
          count={Math.ceil(totalCount / pageSize)}
          page={currentPage}
          onChange={(e, value) => getNotifications(value)}
          color="primary"
        />
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 150 } }}
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
