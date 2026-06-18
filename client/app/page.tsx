"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/components/AuthProvider";

/**
 * Authenticated landing page. Greets the signed-in user and offers a Log out
 * control that clears the session and returns to /login (FR-ui.6, FR-logout.1).
 * Visitors without a session are pointed to the login screen.
 */
export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "0.04em",
          color: "text.primary",
        }}
      >
        EFKT
      </Typography>

      {user ? (
        <>
          <Typography component="h1" sx={{ fontSize: 32, fontWeight: 600 }}>
            Welcome{user.name ? `, ${user.name}` : ""}.
          </Typography>
          <Typography sx={{ color: "text.secondary", fontWeight: 100 }}>
            You are signed in as {user.email}.
          </Typography>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              borderRadius: 999,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Log out
          </Button>
        </>
      ) : (
        <>
          <Typography component="h1" sx={{ fontSize: 32, fontWeight: 600 }}>
            Welcome to EFKT.
          </Typography>
          <Link
            href="/login"
            sx={{ color: "primary.main", fontWeight: 600 }}
            underline="none"
          >
            Log in
          </Link>
        </>
      )}
    </Box>
  );
}
