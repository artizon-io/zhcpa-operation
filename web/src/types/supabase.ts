type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface Database {
  public: {
    Tables: {
      attendance: {
        Row: {
          check_date: string | null;
          check_in: boolean;
          check_source: string;
          check_time: string;
          id: string;
          opuser_id: string;
        };
        Insert: {
          check_date?: string | null;
          check_in: boolean;
          check_source: string;
          check_time: string;
          id: string;
          opuser_id: string;
        };
        Update: {
          check_date?: string | null;
          check_in?: boolean;
          check_source?: string;
          check_time?: string;
          id?: string;
          opuser_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "monthly_leave_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_monthly_attendance_view";
            referencedColumns: ["opuser_id"];
          }
        ];
      };
      holiday: {
        Row: {
          date: string;
          holiday_scheme_id: number;
          id: number;
          name: string;
        };
        Insert: {
          date: string;
          holiday_scheme_id: number;
          id?: number;
          name: string;
        };
        Update: {
          date?: string;
          holiday_scheme_id?: number;
          id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "holiday_holiday_scheme_id_fkey";
            columns: ["holiday_scheme_id"];
            referencedRelation: "holiday_scheme";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "holiday_holiday_scheme_id_fkey";
            columns: ["holiday_scheme_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["holiday_scheme_id"];
          }
        ];
      };
      holiday_scheme: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      leave: {
        Row: {
          id: string;
          leave_end_time: string;
          leave_start_time: string;
          leave_type: string;
          opuser_id: string;
          opuser_remark: string | null;
          record_create_time: string;
          status: string;
        };
        Insert: {
          id: string;
          leave_end_time: string;
          leave_start_time: string;
          leave_type: string;
          opuser_id: string;
          opuser_remark?: string | null;
          record_create_time: string;
          status: string;
        };
        Update: {
          id?: string;
          leave_end_time?: string;
          leave_start_time?: string;
          leave_type?: string;
          opuser_id?: string;
          opuser_remark?: string | null;
          record_create_time?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leave_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leave_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "monthly_leave_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "leave_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "leave_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_monthly_attendance_view";
            referencedColumns: ["opuser_id"];
          }
        ];
      };
      opuser: {
        Row: {
          department: string | null;
          email: string | null;
          employee_code: number | null;
          id: string;
          name: string;
          name_chinese: string | null;
          phone: string | null;
          rank: string | null;
        };
        Insert: {
          department?: string | null;
          email?: string | null;
          employee_code?: number | null;
          id: string;
          name: string;
          name_chinese?: string | null;
          phone?: string | null;
          rank?: string | null;
        };
        Update: {
          department?: string | null;
          email?: string | null;
          employee_code?: number | null;
          id?: string;
          name?: string;
          name_chinese?: string | null;
          phone?: string | null;
          rank?: string | null;
        };
        Relationships: [];
      };
      opuser_shift_assignment: {
        Row: {
          assign_date: string;
          id: number;
          job_code: string | null;
          opuser_id: string;
          shift_id: number | null;
        };
        Insert: {
          assign_date: string;
          id?: number;
          job_code?: string | null;
          opuser_id: string;
          shift_id?: number | null;
        };
        Update: {
          assign_date?: string;
          id?: number;
          job_code?: string | null;
          opuser_id?: string;
          shift_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "opuser_shift_assignment_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opuser_shift_assignment_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "monthly_leave_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "opuser_shift_assignment_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "opuser_shift_assignment_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_monthly_attendance_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "opuser_shift_assignment_shift_id_fkey";
            columns: ["shift_id"];
            referencedRelation: "shift";
            referencedColumns: ["id"];
          }
        ];
      };
      overtime: {
        Row: {
          id: string;
          location: string;
          opuser_id: string;
          opuser_remark: string | null;
          overtime_end_time: string;
          overtime_start_time: string;
          record_create_time: string;
          status: string;
        };
        Insert: {
          id: string;
          location: string;
          opuser_id: string;
          opuser_remark?: string | null;
          overtime_end_time: string;
          overtime_start_time: string;
          record_create_time: string;
          status: string;
        };
        Update: {
          id?: string;
          location?: string;
          opuser_id?: string;
          opuser_remark?: string | null;
          overtime_end_time?: string;
          overtime_start_time?: string;
          record_create_time?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "overtime_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "overtime_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "monthly_leave_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "overtime_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "overtime_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_monthly_attendance_view";
            referencedColumns: ["opuser_id"];
          }
        ];
      };
      shift: {
        Row: {
          break_duration: unknown;
          end_time: string | null;
          holiday_scheme_id: number | null;
          id: number;
          name: string;
          off_days: number[] | null;
          start_time: string;
        };
        Insert: {
          break_duration: unknown;
          end_time?: string | null;
          holiday_scheme_id?: number | null;
          id?: number;
          name: string;
          off_days?: number[] | null;
          start_time: string;
        };
        Update: {
          break_duration?: unknown;
          end_time?: string | null;
          holiday_scheme_id?: number | null;
          id?: number;
          name?: string;
          off_days?: number[] | null;
          start_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shift_holiday_scheme_id_fkey";
            columns: ["holiday_scheme_id"];
            referencedRelation: "holiday_scheme";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_holiday_scheme_id_fkey";
            columns: ["holiday_scheme_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["holiday_scheme_id"];
          }
        ];
      };
    };
    Views: {
      daily_attendance_view: {
        Row: {
          attendance_date: string | null;
          attendance_duration_including_break: unknown | null;
          attendance_duration_including_break_hours: number | null;
          attendance_duration_including_break_minutes: number | null;
          check_in_times: string[] | null;
          check_out_times: string[] | null;
          holiday_scheme_name: string | null;
          is_record_valid: boolean | null;
          name: string | null;
          opuser_id: string | null;
          shift_assign_date: string | null;
          shift_break_duration: unknown | null;
          shift_end_time: string | null;
          shift_job_code: string | null;
          shift_name: string | null;
          shift_start_time: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "monthly_leave_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_daily_attendance_view";
            referencedColumns: ["opuser_id"];
          },
          {
            foreignKeyName: "attendance_opuser_id_fkey";
            columns: ["opuser_id"];
            referencedRelation: "opuser_monthly_attendance_view";
            referencedColumns: ["opuser_id"];
          }
        ];
      };
      monthly_leave_view: {
        Row: {
          leaves: string[] | null;
          month: string | null;
          name: string | null;
          opuser_id: string | null;
        };
        Relationships: [];
      };
      opuser_daily_attendance_view: {
        Row: {
          attendance_date: string | null;
          check_in_times: string[] | null;
          check_out_times: string[] | null;
          holiday_id: number | null;
          holiday_name: string | null;
          holiday_scheme_id: number | null;
          holiday_scheme_name: string | null;
          is_holiday: boolean | null;
          is_record_valid: boolean | null;
          is_shift_off_day: boolean | null;
          name: string | null;
          opuser_id: string | null;
          shift_assign_date: string | null;
          shift_break_duration: unknown | null;
          shift_end_time: string | null;
          shift_job_code: string | null;
          shift_name: string | null;
          shift_start_time: string | null;
        };
        Relationships: [];
      };
      opuser_monthly_attendance_view: {
        Row: {
          attendance_duration: unknown | null;
          attendance_duration_hours: number | null;
          attendance_duration_including_break: unknown | null;
          attendance_duration_minutes: number | null;
          attendance_month: string | null;
          name: string | null;
          opuser_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      array_sort: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      array_sub_then_sum:
        | {
            Args: {
              array_a: number[];
              array_b: number[];
            };
            Returns: number;
          }
        | {
            Args: {
              array_a: string[];
              array_b: string[];
            };
            Returns: unknown;
          };
      get_attendance_earliest_month: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_attendance_latest_month: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      time_array_sub_then_sum: {
        Args: {
          array_a: string[];
          array_b: string[];
        };
        Returns: unknown;
      };
      time_interval_array_sum: {
        Args: {
          arr: unknown[];
        };
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
