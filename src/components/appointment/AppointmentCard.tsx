// src/components/appointment/AppointmentCard.tsx
import React from "react";
import type { Appointment } from "@/api/types.api";

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({
  appointment,
}) => (
  <div className="p-4 rounded-lg shadow bg-white">
    <div className="flex justify-between">
      <div>
        <div className="font-semibold">{appointment.client_name}</div>
        <div className="text-sm text-slate-500">
          {appointment.date} · {appointment.start_time}
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">
          ${appointment.total_amount.toFixed(2)}
        </div>
        <div className="text-sm text-slate-500">
          {appointment.technician_name}
        </div>
      </div>
    </div>
  </div>
);

export default AppointmentCard;
