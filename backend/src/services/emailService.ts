import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentConfirmation({
  patientEmail,
  patientName,
  doctorName,
  specialty,
  appointmentTime
}: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  appointmentTime: string;
}) {
  const date = new Date(appointmentTime).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short"
  });

  await resend.emails.send({
    from: "MediHive <onboarding@resend.dev>",
    to: patientEmail,
    subject: "Appointment Confirmed - MediHive",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
        <h1 style="color: #2dd4bf; margin-bottom: 8px;">MediHive</h1>
        <h2 style="color: #f8fafc;">Appointment Confirmed!</h2>
        <p style="color: #94a3b8;">Hi ${patientName},</p>
        <p style="color: #94a3b8;">Your appointment has been successfully booked.</p>
        <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #f8fafc;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 8px 0; color: #f8fafc;"><strong>Specialty:</strong> ${specialty}</p>
          <p style="margin: 8px 0; color: #2dd4bf;"><strong>Date & Time:</strong> ${date}</p>
        </div>
        <p style="color: #94a3b8;">Please arrive 10 minutes early.</p>
        <p style="color: #64748b; font-size: 12px;">MediHive Medical Platform</p>
      </div>
    `
  });

  console.log("Confirmation email sent to:", patientEmail);
}
