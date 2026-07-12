import { Search } from "@mui/icons-material";
import { InputAdornment, TextField, TextFieldProps } from "@mui/material";

type SearchFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export const SearchField = ({ value, onChange, placeholder = "بحث...", sx, ...rest }: SearchFieldProps) => (
  <TextField
    fullWidth
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="search-bar-premium"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search fontSize="small" sx={{ color: "var(--ink-faint)" }} />
        </InputAdornment>
      ),
    }}
    sx={{
      mb: 2,
      "& .MuiOutlinedInput-root": {
        borderRadius: 2.5,
        bgcolor: "var(--panel)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&.Mui-focused": {
          boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
        },
      },
      ...sx,
    }}
    {...rest}
  />
);
