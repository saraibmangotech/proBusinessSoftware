"use client"

import { Fragment, useState, useRef, useEffect } from "react"

// Import MUI components
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
  Button,
  FormControl,
  FormHelperText,
  styled,
} from "@mui/material"

// Import MUI icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import SearchIcon from "@mui/icons-material/Search"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import FolderIcon from "@mui/icons-material/Folder"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"
import DescriptionIcon from "@mui/icons-material/Description"

// Styled components
const SelectButton = styled(Button)(({ theme, error, disabled }) => ({
  width: "100%",
  padding: "10px 16px",
  textAlign: "left",
  justifyContent: "space-between",
  backgroundColor: disabled ? theme.palette.action.disabledBackground : theme.palette.background.paper,
  border: `2px solid ${error ? theme.palette.error.main : theme.palette.grey[800]}`,
  borderRadius: "12px",
  "&:hover": {
    backgroundColor: disabled ? theme.palette.action.disabledBackground : theme.palette.action.hover,
    border: `2px solid ${error ? theme.palette.error.main : theme.palette.grey[800]}`,
  },
  "& .MuiButton-endIcon": {
    marginLeft: "auto",
  },
}))

const DropdownPaper = styled(Paper)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  marginTop: "4px",
  zIndex: 1300,
  borderRadius: "8px",
  boxShadow: theme.shadows[3],
  maxHeight: "400px",
  display: "flex",
  flexDirection: "column",
}))

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

const HierarchyContainer = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  maxHeight: "320px",
}))

const CategoryItem = styled(ListItem)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  padding: theme.spacing(1, 2),
}))

const SubCategoryItem = styled(ListItem)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  padding: theme.spacing(1, 2),
}))

const AccountItem = styled(ListItem)(({ theme, isSelectable }) => ({
  cursor: isSelectable ? "pointer" : "default",
  "&:hover": {
    backgroundColor: isSelectable ? theme.palette.primary.lighter : "transparent",
  },
  padding: theme.spacing(1, 2),
}))

const ChildAccountItem = styled(ListItem)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.primary.lighter,
  },
  padding: theme.spacing(1, 2),
}))

