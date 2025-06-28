import { StylesConfig, ControlProps, MenuProps, OptionProps, PlaceholderProps, InputProps, SingleValueProps } from 'react-select';

// オプション型の定義
export interface SelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export const reactSelectStyles: StylesConfig<SelectOption, false> = {
  control: (provided: React.CSSProperties, state: ControlProps<SelectOption, false>) => ({
    ...provided,
    borderRadius: '0.5rem',
    borderColor: '#e5e7eb',
    backgroundColor: '#4b5563',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: '#d1d5db',
    },
  }),
  menu: (provided: React.CSSProperties, state: MenuProps<SelectOption, false>) => ({
    ...provided,
    backgroundColor: '#4b5563',
  }),
  option: (provided: React.CSSProperties, state: OptionProps<SelectOption, false>) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
    color: 'white',
  }),
  placeholder: (provided: React.CSSProperties, state: PlaceholderProps<SelectOption, false>) => ({
    ...provided,
    color: 'white',
  }),
  input: (provided: React.CSSProperties, state: InputProps<SelectOption, false>) => ({
    ...provided,
    color: 'white',
  }),
  singleValue: (provided: React.CSSProperties, state: SingleValueProps<SelectOption, false>) => ({
    ...provided,
    color: 'white',
  }),
}; 