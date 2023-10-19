const mysql = require('mysql');


const connection = mysql.createConnection({
  host: 'omar-server.trueddns.com',
  port: 52300,
  user: 'gnog',
  password: '29136111',
  database: 'SEHP_proj'
});


const bookingData = {
  "checkin_date": "2023-11-25",
  "checkout_date": "2023-11-27",
  "rooms": [
    {
      "room_type_id": "3",
      "num_rooms": 1
    }
  ],
  "guest_title": "Mr",
  "guest_first_name": "Patrawee",
  "guest_last_name": "songtuk",
  "guest_email": "Test1@mail.com",
  "guest_address": "Test1",
  "guest_telnum": "0800000000",
};

async function checkRoomAvailability(checkinDate, checkoutDate, rooms) {
  const availabilityPromises = rooms.map(async room => {
    const { room_type_id, num_rooms } = room;
    const availabilityQuery = `
      SELECT room_id, COUNT(*) AS available_rooms
      FROM room
      WHERE room_type_id = ${room_type_id}
        AND room_status = 'free'
        AND room_id NOT IN (
          SELECT room_id
          FROM booking_room
          WHERE booking_id IN (
            SELECT booking_id
            FROM booking
            WHERE (checkin_date BETWEEN '${checkinDate}' AND '${checkoutDate}' OR
                   checkout_date BETWEEN '${checkinDate}' AND '${checkoutDate}')
          )
        )
      GROUP BY room_id
      HAVING available_rooms >= ${num_rooms};
    `;

    return new Promise((resolve, reject) => {
      connection.query(availabilityQuery, (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            resolve(results[0].room_id);
          } else {
            resolve(null);
          }
        }
      });
    });
  });

  try {
    const roomIds = await Promise.all(availabilityPromises);
    // Check if all room types are available
    if (roomIds.every(roomId => roomId !== null)) {
      return roomIds;
    } else {
      return null; // Some room types are not available
    }
  } catch (error) {
    throw error;
  }
}


async function createBooking(bookingData) {
  try {
    const roomIds = await checkRoomAvailability(
      bookingData.checkin_date,
      bookingData.checkout_date,
      bookingData.rooms
    );

    if (roomIds !== null) {
      const guestId = Math.floor(Math.random() * 99999999) + 1;
      const guestInsertQuery = `
      INSERT INTO guest (guest_id, guest_title, guest_first_name, guest_last_name, guest_email, guest_address, guest_telnum)
      VALUES ('${guestId}', '${bookingData.guest_title}', '${bookingData.guest_first_name}', '${bookingData.guest_last_name}', '${bookingData.guest_email}', '${bookingData.guest_address}', '${bookingData.guest_telnum}');
    `;

      // Execute guest data insertion query
      connection.query(guestInsertQuery, (guestInsertError, guestInsertResults, guestInsertFields) => {
        if (guestInsertError) {
          console.error('Error inserting guest data:', guestInsertError);
        } else {
          // Guest data inserted successfully, retrieve the guest_id

          const bookingId = Math.floor(Math.random() * 99999999) + 1;
          // Proceed to create booking
          const insertBookingQuery = `
            INSERT INTO booking (booking_id, checkin_date, checkout_date, guest_id, booking_status, booking_note)
            VALUES ('${bookingId}','${bookingData.checkin_date}', '${bookingData.checkout_date}', ${guestId}, 'paid', 'Booking confirmed');
          `;

          // Execute booking insertion query
          connection.query(insertBookingQuery, (bookingInsertError, bookingInsertResults, bookingInsertFields) => {
            if (bookingInsertError) {
              console.error('Error creating booking:', bookingInsertError);
            } else {
              // Booking created successfully, update room_status and booking_room table
              bookingData.rooms.forEach(room => {
                const { room_type_id, num_rooms } = room;

                // Query room_id based on room_type_id
                const selectRoomIdQuery = `
                  SELECT room_id
                  FROM room
                  WHERE room_type_id = ${room_type_id}
                    AND room_status = 'free'
                  ORDER BY room_id ASC
                  LIMIT ${num_rooms};
                `;
                console.log('Select Room ID Query:', selectRoomIdQuery);

                connection.query(selectRoomIdQuery, (selectError, selectResults) => {
                  if (selectError || selectResults.length === 0) {
                    console.error(`Error selecting room_id for room_type_id ${room_type_id}:`, selectError);
                  } else {
                    const room_id = selectResults[0].room_id;


                    const updateRoomStatusQuery = `
                      UPDATE room
                      SET room_status = 'occupined'
                      WHERE room_id = ${room_id}
                      LIMIT ${num_rooms};
                    `;

                    const insertBookingRoomQuery = `
                      INSERT INTO booking_room (booking_id, room_id)
                      VALUES (${bookingId}, ${room_id});
                    `;

                    // Execute room status update and booking_room insertion queries
                    connection.query(updateRoomStatusQuery, (updateError, updateResults) => {
                      if (updateError) {
                        console.error('Error updating room status:', updateError);
                      } else {
                        console.log(`Room ${room_id} updated to 'booked'.`);
                        connection.query(insertBookingRoomQuery, (bookingRoomError, bookingRoomResults) => {
                          if (bookingRoomError) {
                            console.error('Error inserting into booking_room:', bookingRoomError);
                          } else {
                            console.log('Booking_room entry added successfully.');
                          }
                        });
                      }
                    });
                  }
                });
              });
              console.log('Booking created successfully!');
            }
          });
        }
      });
    } else {
      console.log('Some room types are not available for the specified dates.');
    }
  } catch (error) {
    console.error('Error checking room availability:', error);
  }
}

// Call the function to create the booking



fetch('http://localhost:5000/api/createBooking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bookingData)
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });


module.exports = {
  createBooking: createBooking
};

