import Box from "@mui/material/Box";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";

export interface FormErrorAlertProps {
  message: string;
}

/**
 * Top-level form error banner (EFKT tea-rose surface with error-ink text),
 * shown when an API call is rejected. Has `role="alert"` so the message is
 * announced and discoverable by tests/screen readers.
 */
export function FormErrorAlert({ message }: FormErrorAlertProps) {
  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        bgcolor: "efkt.teaRose",
        color: "efkt.errorInk",
        borderRadius: "var(--radius-field)",
        px: 2,
        py: 1.5,
        mb: 2.25,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 18, flex: "none" }} />
      {message}
    </Box>
  );
}

export default FormErrorAlert;
