import { ControlProps, InputProps, MenuProps, OptionProps, PlaceholderProps, SingleValueProps, StylesConfig } from 'react-select';

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
    borderColor: 'var(--hud-primary)',
    backgroundColor: 'var(--panel)',
    color: 'var(--text-primary)',
    boxShadow: '0 0 0 0 rgba(0,0,0,0)',
    '&:hover': {
      borderColor: 'var(--hud-primary)',
    },
  }),
  menu: (provided: React.CSSProperties, state: MenuProps<SelectOption, false>) => ({
    ...provided,
    backgroundColor: 'rgba(0,0,0,0.85)',
    border: '1px solid var(--hud-primary)',
    color: 'var(--text-primary)'
  }),
  option: (provided: React.CSSProperties, state: OptionProps<SelectOption, false>) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  }),
  placeholder: (provided: React.CSSProperties, state: PlaceholderProps<SelectOption, false>) => ({
    ...provided,
    color: 'var(--text-primary)',
  }),
  input: (provided: React.CSSProperties, state: InputProps<SelectOption, false>) => ({
    ...provided,
    color: 'var(--text-primary)',
  }),
  singleValue: (provided: React.CSSProperties, state: SingleValueProps<SelectOption, false>) => ({
    ...provided,
    color: 'var(--text-primary)',
  }),
};
