import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Tooltip,
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import CustomerServices from "services/Customer";
import { showErrorToast } from "components/NewToaster";
import { SuccessToaster } from "components/Toaster";


const localizer = momentLocalizer(moment);

function Holidays() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialog2, setOpenDialog2] = useState(false);
    const [holidayReason, setHolidayReason] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState(null)
    const [id, setId] = useState(null)
    // ✅ Fetch and map holidays
    const fetchLeaves = async (
        year = moment().year(),
        month = moment().month() + 1 // month is zero-indexed
    ) => {
        try {
            const params = { year, month };
            const { data } = await CustomerServices.getHolidays(params);
            const formattedEvents = data?.holidays?.map((holiday) => ({
                id: holiday.id,
                title: holiday.name,
                description: `${holiday.description}`,
                tooltip: `${holiday.name} - ${holiday.description}`,
                start: new Date(holiday.date),
                end: new Date(holiday.date),
                allDay: true,
            })) || [];

            setEvents(formattedEvents);
    
} catch (err) {
    showErrorToast("Failed to load holidays");
}
};


useEffect(() => {
    fetchLeaves();
}, []);

const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);

    const clickedDate = moment(start).format("YYYY-MM-DD");
    console.log(events, 'events');

    // Find if a holiday already exists on this date
    const existingHoliday = events.find(event =>
        moment(event.start).isSame(clickedDate)
    );
    console.log(existingHoliday, 'existingHoliday');

    if (existingHoliday) {
        setId(existingHoliday.id || "");
        setName(existingHoliday.title || "");
        setDescription(existingHoliday.description || "");
        setHolidayReason(existingHoliday.name || "");
        setOpenDialog2(true);
    } else {
        setName("");
        setDescription("");
        setHolidayReason("");
        setOpenDialog(true);
    }


};


const handleSaveHoliday = async () => {
    if (!name.trim() || !description.trim()) {
        showErrorToast("Name and Description is required.");
        return;
    }

    try {
        const params = {
            date: selectedDate,
            description: description,
            name: name,
        };

        const { message } = await CustomerServices.addHoliday(params);
        SuccessToaster(message);
        setOpenDialog(false);
        fetchLeaves();
    } catch (err) {
        showErrorToast("Failed to mark as holiday");
    }
};
const handleSaveHoliday2 = async () => {
    if (!name.trim() || !description.trim()) {
        showErrorToast("Name and Description is required.");
        return;
    }

    try {
        const params = {
            id: id,

            date: selectedDate,
            description: description,
            name: name,
        };

        const { message } = await CustomerServices.updateHoliday(params);
        SuccessToaster(message);
        setOpenDialog2(false);
        fetchLeaves();
    } catch (err) {
        showErrorToast("Failed to mark as holiday");
    }
};

const handleMonthChange = (newDate) => {
    const month = moment(newDate).month() + 1; // month is 0-indexed
    const year = moment(newDate).year();

    // Optional: console.log or fetch holidays for new month
    console.log("Changed to:", month, year);

    // Fetch holidays for that month/year
    fetchLeaves(year, month);
};

// ✅ Red dot style for holidays
const eventStyleGetter = () => ({
    style: {
        backgroundColor: "red",

        padding: "4px",

        color: "white",
        textAlign: 'center',
        border: "none",
    },
});

// ✅ Tooltip renderer
const CustomEvent = ({ event }) => (
    <Tooltip title={event.tooltip || event.title}>
        <span style={{ color: "white", width: '100%' }}>{event.tooltip}</span>
    </Tooltip>
);

return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Holiday Calendar</Typography>

        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            views={['month']}
            style={{ height: 600 }}
            onSelectSlot={handleSelectSlot}
            onNavigate={handleMonthChange}  // 👈 handles month change
            eventPropGetter={eventStyleGetter}
            components={{
                event: CustomEvent,
            }}
        />


        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>
                Mark Holiday - {moment(selectedDate).format("Do MMM YYYY")}
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}

                    sx={{ mt: 2 }}
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveHoliday}>Confirm</Button>
            </DialogActions>
        </Dialog>


        <Dialog open={openDialog2} onClose={() => setOpenDialog2(false)}>
            <DialogTitle>
                Mark Holiday - {moment(selectedDate).format("Do MMM YYYY")}
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}

                    sx={{ mt: 2 }}
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDialog2(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveHoliday2}>Update</Button>
            </DialogActions>
        </Dialog>
    </Box>
);
}

export default Holidays;
