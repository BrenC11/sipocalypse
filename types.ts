
export interface GameOptions {
  activity: string; 
  chaosLevel: string; 
  includeDares: boolean;
  numberOfRules: number; // Changed from difficulty (string) to numberOfRules (number)
}

export interface GeneratedGame {
  title: string;
  rules: string[];
  dares?: string[];
}

// Props for common input components
export interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
}

export interface CheckboxInputProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Added onKeyDown
}

export interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  unitLabel?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}