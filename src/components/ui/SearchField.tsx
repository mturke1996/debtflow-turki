import { Search } from "@mui/icons-material";
import { InputAdornment, TextField, TextFieldProps } from "@mui/material";

type SearchFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export const SearchField = ({ value, onChange, placeholder = "بحث...", ...rest }: SearchFieldProps) => (
  <TextField
    fullWidth
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search fontSize="small" color="action" />
        </InputAdornment>
      ),
    }}
    sx={{ mb: 2, ...rest.sx }}
    {...rest}
  />
);
