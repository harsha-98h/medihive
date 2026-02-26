const fs = require('fs');
let c = fs.readFileSync('src/controllers/appointmentController.ts', 'utf8');
const newFn = `

export const markAppointmentDone = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can mark appointments as done' });
    }
    const doctorResult = await pool.query(
      'SELECT doctor_id FROM doctor_profiles WHERE user_id = $1',
      [user.user_id]
    );
    if (doctorResult.rowCount === 0) {
      return res.status(400).json({ message: 'Doctor profile not found' });
    }
    const doctor_id = doctorResult.rows[0].doctor_id;
    const apptResult = await pool.query(
      'SELECT appointment_id, doctor_id FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (apptResult.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (apptResult.rows[0].doctor_id !== doctor_id) {
      return res.status(403).json({ message: 'Not your appointment' });
    }
    await pool.query(
      "UPDATE appointments SET status = 'done', updated_at = NOW() WHERE appointment_id = $1",
      [id]
    );
    return res.json({ message: 'Appointment marked as done' });
  } catch (err) {
    console.error('markAppointmentDone error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
`;
c = c + newFn;
fs.writeFileSync('src/controllers/appointmentController.ts', c);
console.log('Done');

