import { Field, TextArea, TextInput } from "../../components/ui/FormControls";
import type { FieldDefinition } from "../../types/activity";

function humanize(key: string): string {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

interface ActivityFieldInputProps {
  definition: FieldDefinition;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}

// El backend todavía no expone las opciones válidas de 'select'/'multi_select'
// (activity_field_definitions no las trae), así que por ahora caen a texto libre.
export function ActivityFieldInput({ definition, value, onChange }: ActivityFieldInputProps) {
  const label = humanize(definition.key) + (definition.is_required ? " *" : "");

  if (definition.field_type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    );
  }

  if (definition.field_type === "long_text") {
    return (
      <Field label={label}>
        <TextArea
          rows={3}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={definition.is_required}
        />
      </Field>
    );
  }

  const inputType =
    definition.field_type === "date"
      ? "date"
      : definition.field_type === "datetime"
        ? "datetime-local"
        : definition.field_type === "number" || definition.field_type === "duration" || definition.field_type === "rating"
          ? "number"
          : definition.field_type === "url"
            ? "url"
            : "text";

  const placeholder = definition.field_type === "multi_select" ? "Separa cada valor con comas" : undefined;

  return (
    <Field label={label}>
      <TextInput
        type={inputType}
        placeholder={placeholder}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={definition.is_required}
      />
    </Field>
  );
}
