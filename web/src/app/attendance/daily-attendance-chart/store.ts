import { DateTime } from "luxon";
import { create } from "zustand";

export const useDailyAttendanceChart = create<{
  open: (opuserId: string, name: string, month: DateTime) => void;
  inputs?: {
    opuserId: string;
    name: string;
    month: DateTime;
  };
}>((set) => ({
  open: (opuserId, name, month) => {
    set({
      inputs: {
        opuserId,
        name,
        month,
      },
    });
  },
  inputs: undefined,
}));
