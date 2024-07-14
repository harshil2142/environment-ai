import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface InputWrapperProps {
  className?: string;
  form: any;
  name: string;
  required?: boolean;
  title: string;
  placeholder?: string;
  renderComponent: (_props: {
    className: string;
    placeholder: string;
  }) => JSX.Element;
}

function InputWrapper({
  form,
  name,
  title,
  required = false,
  className = "",
  placeholder = "",
  renderComponent,
}: InputWrapperProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="mb-2 text-lg">{title}</FormLabel>
          <span className="text-destructive">{required ? " *" : ""}</span>
          <FormControl>
            {renderComponent({
              className,
              placeholder,
              ...field,
            })}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default InputWrapper;
