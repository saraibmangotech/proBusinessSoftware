import { ArrowBack, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Checkbox, Collapse, Grid, IconButton, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { addNavigation, addPermission, setPermission } from 'redux/slices/navigationDataSlice';
import AuthServices from 'services/Auth';
import RoleServices from 'services/Role';
import { addChildRoutes, formatPermissionData, getPermissionsRoutes } from 'utils';

function PermissionList({ permission, selectedPermissions, updateSelected, parentId, parentChild, expand, handleCollapse }) {

    const nestedComments = (permission.children || []).map(item => {
        return (
            <PermissionList
                key={item.id}
                parentId={permission.id}
                parentChild={permission.children}
                permission={item}
                selectedPermissions={selectedPermissions}
                updateSelected={updateSelected}
                expand={expand}
                handleCollapse={(id) => handleCollapse(id)}
            />
        )
    })

    return (
        <List component="div" disablePadding sx={{ pl: '13px', ml: '11px', borderLeft: `1px dashed rgba(0,0,0,0.1)` }}>
            <ListItemButton disableGutters disableRipple disableTouchRipple
                sx={{
                    p: 0,
                    '.MuiCheckbox-root': { p: 0.8 },
                    '.MuiTypography-root': { fontSize: 14, fontFamily: FontFamily?.NunitoRegular },
                    '&:hover': { bgcolor: 'transparent', cursor: 'inherit' }
                }}
            >
                {expand.indexOf(permission.id) !== -1 ? (
                    <ExpandLess sx={{ cursor: 'pointer', transform: 'rotate(90deg)', opacity: permission?.children?.length > 0 ? 1 : 0 }} onClick={() => handleCollapse(permission.id)} />
                ) : (
                    <ExpandMore sx={{ cursor: 'pointer', opacity: permission?.children?.length > 0 ? 1 : 0 }} onClick={() => handleCollapse(permission.id)} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: '8px', px: 0.8, cursor: 'pointer', '&:hover': { bgcolor: Colors.primary + '4D' } }}>
                    <Checkbox
                        size="small"
                        defaultValue={true}
                        checked={selectedPermissions.indexOf(permission.id) !== -1}
                        onClick={(e) => updateSelected(parentId, parentChild, permission.id, permission.children)}
                        sx={{ color: Colors.primary + 'b3', p: '0px !important', mr: 0.5 }}
                    />
                    <ListItemText
                        primary={permission.name}
                        onClick={(e) => updateSelected(parentId, parentChild, permission.id, permission.children)}
                        sx={{ color: Colors.gunMetal }}
                    />
                </Box>
            </ListItemButton>
            <Collapse in={expand.indexOf(permission.id) === -1} unmountOnExit>
                {nestedComments}
            </Collapse>
        </List>
    )
}

function UserPermissions() {

    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // *For Loading
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);

    // *For Permissions
    const [rolesPermissions, setRolesPermissions] = useState([]);

    // *For Check Box
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [permissions, setPermissions] = useState([])

    // *For Collapse
    const [expand, setExpand] = useState([]);

    // *For Get getRolesPermissions
    const getRolesPermissions = async () => {
        setLoader(true)
        try {
            let params = {
                user_id: id
            }
            const { data } = await RoleServices.getUserRolesPermissions(params)
            setRolesPermissions(data.permissions)
            selectDefaultPermission(data.permissions)
            console.log(formatPermissionData(data?.permissions))
            setPermissions(formatPermissionData(data?.permissions))
            data?.permissions.forEach(e => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            })
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }

    // *For Checkbox Handle
    const selectAllPermission = (parentId, parentChild, id, data) => {
        try {
            let updatedSelectedPermissions = [...selectedPermissions]
            const currentIndex = selectedPermissions.indexOf(id)
            if (parentId !== null) {
                const parentIndex = updatedSelectedPermissions.indexOf(parentId)
                if (parentIndex === -1) {
                    updatedSelectedPermissions.push(parentId)
                }
            }
            if (currentIndex === -1) {
                updatedSelectedPermissions.push(id)
                const nestedComments = (data) => {
                    if (data) {
                        data.map(element => {
                            const index = updatedSelectedPermissions.indexOf(element.id)
                            if (index === -1) {
                                updatedSelectedPermissions.push(element.id)
                            }
                            nestedComments(element.children)
                        })
                    }
                }
                nestedComments(data)
            } else {
                updatedSelectedPermissions.splice(currentIndex, 1)
                const nestedComments = (data) => {
                    if (data) {
                        data.map(element => {
                            const index = updatedSelectedPermissions.indexOf(element.id)
                            if (index !== -1) {
                                updatedSelectedPermissions.splice(index, 1)
                            }
                            nestedComments(element.children)
                        })
                    }
                }
                nestedComments(data)
            }
            // if (parentChild !== null) {
            //   let ids = []
            //   parentChild.forEach(element => {
            //     const index = updatedSelectedPermissions.indexOf(element.id)
            //     if (index !== -1) {
            //       ids.push(index)
            //     }
            //   });
            //   if (ids.length === 0) {
            //     const index = updatedSelectedPermissions.indexOf(parentId)
            //     if (index !== -1) {
            //       updatedSelectedPermissions.splice(index, 1)
            //     }
            //   }
            // }
            setSelectedPermissions(updatedSelectedPermissions)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    const selectDefaultPermission = (data) => {
        try {
            let array = []
            const nestedComments = (data) => {
                if (data) {
                    data.forEach(element => {
                        if (element.permitted === true) {
                            array.push(element.id)
                        }
                        nestedComments(element.children)
                    })
                }
            }
            nestedComments(data)
            setSelectedPermissions(array)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Collapse
    const handleCollapse = (id) => {
        const currentIndex = expand.indexOf(id);
        const newExpand = [...expand];

        if (currentIndex === -1) {
            newExpand.push(id);
        } else {
            newExpand.splice(currentIndex, 1);
        }

        setExpand(newExpand);
    };

    // *For Save Roles Permissions
    const saveRolesPermissions = async () => {
        setLoading(true)
        try {
            let obj = {
                role_id: state?.roleId,
                user_id: id,
                module_ids: selectedPermissions
            }
            const { message } = await RoleServices.updateUserRolesPermissions(obj)
            SuccessToaster(message)
            getSideNavigation()
            navigate('/user-list')
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoading(false)
        }
    }

    // *For Get Side Navigation
    const getSideNavigation = async () => {
        try {
            const { data } = await AuthServices.getSideNavigation()
            console.log(data);

            dispatch(addNavigation(addChildRoutes(data?.permissions)))
            dispatch(setPermission(getPermissionsRoutes(data?.permissions)))
        } catch (error) {
            ErrorToaster(error)
        }
    }

    useEffect(() => {
        if (id) {
            getRolesPermissions()
        }
    }, [id]);

    return (
        <Box sx={{ m: 4, mb: 2 }}>

            <Box onClick={() => navigate('/role-list')} sx={{ width: '100px', mb: 2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <IconButton
                    size="small"
                    sx={{
                        bgcolor: Colors.primary,
                        color: Colors.white,
                        '&:hover': {
                            bgcolor: Colors.primary,
                            color: Colors.white
                        }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, ml: 1 }}>
                    Back
                </Typography>
            </Box>

            <Box sx={{ my: 1, p: 5, bgcolor: Colors.white, borderRadius: 2 }}>

                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 3 }}>
                    Set Permissions for {state?.name} role
                </Typography>

                {loader ? (
                    <CircleLoading />
                ) : (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        {rolesPermissions?.map((permission, index) => {
                            return (
                                <Grid key={index} item md={4}>
                                    <List
                                        component="nav"
                                        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                                    >
                                        <ListItemButton disableGutters disableRipple disableTouchRipple
                                            sx={{
                                                p: 0,
                                                '.MuiCheckbox-root': { p: 0.8 },
                                                '.MuiTypography-root': { fontSize: 14 },
                                                '&:hover': { bgcolor: 'transparent', cursor: 'inherit' }
                                            }}
                                        >
                                            {expand.indexOf(permission.id) !== -1 ? (
                                                <ExpandLess sx={{ cursor: 'pointer', transform: 'rotate(90deg)', opacity: permission?.children?.length > 0 ? 1 : 0 }} onClick={() => handleCollapse(permission.id)} />
                                            ) : (
                                                <ExpandMore sx={{ cursor: 'pointer', opacity: permission?.children?.length > 0 ? 1 : 0 }} onClick={() => handleCollapse(permission.id)} />
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: '8px', px: 0.8, cursor: 'pointer', '&:hover': { bgcolor: Colors.primary + '4D' } }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedPermissions.indexOf(permission.id) !== -1}
                                                    onClick={(e) => selectAllPermission(null, null, permission.id, permission.children)}
                                                    sx={{ color: Colors.primary + 'b3', p: '0px !important', mr: 0.5 }}
                                                />
                                                <ListItemText
                                                    primary={permission.name}
                                                    onClick={(e) => selectAllPermission(null, null, permission.id, permission.children)}
                                                    sx={{ color: Colors.gunMetal }}
                                                />
                                            </Box>
                                        </ListItemButton>
                                        <Collapse in={expand.indexOf(permission.id) === -1} unmountOnExit>
                                            {permission?.children?.map((item, i) => (
                                                <PermissionList
                                                    key={i}
                                                    parentId={permission.id}
                                                    parentChild={permission.children}
                                                    permission={item}
                                                    selectedPermissions={selectedPermissions}
                                                    updateSelected={selectAllPermission}
                                                    expand={expand}
                                                    handleCollapse={(id) => handleCollapse(id)}
                                                />
                                            ))}
                                        </Collapse>
                                    </List>
                                </Grid>
                            )
                        })}
                    </Grid>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                <Box sx={{ flexGrow: 1 }} />
                <PrimaryButton
                    title="Save"
                    loading={loading}
                    onClick={() => saveRolesPermissions()}
                />
            </Box>

        </Box>
    )
}

export default UserPermissions