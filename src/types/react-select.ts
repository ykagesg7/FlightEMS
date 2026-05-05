// React Select専用型定義ファイル
// RoutePlanning.tsxで使用されるReact Select関連の型定義

// React Select基本オプション型定義
export interface ReactSelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

// React Selectグループオプション型定義
export interface ReactSelectGroupOption {
  label: string;
  options: ReactSelectOption[];
}

// React Select状態型定義
export interface ReactSelectState {
  isFocused?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  [key: string]: unknown;
}

// React Selectスタイルプロパティ型定義
export interface ReactSelectStylesProps {
  isFocused?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  [key: string]: unknown;
}

// React Selectコンポーネントプロパティ型定義
export interface ReactSelectComponentProps {
  options: ReactSelectOption[] | ReactSelectGroupOption[];
  value?: ReactSelectOption | ReactSelectOption[] | null;
  onChange?: (option: ReactSelectOption | ReactSelectOption[] | null) => void;
  onInputChange?: (inputValue: string) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoading?: boolean;
  menuIsOpen?: boolean;
  closeMenuOnSelect?: boolean;
  blurInputOnSelect?: boolean;
  captureMenuScroll?: boolean;
  hideSelectedOptions?: boolean;
  isOptionDisabled?: (option: ReactSelectOption) => boolean;
  filterOption?: (option: ReactSelectOption, inputValue: string) => boolean;
  formatOptionLabel?: (option: ReactSelectOption, context: { context: string }) => React.ReactNode;
  noOptionsMessage?: (obj: { inputValue: string }) => string | null;
  loadingMessage?: (obj: { inputValue: string }) => string | null;
  styles?: Record<string, (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties>;
  className?: string;
  classNamePrefix?: string;
  theme?: (theme: Record<string, unknown>) => Record<string, unknown>;
  components?: Record<string, React.ComponentType<Record<string, unknown>>>;
}

// カスタムオプション型の拡張
export interface CustomSelectOption extends ReactSelectOption {
  name?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  properties?: Record<string, unknown>;
  ch?: string;
  frequency?: string;
}

// カスタムグループオプション型の拡張
export interface CustomGroupOption extends ReactSelectGroupOption {
  options: CustomSelectOption[];
}

// React Selectコントロール型定義
export interface ReactSelectControlProps {
  children: React.ReactNode;
  innerRef: React.Ref<HTMLElement>;
  innerProps: React.HTMLAttributes<HTMLElement>;
  isDisabled: boolean;
  isFocused: boolean;
  isMenuOpen: boolean;
  selectProps: ReactSelectSelectProps;
}

// React Selectメニュー型定義
export interface ReactSelectMenuProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
}

// React Selectオプション型定義
export interface ReactSelectOptionProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  isDisabled: boolean;
  isFocused: boolean;
  isSelected: boolean;
  selectProps: ReactSelectSelectProps;
  data: ReactSelectOption;
}

// React Selectプレースホルダー型定義
export interface ReactSelectPlaceholderProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
}

// React Select単一値型定義
export interface ReactSelectSingleValueProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
  data: ReactSelectOption;
}

// React Select入力型定義
export interface ReactSelectInputProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
}

// React Select値コンテナ型定義
export interface ReactSelectValueContainerProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
  hasValue: boolean;
  isMulti: boolean;
}

// React Selectインジケーター型定義
export interface ReactSelectIndicatorProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
  isDisabled: boolean;
  isFocused: boolean;
}

// React Selectセパレーター型定義
export interface ReactSelectSeparatorProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
  isDisabled: boolean;
  isFocused: boolean;
}

// React Selectグループ型定義
export interface ReactSelectGroupProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
  data: ReactSelectGroupOption;
  isDisabled: boolean;
  isFocused: boolean;
}

// React Selectグループヘッダー型定義
export interface ReactSelectGroupHeadingProps {
  children: React.ReactNode;
  innerProps: React.HTMLAttributes<HTMLElement>;
  selectProps: ReactSelectSelectProps;
  data: ReactSelectGroupOption;
}

// React Selectセレクトプロパティ型定義
export interface ReactSelectSelectProps {
  options: ReactSelectOption[] | ReactSelectGroupOption[];
  value?: ReactSelectOption | ReactSelectOption[] | null;
  onChange?: (option: ReactSelectOption | ReactSelectOption[] | null) => void;
  onInputChange?: (inputValue: string) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoading?: boolean;
  menuIsOpen?: boolean;
  closeMenuOnSelect?: boolean;
  blurInputOnSelect?: boolean;
  captureMenuScroll?: boolean;
  hideSelectedOptions?: boolean;
  isOptionDisabled?: (option: ReactSelectOption) => boolean;
  filterOption?: (option: ReactSelectOption, inputValue: string) => boolean;
  formatOptionLabel?: (option: ReactSelectOption, context: { context: string }) => React.ReactNode;
  noOptionsMessage?: (obj: { inputValue: string }) => string | null;
  loadingMessage?: (obj: { inputValue: string }) => string | null;
  styles?: Record<string, (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties>;
  className?: string;
  classNamePrefix?: string;
  theme?: (theme: Record<string, unknown>) => Record<string, unknown>;
  components?: Record<string, React.ComponentType<Record<string, unknown>>>;
}

// React Selectカスタムスタイル型定義
export interface ReactSelectCustomStyles {
  control?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  menu?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  option?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  placeholder?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  singleValue?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  input?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  valueContainer?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  indicatorsContainer?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  indicatorSeparator?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  dropdownIndicator?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  clearIndicator?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  group?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  groupHeading?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  menuList?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  multiValue?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  multiValueLabel?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  multiValueRemove?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  noOptionsMessage?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
  loadingMessage?: (provided: React.CSSProperties, state: ReactSelectState) => React.CSSProperties;
}
