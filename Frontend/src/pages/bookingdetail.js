
import { useLocation, useNavigate } from "react-router-dom"
import { React, useEffect, useState } from "react"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function BookingDetail(){
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(true);
    const [admin, setAdmin] = useState([]);
    const location = useLocation();
    const MySwal = withReactContent(Swal);
    const [guestinfo, setGuest_Info] = useState([]);
    const [Fetch, setFetch] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);
        
        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };
        
        fetch("http://omar-server.trueddns.com:52302/api/admin/auth", requestOptions)
          .then(response => response.json())
          .then(result => {
            if(result.status === 'ok'){
                setAdmin(result.user)
                setIsLoaded(false)
            }else if(result.status === 'forbidden'){
                MySwal.fire({
                    html : <i>{result.message}</i>,
                    icon : 'error'
                }).then((value) => {
                    navigate('/loginadmin')
                })
            }
          })
          .catch(error => console.log('error', error));
      });
      useEffect(()=>{
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
        "booking_id": location.state.booking_id
        });

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("http://omar-server.trueddns.com:52302/api/admin/viewBookingDetail", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            setGuest_Info(result)
            setFetch(true)
        })
        .catch(error => {
            console.log('error', error)
            setFetch(false)
    });
      },[])
      const update_room_status = (room_id) => {
        console.log(room_id,'check_out')
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
        "room_id": room_id,
        "status": "check_out"
        });

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
        };

        fetch("http://omar-server.trueddns.com:52302/api/admin/updateRoomStatus", requestOptions)
        .then(response => response.json())
        .then(result => {
                            if(result.success === true){
                                console.log(result)
                                if(result.success === true){
                                    MySwal.fire({
                                      html : <i>Room ID: {room_id} {result.message}</i>,
                                      icon : 'success'
                                    }).then((value) => {
                                        var myHeaders = new Headers();
                                        myHeaders.append("Content-Type", "application/json");
                                
                                        var raw = JSON.stringify({
                                        "booking_id": location.state.booking_id
                                        });
                                
                                        var requestOptions = {
                                        method: 'POST',
                                        headers: myHeaders,
                                        body: raw,
                                        redirect: 'follow'
                                        };
                                
                                        fetch("http://omar-server.trueddns.com:52302/api/admin/viewBookingDetail", requestOptions)
                                        .then(response => response.json())
                                        .then(result => {
                                            console.log(result)
                                            setGuest_Info(result)
                                            setFetch(true)
                                        })
                                        .catch(error => {
                                            console.log('error', error)
                                            setFetch(false)
                                    });})
                            }
        }})
        .catch(error => console.log('error', error));
      }

    if(isLoaded) return(<div>Loading...</div>)

    return(
        <div>
            <h3>Welcome To Booking Detail Page. {admin.fname}</h3>
            {Fetch && 
                <div>
                    <p>Booking ID: {guestinfo.bookingDetails.booking_id}</p>
                    <p>Booking Note: {guestinfo.bookingDetails.booking_note}</p>
                    <p>Booking Status: {guestinfo.bookingDetails.booking_status}</p>
                    <p>Check In: {guestinfo.bookingDetails.checkin_date}</p>
                    <p>Check Out: {guestinfo.bookingDetails.checkout_date}</p>
                    <p>Guest Title: {guestinfo.bookingDetails.guest_title}</p>
                    <p>Guest Name: {guestinfo.bookingDetails.guest_first_name} {guestinfo.bookingDetails.guest_last_name}</p>
                    <p>Guest MiddleName: {guestinfo.bookingDetails.guest_middle_name}</p>
                    <p>Guest Email: {guestinfo.bookingDetails.guest_email}</p>
                    <p>Guest Telnumber:{guestinfo.bookingDetails.guest_telnum}</p>
                    <p>Guest Address:{guestinfo.bookingDetails.guest_address}</p>
                    {
                        guestinfo.bookingDetails.rooms.map((item) => (
                            <div key={item.id}>
                                <p>Room ID: {item.room_id}</p>
                                <p>Room Type: {item.room_type_name}</p>
                                <p>Room Status: {item.room_status}</p>
                                {item.room_status === "free" && <button onClick={() => update_room_status(item.room_id)}>Check Out</button>}
                            </div>
                        ))}
                </div>
            }
            
        </div>
    )
}