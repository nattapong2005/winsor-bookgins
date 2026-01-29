import prisma from '../utils/prisma.js';

// Create a new booking
export const createBooking = async (req, res) => {
    const {
        customer_name,
        phone,
        service_type,
        booking_date,
        sub_district,
        district,
        province,
        postcode,
        address_detail,
        notes,
    } = req.body;

    let imageUrl = req.body.image_url || null;
    if (req.file) {
        imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    }

    try {
        const bookingData = {
            customer_name,
            phone,
            service_type,
            booking_date: new Date(booking_date),
            sub_district,
            district,
            province,
            postcode,
            address_detail,
            image_url: imageUrl,
            notes,
        };

        // If user is authenticated, link the booking
        if (req.user && req.user.id) {
            bookingData.customerId = req.user.id;
        }

        const booking = await prisma.booking.create({
            data: bookingData,
        });
        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// Get bookings (filtered by role)
export const getBookings = async (req, res) => {
    const role = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;

    try {
        let where = {};

        // If authenticated user is a CUSTOMER/USER, only show their bookings
        if (role === 'CUSTOMER' || role === 'USER') { // Flexible check
            // Check both customerId (new bookings) and phone (legacy) if possible
            // But Prisma OR requires care.
            // Let's stick to customerId preference, or phone fallback
            where = {
                OR: [
                    { customerId: userId },
                    { phone: req.user.phone } // Fallback for old bookings
                ]
            };
        }


        // Admins and Coordinators see all (no where clause added)
        // If role is NOT ADMIN or COORDINATOR, we filter?
        // Actually the logic above handles CUSTOMER/USER.
        // If it falls through here, it implies privileged access (ADMIN/STAFF/COORDINATOR)

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { booking_date: 'asc' },
            include: {
                customer: { select: { username: true, full_name: true, phone: true } },
                technician: { select: { username: true, full_name: true, phone: true } }
            }
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

// Update booking
export const updateBooking = async (req, res) => {
    const { id } = req.params;
    const updatePayload = req.body;

    const role = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;
    const phone = req.user ? req.user.phone : null;

    try {
        const booking = await prisma.booking.findUnique({ where: { id: id } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Authorization Check
        if (role === 'CUSTOMER' || role === 'USER') {
            // Check ownership
            const isOwner = booking.customerId === userId || booking.phone === phone;
            if (!isOwner) {
                return res.status(403).json({ message: 'Not authorized to update this booking' });
            }
        }

        const updateData = {};
        const allowedFieldsForCustomer = ['status', 'booking_date', 'notes']; // Customer can generally only cancel (update status) or maybe reschedule
        const allowedFieldsForAdmin = [
            'customer_name', 'phone', 'service_type', 'booking_date',
            'sub_district', 'district', 'province', 'postcode',
            'address_detail', 'status', 'notes', 'image_url', 'technicianId'
        ];

        const allowedFields = (role === 'ADMIN' || role === 'TECHNICIAN' || role === 'COORDINATOR')
            ? allowedFieldsForAdmin
            : allowedFieldsForCustomer;

        for (const field of allowedFields) {
            if (updatePayload[field] !== undefined) {
                // Customers can only set status to 'ยกเลิก' (Cancelled)
                if ((role === 'CUSTOMER' || role === 'USER') && field === 'status' && updatePayload[field] !== 'ยกเลิก') {
                    continue;
                }
                updateData[field] = updatePayload[field];
            }
        }

        if (updateData.booking_date) {
            updateData.booking_date = new Date(updateData.booking_date);
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: id },
            data: updateData
        });

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
};

export const getBookingStats = async (req, res) => {
    try {
        const total = await prisma.booking.count();
        const byStatus = await prisma.booking.groupBy({
            by: ['status'],
            _count: { status: true }
        });
        res.json({ total, byStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
}

// Public search by phone
export const searchBookingsByPhone = async (req, res) => {
    const { phone } = req.params;
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                phone: phone
            },
            orderBy: { booking_date: 'desc' }
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error searching bookings', error: error.message });
    }
};

// Delete booking
export const deleteBooking = async (req, res) => {
    const { id } = req.params;
    const role = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;
    const phone = req.user ? req.user.phone : null;

    try {
        const booking = await prisma.booking.findUnique({ where: { id: id } });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Authorization Check
        if (role === 'CUSTOMER' || role === 'USER') {
            const isOwner = booking.customerId === userId || booking.phone === phone;
            if (!isOwner) {
                return res.status(403).json({ message: 'Not authorized to delete this booking' });
            }
            // Optional: Prevent deleting if status is 'Completed'?
            if (booking.status === 'เสร็จสิ้น') {
                return res.status(403).json({ message: 'Cannot delete completed booking' });
            }
        }

        await prisma.booking.delete({
            where: { id: id },
        });
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking', error: error.message });
    }
};
