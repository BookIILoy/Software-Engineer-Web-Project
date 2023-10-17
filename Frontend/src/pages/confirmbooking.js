import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Confirmbooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const firstdate_Booking = location.state.firstdate_booking;
    const enddate_Booking = location.state.enddate_booking;
    const StdRoom_Detail = location.state.Bookingroom.standard;
    const DlxRoom_Detail = location.state.Bookingroom.deluxe;
    const LuxRoom_Detail = location.state.Bookingroom.luxury;

    const handleSubmit_back = (e) => {
        e.preventDefault();
            navigate('/editbookingroom', {replace: true, state:{firstdate_Booking, enddate_Booking}});
    }
    const handleSubmit_payment = (e) => {
        e.preventDefault();
            navigate('/payment', {replace: true, state:{firstdate_Booking, enddate_Booking, StdRoom_Detail, DlxRoom_Detail, LuxRoom_Detail}});
    }
    return (
        <div>
            <h3 className="title"> Confirm Booking</h3>
            <p>Room Detail:</p>
            <p>FirstDate Booking: {firstdate_Booking} </p>
            <p>EndDate Booking: {enddate_Booking} </p>
            <p>Standard Room : {StdRoom_Detail} rooms</p>
            <p>Deluxe Room : {DlxRoom_Detail} rooms</p>
            <p>Luxury Room : {LuxRoom_Detail} rooms</p>
            <form onSubmit={handleSubmit_back}>
                <button type="submit">Back</button>
            </form>
            <form onSubmit={handleSubmit_payment}>
                <button type="submit">Confirm</button>
            </form>
        </div>
    )
}