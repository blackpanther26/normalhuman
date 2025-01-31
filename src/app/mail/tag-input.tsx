import useThreads from "@/hooks/use-threads";
import { api } from "@/trpc/react";
import React from "react";
import Avatar from "react-avatar";
import Select from "react-select";

type Props = {
  placeholder: string;
  label: string;
  onChange: (value: { label: string; value: string }[]) => void;
  value: { label: string; value: string }[];
};

const TagInput = ({
  placeholder,
  label,
  onChange,
  value,
}: Props) => {
  const { accountId } = useThreads();
  const { data: suggestions } = api.account.getSuggestions.useQuery({
    accountId,
  });
  const [inputValue, setInputValue] = React.useState('');

  if (!suggestions) {
    return null;
  }

  const options = suggestions.map((s) => ({
    label: (
      <div className="flex items-center gap-2">
        <Avatar
          name={s.address || " "}
          size="25"
          textSizeRatio={2}
          round={true}
        />
        <span>{s.address}</span>
      </div>
    ),
    value: s.address,
  }));

  return (
    <div className="flex items-center rounded-md border">
      <span className="ml-3 text-sm text-gray-500">{label}</span>
      <Select
        value={value}
        // @ts-ignore
        onChange={onChange}
        onInputChange={setInputValue}
        // @ts-ignore
        options={inputValue ? options?.concat({ label: inputValue, value: inputValue }) : options}
        isMulti
        placeholder={placeholder}
        className="w-full"
        classNames={{
          control: () =>
            '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none',
          multiValue: () => 
            '!bg-gray-200 dark:!bg-gray-700', // Light mode bg set to gray-200
          multiValueLabel: () => 
            '!text-black dark:!text-white dark:bg-gray-700 rounded-md',
          menu: () =>
            '!bg-white dark:!bg-gray-800 dark:border-gray-700', // Explicit white background for light mode, gray-800 for dark mode
          option: (state) =>
            `!bg-white dark:!bg-gray-800 !text-black dark:!text-white ${
              state.isFocused ? '!bg-blue-100 dark:!bg-blue-600' : '' // Focused hover blue
            } ${
              state.isSelected ? '!bg-blue-500 dark:!bg-blue-700 !text-white' : '' // Selected blue
            }`,
          input: () => 
            '!text-black dark:!text-white', // Ensure text is white in dark mode
          singleValue: () => 
            '!text-black dark:!text-white', // Ensure text is white in dark mode
          menuList: () => 
            '!bg-white dark:!bg-gray-800 dark:border-gray-700', // Ensure proper background color
          clearIndicator: () => 
            '!text-gray-500 dark:text-gray-400 hover:!text-gray-700 dark:hover:!text-gray-200',
          dropdownIndicator: () => 
            '!text-gray-500 dark:text-gray-400 hover:!text-gray-700 dark:hover:!text-gray-200',
          indicatorSeparator: () => 
            '!bg-gray-200 dark:bg-gray-700',
        }}
        classNamePrefix="select"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            neutral0: 'var(--background, white)',    // Set white as default for light mode
            primary: '#3b82f6',                      // Primary blue color for both modes
            primary25: '#bfdbfe',                    // Light blue hover color for light mode
            primary50: '#93c5fd',                    // Blue selection color for light mode
            neutral5: 'var(--border)',         
            neutral10: 'var(--input)',         
            neutral20: 'var(--border)',        
            neutral30: 'var(--border)',        
            neutral40: 'var(--muted-foreground)', 
            neutral50: 'var(--muted-foreground)', 
            neutral60: 'var(--muted-foreground)', 
            neutral70: 'var(--foreground)',    
            neutral80: 'var(--foreground)',    
            neutral90: 'var(--foreground)',    
          },
        })}
      />
    </div>
  );
};

export default TagInput;
