// components/TextareaInput.jsx
import { useFormContext } from "react-hook-form";

export default function TextareaInput({ id, label, placeholder, rows = 4 }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1 max-w-md">
      <label htmlFor={id} className="text-base font-medium">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        {...register(id)}
        className={`outline-none md:py-2.5 py-2 px-3 rounded border ${
          errors[id] ? "border-red-500" : "border-gray-500/40"
        } resize-none`}
      ></textarea>
      {errors[id] && (
        <p className="text-red-500 text-sm mt-1">{errors[id].message}</p>
      )}
    </div>
  );
}