function HierarchicalSelectField(props) {
  const {
    label,
    size = "medium",
    disabled = false,
    selected,
    onSelect,
    error,
    data = [],
    placeholder = "Select an account...",
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [expandedSubCategories, setExpandedSubCategories] = useState(new Set())
  const [expandedAccounts, setExpandedAccounts] = useState(new Set())
  const selectRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Flatten all accounts for search
  const getAllAccounts = () => {
    const accounts = []

    data.forEach((category) => {
      if (category.sub) {
        category.sub.forEach((subCategory) => {
          if (subCategory.accounts) {
            subCategory.accounts.forEach((account) => {
              accounts.push({
                ...account,
                categoryName: category.name,
                subCategoryName: subCategory.name,
                fullPath: `${category.name} > ${subCategory.name} > ${account.account_name}`,
              })

              // Add child accounts if they exist
              if (account.childAccounts) {
                account.childAccounts.forEach((childAccount) => {
                  accounts.push({
                    ...childAccount,
                    categoryName: category.name,
                    subCategoryName: subCategory.name,
                    parentAccountName: account.account_name,
                    fullPath: `${category.name} > ${subCategory.name} > ${account.account_name} > ${childAccount.account_name}`,
                  })
                })
              }
            })
          }
        })
      }
    })

    return accounts
  }

  const filteredAccounts = getAllAccounts().filter(
    (account) =>
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubCategory = (subCategoryId) => {
    const newExpanded = new Set(expandedSubCategories)
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId)
    } else {
      newExpanded.add(subCategoryId)
    }
    setExpandedSubCategories(newExpanded)
  }

  const toggleAccount = (accountId) => {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedAccounts(newExpanded)
  }

  const handleAccountSelect = (account) => {
    onSelect(account)
    setIsOpen(false)
    setSearchTerm("")
  }

  const getSelectedAccountDisplay = () => {
    if (!selected) return placeholder
    return `${selected.account_code} - ${selected.account_name}`
  }

  const renderSearchResults = () => {
    if (!searchTerm) return null

    return (
      <List disablePadding>
        {filteredAccounts.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="textSecondary">
                  No accounts found
                </Typography>
              }
            />
          </ListItem>
        ) : (
          filteredAccounts.map((account) => (
            <Fragment key={account.id}>
              <ListItem button onClick={() => handleAccountSelect(account)} sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DescriptionIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {account.account_name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {account.account_code}
                      </Typography>
                      <Typography variant="caption" display="block" color="primary">
                        {account.fullPath}
                      </Typography>
                    </>
                  }
                />
                <Typography variant="caption" color="textSecondary">
                  {account.nature === "debit" ? "Dr" : "Cr"}
                </Typography>
              </ListItem>
              <Divider />
            </Fragment>
          ))
        )}
      </List>
    )
  }

  const renderHierarchy = () => {
    if (searchTerm) return renderSearchResults()

    return (
      <List disablePadding>
        {data.map((category) => (
          <Fragment key={category.id}>
            {/* Main Category */}
            <CategoryItem onClick={() => toggleCategory(category.id)}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {expandedCategories.has(category.id) ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </ListItemIcon>
              {/* <ListItemIcon sx={{ minWidth: 36 }}>
                <AccountBalanceIcon fontSize="small" color="primary" />
              </ListItemIcon> */}
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="medium">
                    {category.name}
                  </Typography>
                }
              />
            </CategoryItem>
            <Divider />

            {/* Sub Categories */}
            <Collapse in={expandedCategories.has(category.id)} timeout="auto" unmountOnExit>
              <Box sx={{ ml: 4 }}>
                {category.sub &&
                  category.sub.map((subCategory) => (
                    <Fragment key={subCategory.id}>
                      <SubCategoryItem onClick={() => toggleSubCategory(subCategory.id)}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {expandedSubCategories.has(subCategory.id) ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ChevronRightIcon fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <FolderOpenIcon fontSize="small" color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="medium">
                              {subCategory.name}
                            </Typography>
                          }
                        />
                      </SubCategoryItem>
                      <Divider />

                      {/* Accounts */}
                      <Collapse in={expandedSubCategories.has(subCategory.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ ml: 4 }}>
                          {subCategory.accounts &&
                            subCategory.accounts.map((account) => (
                              <Fragment key={account.id}>
                                {/* Account without children or leaf account */}
                                {!account.childAccounts || account.childAccounts.length === 0 ? (
                                  <>
                                    <AccountItem isSelectable={true} onClick={() => handleAccountSelect(account)}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <DescriptionIcon fontSize="small" color="info" />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" fontWeight="medium">
                                            {`${account.account_code} ${account.account_name}`}
                                          </Typography>
                                        }
                                      />
                                      <Typography variant="caption" color="textSecondary">
                                        {account.nature === "debit" ? "Dr" : "Cr"}
                                      </Typography>
                                    </AccountItem>
                                    <Divider />
                                  </>
                                ) : (
                                  /* Account with children */
                                  <>
                                    <AccountItem onClick={() => toggleAccount(account.id)}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        {expandedAccounts.has(account.id) ? (
                                          <ExpandLessIcon fontSize="small" />
                                        ) : (
                                          <ChevronRightIcon fontSize="small" />
                                        )}
                                      </ListItemIcon>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <FolderIcon fontSize="small" color="warning" />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" fontWeight="medium">
                                            {account.account_name}
                                          </Typography>
                                        }
                                        secondary={
                                          <>
                                            <Typography variant="caption" display="block" color="textSecondary">
                                              {account.account_code}
                                            </Typography>
                                            <Typography variant="caption" display="block" color="primary">
                                              {account.account_subcategory}
                                            </Typography>
                                          </>
                                        }
                                      />
                                      <Typography variant="caption" color="textSecondary">
                                        {account.nature === "debit" ? "Dr" : "Cr"}
                                      </Typography>
                                    </AccountItem>
                                    <Divider />

                                    {/* Child Accounts */}
                                    <Collapse in={expandedAccounts.has(account.id)} timeout="auto" unmountOnExit>
                                      <Box sx={{ ml: 4 }}>
                                        {account.childAccounts &&
                                          account.childAccounts.map((childAccount) => (
                                            <Fragment key={childAccount.id}>
                                              <ChildAccountItem onClick={() => handleAccountSelect(childAccount)}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                  <DescriptionIcon fontSize="small" color="error" />
                                                </ListItemIcon>
                                                <ListItemText
                                                  primary={
                                                    <Typography variant="body2" fontWeight="medium">
                                                      {childAccount.account_name}
                                                    </Typography>
                                                  }
                                                  secondary={
                                                    <>
                                                      <Typography
                                                        variant="caption"
                                                        display="block"
                                                        color="textSecondary"
                                                      >
                                                        {childAccount.account_code}
                                                      </Typography>
                                                      <Typography variant="caption" display="block" color="primary">
                                                        {childAccount.account_subcategory}
                                                      </Typography>
                                                    </>
                                                  }
                                                />
                                                <Typography variant="caption" color="textSecondary">
                                                  {childAccount.nature === "debit" ? "Dr" : "Cr"}
                                                </Typography>
                                              </ChildAccountItem>
                                              <Divider />
                                            </Fragment>
                                          ))}
                                      </Box>
                                    </Collapse>
                                  </>
                                )}
                              </Fragment>
                            ))}
                        </Box>
                      </Collapse>
                    </Fragment>
                  ))}
              </Box>
            </Collapse>
          </Fragment>
        ))}
      </List>
    )
  }

  return (
    <FormControl fullWidth error={!!error && !selected}>
      <Typography
        component="label"
        variant="subtitle1"
        fontWeight="bold"
        color={error && !selected ? "error" : "textPrimary"}
        sx={{ mb: 1 }}
      >
        {label}
      </Typography>

      <Box ref={selectRef} sx={{ position: "relative" }}>
        {/* Main Select Button */}
        <SelectButton
          variant="outlined"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          error={!!error}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          }
        >
          <Typography color={selected ? "textPrimary" : "textSecondary"} noWrap>
            {getSelectedAccountDisplay()}
          </Typography>
        </SelectButton>

        {/* Dropdown */}
        {isOpen && (
          <DropdownPaper ref={dropdownRef}>
            {/* Search Box */}
            <SearchContainer>
              <TextField
                fullWidth
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </SearchContainer>

            {/* Hierarchical Content */}
            <HierarchyContainer>{renderHierarchy()}</HierarchyContainer>
          </DropdownPaper>
        )}
      </Box>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  )
}

export default HierarchicalSelectField
