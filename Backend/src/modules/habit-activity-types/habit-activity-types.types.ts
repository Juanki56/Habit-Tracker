export interface HabitActivityTypeAssignment {
  activity_type_id: string;
  activity_types: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
  };
}