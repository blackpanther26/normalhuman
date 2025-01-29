import useThreads from "@/hooks/use-threads";
import { api } from "@/trpc/react";
import React, { use } from "react";
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
  const [inputValue,setInputValue] = React.useState('')

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
        options={inputValue?options?.concat({label:inputValue,value:inputValue}):options}
        isMulti
        placeholder={placeholder}
        className="w-full"
        classNames={{
            control: () => {
                return '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent'
            },
            multiValue: () => {
                return 'dark:!bg-gray-700'
            },
            multiValueLabel: () => {
                return 'dark:text-white dark:bg-gray-700 rounded-md'
            }
        }}
        classNamePrefix="select"
      />
    </div>
  );
};

export default TagInput;
